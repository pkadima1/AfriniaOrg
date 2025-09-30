import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'contributor' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  hasPermission: (requiredRole: UserRole) => boolean;
  isAdmin: () => boolean;
  isContributor: () => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that manages authentication state and provides
 * authentication methods to child components
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches the user profile from the database
   */
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  /**
   * Refreshes the current user's profile
   */
  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  /**
   * Checks if the current user has the required permission level
   */
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!userProfile || !userProfile.is_active) return false;

    const roleHierarchy: Record<UserRole, number> = {
      viewer: 1,
      contributor: 2,
      admin: 3,
    };

    const userLevel = roleHierarchy[userProfile.role];
    const requiredLevel = roleHierarchy[requiredRole];

    return userLevel >= requiredLevel;
  };

  /**
   * Checks if the current user is an admin
   */
  const isAdmin = (): boolean => {
    return userProfile?.role === 'admin' && userProfile?.is_active === true;
  };

  /**
   * Checks if the current user is a contributor or higher
   */
  const isContributor = (): boolean => {
    return hasPermission('contributor');
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Set up auth state change listener
  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserProfile(session.user.id).then((profile) => {
            if (mounted) {
              setUserProfile(profile);
              setIsLoading(false);
            }
          });
        } else {
          setUserProfile(null);
          setIsLoading(false);
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    userProfile,
    session,
    isLoading,
    isAuthenticated: !!user && !!userProfile && userProfile.is_active,
    signIn,
    signUp,
    signOut,
    resetPassword,
    hasPermission,
    isAdmin,
    isContributor,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use the auth context
 * @returns AuthContextType
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}