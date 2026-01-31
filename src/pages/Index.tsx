import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Database, Shield, Users, Zap, ArrowRight, HardDrive, Activity } from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: Database,
      title: 'Database Management',
      description: 'Browse tables, manage schemas, and edit data with a powerful SQL editor',
    },
    {
      icon: Shield,
      title: 'Authentication',
      description: 'Built-in user management with providers, RLS policies, and security',
    },
    {
      icon: HardDrive,
      title: 'Storage',
      description: 'Manage file buckets, upload assets, and configure access policies',
    },
    {
      icon: Zap,
      title: 'Edge Functions',
      description: 'Deploy and manage serverless functions at the edge',
    },
    {
      icon: Users,
      title: 'Team & Permissions',
      description: 'Custom roles per project with granular permission control',
    },
    {
      icon: Activity,
      title: 'Monitoring & Logs',
      description: 'Real-time logs, metrics, and health monitoring for your projects',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Supabase Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Self-Hosted Management Dashboard
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
            Manage Your Self-Hosted{' '}
            <span className="text-primary">Supabase</span> Instance
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A powerful admin dashboard for your self-hosted Supabase server at{' '}
            <strong>apps.swoselectrical.com</strong>. Manage databases, authentication,
            storage, and team permissions all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Manage Supabase
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete admin interface for managing your self-hosted Supabase infrastructure
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Setup Instructions */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Quick Setup Guide
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Create an Account</h3>
                  <p className="text-muted-foreground">
                    Sign up with your email and password to access the admin dashboard
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Create an Organization</h3>
                  <p className="text-muted-foreground">
                    Set up your organization to group related projects together
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Connect Your Supabase Instance</h3>
                  <p className="text-muted-foreground">
                    Add your self-hosted Supabase URL and API keys to connect the dashboard
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Invite Your Team</h3>
                  <p className="text-muted-foreground">
                    Add team members with custom roles and permissions per project
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-sidebar-accent-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Create your account and start managing your self-hosted Supabase instance today.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2024 Supabase Admin Dashboard. Built for apps.swoselectrical.com</p>
        </div>
      </footer>
    </div>
  );
}
