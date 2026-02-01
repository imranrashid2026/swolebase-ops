-- Create a trigger function to auto-create a default organization for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id uuid;
  default_role_id uuid;
BEGIN
  -- Create default organization for the user
  INSERT INTO public.organizations (name, slug, owner_id)
  VALUES (
    'My Organization',
    'org-' || SUBSTRING(NEW.id::text FROM 1 FOR 8),
    NEW.id
  )
  RETURNING id INTO org_id;
  
  -- Add user as admin member of their organization
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'admin');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user organization
DROP TRIGGER IF EXISTS on_auth_user_created_organization ON auth.users;
CREATE TRIGGER on_auth_user_created_organization
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_organization();