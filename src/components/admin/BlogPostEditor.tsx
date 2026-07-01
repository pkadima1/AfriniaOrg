import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchBlogPostById, saveBlogPost, uploadBlogImage } from "@/integrations/firebase/blogService";
import { ArrowLeft, Save, Eye, X, Bell } from "lucide-react";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { Lang } from "@/utils/languageUtils";
import {
  SIGNAL_CATEGORIES,
  SIGNAL_SECTORS,
  SIGNAL_REGIONS,
  CATEGORY_LABEL_MAP,
} from '@/constants/taxonomy';
import type { PostCategory, PostSector, PostRegion } from '@/integrations/firebase/types';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  category?: PostCategory;
  categoryEN?: string;
  categoryFR?: string;
  sector?: PostSector;
  region?: PostRegion;
  tags: string[];
  meta_title: string;
  meta_description: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  content_language: 'en' | 'fr' | 'both';
  target_countries: string[];
}

interface CountryEntry { name: string; lang: 'fr' | 'en' | 'both' | 'pt' }

const COUNTRY_GROUPS: { label: string; flag: string; lang: 'fr' | 'en' | 'both' | 'pt'; countries: CountryEntry[] }[] = [
  {
    label: 'Francophone', flag: '🇫🇷', lang: 'fr',
    countries: [
      { name: 'DR Congo',                  lang: 'fr' },
      { name: "Côte d'Ivoire",             lang: 'fr' },
      { name: 'Senegal',                   lang: 'fr' },
      { name: 'Mali',                      lang: 'fr' },
      { name: 'Burkina Faso',              lang: 'fr' },
      { name: 'Niger',                     lang: 'fr' },
      { name: 'Guinea',                    lang: 'fr' },
      { name: 'Chad',                      lang: 'fr' },
      { name: 'Togo',                      lang: 'fr' },
      { name: 'Benin',                     lang: 'fr' },
      { name: 'Madagascar',                lang: 'fr' },
      { name: 'Central African Republic',  lang: 'fr' },
      { name: 'Gabon',                     lang: 'fr' },
      { name: 'Congo',                     lang: 'fr' },
      { name: 'Djibouti',                  lang: 'fr' },
      { name: 'Comoros',                   lang: 'fr' },
      { name: 'Mauritania',                lang: 'fr' },
      { name: 'Burundi',                   lang: 'fr' },
      { name: 'Algeria',                   lang: 'fr' },
      { name: 'Morocco',                   lang: 'fr' },
      { name: 'Tunisia',                   lang: 'fr' },
    ],
  },
  {
    label: 'Anglophone', flag: '🇬🇧', lang: 'en',
    countries: [
      { name: 'Nigeria',       lang: 'en' },
      { name: 'Ethiopia',      lang: 'en' },
      { name: 'Egypt',         lang: 'en' },
      { name: 'Tanzania',      lang: 'en' },
      { name: 'Kenya',         lang: 'en' },
      { name: 'Sudan',         lang: 'en' },
      { name: 'Uganda',        lang: 'en' },
      { name: 'Ghana',         lang: 'en' },
      { name: 'Zambia',        lang: 'en' },
      { name: 'Zimbabwe',      lang: 'en' },
      { name: 'Malawi',        lang: 'en' },
      { name: 'Sierra Leone',  lang: 'en' },
      { name: 'Liberia',       lang: 'en' },
      { name: 'Gambia',        lang: 'en' },
      { name: 'Botswana',      lang: 'en' },
      { name: 'Namibia',       lang: 'en' },
      { name: 'Lesotho',       lang: 'en' },
      { name: 'Eswatini',      lang: 'en' },
      { name: 'Somalia',       lang: 'en' },
      { name: 'South Sudan',   lang: 'en' },
      { name: 'Eritrea',       lang: 'en' },
      { name: 'Libya',         lang: 'en' },
    ],
  },
  {
    label: 'Bilingual FR/EN', flag: '🌍', lang: 'both',
    countries: [
      { name: 'Cameroon',     lang: 'both' },
      { name: 'Rwanda',       lang: 'both' },
      { name: 'South Africa', lang: 'both' },
      { name: 'Seychelles',   lang: 'both' },
      { name: 'Mauritius',    lang: 'both' },
    ],
  },
  {
    label: 'Lusophone', flag: '🇵🇹', lang: 'pt',
    countries: [
      { name: 'Angola',                lang: 'pt' },
      { name: 'Mozambique',            lang: 'pt' },
      { name: 'Cape Verde',            lang: 'pt' },
      { name: 'Guinea-Bissau',         lang: 'pt' },
      { name: 'São Tomé & Príncipe',   lang: 'pt' },
      { name: 'Equatorial Guinea',     lang: 'pt' },
    ],
  },
];

