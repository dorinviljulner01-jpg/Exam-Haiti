-- ExamHaiti — Stage 3 : abonnements + paiements MonCash/NatCash
-- À exécuter APRÈS schema.sql puis stage2.sql.
-- Le paiement reste manuel : l'élève paie, envoie la référence + capture,
-- puis un administrateur approuve ou rejette.

-- 1) Date d'expiration Premium
alter table profiles
  add column if not exists premium_until timestamptz;

-- 2) Bucket privé pour les captures de paiement
insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do update set public = false;

-- Un étudiant peut déposer uniquement dans son propre dossier.
drop policy if exists "Étudiant envoie sa capture de paiement" on storage.objects;
create policy "Étudiant envoie sa capture de paiement"
on storage.objects for insert
with check (
  bucket_id = 'payment-screenshots'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Un étudiant peut voir uniquement ses propres captures.
drop policy if exists "Étudiant voit sa capture de paiement" on storage.objects;
create policy "Étudiant voit sa capture de paiement"
on storage.objects for select
using (
  bucket_id = 'payment-screenshots'
  and (
    is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- Un étudiant peut remplacer/supprimer uniquement sa propre capture.
drop policy if exists "Étudiant modifie sa capture de paiement" on storage.objects;
create policy "Étudiant modifie sa capture de paiement"
on storage.objects for update
using (
  bucket_id = 'payment-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'payment-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Étudiant supprime sa capture de paiement" on storage.objects;
create policy "Étudiant supprime sa capture de paiement"
on storage.objects for delete
using (
  bucket_id = 'payment-screenshots'
  and (
    is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- 3) Activation automatique du Premium après approbation.
create or replace function handle_approved_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_duration integer;
  current_until timestamptz;
begin
  if new.status = 'approved'
     and (old.status is distinct from 'approved' or old.plan_id is distinct from new.plan_id) then

    select duration_days
      into selected_duration
      from plans
     where id = new.plan_id;

    if selected_duration is null then
      raise exception 'Plan d''abonnement introuvable';
    end if;

    select premium_until
      into current_until
      from profiles
     where id = new.user_id
     for update;

    update profiles
       set is_premium = true,
           premium_until = greatest(
             coalesce(current_until, now()),
             now()
           ) + make_interval(days => selected_duration)
     where id = new.user_id;

  end if;

  return new;
end;
$$;

drop trigger if exists payment_approval_trigger on payments;
create trigger payment_approval_trigger
after update of status on payments
for each row
execute function handle_approved_payment();

-- 4) Si un ancien premium arrive à expiration, les lectures premium
-- doivent aussi être protégées par is_premium_user().
create or replace function is_premium_user()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
      from profiles
     where id = auth.uid()
       and is_premium = true
       and (premium_until is null or premium_until > now())
  );
$$;

-- 5) Plans de départ (modifiable selon tes prix).
insert into plans (name, price_htg, duration_days)
select '1 mois', 500, 30
where not exists (select 1 from plans where name = '1 mois');

insert into plans (name, price_htg, duration_days)
select '3 mois', 1200, 90
where not exists (select 1 from plans where name = '3 mois');

insert into plans (name, price_htg, duration_days)
select '12 mois', 4000, 365
where not exists (select 1 from plans where name = '12 mois');

-- IMPORTANT :
-- Les numéros MonCash/NatCash ne sont pas inventés dans le code.
-- Configure-les dans Vercel :
-- NEXT_PUBLIC_MONCASH_NUMBER=xxxxxxxx
-- NEXT_PUBLIC_NATCASH_NUMBER=xxxxxxxx
