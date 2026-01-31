import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrganizations, useCreateOrganization } from '@/hooks/useOrganizations';
import { useCreateProject } from '@/hooks/useProjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const projectSchema = z.object({
  organization_id: z.string().min(1, 'Please select an organization'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
  supabase_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  supabase_anon_key: z.string().optional(),
  supabase_service_key: z.string().optional(),
});

const orgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type OrgFormData = z.infer<typeof orgSchema>;

export default function NewProject() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: organizations, isLoading: orgsLoading } = useOrganizations();
  const createProject = useCreateProject();
  const createOrg = useCreateOrganization();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      organization_id: '',
      name: '',
      slug: '',
      description: '',
      supabase_url: '',
      supabase_anon_key: '',
      supabase_service_key: '',
    },
  });

  const orgForm = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
    defaultValues: { name: '', slug: '' },
  });

  // Auto-generate slug from name
  const watchName = form.watch('name');
  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    form.setValue('slug', slug);
  };

  async function onSubmit(data: ProjectFormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const project = await createProject.mutateAsync({
        organization_id: data.organization_id,
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        supabase_url: data.supabase_url || undefined,
        supabase_anon_key: data.supabase_anon_key || undefined,
        supabase_service_key: data.supabase_service_key || undefined,
      });

      toast.success('Project created successfully!');
      navigate(`/dashboard/projects/${project.id}`);
    } catch (err: any) {
      if (err.message?.includes('duplicate')) {
        setError('A project with this slug already exists in the organization.');
      } else {
        setError(err.message || 'Failed to create project');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onCreateOrg(data: OrgFormData) {
    try {
      const org = await createOrg.mutateAsync({
        name: data.name,
        slug: data.slug,
      });
      form.setValue('organization_id', org.id);
      setOrgDialogOpen(false);
      orgForm.reset();
      toast.success('Organization created!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create organization');
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Project</CardTitle>
            <CardDescription>
              Connect your self-hosted Supabase instance to manage it from this dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Organization */}
                <FormField
                  control={form.control}
                  name="organization_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={orgsLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select an organization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {organizations?.map((org) => (
                              <SelectItem key={org.id} value={org.id}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Organization</DialogTitle>
                              <DialogDescription>
                                Organizations help you group related projects together
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...orgForm}>
                              <form onSubmit={orgForm.handleSubmit(onCreateOrg)} className="space-y-4">
                                <FormField
                                  control={orgForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Name</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="My Company" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={orgForm.control}
                                  name="slug"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Slug</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="my-company" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button type="submit" className="w-full" disabled={createOrg.isPending}>
                                  {createOrg.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  Create Organization
                                </Button>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="My Supabase Project"
                          onChange={(e) => {
                            field.onChange(e);
                            handleNameChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Slug */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="my-supabase-project" />
                      </FormControl>
                      <FormDescription>
                        Used in URLs. Only lowercase letters, numbers, and hyphens.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="A brief description of this project..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Supabase Connection */}
                <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Supabase Connection (Optional)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connect to your self-hosted Supabase instance at apps.swoselectrical.com
                  </p>

                  <FormField
                    control={form.control}
                    name="supabase_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supabase URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://your-project.supabase.co" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supabase_anon_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anon Key</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="eyJhbGciOiJI..." type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supabase_service_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Role Key</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="eyJhbGciOiJI..." type="password" />
                        </FormControl>
                        <FormDescription>
                          Required for admin operations. Keep this secret!
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Project
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
