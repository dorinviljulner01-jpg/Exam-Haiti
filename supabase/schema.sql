-- ExamHaiti — schéma de base de données Supabase
-- À exécuter dans l'éditeur SQL de ton projet Supabase.
-- Ce schéma prépare les Stages 2, 3 et 4 (le Stage 1 tourne avec des données locales).

create extension if not exists "uuid-ossp";

-- Profils utilisateurs (lié à auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  level text check (level in ('9e-af', 'ns4')),
  role text not null default 'student' check (role in ('student', 'admin')),
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists subjects (
  id uuid primary key default uuid_generate_v4(),
  level text not null check (level in ('9e-af', 'ns4')),
  name text not null,
  slug text not null,
  icon text,
  unique (level, slug)
);

create table if not exists topics (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid references subjects(id) on delete cascade,
  name text not null
);

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  level text not null check (level in ('9e-af', 'ns4')),
  subject_id uuid references subjects(id),
  year int,
  file_url text,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default uuid_generate_v4(),
  level text not null check (level in ('9e-af', 'ns4')),
  subject_id uuid references subjects(id),
  topic_id uuid references topics(id),
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null check (correct_answer in ('a', 'b', 'c', 'd')),
  explanation text,
  difficulty text not null default 'moyen' check (difficulty in ('facile', 'moyen', 'difficile')),
  source text,
  year int,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists quizzes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  level text not null check (level in ('9e-af', 'ns4')),
  subject_id uuid references subjects(id),
  is_premium boolean not null default false,
  is_mock_exam boolean not null default false,
  time_limit_minutes int,
  created_at timestamptz not null default now()
);

create table if not exists quiz_questions (
  quiz_id uuid references quizzes(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  position int not null default 0,
  primary key (quiz_id, question_id)
);

create table if not exists quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id) on delete cascade,
  quiz_id uuid references quizzes(id),
  score int not null,
  percentage numeric not null,
  duration_seconds int,
  created_at timestamptz not null default now()
);

create table if not exists attempt_answers (
  id uuid primary key default uuid_generate_v4(),
  attempt_id uuid references quiz_attempts(id) on delete cascade,
  question_id uuid references questions(id),
  selected_answer text check (selected_answer in ('a', 'b', 'c', 'd')),
  is_correct boolean
);

create table if not exists plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price_htg numeric not null,
  duration_days int not null
);

create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  plan_id uuid references plans(id),
  payment_method text not null check (payment_method in ('moncash', 'natcash')),
  amount numeric not null,
  transaction_reference text not null,
  screenshot_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id)
);

-- Row Level Security
alter table profiles enable row level security;
alter table quiz_attempts enable row level security;
alter table attempt_answers enable row level security;
alter table payments enable row level security;

create policy "Un étudiant voit son propre profil"
  on profiles for select using (auth.uid() = id);

create policy "Un étudiant modifie son propre profil"
  on profiles for update using (auth.uid() = id);

create policy "Un étudiant voit ses propres tentatives"
  on quiz_attempts for select using (auth.uid() = student_id);

create policy "Un étudiant crée ses propres tentatives"
  on quiz_attempts for insert with check (auth.uid() = student_id);

create policy "Un étudiant voit ses propres paiements"
  on payments for select using (auth.uid() = user_id);

create policy "Un étudiant crée ses propres paiements"
  on payments for insert with check (auth.uid() = user_id);

-- Note : les captures d'écran de paiement doivent être stockées dans un
-- bucket Supabase Storage PRIVÉ (pas public), avec des policies limitant
-- l'accès au propriétaire et aux administrateurs (role = 'admin').
