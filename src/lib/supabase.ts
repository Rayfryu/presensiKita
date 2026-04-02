import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/*
SQL SCHEMA FOR SUPABASE:

-- 1. Profiles table (linked to auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('admin', 'teacher')) default 'teacher',
  email text
);

-- 2. Students table
create table students (
  id uuid default uuid_generate_v4() primary key,
  nism text unique not null,
  name text not null,
  class_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Teacher Attendance table
create table teacher_attendance (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  status text check (status in ('present', 'absent', 'late')) not null,
  check_in_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(teacher_id, date)
);

-- 4. Student Attendance table
create table student_attendance (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references students(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  status text check (status in ('present', 'absent', 'late', 'sick', 'permission')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, date)
);

-- RLS POLICIES (Simplified for demo)
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

alter table students enable row level security;
create policy "Students viewable by authenticated users." on students for select using (auth.role() = 'authenticated');
create policy "Only admins can manage students." on students for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Trigger to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    case when (select count(*) from public.profiles) = 0 then 'admin' else coalesce(new.raw_user_meta_data->>'role', 'teacher') end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
*/

export type Profile = {
  id: string;
  full_name: string;
  role: 'admin' | 'teacher';
  email: string;
};

export type Student = {
  id: string;
  nism: string;
  name: string;
  class_name: string;
};

export type TeacherAttendance = {
  id: string;
  teacher_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  check_in_time: string;
};

export type StudentAttendance = {
  id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'sick' | 'permission';
};
