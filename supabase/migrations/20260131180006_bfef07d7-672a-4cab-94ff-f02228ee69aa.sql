-- Create app_permission enum for granular permissions
CREATE TYPE public.app_permission AS ENUM (
  'projects.read',
  'projects.write',
  'projects.delete',
  'projects.admin',
  'database.read',
  'database.write',
  'database.delete',
  'storage.read',
  'storage.write',
  'storage.delete',
  'functions.read',
  'functions.write',
  'functions.deploy',
  'team.read',
  'team.invite',
  'team.remove',
  'team.admin',
  'settings.read',
  'settings.write',
  'logs.read',
  'backups.read',
  'backups.create',
  'backups.restore'
);

-- Organizations table (top-level container for projects)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects table (represents Supabase projects)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  supabase_url TEXT,
  supabase_anon_key TEXT,
  supabase_service_key TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- Custom roles table (per-project custom roles)
CREATE TABLE public.custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions app_permission[] NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, name)
);

-- Organization members (org-level membership)
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Project members (project-level access with custom roles)
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  custom_role_id UUID REFERENCES public.custom_roles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Team invitations
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  custom_role_id UUID REFERENCES public.custom_roles(id) ON DELETE SET NULL,
  invited_by UUID NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (organization_id IS NOT NULL OR project_id IS NOT NULL)
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Security definer function to check org membership
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
  )
$$;

-- Security definer function to check org admin
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id 
    AND organization_id = _org_id 
    AND role IN ('owner', 'admin')
  )
$$;

-- Security definer function to check project membership
CREATE OR REPLACE FUNCTION public.is_project_member(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members WHERE user_id = _user_id AND project_id = _project_id
  ) OR EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.organization_members om ON om.organization_id = p.organization_id
    WHERE p.id = _project_id AND om.user_id = _user_id
  )
$$;

-- Security definer function to check project permission
CREATE OR REPLACE FUNCTION public.has_project_permission(_user_id UUID, _project_id UUID, _permission app_permission)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members pm
    JOIN public.custom_roles cr ON cr.id = pm.custom_role_id
    WHERE pm.user_id = _user_id 
    AND pm.project_id = _project_id 
    AND _permission = ANY(cr.permissions)
  ) OR EXISTS (
    -- Org admins have all permissions
    SELECT 1 FROM public.projects p
    JOIN public.organization_members om ON om.organization_id = p.organization_id
    WHERE p.id = _project_id 
    AND om.user_id = _user_id 
    AND om.role IN ('owner', 'admin')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for organizations
CREATE POLICY "Members can view their organizations" ON public.organizations FOR SELECT
  USING (public.is_org_member(auth.uid(), id));
CREATE POLICY "Authenticated users can create organizations" ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Org admins can update organizations" ON public.organizations FOR UPDATE
  USING (public.is_org_admin(auth.uid(), id));
CREATE POLICY "Org owners can delete organizations" ON public.organizations FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for projects
CREATE POLICY "Project members can view projects" ON public.projects FOR SELECT
  USING (public.is_project_member(auth.uid(), id));
CREATE POLICY "Org admins can create projects" ON public.projects FOR INSERT
  WITH CHECK (public.is_org_admin(auth.uid(), organization_id));
CREATE POLICY "Project admins can update projects" ON public.projects FOR UPDATE
  USING (public.has_project_permission(auth.uid(), id, 'projects.admin'));
CREATE POLICY "Org admins can delete projects" ON public.projects FOR DELETE
  USING (public.has_project_permission(auth.uid(), id, 'projects.delete'));

-- RLS Policies for custom_roles
CREATE POLICY "Project members can view roles" ON public.custom_roles FOR SELECT
  USING (public.is_project_member(auth.uid(), project_id));
CREATE POLICY "Team admins can create roles" ON public.custom_roles FOR INSERT
  WITH CHECK (public.has_project_permission(auth.uid(), project_id, 'team.admin'));
CREATE POLICY "Team admins can update roles" ON public.custom_roles FOR UPDATE
  USING (public.has_project_permission(auth.uid(), project_id, 'team.admin'));
CREATE POLICY "Team admins can delete roles" ON public.custom_roles FOR DELETE
  USING (public.has_project_permission(auth.uid(), project_id, 'team.admin'));

-- RLS Policies for organization_members
CREATE POLICY "Org members can view org membership" ON public.organization_members FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Org admins can add members" ON public.organization_members FOR INSERT
  WITH CHECK (public.is_org_admin(auth.uid(), organization_id));
CREATE POLICY "Org admins can update members" ON public.organization_members FOR UPDATE
  USING (public.is_org_admin(auth.uid(), organization_id));
CREATE POLICY "Org admins can remove members" ON public.organization_members FOR DELETE
  USING (public.is_org_admin(auth.uid(), organization_id) AND user_id != auth.uid());

-- RLS Policies for project_members
CREATE POLICY "Project members can view project membership" ON public.project_members FOR SELECT
  USING (public.is_project_member(auth.uid(), project_id));
CREATE POLICY "Team admins can add project members" ON public.project_members FOR INSERT
  WITH CHECK (public.has_project_permission(auth.uid(), project_id, 'team.invite'));
CREATE POLICY "Team admins can update project members" ON public.project_members FOR UPDATE
  USING (public.has_project_permission(auth.uid(), project_id, 'team.admin'));
CREATE POLICY "Team admins can remove project members" ON public.project_members FOR DELETE
  USING (public.has_project_permission(auth.uid(), project_id, 'team.remove'));

-- RLS Policies for team_invitations
CREATE POLICY "Users can view invitations sent to them" ON public.team_invitations FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR (organization_id IS NOT NULL AND public.is_org_admin(auth.uid(), organization_id))
    OR (project_id IS NOT NULL AND public.has_project_permission(auth.uid(), project_id, 'team.invite'))
  );
