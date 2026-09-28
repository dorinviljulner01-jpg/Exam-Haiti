-- ExamHaiti — Stage 2 : sécurité admin + règles RLS + stockage + matières
-- À exécuter APRÈS supabase/schema.sql, dans l'éditeur SQL de Supabase.

-- ========== Fonctions utilitaires ==========
create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function is_premium_user() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and is_premium = true);
$$;

-- ========== Création automatique du profil à l'inscription ==========
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, level)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    case when new.raw_user_meta_data ->> 'level' in ('9e-af', 'ns4')
         then new.raw_user_meta_data ->> 'level' else null end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ========== Empêcher un étudiant de se donner admin/premium ==========
create or replace function protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() and auth.uid() is not null
     and (new.role is distinct from old.role or new.is_premium is distinct from old.is_premium) then
    raise exception 'Modification non autorisée';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields_trg on profiles;
create trigger protect_profile_fields_trg
  before update on profiles
  for each row execute function protect_profile_fields();

-- ========== Activer RLS sur toutes les tables ==========
alter table subjects enable row level security;
alter table topics enable row level security;
alter table documents enable row level security;
alter table questions enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table plans enable row level security;
alter table profiles enable row level security;
alter table quiz_attempts enable row level security;
alter table attempt_answers enable row level security;
alter table payments enable row level security;

-- ========== Lecture publique du catalogue ==========
create policy "Lecture matières" on subjects for select using (true);
create policy "Lecture thèmes" on topics for select using (true);
create policy "Lecture documents (fiches)" on documents for select using (true);
create policy "Lecture quiz" on quizzes for select using (true);
create policy "Lecture liens quiz-questions" on quiz_questions for select using (true);
create policy "Lecture plans" on plans for select using (true);

-- Les questions premium ne sont visibles que par les premium et les admins
create policy "Lecture questions" on questions for select
  using (not is_premium or is_premium_user() or is_admin());

-- ========== Droits administrateur ==========
create policy "Admin gère matières" on subjects for all using (is_admin()) with check (is_admin());
create policy "Admin gère thèmes" on topics for all using (is_admin()) with check (is_admin());
create policy "Admin gère documents" on documents for all using (is_admin()) with check (is_admin());
create policy "Admin gère questions" on questions for all using (is_admin()) with check (is_admin());
create policy "Admin gère quiz" on quizzes for all using (is_admin()) with check (is_admin());
create policy "Admin gère quiz-questions" on quiz_questions for all using (is_admin()) with check (is_admin());
create policy "Admin gère plans" on plans for all using (is_admin()) with check (is_admin());

create policy "Admin voit les profils" on profiles for select using (is_admin());
create policy "Admin modifie les profils" on profiles for update using (is_admin());
create policy "Admin voit les tentatives" on quiz_attempts for select using (is_admin());
create policy "Admin voit les paiements" on payments for select using (is_admin());
create policy "Admin modifie les paiements" on payments for update using (is_admin());

-- ========== Réponses de tentative : accès via la tentative du propriétaire ==========
create policy "Voir ses réponses" on attempt_answers for select
  using (exists (select 1 from quiz_attempts a where a.id = attempt_id and a.student_id = auth.uid()));
create policy "Enregistrer ses réponses" on attempt_answers for insert
  with check (exists (select 1 from quiz_attempts a where a.id = attempt_id and a.student_id = auth.uid()));

-- ========== Stockage des documents (bucket PRIVÉ) ==========
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Admin envoie des documents" on storage.objects for insert
  with check (bucket_id = 'documents' and is_admin());
create policy "Admin modifie des documents" on storage.objects for update
  using (bucket_id = 'documents' and is_admin());
create policy "Admin supprime des documents" on storage.objects for delete
  using (bucket_id = 'documents' and is_admin());

-- Lecture : fichiers gratuits pour tout utilisateur connecté, premium seulement pour les premium/admin
create policy "Lecture des documents autorisés" on storage.objects for select
  using (
    bucket_id = 'documents'
    and auth.uid() is not null
    and (
      is_admin()
      or exists (
        select 1 from documents d
        where d.file_url = storage.objects.name
          and (not d.is_premium or is_premium_user())
      )
    )
  );

-- ========== Matières (9e AF et NS4) ==========
insert into subjects (level, name, slug, icon) values
  ('9e-af', 'Français', 'francais', '📖'),
  ('9e-af', 'Mathématiques', 'mathematiques', '➗'),
  ('9e-af', 'Sciences expérimentales', 'sciences-experimentales', '🔬'),
  ('9e-af', 'Sciences sociales', 'sciences-sociales', '🌍'),
  ('9e-af', 'Créole', 'creole', '🗣️'),
  ('9e-af', 'Anglais', 'anglais', '🇬🇧'),
  ('9e-af', 'Espagnol', 'espagnol', '🇪🇸'),
  ('9e-af', 'Éducation à la citoyenneté', 'eac', '🏛️'),
  ('9e-af', 'ETAP', 'etap', '🛠️'),
  ('9e-af', 'EPS', 'eps', '⚽'),
  ('9e-af', 'EEA', 'eea', '🎨'),
  ('ns4', 'Français', 'francais', '📖'),
  ('ns4', 'Mathématiques', 'mathematiques', '➗'),
  ('ns4', 'Philosophie', 'philosophie', '💭'),
  ('ns4', 'Physique', 'physique', '⚛️'),
  ('ns4', 'Chimie', 'chimie', '🧪'),
  ('ns4', 'Biologie', 'biologie', '🧬'),
  ('ns4', 'Anglais', 'anglais', '🇬🇧'),
  ('ns4', 'Créole', 'creole', '🗣️'),
  ('ns4', 'Histoire-Géographie', 'histoire-geo', '🗺️')
on conflict (level, slug) do nothing;

-- ========== Créer ton premier administrateur ==========
-- 1) Inscris-toi normalement sur le site avec ton email.
-- 2) Puis exécute cette ligne en remplaçant TON_EMAIL :
--
-- update profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'TON_EMAIL');
