import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Database,
  Table as TableIcon,
  Plus,
  Search,
  RefreshCw,
  Settings,
  Key,
  Shield,
} from 'lucide-react';

// Mock data for demonstration
const mockTables = [
  { name: 'profiles', rows: 156, size: '24 KB', rls: true },
  { name: 'projects', rows: 42, size: '12 KB', rls: true },
  { name: 'organizations', rows: 8, size: '4 KB', rls: true },
  { name: 'custom_roles', rows: 24, size: '8 KB', rls: true },
  { name: 'project_members', rows: 89, size: '16 KB', rls: true },
  { name: 'team_invitations', rows: 5, size: '2 KB', rls: true },
];

const mockColumns = [
  { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
  { name: 'user_id', type: 'uuid', nullable: false, default: null },
  { name: 'email', type: 'text', nullable: false, default: null },
  { name: 'full_name', type: 'text', nullable: true, default: null },
  { name: 'avatar_url', type: 'text', nullable: true, default: null },
  { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' },
  { name: 'updated_at', type: 'timestamptz', nullable: false, default: 'now()' },
];

export default function DatabaseBrowser() {
  const [selectedTable, setSelectedTable] = useState<string | null>('profiles');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTables = mockTables.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Database</h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage your database tables
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Table
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tables Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5" />
                Tables
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 px-3 pb-3">
                {filteredTables.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => setSelectedTable(table.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedTable === table.name
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-4 h-4" />
                      <span className="font-medium">{table.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {table.rls && (
                        <Shield className="w-3 h-3 text-accent" />
                      )}
                      <span className="text-xs opacity-70">{table.rows}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Table Details */}
          <div className="lg:col-span-3 space-y-6">
            {selectedTable ? (
              <>
                {/* Table Header */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TableIcon className="w-5 h-5" />
                          {selectedTable}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {mockTables.find((t) => t.name === selectedTable)?.rows} rows •{' '}
                          {mockTables.find((t) => t.name === selectedTable)?.size}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          RLS Enabled
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Table Content */}
                <Tabs defaultValue="columns" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="columns">Columns</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                    <TabsTrigger value="policies">RLS Policies</TabsTrigger>
                    <TabsTrigger value="indexes">Indexes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="columns">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Columns</CardTitle>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Column
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Nullable</TableHead>
                              <TableHead>Default</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockColumns.map((col) => (
                              <TableRow key={col.name}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {col.name === 'id' && (
                                      <Key className="w-3 h-3 text-primary" />
                                    )}
                                    {col.name}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{col.type}</Badge>
                                </TableCell>
                                <TableCell>
                                  {col.nullable ? 'Yes' : 'No'}
                                </TableCell>
                                <TableCell className="font-mono text-sm text-muted-foreground">
                                  {col.default || '-'}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm">
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="data">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Table Data</CardTitle>
                          <div className="flex gap-2">
                            <Input placeholder="Search..." className="w-64" />
                            <Button size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Insert Row
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Connect to your Supabase instance to view data</p>
                          <Button variant="outline" className="mt-4">
                            Configure Connection
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="policies">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">RLS Policies</CardTitle>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Policy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {['SELECT', 'INSERT', 'UPDATE', 'DELETE'].map((op) => (
                            <div key={op} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge>{op}</Badge>
                                  <span className="font-medium">
                                    {selectedTable}_{op.toLowerCase()}_policy
                                  </span>
                                </div>
                                <Button variant="ghost" size="sm">Edit</Button>
                              </div>
                              <code className="text-sm text-muted-foreground">
                                auth.uid() = user_id
                              </code>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="indexes">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Indexes</CardTitle>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Index
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Columns</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Unique</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                {selectedTable}_pkey
                              </TableCell>
                              <TableCell>id</TableCell>
                              <TableCell>btree</TableCell>
                              <TableCell>Yes</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                {selectedTable}_user_id_idx
                              </TableCell>
                              <TableCell>user_id</TableCell>
                              <TableCell>btree</TableCell>
                              <TableCell>No</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center py-12">
                <div className="text-center">
                  <TableIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a table to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
