import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type AppPermission = Database['public']['Enums']['app_permission'];

interface CustomRole {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  permissions: AppPermission[];
  is_default: boolean;
  created_at: string;
}

interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  custom_role_id: string | null;
  created_at: string;
  custom_roles?: {
    name: string;
    permissions: AppPermission[];
  } | null;
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export function useCustomRoles(projectId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['custom-roles', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .eq('project_id', projectId)
        .order('is_default', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as CustomRole[];
    },
    enabled: !!user && !!projectId,
  });
}

export function useProjectMembers(projectId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select('*, custom_roles(name, permissions)')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data as ProjectMember[];
    },
    enabled: !!user && !!projectId,
  });
}

export function useOrganizationMembers(organizationId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['org-members', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (error) throw error;
      return data as OrganizationMember[];
    },
    enabled: !!user && !!organizationId,
  });
}

export function useCreateCustomRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      project_id: string;
      name: string;
      description?: string;
      permissions: AppPermission[];
    }) => {
      const { data, error } = await supabase
        .from('custom_roles')
        .insert({
          project_id: input.project_id,
          name: input.name,
          description: input.description,
          permissions: input.permissions,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as CustomRole;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-roles', data.project_id] });
    },
  });
}

export function useUpdateCustomRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, project_id, ...input }: { 
      id: string; 
      project_id: string;
      name?: string; 
      description?: string; 
      permissions?: AppPermission[];
    }) => {
      const { data, error } = await supabase
        .from('custom_roles')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as CustomRole;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-roles', data.project_id] });
    },
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      project_id: string;
      user_id: string;
      custom_role_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('project_members')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data as ProjectMember;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', data.project_id] });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, projectId }: { memberId: string; projectId: string }) => {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      return { projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', data.projectId] });
    },
  });
}
