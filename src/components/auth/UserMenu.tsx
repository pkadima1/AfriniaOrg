import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  LogIn,
  UserPlus,
  Crown,
  Edit3,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { routes } from '@/routing/routes';

/**
 * UserMenu component that displays authentication controls and user profile options
 */
export function UserMenu() {
  const { 
    isAuthenticated, 
    isLoading, 
    userProfile, 
    signOut, 
    isAdmin, 
    isContributor 
  } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const { t } = useTranslation();

  /**
   * Handle user sign out
   */
  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: t('auth.toasts.error'),
          description: t('auth.toasts.signOutFailed'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('auth.toasts.success'),
          description: t('auth.toasts.signedOut'),
        });
        navigate(routes.home());
      }
    } catch (error) {
      toast({
        title: t('auth.toasts.error'),
        description: t('auth.errors.unexpected'),
        variant: 'destructive',
      });
    }
  };

  /**
   * Get role-specific icon
   */
  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3" />;
      case 'contributor':
        return <Edit3 className="w-3 h-3" />;
      case 'viewer':
        return <Eye className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  /**
   * Get role-specific color
   */
  const getRoleColor = (role?: string) => {
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
   * Get user's initials for avatar fallback
   */
  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
    );
  }

  // Show auth buttons if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setAuthModalTab('login');
            setShowAuthModal(true);
          }}
          className="text-gray-300 hover:text-white"
        >
          <LogIn className="w-4 h-4 mr-2" />
          {t('auth.signIn')}
        </Button>
        
        <Button
          size="sm"
          onClick={() => {
            setAuthModalTab('register');
            setShowAuthModal(true);
          }}
          className="bg-accent-blue hover:bg-accent-blue/80"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {t('auth.signUp')}
        </Button>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab={authModalTab}
        />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={userProfile?.avatar_url} 
              alt={userProfile?.full_name || userProfile?.email || t('auth.menu.userFallback')} 
            />
            <AvatarFallback className="bg-accent-blue text-white text-xs">
              {getUserInitials(userProfile?.full_name, userProfile?.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 bg-dark-surface border-white/10" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">
                {userProfile?.full_name || t('auth.menu.userFallback')}
              </p>
              <Badge className={`text-xs ${getRoleColor(userProfile?.role)}`}>
                <span className="flex items-center gap-1">
                  {getRoleIcon(userProfile?.role)}
                  {userProfile?.role ? t(`auth.roles.${userProfile.role}`, userProfile.role) : null}
                </span>
              </Badge>
            </div>
            <p className="text-xs text-gray-400">
              {userProfile?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-white/5"
            onClick={() => navigate('/profile')}
          >
            <User className="mr-2 h-4 w-4" />
            <span>{t('auth.menu.profile')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-white/5"
            onClick={() => navigate('/settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('auth.menu.settings')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Admin/Contributor specific menu items */}
        {(isAdmin() || isContributor()) && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuGroup>
              {isAdmin() && (
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-white/5"
                  onClick={() => navigate('/admin')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  <span>{t('auth.menu.adminDashboard')}</span>
                </DropdownMenuItem>
              )}
              
              {isContributor() && (
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-white/5"
                  onClick={() => navigate('/admin/blog')}
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  <span>{t('auth.menu.manageBlog')}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </>
        )}
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-white/5 text-red-400 focus:text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('auth.menu.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}