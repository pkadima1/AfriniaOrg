import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Edit3, 
  Eye, 
  Crown,
  Mail,
  KeyRound,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Admin component for managing users and their roles
 */
export function UserManagement() {
  const { isAdmin, userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state for creating new users
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'viewer' as 'admin' | 'contributor' | 'viewer',
  });

  // Password reset form
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  /**
   * Load all users from the database
   */
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new user account
   */
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: newUser.fullName,
        },
      });

      if (authError) throw authError;

      // Update user profile with role
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            role: newUser.role,
            full_name: newUser.fullName,
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      toast({
        title: 'Success',
        description: `User ${newUser.email} created successfully`,
      });

      // Reset form
      setNewUser({
        email: '',
        password: '',
        fullName: '',
        role: 'viewer',
      });
      setShowCreateForm(false);
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Update user role
   */
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });

      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  /**
   * Toggle user active status
   */
  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });

      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  /**
   * Send password reset email
   */
  const handlePasswordReset = async (email: string) => {
    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Password reset email sent to ${email}`,
      });
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  /**
   * Get role badge color
   */
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'contributor':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'viewer':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  /**
   * Get role icon
   */
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3" />;
      case 'contributor':
        return <Edit3 className="w-3 h-3" />;
      case 'viewer':
        return <Eye className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      loadUsers();
    }
  }, [isAdmin]);

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <Shield className="w-4 h-4" />
          <AlertDescription>
            Only administrators can access user management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-400">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Temporary Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: any) => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="contributor">Contributor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Create User
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name || 'No name'}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                      disabled={user.id === userProfile?.id} // Can't change own role
                    >
                      <SelectTrigger className="w-40">
                        <Badge className={getRoleColor(user.role)}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            {user.role}
                          </span>
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="contributor">Contributor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      disabled={user.id === userProfile?.id} // Can't deactivate self
                      className={user.is_active ? 'text-green-400' : 'text-red-400'}
                    >
                      {user.is_active ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePasswordReset(user.email)}
                        disabled={isResetting}
                        title="Send password reset email"
                      >
                        {isResetting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <KeyRound className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                        title="Send email"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}