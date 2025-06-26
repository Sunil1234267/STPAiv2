/*
    # Update RLS policies for profiles table

    1. Changes
      - Updates RLS policies for the `profiles` table to support 'admin', 'contributor', and 'user' roles.
      - Admins can perform all CRUD operations on any profile.
      - Authenticated users (including contributors and general users) can read and update their own profile.
      - Authenticated users can insert their own profile if it doesn't exist.
    2. Security
      - Ensures only authorized users can access and modify profile data.
  */

  -- Enable RLS on profiles table (if not already enabled)
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile." ON public.profiles;
  DROP POLICY IF EXISTS "Users can read own data" ON public.profiles;

  -- Policy for Admins: Full CRUD access
  CREATE POLICY "Admins can manage all profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
    WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

  -- Policy for Authenticated Users: Read own profile
  CREATE POLICY "Authenticated users can read their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  -- Policy for Authenticated Users: Insert own profile (if not exists)
  CREATE POLICY "Authenticated users can insert their own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

  -- Policy for Authenticated Users: Update own profile
  CREATE POLICY "Authenticated users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

  -- Policy for Authenticated Users: Delete own profile (only if admin)
  -- This policy is implicitly covered by the "Admins can manage all profiles" policy
  -- and is generally not recommended for users to delete their own profiles directly.
  -- If a non-admin user tries to delete their profile, it will be denied unless they are an admin.
  -- No specific policy for non-admin users to delete their own profile.
  ;
