import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  organizations?: {
    name: string;
    slug: string;
  };
}

interface CreateProjectInput {
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  supabase_url?: string;
  supabase_anon_key?: string;
  supabase_service_key?: string;
}

export function useProjects(organizationId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', organizationId, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*, organizations(name, slug)')
        .order('created_at', { ascending: false });
      
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });
}

export function useProject(projectId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, organizations(name, slug)')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    enabled: !!user && !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
