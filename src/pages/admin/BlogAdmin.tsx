import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BlogPostList } from '@/components/admin/BlogPostList';
import { BlogPostEditor } from '@/components/admin/BlogPostEditor';
import { UserManagement } from '@/components/admin/UserManagement';
import { ContributorRoute, AdminRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Settings, Users, Crown, Edit3 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userProfile, isAdmin, isContributor } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Site
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isAdmin() ? 'Admin Dashboard' : 'Content Management'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {userProfile?.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                {userProfile?.role === 'contributor' && <Edit3 className="w-3 h-3 mr-1" />}
                {userProfile?.role?.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-400">
                {userProfile?.full_name || userProfile?.email}
              </span>
            </div>
          </div>
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
              {isAdmin() 
                ? 'Create, edit, and manage your blog posts with full control.'
                : 'Create and edit blog posts. Contact admin for advanced permissions.'
              }
            </p>
          </CardContent>
        </Card>

        <Card className={isAdmin() ? "cursor-pointer hover:shadow-lg transition-shadow" : "opacity-50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
              {!isAdmin() && <Badge variant="outline" className="text-xs">Admin Only</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isAdmin() 
                ? 'Manage user accounts, roles, and permissions.'
                : 'Only administrators can manage users.'
              }
            </p>
            {isAdmin() && (
              <Button 
                className="mt-3" 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className={isAdmin() ? "cursor-pointer hover:shadow-lg transition-shadow" : "opacity-50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
              {!isAdmin() && <Badge variant="outline" className="text-xs">Admin Only</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isAdmin() 
                ? 'Configure site settings and preferences. (Coming soon)'
                : 'Only administrators can modify settings.'
              }
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
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route 
        path="/blog" 
        element={
          <ContributorRoute>
            <BlogPostList />
          </ContributorRoute>
        } 
      />
      <Route 
        path="/blog/new" 
        element={
          <ContributorRoute>
            <BlogPostEditor />
          </ContributorRoute>
        } 
      />
      <Route 
        path="/blog/edit/:id" 
        element={
          <ContributorRoute>
            <BlogPostEditor />
          </ContributorRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <AdminRoute>
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-3xl font-bold">User Management</h1>
              </div>
              <UserManagement />
            </div>
          </AdminRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};