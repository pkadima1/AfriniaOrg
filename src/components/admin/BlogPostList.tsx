import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { fetchBlogPosts, saveBlogPost, deleteBlogPost } from "@/integrations/firebase/blogService";
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Edit, Trash2, Eye, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import type { Lang } from "@/utils/languageUtils";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export const BlogPostList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin, userProfile } = useAuth();

  // Language selection — reads from ?lang= query param, defaults to 'en'
  const langParam = searchParams.get('lang');
  const lang: Lang = langParam === 'fr' ? 'fr' : 'en';

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const setLang = (l: Lang) => {
    const next = new URLSearchParams(searchParams);
    next.set('lang', l);
    setSearchParams(next, { replace: true });
  };

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        searchTerm: searchTerm || undefined,
      };
      const data = await fetchBlogPosts(filters, lang);
      setPosts(data.map(post => ({
        ...post,
        status: post.status as 'draft' | 'published' | 'archived',
        category: post.category || '',
        tags: post.tags || []
      })));
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      void loadPosts();
    }, 300);
    return () => clearTimeout(debounceTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, categoryFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!isAdmin()) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete posts",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    try {
      const success = await deleteBlogPost(id, lang);
      if (!success) throw new Error('Delete failed');
      toast({ title: "Success", description: "Blog post deleted successfully" });
      void loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: "Error", description: "Failed to delete blog post", variant: "destructive" });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const post = posts.find(p => p.id === id);
      if (!post) return;

      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const success = await saveBlogPost(updateData, id, lang);
      if (!success) throw new Error('Update failed');

      toast({ title: "Success", description: `Post ${newStatus} successfully` });
      void loadPosts();
    } catch (error) {
      console.error('Error updating post status:', error);
      toast({ title: "Error", description: "Failed to update post status", variant: "destructive" });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    try { return format(new Date(dateString), 'MMM dd, yyyy'); } catch { return '—'; }
  };

  const uniqueCategories = [...new Set(posts.map(post => post.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading blog posts…</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-sm text-gray-400 mt-1">
            Logged in as {userProfile?.full_name || userProfile?.email} ({userProfile?.role})
            {!isAdmin() && " • Contact admin for delete permissions"}
          </p>
        </div>
        <Button onClick={() => navigate(`/admin/blog/new?lang=${lang}`)}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Language tabs */}
      <div className="flex gap-2 mb-6">
        {(['en', 'fr'] as Lang[]).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-5 py-2 text-sm font-medium tracking-widest uppercase transition-colors border ${
              lang === l
                ? 'border-[#B8912A] text-[#B8912A] bg-[#B8912A]/10'
                : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
            }`}
          >
            {l === 'en' ? '🇺🇸 English' : '🇫🇷 Français'}
          </button>
        ))}
        <span className="ml-3 self-center text-xs text-gray-500">
          Collection: <code className="text-gray-300">posts_{lang}</code>
        </span>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                        ? 'No posts match your filters'
                        : `No ${lang.toUpperCase()} posts yet. Create your first post!`}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-muted-foreground">/{post.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>{post.author_name}</TableCell>
                    <TableCell>
                      {post.category && <Badge variant="outline">{post.category}</Badge>}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={post.status}
                        onValueChange={(value) => handleStatusChange(post.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge variant={getStatusBadgeVariant(post.status)}>
                            {post.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {post.published_at ? formatDate(post.published_at) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(post.updated_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/admin/blog/edit/${post.id}?lang=${lang}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {post.status === 'published' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/${lang}/blog/${post.slug}`, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {isAdmin() ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(post.id, post.title)}
                            className="text-destructive hover:text-destructive"
                            title="Delete post (Admin only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled
                            className="text-gray-500 cursor-not-allowed"
                            title="Only administrators can delete posts"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
