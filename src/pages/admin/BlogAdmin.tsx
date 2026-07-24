import { Routes, Route, Navigate } from 'react-router-dom';
import { BlogPostList } from '@/components/admin/BlogPostList';
import { BlogPostEditor } from '@/components/admin/BlogPostEditor';
import { UserManagement } from '@/components/admin/UserManagement';
import { AudioEpisodeList } from '@/components/admin/AudioEpisodeList';
import { AudioUpload } from '@/components/admin/AudioUpload';
import { NewsletterSubscribers } from '@/components/admin/NewsletterSubscribers';
import { ContactMessages } from '@/components/admin/ContactMessages';
import { SocialLinksSettings } from '@/components/admin/SocialLinksSettings';
import { NewsletterAdmin } from '@/pages/admin/NewsletterAdmin';
import { PopupTemplateAdmin } from '@/components/admin/PopupTemplateAdmin';
import { ContributorRoute, AdminRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Settings, Users, Crown, Edit3, Mic, Mail, Share2, BellRing, MessageSquare } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userProfile, isAdmin } = useAuth();

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
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/blog?lang=en')}>
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

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/admin/audio')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Audio Episodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Upload and manage bilingual audio episodes. Files go to Firebase
              Storage; metadata to Firestore.
            </p>
            <Button className="mt-3" variant="outline" size="sm">
              Manage Audio
            </Button>
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

        <Card
          className={isAdmin() ? "cursor-pointer hover:shadow-lg transition-shadow" : "opacity-50"}
          onClick={() => isAdmin() && navigate('/admin/subscribers')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Newsletter Subscribers
              {!isAdmin() && <Badge variant="outline" className="text-xs">Admin Only</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isAdmin()
                ? 'View, filter, export, and manage newsletter subscribers.'
                : 'Only administrators can view subscriber data.'
              }
            </p>
            {isAdmin() && (
              <div className="flex gap-2 mt-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); navigate('/admin/subscribers'); }}
                >
                  Manage Subscribers
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); navigate('/admin/newsletter'); }}
                >
                  Send Newsletter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Social Links settings card */}
        <Card className={isAdmin() ? "cursor-pointer hover:shadow-lg transition-shadow" : "opacity-50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Social Links
              {!isAdmin() && <Badge variant="outline" className="text-xs">Admin Only</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isAdmin()
                ? 'Toggle and configure social media links (Facebook, LinkedIn, X). Activate when pages are ready.'
                : 'Only administrators can configure social links.'
              }
            </p>
            {isAdmin() && (
              <Button className="mt-3" variant="outline" size="sm" onClick={() => navigate('/admin/social')}>
                Configure Social Links
              </Button>
            )}
          </CardContent>
        </Card>

        <Card
          className={isAdmin() ? "cursor-pointer hover:shadow-lg transition-shadow" : "opacity-50"}
          onClick={() => isAdmin() && navigate('/admin/messages')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Contact Messages
              {!isAdmin() && <Badge variant="outline" className="text-xs">Admin Only</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isAdmin()
                ? 'View, reply to, and manage messages submitted through the contact form.'
                : 'Only administrators can view contact messages.'}
            </p>
            {isAdmin() && (
              <Button className="mt-3" variant="outline" size="sm" onClick={e => { e.stopPropagation(); navigate('/admin/messages'); }}>
                View Messages
              </Button>
            )}
          </CardContent>
        </Card>

        <Card
          className={isAdmin() ? "cursor-pointer hover:shadow-lg transition-shadow" : "opacity-50"}
          onClick={() => isAdmin() && navigate('/admin/popup')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="w-5 h-5" />
              Subscribe Popup
              {!isAdmin() && <Badge variant="outline" className="text-xs">Admin Only</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isAdmin()
                ? 'Manage the subscribe popup: select template, edit bilingual copy, set trigger timing.'
                : 'Only administrators can manage the popup.'}
            </p>
            {isAdmin() && (
              <Button className="mt-3" variant="outline" size="sm" onClick={e => { e.stopPropagation(); navigate('/admin/popup'); }}>
                Configure Popup
              </Button>
            )}
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate('/admin/blog/new?lang=en')}>
              Create New Post (EN)
            </Button>
            <Button onClick={() => navigate('/admin/blog/new?lang=fr')}>
              Create New Post (FR)
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/blog?lang=en')}>
              View All Posts
            </Button>
            <Button variant="outline" onClick={() => window.open('/en/blog', '_blank')}>
              View Blog
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/audio/new?lang=en')}>
              Upload Audio (EN)
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/audio/new?lang=fr')}>
              Upload Audio (FR)
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
      {/* Audio management routes */}
      <Route
        path="/audio"
        element={
          <ContributorRoute>
            <AudioEpisodeList />
          </ContributorRoute>
        }
      />
      <Route
        path="/audio/new"
        element={
          <ContributorRoute>
            <AudioUpload />
          </ContributorRoute>
        }
      />

      <Route
        path="/subscribers"
        element={
          <AdminRoute>
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />Back
                </Button>
                <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
              </div>
              <NewsletterSubscribers />
            </div>
          </AdminRoute>
        }
      />
      <Route
        path="/social"
        element={
          <AdminRoute>
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />Back
                </Button>
                <h1 className="text-3xl font-bold">Social Links Settings</h1>
              </div>
              <SocialLinksSettings />
            </div>
          </AdminRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <AdminRoute>
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />Back
                </Button>
                <h1 className="text-3xl font-bold">Contact Messages</h1>
              </div>
              <ContactMessages />
            </div>
          </AdminRoute>
        }
      />
      <Route
        path="/newsletter"
        element={
          <AdminRoute>
            <NewsletterAdmin />
          </AdminRoute>
        }
      />
      <Route
        path="/popup"
        element={
          <AdminRoute>
            <PopupTemplateAdmin />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};