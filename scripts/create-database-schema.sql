-- Create users table for extended user profiles
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Developer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  priority TEXT DEFAULT 'Medium',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  archive_type TEXT,
  archive_note TEXT,
  lessons_learned TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mood TEXT NOT NULL,
  energy INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_streaks table
CREATE TABLE IF NOT EXISTS public.activity_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accountability_partners table
CREATE TABLE IF NOT EXISTS public.accountability_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  partner_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shared_projects table
CREATE TABLE IF NOT EXISTS public.shared_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  shared_with_email TEXT NOT NULL,
  permission TEXT DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for projects table
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for mood_entries table
CREATE POLICY "Users can view own mood entries" ON public.mood_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries" ON public.mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries" ON public.mood_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries" ON public.mood_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for activity_streaks table
CREATE POLICY "Users can view own activity streaks" ON public.activity_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity streaks" ON public.activity_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity streaks" ON public.activity_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for accountability_partners table
CREATE POLICY "Users can view own accountability partners" ON public.accountability_partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accountability partners" ON public.accountability_partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accountability partners" ON public.accountability_partners
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accountability partners" ON public.accountability_partners
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for shared_projects table
CREATE POLICY "Users can view projects shared with them" ON public.shared_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = shared_projects.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can share own projects" ON public.shared_projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = shared_projects.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_last_activity ON public.projects(last_activity);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_streaks_user_id ON public.activity_streaks(user_id);
