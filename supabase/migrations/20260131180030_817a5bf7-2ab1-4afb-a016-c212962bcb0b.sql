-- Fix Function Search Path Mutable warning
-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Update handle_new_organization function
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$;

-- Update handle_new_project function
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
          'logs.read', 'backups.read', 'backups.create', 'backups.restore']::public.app_permission[],
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
          'team.read', 'logs.read']::public.app_permission[],
    true
  );
  
  -- Create default Viewer role
  INSERT INTO public.custom_roles (project_id, name, description, permissions, is_default)
  VALUES (
    NEW.id,
    'Viewer',
    'Read-only access to project resources',
    ARRAY['projects.read', 'database.read', 'storage.read', 'functions.read', 'team.read', 'logs.read']::public.app_permission[],
    true
  );
  
  RETURN NEW;
END;
$$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;