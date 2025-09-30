-- Initial setup script for Nodematics Engage AI Web
-- This script sets up the default admin user

-- First, let's ensure the migration has been applied
-- (Run the main migration file first: 20250930000001_create_auth_and_roles.sql)

-- Create the default admin user profile
-- Note: The user must first sign up normally through the app, then we promote them
-- Replace 'pkadima1@gmail.com' with the actual user ID after signup

-- Step 1: After pkadima1@gmail.com signs up through the app, run this:
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the user ID for pkadima1@gmail.com
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'pkadima1@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Update the user profile to make them admin
        UPDATE public.user_profiles 
        SET 
            role = 'admin',
            full_name = COALESCE(full_name, 'Pascal Kadima'),
            updated_at = now()
        WHERE id = admin_user_id;
        
        -- If the profile doesn't exist, create it
        INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
        VALUES (admin_user_id, 'pkadima1@gmail.com', 'Pascal Kadima', 'admin', true)
        ON CONFLICT (id) DO UPDATE SET 
            role = 'admin',
            full_name = COALESCE(user_profiles.full_name, 'Pascal Kadima'),
            updated_at = now();
            
        RAISE NOTICE 'Admin user setup completed for pkadima1@gmail.com';
    ELSE
        RAISE NOTICE 'User pkadima1@gmail.com not found. Please sign up first through the application.';
    END IF;
END $$;

-- Verify the setup
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.is_active,
    up.created_at
FROM public.user_profiles up
WHERE up.email = 'pkadima1@gmail.com';

-- Optional: Create a few test users for demonstration
-- (Uncomment these if you want test accounts)

/*
-- Test Contributor User
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
) VALUES (
    gen_random_uuid(),
    'contributor@test.com',
    crypt('testpass123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    ''
);

-- Test Viewer User
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
) VALUES (
    gen_random_uuid(),
    'viewer@test.com',
    crypt('testpass123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    ''
);
*/