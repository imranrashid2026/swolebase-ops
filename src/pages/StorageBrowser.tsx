import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  HardDrive,
  FolderOpen,
  Plus,
  Search,
  RefreshCw,
  Upload,
  Download,
  Trash2,
  Lock,
  Globe,
  FileImage,
  FileText,
  File,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Mock data
const mockBuckets = [
  { name: 'avatars', public: true, files: 234, size: '45.2 MB' },
  { name: 'documents', public: false, files: 89, size: '128.5 MB' },
  { name: 'images', public: true, files: 567, size: '1.2 GB' },
  { name: 'backups', public: false, files: 12, size: '5.6 GB' },
];

const mockFiles = [
  { name: 'avatar-1.png', size: '124 KB', type: 'image/png', created: new Date(2024, 0, 15) },
  { name: 'avatar-2.jpg', size: '89 KB', type: 'image/jpeg', created: new Date(2024, 0, 14) },
  { name: 'profile-photo.png', size: '256 KB', type: 'image/png', created: new Date(2024, 0, 13) },
  { name: 'document.pdf', size: '1.2 MB', type: 'application/pdf', created: new Date(2024, 0, 12) },
  { name: 'readme.txt', size: '4 KB', type: 'text/plain', created: new Date(2024, 0, 11) },
];

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return FileImage;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

export default function StorageBrowser() {
  const [selectedBucket, setSelectedBucket] = useState<string | null>('avatars');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuckets = mockBuckets.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Storage</h1>
            <p className="text-muted-foreground mt-1">
              Manage your file storage buckets
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Bucket
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7.0 GB</div>
              <p className="text-xs text-muted-foreground">of 10 GB limit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Buckets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockBuckets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockBuckets.reduce((acc, b) => acc + b.files, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Public Buckets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockBuckets.filter((b) => b.public).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Buckets Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Buckets
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search buckets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 px-3 pb-3">
                {filteredBuckets.map((bucket) => (
                  <button
                    key={bucket.name}
                    onClick={() => setSelectedBucket(bucket.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedBucket === bucket.name
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      <span className="font-medium">{bucket.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {bucket.public ? (
                        <Globe className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      <span className="text-xs opacity-70">{bucket.files}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bucket Content */}
          <div className="lg:col-span-3">
            {selectedBucket ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" />
                        {selectedBucket}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {mockBuckets.find((b) => b.name === selectedBucket)?.files} files •{' '}
                        {mockBuckets.find((b) => b.name === selectedBucket)?.size}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          mockBuckets.find((b) => b.name === selectedBucket)?.public
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {mockBuckets.find((b) => b.name === selectedBucket)?.public ? (
                          <>
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Private
                          </>
                        )}
                      </Badge>
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockFiles.map((file) => {
                        const FileIcon = getFileIcon(file.type);
                        return (
                          <TableRow key={file.name}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileIcon className="w-4 h-4 text-muted-foreground" />
                                {file.name}
                              </div>
                            </TableCell>
                            <TableCell>{file.size}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{file.type.split('/')[1]}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(file.created)} ago
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center py-12">
                <div className="text-center">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a bucket to view files</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
