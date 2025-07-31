/*
  # Complete Application Schema with Project Management

  1. New Tables
    - `profiles` - User profiles with extended information
    - `projects` - Project information and management
    - `project_keys` - Special keys for project access
    - `user_projects` - Many-to-many relationship between users and projects

  2. Security
    - Enable RLS on all tables
    - Comprehensive policies for data access and modification
    - Admin-only policies for project key management

  3. Functions and Triggers
    - Auto-create profile on user signup
    - Update timestamps automatically
    - Project key validation functions
*/

-- Create profiles table with extended fields
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  user_type text NOT NULL CHECK (user_type IN ('individual', 'industry')),
  role text CHECK (role IN ('admin', 'engineer', 'contractor', 'worker')),
  special_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_keys table
CREATE TABLE IF NOT EXISTS project_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_value text UNIQUE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  default_role text CHECK (default_role IN ('admin', 'engineer', 'contractor', 'worker')),
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_projects junction table
CREATE TABLE IF NOT EXISTS user_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  role text CHECK (role IN ('admin', 'engineer', 'contractor', 'worker')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Projects policies
CREATE POLICY "Users can read projects they're assigned to"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_projects
      WHERE user_projects.project_id = projects.id
      AND user_projects.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Project keys policies
CREATE POLICY "Anyone can read active project keys for signup"
  ON project_keys
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage project keys"
  ON project_keys
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User projects policies
CREATE POLICY "Users can read their own project assignments"
  ON user_projects
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user project assignments"
  ON user_projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can be assigned to projects via valid keys"
  ON user_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Functions and triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name, phone, user_type, role, special_key)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'individual'),
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'special_key'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to handle profile updates
CREATE OR REPLACE FUNCTION handle_profile_update()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_profile_update();

DROP TRIGGER IF EXISTS on_project_updated ON projects;
CREATE TRIGGER on_project_updated
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_profile_update();

DROP TRIGGER IF EXISTS on_project_key_updated ON project_keys;
CREATE TRIGGER on_project_key_updated
  BEFORE UPDATE ON project_keys
  FOR EACH ROW EXECUTE FUNCTION handle_profile_update();

-- Function to validate project keys
CREATE OR REPLACE FUNCTION validate_project_key(key_input text)
RETURNS TABLE(
  is_valid boolean,
  project_id uuid,
  project_name text,
  default_role text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as is_valid,
    pk.project_id,
    pk.project_name,
    pk.default_role
  FROM project_keys pk
  WHERE pk.key_value = key_input
    AND pk.is_active = true
    AND (pk.expires_at IS NULL OR pk.expires_at > now());
    
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, null::text, null::text;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique project keys
CREATE OR REPLACE FUNCTION generate_project_key()
RETURNS text AS $$
DECLARE
  key_value text;
  key_exists boolean;
BEGIN
  LOOP
    -- Generate a random 12-character key
    key_value := upper(substring(md5(random()::text) from 1 for 12));
    
    -- Check if key already exists
    SELECT EXISTS(SELECT 1 FROM project_keys WHERE project_keys.key_value = key_value) INTO key_exists;
    
    -- Exit loop if key is unique
    EXIT WHEN NOT key_exists;
  END LOOP;
  
  RETURN key_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;