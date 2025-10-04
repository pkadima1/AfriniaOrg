# Manual Migration Instructions

Since we don't have the Supabase CLI installed in this environment, you'll need to apply the migration manually through the Supabase dashboard.

## Steps to Apply the Migration:

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `InSighter-engage-ai-web`
3. **Navigate to SQL Editor** (left sidebar)
4. **Create a new query**
5. **Copy and paste the entire contents** of:
   ```
   /workspaces/InSighter-engage-ai-web/supabase/migrations/20250930000001_create_auth_and_roles.sql
   ```
6. **Execute the query**

## After Migration:

1. **Test the application** at http://localhost:8080/
2. **Try to access /admin** - you should be prompted to sign in
3. **Create your first account** using the Sign Up button
4. **Manually promote your account to admin** by running this SQL in Supabase:
   ```sql
   UPDATE public.user_profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

## Verification:

- ✅ Admin link should be removed from public navigation
- ✅ Admin routes should require authentication
- ✅ User menu should appear in header when signed in
- ✅ Role-based permissions should work in blog management
- ✅ Only admins can delete blog posts

The authentication system is now fully implemented and ready for testing!