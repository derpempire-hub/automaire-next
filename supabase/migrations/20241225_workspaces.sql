-- =============================================
-- Workspaces & Team Management Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. Create Enums
-- =============================================

CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- =============================================
-- 2. Create Profiles Table
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  job_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for profiles
CREATE INDEX idx_profiles_id ON profiles(id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- =============================================
-- 3. Create Workspaces Table
-- =============================================

CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);

-- Trigger to update updated_at
CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- =============================================
-- 4. Create Workspace Members Table
-- =============================================

CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'member',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  invited_by UUID REFERENCES auth.users(id),
  UNIQUE(workspace_id, user_id)
);

-- Create indexes
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);

-- =============================================
-- 5. Create Workspace Invitations Table
-- =============================================

CREATE TABLE workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role workspace_role NOT NULL DEFAULT 'member',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_workspace_invitations_workspace_id ON workspace_invitations(workspace_id);
CREATE INDEX idx_workspace_invitations_email ON workspace_invitations(email);
CREATE INDEX idx_workspace_invitations_token ON workspace_invitations(token);

-- =============================================
-- 6. Add workspace_id to Existing Tables
-- =============================================

-- Add workspace_id column to leads
ALTER TABLE leads ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
CREATE INDEX idx_leads_workspace_id ON leads(workspace_id);

-- Add workspace_id column to companies
ALTER TABLE companies ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
CREATE INDEX idx_companies_workspace_id ON companies(workspace_id);

-- Add workspace_id column to tasks
ALTER TABLE tasks ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
CREATE INDEX idx_tasks_workspace_id ON tasks(workspace_id);

-- Add workspace_id column to proposals
ALTER TABLE proposals ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
CREATE INDEX idx_proposals_workspace_id ON proposals(workspace_id);

-- Add workspace_id column to projects
ALTER TABLE projects ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);

-- Add workspace_id column to workflows
ALTER TABLE workflows ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
CREATE INDEX idx_workflows_workspace_id ON workflows(workspace_id);

-- Add workspace_id column to service_requests
ALTER TABLE service_requests ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
CREATE INDEX idx_service_requests_workspace_id ON service_requests(workspace_id);

-- =============================================
-- 7. Helper Functions
-- =============================================

-- Function to check if user is member of a workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in workspace
CREATE OR REPLACE FUNCTION get_workspace_role(ws_id UUID, user_uuid UUID)
RETURNS workspace_role AS $$
DECLARE
  user_role workspace_role;
BEGIN
  SELECT role INTO user_role
  FROM workspace_members
  WHERE workspace_id = ws_id AND user_id = user_uuid;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can write in workspace (owner, admin, member)
