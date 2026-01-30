import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '@/integrations/firebase/config';
import { UserRole, COLLECTIONS, getCurrentTimestamp } from '@/integrations/firebase/types';

/** UID for bootstrap admin (pkadima1@gmail.com) – gets admin role on create or first load */
const BOOTSTRAP_ADMIN_UID = 'V3o9lw5lUMbpuP8jWedaJCz8gTx2';

export type { UserRole };

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
  session: null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  hasPermission: (requiredRole: UserRole) => boolean;
  isAdmin: () => boolean;
  isContributor: () => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that manages authentication state using Firebase
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Set Firebase auth persistence on mount
   */
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);
  }, []);

  /**
   * Fetches the user profile from Firestore
   */
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const profileRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        return null;
      }

      const data = profileSnap.data();
      return {
        id: profileSnap.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role as UserRole,
        avatar_url: data.avatar_url,
        is_active: data.is_active ?? true,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  /**
   * Creates a new user profile in Firestore
   */
  const createUserProfile = async (userId: string, email: string, fullName?: string): Promise<void> => {
    try {
      const now = getCurrentTimestamp();
      const profileRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
      
      const isBootstrapAdmin = userId === BOOTSTRAP_ADMIN_UID;
      await setDoc(profileRef, {
        id: userId,
        email,
        full_name: fullName || '',
        role: (isBootstrapAdmin ? 'admin' : 'viewer') as UserRole,
        avatar_url: null,
        is_active: true,
        created_at: now,
        updated_at: now,
      } as UserProfile);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  /**
   * Set up auth state listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          let profile = await fetchUserProfile(currentUser.uid);

          if (!profile) {
            await createUserProfile(
              currentUser.uid,
              currentUser.email ?? '',
              currentUser.displayName ?? undefined
            );
            profile = await fetchUserProfile(currentUser.uid);
          }

          // Ensure bootstrap admin UID always has admin role (one-time upgrade for existing profiles)
          if (profile && currentUser.uid === BOOTSTRAP_ADMIN_UID && profile.role !== 'admin') {
            const profileRef = doc(db, COLLECTIONS.USER_PROFILES, currentUser.uid);
            await updateDoc(profileRef, { role: 'admin' as UserRole, updated_at: getCurrentTimestamp() });
            profile = await fetchUserProfile(currentUser.uid);
          }

          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Refreshes the current user's profile
   */
  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.uid);
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
   * Waits for profile to be loaded before returning success
   */
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      console.log('[Auth] Starting sign in...');
      await signInWithEmailAndPassword(auth, email, password);
      
      // Wait for auth state and profile to be set by onAuthStateChanged listener
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds max (500ms intervals)
      
      while (attempts < maxAttempts) {
        console.log(`[Auth] Waiting for profile... attempt ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if both user and profile are loaded
        if (user !== null && userProfile !== null && userProfile.is_active) {
          console.log('[Auth] Profile loaded successfully, sign in complete');
          return { error: null };
        }
        
        attempts++;
      }
      
      // If we get here, something went wrong
      if (user === null) {
        throw new Error('User authentication failed.');
      }
      if (userProfile === null) {
        throw new Error('User profile could not be loaded. Please check your internet connection and try again.');
      }
      if (!userProfile.is_active) {
        throw new Error('Your account has been deactivated.');
      }
      
      return { error: null };
    } catch (error) {
      console.error('[Auth] Sign in error:', error);
      return { error: error as Error };
    }
  };

  /**
   * Sign up with email and password
   * Creates profile and waits for it to load before returning
   */
  const signUp = async (email: string, password: string, fullName?: string): Promise<{ error: Error | null }> => {
    try {
      console.log('[Auth] Starting sign up...');
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[Auth] User created:', newUser.uid);
      
      // Try to create profile
      try {
        await createUserProfile(newUser.uid, email, fullName);
        console.log('[Auth] Profile creation initiated');
      } catch (profileError) {
        console.warn('[Auth] Profile creation error (will retry in onAuthStateChanged):', profileError);
        // Continue - the onAuthStateChanged listener will try to create it
      }
      
      // Wait for auth state listener to set profile
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds max
      
      while (attempts < maxAttempts) {
        console.log(`[Auth] Waiting for profile after signup... attempt ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if profile is loaded
        if (userProfile !== null) {
          console.log('[Auth] Profile loaded after signup, signup complete');
          return { error: null };
        }
        
        attempts++;
      }
      
      throw new Error('Profile creation failed. Please try signing in, or contact support if the problem persists.');
    } catch (error) {
      console.error('[Auth] Sign up error:', error);
      return { error: error as Error };
    }
  };

  /**
   * Sign out
   */
  const signOut = async (): Promise<{ error: Error | null }> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as Error };
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as Error };
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    session: null,
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
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}