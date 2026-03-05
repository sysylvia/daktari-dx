-- Daktari Dx: Clinical Diagnostic Training Platform
-- Initial schema for Supabase PostgreSQL

-- profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  participant_code TEXT UNIQUE,
  display_name TEXT,
  profession TEXT CHECK (profession IN ('physician', 'clinical_officer', 'nurse', 'other')),
  specialty TEXT[],
  years_experience INTEGER,
  facility TEXT,
  region TEXT DEFAULT 'Kibera',
  preferred_language TEXT DEFAULT 'en',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  consent_given_at TIMESTAMPTZ,
  -- Gamification
  current_ability REAL DEFAULT 0.0,
  total_cases INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- cases (clinical vignettes with IRT parameters)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL CHECK (domain IN ('respiratory', 'infectious', 'pediatric', 'maternal', 'ncds', 'emergency')),
  title TEXT NOT NULL,
  demographics JSONB NOT NULL,
  presentation JSONB NOT NULL,
  history JSONB NOT NULL,
  physical_exam JSONB NOT NULL,
  expert_differential JSONB NOT NULL,
  not_to_miss TEXT[] NOT NULL,
  explanations JSONB NOT NULL,
  clinical_pearls JSONB,
  next_steps JSONB,
  -- IRT parameters
  difficulty REAL DEFAULT 0.0,
  discrimination REAL DEFAULT 1.0,
  guessing REAL DEFAULT 0.15,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- assessments (user responses to cases)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  case_id UUID REFERENCES cases(id) NOT NULL,
  session_id UUID DEFAULT gen_random_uuid(),
  user_differential JSONB NOT NULL,
  user_not_to_miss TEXT[],
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  time_spent INTEGER,
  raw_score REAL,
  ability_estimate REAL,
  standard_error REAL,
  component_scores JSONB,
  feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- cognitive_checkpoints (bias-reduction step)
CREATE TABLE cognitive_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id),
  user_id UUID REFERENCES auth.users NOT NULL,
  case_id UUID REFERENCES cases(id) NOT NULL,
  information_gaps TEXT,
  alternative_diagnoses TEXT,
  cant_miss_considered TEXT,
  red_flags TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- achievements (Swahili-named badges)
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_progress (per-domain tracking)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  domain TEXT NOT NULL,
  cases_completed INTEGER DEFAULT 0,
  accuracy REAL DEFAULT 0,
  average_time REAL DEFAULT 0,
  ability_level REAL DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, domain)
);

-- user_sessions (streak/cohort analysis)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id UUID NOT NULL,
  domain TEXT,
  cases_completed INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Cases: everyone can read active cases
CREATE POLICY "Anyone can view active cases" ON cases FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage cases" ON cases FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Assessments: users can read/write their own
CREATE POLICY "Users can view own assessments" ON assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create assessments" ON assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cognitive checkpoints: users own their data
CREATE POLICY "Users can view own checkpoints" ON cognitive_checkpoints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create checkpoints" ON cognitive_checkpoints FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements: users see their own
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Progress: users see their own
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Sessions: users see their own
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON user_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Admin read policies for export
CREATE POLICY "Admins can view all assessments" ON assessments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can view all checkpoints" ON cognitive_checkpoints FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Indexes
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_case_id ON assessments(case_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_cases_domain ON cases(domain);
CREATE INDEX idx_profiles_participant_code ON profiles(participant_code);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
