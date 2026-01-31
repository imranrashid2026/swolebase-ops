import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProject } from '@/hooks/useProjects';
import { useCustomRoles, useProjectMembers } from '@/hooks/useTeam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Database,
  HardDrive,
  Zap,
  Users,
  Settings,
  Activity,
  ExternalLink,
  Clock,
  Shield,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const { data: roles } = useCustomRoles(projectId!);
  const { data: members } = useProjectMembers(projectId!);

  if (projectLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">
            This project may have been deleted or you don't have access.
          </p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const quickActions = [
    { name: 'Database', icon: Database, href: `/dashboard/projects/${projectId}/database`, color: 'bg-primary' },
    { name: 'Storage', icon: HardDrive, href: `/dashboard/projects/${projectId}/storage`, color: 'bg-accent' },
    { name: 'Functions', icon: Zap, href: `/dashboard/projects/${projectId}/functions`, color: 'bg-warning' },
    { name: 'Auth', icon: Shield, href: `/dashboard/projects/${projectId}/auth`, color: 'bg-success' },
    { name: 'Logs', icon: Activity, href: `/dashboard/projects/${projectId}/logs`, color: 'bg-purple-500' },
    { name: 'Settings', icon: Settings, href: `/dashboard/projects/${projectId}/settings`, color: 'bg-muted-foreground' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {project.organizations?.name} • Updated {formatDistanceToNow(new Date(project.updated_at))} ago
            </p>
          </div>
          {project.supabase_url && (
            <Button variant="outline" asChild>
              <a href={project.supabase_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Supabase
              </a>
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link key={action.name} to={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium text-sm">{action.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Project Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Description</label>
                    <p className="mt-1">{project.description || 'No description'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Supabase URL</label>
                    <p className="mt-1 font-mono text-sm">
                      {project.supabase_url || 'Not configured'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Created</label>
                    <p className="mt-1">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Team Members</span>
                    </div>
                    <span className="font-semibold">{members?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span>Custom Roles</span>
                    </div>
                    <span className="font-semibold">{roles?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Last Activity</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(project.updated_at))} ago
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  People with access to this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {members && members.length > 0 ? (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.user_id.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              User {member.user_id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Member since {new Date(member.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {member.custom_roles?.name || 'No Role'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No team members yet</p>
                    <Button className="mt-4">
                      Invite Team Member
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Custom Roles</CardTitle>
                    <CardDescription>
                      Define permissions for team members
                    </CardDescription>
                  </div>
                  <Button>Create Role</Button>
                </div>
              </CardHeader>
              <CardContent>
                {roles && roles.length > 0 ? (
                  <div className="space-y-4">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{role.name}</h4>
                            {role.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {role.description || 'No description'}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {role.permissions.slice(0, 5).map((perm) => (
                              <Badge key={perm} variant="outline" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                            {role.permissions.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No custom roles defined</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
