import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BlogPostList } from '@/components/admin/BlogPostList';
import { BlogPostEditor } from '@/components/admin/BlogPostEditor';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Settings, Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Site
          </Button>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/blog')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Blog Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create, edit, and manage your blog posts with a WordPress-like interface.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage user accounts and permissions. (Coming soon)
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configure site settings and preferences. (Coming soon)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/admin/blog/new')}>
              Create New Post
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/blog')}>
              View All Posts
            </Button>
            <Button variant="outline" onClick={() => navigate('/blog')}>
              View Blog
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const BlogAdmin = () => {
  const location = useLocation();
  
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/blog" element={<BlogPostList />} />
      <Route path="/blog/new" element={<BlogPostEditor />} />
      <Route path="/blog/edit/:id" element={<BlogPostEditor />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};