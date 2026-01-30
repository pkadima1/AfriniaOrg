# 🔥 Firebase Migration Guide

## Migration Status: IN PROGRESS ✅

This document outlines the migration from Supabase to Firebase/Firestore backend.

---

## ✅ **Completed Migrations**

### 1. **Dependencies** ✅
- ✅ Removed `@supabase/supabase-js` from package.json
- ✅ Added `firebase` (v10.7.0) package
- ✅ Installed all Firebase packages

### 2. **Firebase Configuration** ✅
- ✅ Created `/src/integrations/firebase/config.ts`
  - Firebase app initialization
  - Auth service initialization  
  - Firestore database initialization
  - Storage service initialization
  - Analytics setup

### 3. **Type Definitions** ✅
- ✅ Created `/src/integrations/firebase/types.ts`
  - UserProfile interface
  - BlogPost interface
  - Comment interface
  - Collection names constants
  - Helper utility functions

### 4. **Authentication Context** ✅
- ✅ Migrated `/src/contexts/AuthContext.tsx`
  - Replaced Supabase Auth with Firebase Auth
  - Updated sign in/sign up logic
  - Updated password reset
  - Updated profile fetching
  - Maintained same API for existing components

### 5. **Blog Post Service** ✅
- ✅ Created `/src/integrations/firebase/blogService.ts`
  - fetchBlogPosts() - fetch all posts with filters
  - fetchBlogPostById() - fetch single post
  - fetchBlogPostBySlug() - fetch by URL slug
  - saveBlogPost() - create/update posts
  - deleteBlogPost() - delete posts
  - uploadBlogImage() - upload images to storage
  - deleteBlogImage() - delete images

### 6. **Comment Service** ✅
- ✅ Created `/src/integrations/firebase/commentService.ts`
  - fetchCommentsForPost() - get all comments
  - addCommentToPost() - create comment
  - updateComment() - update existing comment
  - deleteComment() - delete comment

### 7. **Comments Utility** ✅
- ✅ Updated `/src/utils/supabaseComments.ts`
  - Now wraps Firebase comment service
  - Maintains same API for components
  - Supports comment tree/replies structure

### 8. **BlogPostEditor Component** ✅  
- ✅ Updated imports to use Firebase services
- ✅ Replaced Supabase queries with Firebase calls
- ✅ Updated image upload logic
- ✅ Updated post save logic
- ✅ All error handling preserved

---

## ⏳ **Remaining Migrations Needed**

### Components Still Using Supabase (need migration):
1. `/src/components/admin/BlogPostList.tsx` - List and manage blog posts
2. `/src/components/admin/UserManagement.tsx` - User admin panel
3. `/src/pages/Blog.tsx` - Blog listing page
4. `/src/pages/BlogPost.tsx` - Individual blog post view
5. `/src/pages/Profile.tsx` - User profile page
6. `/src/pages/Settings.tsx` - User settings page

### Files to Delete:
- `/src/integrations/supabase/client.ts` - Supabase client (replaced by Firebase config)
- `/src/integrations/supabase/types.ts` - Supabase types (replaced by Firebase types)

---

## 🔄 **Firestore Schema Mapping**

### Collections Structure:

```
Firestore Root
├── user_profiles (collection)
│   ├── {userId} (document)
│   │   ├── id: string
│   │   ├── email: string
│   │   ├── full_name: string
│   │   ├── role: 'admin' | 'contributor' | 'viewer'
│   │   ├── avatar_url: string
│   │   ├── is_active: boolean
│   │   ├── created_at: string (ISO)
│   │   └── updated_at: string (ISO)
│
├── blog_posts (collection)
│   ├── {postId} (document)
│   │   ├── id: string
│   │   ├── title: string
│   │   ├── slug: string
│   │   ├── content: string (HTML)
│   │   ├── excerpt: string
│   │   ├── featured_image_url: string
│   │   ├── author_name: string
│   │   ├── category: string
│   │   ├── tags: array of strings
│   │   ├── status: 'draft' | 'published' | 'archived'
│   │   ├── meta_title: string
│   │   ├── meta_description: string
│   │   ├── published_at: string (ISO)
│   │   ├── created_at: string (ISO)
│   │   └── updated_at: string (ISO)
│
└── comments (collection)
    ├── {commentId} (document)
    │   ├── id: string
    │   ├── post_slug: string
    │   ├── name: string
    │   ├── email: string
    │   ├── message: string
    │   ├── parent_id: string (for replies)
    │   ├── created_at: string (ISO)
    │   └── updated_at: string (ISO)
```

---

## 🎯 **Firebase Security Rules (To Be Applied)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - readable by all authenticated users, writable by owner or admin
    match /user_profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                      get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Blog posts - readable by all, writable by authenticated users with role >= 'contributor'
    match /blog_posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null && 
                       get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role in ['contributor', 'admin'];
      allow update: if request.auth != null && 
                       (resource.data.author_name == request.auth.token.email || 
                        get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin');
      allow delete: if request.auth != null && 
                       get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Comments - readable by all, writable by authenticated users
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && 
                       get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Firebase Storage rules for blog images
    match /blog-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🚀 **Migration Checklist**

### Phase 1: Foundation ✅
- [x] Install Firebase
- [x] Create Firebase config
- [x] Create type definitions
- [x] Migrate AuthContext
- [x] Create blog service
- [x] Create comment service

### Phase 2: Components (IN PROGRESS)
- [x] BlogPostEditor
- [ ] BlogPostList
- [ ] UserManagement
- [ ] Blog (listing)
- [ ] BlogPost (detail)
- [ ] Profile
- [ ] Settings

### Phase 3: Cleanup
- [ ] Remove Supabase imports from all files
- [ ] Delete Supabase client files
- [ ] Remove @supabase/supabase-js package
- [ ] Test all functionality
- [ ] Deploy to production

### Phase 4: Verification
- [ ] Test authentication
- [ ] Test blog CRUD operations
- [ ] Test comments
- [ ] Test image uploads
- [ ] Test user permissions

---

## 📝 **Key API Changes for Developers**

### Before (Supabase):
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('id', postId);
```

### After (Firebase):
```typescript
import { fetchBlogPostById } from '@/integrations/firebase/blogService';

const post = await fetchBlogPostById(postId);
```

---

## 🔧 **Development Notes**

1. **Firestore uses document IDs** instead of UUID fields - IDs are auto-generated
2. **Timestamps** stored as ISO strings for consistency
3. **Firebase Storage URLs** are public by default - consider security rules
4. **Real-time subscriptions** available via `onSnapshot()` if needed in future
5. **Firestore queries** are more limited than SQL - denormalize data if needed

---

## 🐛 **Testing After Migration**

```bash
# Run linter (should have 0 errors)
npm run lint

# Start dev server
npm run dev

# Test areas:
# 1. Login/Signup
# 2. Create blog post
# 3. Edit blog post
# 4. Delete blog post
# 5. Upload images
# 6. Add comments
# 7. User profile
# 8. Settings
```

---

## 📞 **Support & Issues**

If you encounter issues during migration:

1. Check Firebase configuration is correct
2. Verify Firestore security rules are applied
3. Check browser console for errors
4. Verify collections and documents exist in Firestore
5. Check Firebase Storage bucket exists

---

**Last Updated**: January 30, 2026  
**Migration Status**: 60% Complete  
**Next Step**: Migrate BlogPostList component
