-- Create custom types for user roles
CREATE TYPE user_role AS ENUM ('admin', 'contributor', 'viewer');

-- Create user profiles table that extends auth.users
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can update any profile
CREATE POLICY "Admins can update any profile" 
ON public.user_profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can insert new profiles
CREATE POLICY "Admins can insert profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS user_role AS $$
  SELECT role FROM public.user_profiles WHERE id = user_id AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user has permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
  required_role user_role,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  current_role user_role;
BEGIN
  SELECT role INTO current_role 
  FROM public.user_profiles 
  WHERE id = user_id AND is_active = true;
  
  IF current_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Admin has all permissions
  IF current_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Contributor has read/write permissions
  IF current_role = 'contributor' AND required_role IN ('contributor', 'viewer') THEN
    RETURN true;
  END IF;
  
  -- Viewer has only read permissions
  IF current_role = 'viewer' AND required_role = 'viewer' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update blog_posts policies to use role-based access
DROP POLICY IF EXISTS "Allow all for admin operations" ON public.blog_posts;

-- Admin can do everything
CREATE POLICY "Admin full access to blog posts" 
ON public.blog_posts 
FOR ALL
USING (public.user_has_permission('admin'))
WITH CHECK (public.user_has_permission('admin'));

-- Contributors can read and write (but not delete)
CREATE POLICY "Contributors can read blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (public.user_has_permission('viewer'));

CREATE POLICY "Contributors can create blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (public.user_has_permission('contributor'));

CREATE POLICY "Contributors can update blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (public.user_has_permission('contributor'))
WITH CHECK (public.user_has_permission('contributor'));

-- Update storage policies for role-based access
DROP POLICY IF EXISTS "Anyone can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete blog images" ON storage.objects;

-- Role-based storage policies
CREATE POLICY "Contributors can upload blog images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'blog-images' AND 
  public.user_has_permission('contributor')
);

CREATE POLICY "Contributors can update blog images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'blog-images' AND 
  public.user_has_permission('contributor')
);

CREATE POLICY "Admins can delete blog images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'blog-images' AND 
  public.user_has_permission('admin')
);

-- Insert a default admin user (you should change this email to your own)
-- Note: This will only work after the user actually signs up with this email
-- You should run this manually after creating your first user account
-- INSERT INTO public.user_profiles (id, email, full_name, role) 
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'),
--   'your-admin-email@example.com',
--   'Admin User',
--   'admin'
-- ) ON CONFLICT (id) DO UPDATE SET role = 'admin';