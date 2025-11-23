# 🚀 Complete Setup Guide for Authentication System

## Step 1: Apply Database Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `NodeMatics-engage-ai-web`
3. **Navigate to SQL Editor** (left sidebar)

#### Execute Migration 1: Core Authentication Setup
1. **Create a new query**
2. **Copy and paste** the contents of: `/workspaces/NodeMatics-engage-ai-web/supabase/migrations/20250930000001_create_auth_and_roles.sql`
3. **Execute the query**

#### Execute Migration 2: Setup Admin User
1. **Create another new query**
2. **Copy and paste** the contents of: `/workspaces/NodeMatics-engage-ai-web/supabase/migrations/20250930000002_setup_admin_user.sql`
3. **Execute the query**

### Option B: Using Supabase CLI (If Available)
```bash
npx supabase db push
```

## Step 2: Create Admin Account

### Method 1: Sign Up Through App (Recommended)
1. **Visit your app**: http://localhost:8080/
2. **Click "Sign Up"** in the header
3. **Create account** with email: `pkadima1@gmail.com`
4. **Complete the registration** with your details

### Method 2: Manual Admin Setup (If needed)
After signing up, run this SQL in Supabase to ensure admin status:

```sql
-- Promote pkadima1@gmail.com to admin
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'pkadima1@gmail.com';

-- Verify the setup
SELECT email, role, is_active FROM public.user_profiles WHERE email = 'pkadima1@gmail.com';
```

## Step 3: Test the System

### ✅ Authentication Tests
1. **Visit `/admin`** - Should prompt for login
2. **Try to sign in** with invalid credentials - Should show error
3. **Sign in with admin account** - Should work and redirect to admin dashboard
4. **Sign out and sign back in** - Should work smoothly

### ✅ Authorization Tests
1. **Create a test contributor account**:
   - Sign up with a different email
   - As admin, go to `/admin/users`
   - Change the new user's role to "contributor"

2. **Test role permissions**:
   - **Admin**: Can access everything, including delete posts and user management
   - **Contributor**: Can create/edit posts but cannot delete them
   - **Viewer**: Cannot access admin sections

### ✅ UI/UX Tests
1. **Header behavior**:
   - When signed out: Shows "Sign In" and "Sign Up" buttons
   - When signed in: Shows user avatar and dropdown menu
   - Admin link should only appear in user menu for authenticated users

2. **Admin dashboard**:
   - Shows user role and permissions clearly
   - User management card only clickable for admins
   - Quick actions work properly

## Step 4: User Management (Admin Only)

### Create New Users
1. **Go to `/admin/users`**
2. **Click "Create User"**
3. **Fill in user details**:
   - Email (required)
   - Temporary password (required, min 6 chars)
   - Full name (optional)
   - Role (admin/contributor/viewer)
4. **Send login credentials** to the new user

### Manage Existing Users
- **Change roles**: Use the role dropdown
- **Reset passwords**: Click the key icon to send reset email
- **Activate/Deactivate**: Toggle user status
- **Contact users**: Click email icon to send email

## Step 5: Blog Management with Roles

### For Contributors and Admins
1. **Create posts**: `/admin/blog/new`
2. **Edit posts**: Click edit button in blog list
3. **Change status**: Draft → Published → Archived
4. **Upload images**: Use the image upload feature

### For Admins Only
- **Delete posts**: Trash icon appears only for admins
- **User management**: Full access to user accounts
- **System settings**: (Coming soon)

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. "User not found" after migration
**Solution**: The user must sign up through the app first, then run the admin promotion SQL.

#### 2. Email field not visible in auth modal
**Solution**: Check browser console for CSS conflicts. The modal should show clearly with dark theme.

#### 3. Permission denied errors
**Solution**: Ensure RLS policies are applied correctly by re-running the migration.

#### 4. Users can't access admin after role change
**Solution**: User needs to refresh the page or sign out/in to get new permissions.

### Verify Database Setup
Run these queries in Supabase SQL Editor to verify setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('user_profiles', 'blog_posts');

-- Check if user roles enum exists
SELECT enum_range(NULL::user_role);

-- Check if policies are active
SELECT tablename, policyname, roles FROM pg_policies 
WHERE schemaname = 'public';

-- Check admin user
SELECT email, role, is_active FROM public.user_profiles 
WHERE role = 'admin';
```

## 🎯 Expected Results

After successful setup:

### ✅ Security Features Working
- [x] Admin routes protected by authentication
- [x] Role-based access control enforced
- [x] Admin link removed from public navigation
- [x] Delete operations restricted to admins
- [x] User management only accessible to admins

### ✅ User Experience Improved
- [x] Clear login/signup forms with validation
- [x] Password reset functionality
- [x] User menu with role indicators
- [x] Responsive design on all devices
- [x] Helpful error messages and feedback

### ✅ Admin Features Available
- [x] User management dashboard
- [x] Role assignment and management
- [x] Password reset for users
- [x] Blog post management with permissions
- [x] System overview and quick actions

## 📞 Support

If you encounter any issues:

1. **Check browser console** for JavaScript errors
2. **Verify Supabase connection** in Network tab
3. **Confirm database setup** with verification queries above
4. **Test with incognito mode** to rule out cache issues

The authentication system is now production-ready with enterprise-level security! 🚀