CREATE POLICY "Team admins can create invitations" ON public.team_invitations FOR INSERT
  WITH CHECK (
    (organization_id IS NOT NULL AND public.is_org_admin(auth.uid(), organization_id))
    OR (project_id IS NOT NULL AND public.has_project_permission(auth.uid(), project_id, 'team.invite'))
  );
CREATE POLICY "Invitees can update their invitation" ON public.team_invitations FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "Team admins can delete invitations" ON public.team_invitations FOR DELETE
  USING (
    (organization_id IS NOT NULL AND public.is_org_admin(auth.uid(), organization_id))
    OR (project_id IS NOT NULL AND public.has_project_permission(auth.uid(), project_id, 'team.admin'))
  );

-- Trigger for auto-creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for auto-adding org creator as owner
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization();

-- Trigger for creating default roles when a project is created
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create default Admin role
  INSERT INTO public.custom_roles (project_id, name, description, permissions, is_default)
  VALUES (
    NEW.id,
    'Admin',
    'Full access to all project features',
    ARRAY['projects.read', 'projects.write', 'projects.delete', 'projects.admin',
          'database.read', 'database.write', 'database.delete',
          'storage.read', 'storage.write', 'storage.delete',
          'functions.read', 'functions.write', 'functions.deploy',
          'team.read', 'team.invite', 'team.remove', 'team.admin',
          'settings.read', 'settings.write',
          'logs.read', 'backups.read', 'backups.create', 'backups.restore']::app_permission[],
    true
  );
  
  -- Create default Developer role
  INSERT INTO public.custom_roles (project_id, name, description, permissions, is_default)
  VALUES (
    NEW.id,
    'Developer',
    'Read/write access to database, storage, and functions',
    ARRAY['projects.read',
          'database.read', 'database.write',
          'storage.read', 'storage.write',
          'functions.read', 'functions.write', 'functions.deploy',
          'team.read', 'logs.read']::app_permission[],
    true
  );
  
  -- Create default Viewer role
  INSERT INTO public.custom_roles (project_id, name, description, permissions, is_default)
  VALUES (
    NEW.id,
    'Viewer',
    'Read-only access to project resources',
    ARRAY['projects.read', 'database.read', 'storage.read', 'functions.read', 'team.read', 'logs.read']::app_permission[],
    true
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_roles_updated_at BEFORE UPDATE ON public.custom_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();