CREATE OR REPLACE FUNCTION can_write_in_workspace(ws_id UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role workspace_role;
BEGIN
  SELECT role INTO user_role
  FROM workspace_members
  WHERE workspace_id = ws_id AND user_id = user_uuid;

  RETURN user_role IN ('owner', 'admin', 'member');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can delete in workspace (owner, admin)
CREATE OR REPLACE FUNCTION can_delete_in_workspace(ws_id UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role workspace_role;
BEGIN
  SELECT role INTO user_role
  FROM workspace_members
  WHERE workspace_id = ws_id AND user_id = user_uuid;

  RETURN user_role IN ('owner', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate workspace slug from name
CREATE OR REPLACE FUNCTION generate_workspace_slug(workspace_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(workspace_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := substring(base_slug, 1, 50);

  final_slug := base_slug;

  -- Check for uniqueness and add suffix if needed
  WHILE EXISTS (SELECT 1 FROM workspaces WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 8. Auto-create Profile and Workspace on Signup
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
  workspace_slug TEXT;
  user_name TEXT;
BEGIN
  -- Get user's name from metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Create profile
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, user_name);

  -- Generate unique workspace slug
  workspace_slug := generate_workspace_slug(user_name || '''s Workspace');

  -- Create personal workspace
  INSERT INTO workspaces (id, name, slug, owner_id)
  VALUES (
    gen_random_uuid(),
    user_name || '''s Workspace',
    workspace_slug,
    NEW.id
  )
  RETURNING id INTO new_workspace_id;

  -- Add user as owner of their workspace
  INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
  VALUES (new_workspace_id, NEW.id, 'owner', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 9. Row Level Security - Profiles
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in shared workspaces"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT wm2.user_id FROM workspace_members wm1
      JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
      WHERE wm1.user_id = auth.uid()
    )
  );

-- =============================================
-- 10. Row Level Security - Workspaces
-- =============================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their workspaces"
  ON workspaces FOR SELECT
  USING (is_workspace_member(id, auth.uid()));

CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins can update workspace"
  ON workspaces FOR UPDATE
  USING (get_workspace_role(id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Only owner can delete workspace"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- =============================================
-- 11. Row Level Security - Workspace Members
-- =============================================

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Admins can add members"
  ON workspace_members FOR INSERT
  WITH CHECK (get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Admins can update member roles"
  ON workspace_members FOR UPDATE
  USING (get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Admins can remove members"
  ON workspace_members FOR DELETE
  USING (
    get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
    OR user_id = auth.uid() -- Users can remove themselves
  );

-- =============================================
-- 12. Row Level Security - Workspace Invitations
-- =============================================

ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view invitations"
  ON workspace_invitations FOR SELECT
  USING (get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Admins can create invitations"
  ON workspace_invitations FOR INSERT
  WITH CHECK (get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Admins can delete invitations"
  ON workspace_invitations FOR DELETE
  USING (get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin'));

-- Allow anyone to view invitation by token (for accepting)
CREATE POLICY "Anyone can view invitation by token"
  ON workspace_invitations FOR SELECT
  USING (true);

-- =============================================
-- 13. Update RLS for Existing Tables (Workspace-Scoped)
-- =============================================

-- Drop existing policies on leads (if they exist)
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
DROP POLICY IF EXISTS "Users can create leads" ON leads;
DROP POLICY IF EXISTS "Users can update own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON leads;

-- New workspace-scoped policies for leads
CREATE POLICY "Members can view workspace leads"
  ON leads FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Writers can create workspace leads"
  ON leads FOR INSERT
  WITH CHECK (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Writers can update workspace leads"
  ON leads FOR UPDATE
  USING (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Admins can delete workspace leads"
  ON leads FOR DELETE
  USING (can_delete_in_workspace(workspace_id, auth.uid()));

-- Companies
DROP POLICY IF EXISTS "Users can view own companies" ON companies;
DROP POLICY IF EXISTS "Users can create companies" ON companies;
DROP POLICY IF EXISTS "Users can update own companies" ON companies;
DROP POLICY IF EXISTS "Users can delete own companies" ON companies;

CREATE POLICY "Members can view workspace companies"
  ON companies FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Writers can create workspace companies"
  ON companies FOR INSERT
  WITH CHECK (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Writers can update workspace companies"
  ON companies FOR UPDATE
  USING (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Admins can delete workspace companies"
  ON companies FOR DELETE
  USING (can_delete_in_workspace(workspace_id, auth.uid()));

-- Tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

CREATE POLICY "Members can view workspace tasks"
  ON tasks FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Writers can create workspace tasks"
  ON tasks FOR INSERT
  WITH CHECK (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Writers can update workspace tasks"
  ON tasks FOR UPDATE
  USING (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Admins can delete workspace tasks"
  ON tasks FOR DELETE
  USING (can_delete_in_workspace(workspace_id, auth.uid()));

-- Proposals
DROP POLICY IF EXISTS "Users can view own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can create proposals" ON proposals;
DROP POLICY IF EXISTS "Users can update own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can delete own proposals" ON proposals;

CREATE POLICY "Members can view workspace proposals"
  ON proposals FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Writers can create workspace proposals"
  ON proposals FOR INSERT
  WITH CHECK (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Writers can update workspace proposals"
  ON proposals FOR UPDATE
  USING (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Admins can delete workspace proposals"
  ON proposals FOR DELETE
  USING (can_delete_in_workspace(workspace_id, auth.uid()));

-- Projects
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Members can view workspace projects"
  ON projects FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Writers can create workspace projects"
  ON projects FOR INSERT
  WITH CHECK (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Writers can update workspace projects"
  ON projects FOR UPDATE
  USING (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Admins can delete workspace projects"
  ON projects FOR DELETE
  USING (can_delete_in_workspace(workspace_id, auth.uid()));

-- Workflows
DROP POLICY IF EXISTS "Users can view own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can create workflows" ON workflows;
DROP POLICY IF EXISTS "Users can update own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can delete own workflows" ON workflows;

CREATE POLICY "Members can view workspace workflows"
  ON workflows FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Writers can create workspace workflows"
  ON workflows FOR INSERT
  WITH CHECK (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Writers can update workspace workflows"
  ON workflows FOR UPDATE
  USING (can_write_in_workspace(workspace_id, auth.uid()));

CREATE POLICY "Admins can delete workspace workflows"
  ON workflows FOR DELETE
  USING (can_delete_in_workspace(workspace_id, auth.uid()));

-- =============================================
-- 14. Storage Bucket for Avatars
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Storage bucket for workspace logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workspace-logos',
  'workspace-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for workspace logos
CREATE POLICY "Admins can upload workspace logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'workspace-logos' AND
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id::text = (storage.foldername(name))[1]
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Anyone can view workspace logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'workspace-logos');
