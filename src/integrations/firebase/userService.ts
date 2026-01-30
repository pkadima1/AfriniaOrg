import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where,
  DocumentData,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './types';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'contributor' | 'viewer';
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all user profiles from Firestore
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USER_PROFILES));
    return querySnapshot.docs.map(doc => ({
      ...doc.data() as Omit<UserProfile, 'id'>,
      id: doc.id,
    } as UserProfile)).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get a single user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    const userSnap = await getDocs(query(collection(db, COLLECTIONS.USER_PROFILES), where('id', '==', userId)));
    
    if (userSnap.empty) {
      return null;
    }
    
    const docData = userSnap.docs[0].data();
    return {
      ...docData as Omit<UserProfile, 'id'>,
      id: userSnap.docs[0].id,
    } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string, 
  role: 'admin' | 'contributor' | 'viewer'
): Promise<boolean> {
  try {
    const userRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    await updateDoc(userRef, {
      role,
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserActive(
  userId: string, 
  isActive: boolean
): Promise<boolean> {
  try {
    const userRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    await updateDoc(userRef, {
      is_active: isActive,
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error toggling user active status:', error);
    throw error;
  }
}

/**
 * Search users by email
 */
export async function searchUsersByEmail(emailQuery: string): Promise<UserProfile[]> {
  try {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => 
      user.email.toLowerCase().includes(emailQuery.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: 'admin' | 'contributor' | 'viewer'): Promise<UserProfile[]> {
  try {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => user.role === role);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
}
