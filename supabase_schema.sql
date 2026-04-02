-- ==========================================
-- PRESENSIKITA SUPABASE SQL SCHEMA
-- ==========================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Profiles table (linked to auth.users)
-- This table stores additional user information like full name and role.
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text check (role in ('admin', 'teacher')) default 'teacher',
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Students table
-- Stores student data (NISM, Name, Class).
create table public.students (
  id uuid default uuid_generate_v4() primary key,
  nism text unique not null,
  name text not null,
  class_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Teacher Attendance table
-- Stores attendance records for teachers/employees.
create table public.teacher_attendance (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  status text check (status in ('present', 'absent', 'late')) not null,
  check_in_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(teacher_id, date)
);

-- 5. Student Attendance table
-- Stores attendance records for students, marked by teachers.
create table public.student_attendance (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  status text check (status in ('present', 'absent', 'late', 'sick', 'permission')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, date)
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.teacher_attendance enable row level security;
alter table public.student_attendance enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Students Policies
create policy "Students viewable by authenticated users." on public.students
  for select using (auth.role() = 'authenticated');

create policy "Only admins can manage students." on public.students
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Teacher Attendance Policies
create policy "Teachers can view their own attendance." on public.teacher_attendance
  for select using (auth.uid() = teacher_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Teachers can insert their own attendance." on public.teacher_attendance
  for insert with check (auth.uid() = teacher_id);

-- Student Attendance Policies
create policy "Authenticated users can view student attendance." on public.student_attendance
  for select using (auth.role() = 'authenticated');

create policy "Teachers can manage student attendance." on public.student_attendance
  for all using (auth.role() = 'authenticated');

-- ==========================================
-- AUTH TRIGGERS
-- ==========================================

-- Function to handle new user signup
-- Automatically creates a profile and sets the first user as 'admin'
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_user boolean;
begin
  select count(*) = 0 into is_first_user from public.profiles;
  
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'), 
    new.email,
    case when is_first_user then 'admin' else coalesce(new.raw_user_meta_data->>'role', 'teacher') end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute the function on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- SAMPLE DATA (Optional)
-- ==========================================
-- insert into public.students (nism, name, class_name) values 
-- ('2021001', 'Ahmad Fauzi', 'XII RPL 1'),
-- ('2021002', 'Budi Santoso', 'XII RPL 1'),
-- ('2021003', 'Citra Lestari', 'XII RPL 2');