export const BlogPostEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);
  const { user } = useAuth();

  // Read language from ?lang= query param — defaults to 'en'
  const langParam = searchParams.get('lang');
  const lang: Lang = langParam === 'fr' ? 'fr' : 'en';

  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author_name: 'Admin',
    status: 'draft',
    category: undefined,
    categoryEN: undefined,
    categoryFR: undefined,
    sector: undefined,
    region: undefined,
    tags: [],
    meta_title: '',
    meta_description: '',
    content_language: 'en' as const,
    target_countries: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  // When true, publishing this post fires an email to subscribers in this language.
  const [notifySubscribers, setNotifySubscribers] = useState(false);

  const loadPost = async (postId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchBlogPostById(postId, lang);
      if (data) {
        setPost({
          id: data.id,
          title: data.title,
          slug: data.slug,
          author_name: data.author_name,
          tags: data.tags || [],
          status: data.status as 'draft' | 'published' | 'archived',
          category: (data.category as PostCategory) || undefined,
          categoryEN: data.categoryEN,
          categoryFR: data.categoryFR,
          sector: (data.sector as PostSector) || undefined,
          region: (data.region as PostRegion) || undefined,
          content: data.content || '',
          excerpt: data.excerpt || '',
          featured_image_url: data.featured_image_url,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          published_at: data.published_at,
          created_at: data.created_at,
          updated_at: data.updated_at,
          content_language: (data.content_language as 'en' | 'fr' | 'both') || 'en',
          target_countries: (data.target_countries as string[]) || [],
        });
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast({
        title: "Error",
        description: "Failed to load blog post",
        variant: "destructive"
      });
      navigate(`/admin/blog?lang=${lang}`);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isEditing && id) {
      void loadPost(id);
    }
  }, [id, isEditing]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setPost(prev => ({
      ...prev,
      title,
      slug: !isEditing ? generateSlug(title) : prev.slug
    }));
  };

  const uploadImage = async (file: File) => {
    setImageUploading(true);
    try {
      const imageUrl = await uploadBlogImage(file);
      if (!imageUrl) throw new Error('Upload failed');
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setPost(prev => ({ ...prev, featured_image_url: imageUrl }));
      toast({ title: "Success", description: "Image uploaded successfully" });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  // Fires the newsletter broadcast with a branded article announcement email.
  // Called after a successful publish when the "Notify subscribers" toggle is ON.
  const notifyNewArticle = async (publishedPost: BlogPost) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const articleUrl = `https://afrinia.org/${lang}/blog/${publishedPost.slug}`;
      const isFr = lang === 'fr';

      // Brand tokens — must match netlify/functions/lib/email-templates/base.js
      const C = { gold: '#B8912A', cream: '#F5F0E8', muted: '#8a9bb5', dark: '#0a1628' };

      const buildBody = (title: string, excerpt: string, ctaLabel: string, eyebrow: string, featuredImageUrl?: string) => `
        ${featuredImageUrl ? `
        <!-- Featured image hero — table-based for email client compatibility -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;">
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="${featuredImageUrl}" alt="${title}" width="520"
                style="display:block;width:100%;max-width:520px;height:auto;border:0;" />
            </td>
          </tr>
        </table>
        ` : ''}

        <!-- Eyebrow -->
        <p style="margin:0 0 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.gold};">
          ${eyebrow}
        </p>

        <!-- Article headline -->
        <h1 style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:300;color:${C.cream};line-height:1.3;">
          ${title}
        </h1>

        <!-- Gold divider -->
        <div style="width:40px;height:1px;background:${C.gold};opacity:0.5;margin:0 0 24px;"></div>

        <!-- Excerpt -->
        ${excerpt ? `<p style="margin:0 0 32px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:300;color:${C.muted};line-height:1.8;">${excerpt}</p>` : ''}

        <!-- Gold CTA button — table-based for email client compatibility -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0;">
          <tr>
            <td style="background-color:${C.gold};padding:0;">
              <a href="${articleUrl}"
                style="display:inline-block;padding:14px 36px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${C.dark};text-decoration:none;white-space:nowrap;">
                ${ctaLabel}
              </a>
            </td>
          </tr>
        </table>
      `;

      const bodyHtml = buildBody(
        publishedPost.title,
        publishedPost.excerpt,
        isFr ? 'LIRE L\'ARTICLE' : 'READ THE ARTICLE',
        isFr ? 'Nouvel article' : 'New Article',
        publishedPost.featured_image_url,
      );

      const res = await fetch('/.netlify/functions/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          subject_en: publishedPost.title,
          subject_fr: isFr ? publishedPost.title : '',
          body_en: bodyHtml,
          body_fr: isFr ? bodyHtml : '',
          lang_filter: lang,
        }),
      });

      const result = await res.json() as { sent: number; failed: number };
      toast({
        title: `Sent to ${result.sent} subscriber${result.sent !== 1 ? 's' : ''}`,
        description: result.failed > 0 ? `${result.failed} delivery failed.` : undefined,
      });
    } catch (err) {
      console.error('[BlogPostEditor] Subscriber notify failed:', err);
      toast({
        title: 'Article published — subscriber notification failed',
        description: 'Go to Admin → Newsletter to send manually.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (status?: 'draft' | 'published') => {
    setSaving(true);
    try {
      const postData = {
        ...post,
        ...(status && { status }),
        ...(status === 'published' && !post.published_at && { published_at: new Date().toISOString() })
      };

      // Save to the language-specific collection (posts_en or posts_fr)
      const docId = await saveBlogPost(postData, post.id, lang);
      if (!docId) throw new Error('Failed to save post');

      toast({
        title: "Success",
        description: `Blog post ${status === 'published' ? 'published' : 'saved'} successfully`
      });

      // Auto-notify subscribers if the toggle is ON and we're publishing.
      // Reset toggle immediately so re-saves don't re-send.
      if (status === 'published' && notifySubscribers) {
        setNotifySubscribers(false);
        void notifyNewArticle(postData);
      }

      if (!isEditing) {
        navigate(`/admin/blog?lang=${lang}`);
      } else {
        setPost(prev => ({ ...prev, id: docId }));
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({ title: "Error", description: "Failed to save blog post", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/admin/blog?lang=${lang}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Posts
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </h1>
          {/* Language indicator badge */}
          <Badge
            variant="outline"
            className={lang === 'fr' ? 'border-blue-400 text-blue-400' : 'border-green-400 text-green-400'}
          >
            {lang === 'fr' ? '🇫🇷 Français → posts_fr' : '🇺🇸 English → posts_en'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={isSaving}
          >
            <Eye className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={post.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title..."
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={post.slug}
                  onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="post-url-slug"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={post.excerpt}
                  onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the post..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <div className="quill-editor-wrapper text-base">
                  <ReactQuill
                    value={post.content}
                    onChange={(content) => setPost(prev => ({ ...prev, content }))}
                    placeholder="Write your blog post content here..."
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        ['blockquote', 'code-block'],
                        ['link', 'image'],
                        [{ 'align': [] }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header', 'bold', 'italic', 'underline', 'strike',
                      'list', 'bullet', 'indent', 'blockquote', 'code-block',
                      'link', 'image', 'align', 'color', 'background'
                    ]}
                    style={{ height: '480px', marginBottom: '50px', fontSize: '1rem' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="featured-image">Featured Image</Label>
                <div className="space-y-2">
                  {post.featured_image_url && (
                    <img
                      src={post.featured_image_url}
                      alt="Featured"
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                    {imageUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={post.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setPost(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={post.author_name}
                    onChange={(e) => setPost(prev => ({ ...prev, author_name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Signal Type</Label>
                <Select
                  value={post.category || ''}
                  onValueChange={(value) => {
                    const key = value as PostCategory;
                    const labels = CATEGORY_LABEL_MAP[key];
                    setPost(prev => ({
                      ...prev,
                      category: key,
                      categoryEN: labels.en,
                      categoryFR: labels.fr,
                    }));
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="— Select Signal Type —" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNAL_CATEGORIES.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.labelEN} / {c.labelFR}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Select
                  value={post.sector || ''}
                  onValueChange={(value) =>
                    setPost(prev => ({ ...prev, sector: value as PostSector }))
                  }
                >
                  <SelectTrigger id="sector">
                    <SelectValue placeholder="— Select Sector —" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNAL_SECTORS.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={post.region || ''}
                  onValueChange={(value) =>
                    setPost(prev => ({ ...prev, region: value as PostRegion }))
                  }
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="— Select Region —" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNAL_REGIONS.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                      }}
                    />
                    <Button type="button" onClick={addTag} variant="outline">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Subscriber notification toggle ── */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Bell className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Notify subscribers on publish</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Sends an email to {lang === 'fr' ? 'French' : 'English'} subscribers
                        with the article title and excerpt when you click Publish.
                        Resets after each send.
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="notify-subscribers"
                    checked={notifySubscribers}
                    onCheckedChange={setNotifySubscribers}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AUDIENCE TAB ── */}
        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audience Targeting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Content language */}
              <div>
                <Label htmlFor="content_language">Content Language</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Which language is this content written in?
                </p>
                <Select
                  value={post.content_language}
                  onValueChange={(v) =>
                    setPost(prev => ({ ...prev, content_language: v as 'en' | 'fr' | 'both' }))
                  }
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English only</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français uniquement</SelectItem>
                    <SelectItem value="both">🌍 Both / Bilingue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target countries */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Target Countries</Label>
                  {post.target_countries.length > 0 && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => setPost(prev => ({ ...prev, target_countries: [] }))}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the African markets this content targets. Use "Select all" per group for quick bulk selection.
                </p>

                {/* Grouped country chips */}
                <div className="space-y-5">
                  {COUNTRY_GROUPS.map(group => {
                    const groupNames = group.countries.map(c => c.name);
                    const allSelected = groupNames.every(n => post.target_countries.includes(n));
                    return (
                      <div key={group.label}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            {group.flag} {group.label}
                          </span>
                          <button
                            type="button"
                            className="text-xs text-primary underline-offset-2 hover:underline"
                            onClick={() =>
                              setPost(prev => ({
                                ...prev,
                                target_countries: allSelected
                                  ? prev.target_countries.filter(c => !groupNames.includes(c))
                                  : [...new Set([...prev.target_countries, ...groupNames])],
                              }))
                            }
                          >
                            {allSelected ? 'Deselect all' : 'Select all'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.countries.map(({ name }) => {
                            const selected = post.target_countries.includes(name);
                            return (
                              <button
                                key={name}
                                type="button"
                                onClick={() =>
                                  setPost(prev => ({
                                    ...prev,
                                    target_countries: selected
                                      ? prev.target_countries.filter(c => c !== name)
                                      : [...prev.target_countries, name],
                                  }))
                                }
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                  selected
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                                }`}
                              >
                                {name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected as removable badges */}
                {post.target_countries.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md mt-4">
                    <span className="text-xs text-muted-foreground self-center mr-1">
                      Selected ({post.target_countries.length}):
                    </span>
                    {post.target_countries.map(c => (
                      <Badge key={c} variant="secondary" className="flex items-center gap-1">
                        {c}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() =>
                            setPost(prev => ({
                              ...prev,
                              target_countries: prev.target_countries.filter(x => x !== c),
                            }))
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={post.meta_title}
                  onChange={(e) => setPost(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO title (max 60 characters)"
                  maxLength={60}
                />
                <p className="text-sm text-muted-foreground mt-1">{post.meta_title.length}/60 characters</p>
              </div>

              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={post.meta_description}
                  onChange={(e) => setPost(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO description (max 160 characters)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">{post.meta_description.length}/160 characters</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
