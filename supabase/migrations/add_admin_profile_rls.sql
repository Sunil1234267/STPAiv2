/*
  # Add RLS policies for profiles table

  1. Security
    - Enable RLS on `profiles` table
    - Add policy for authenticated users to select their own profile
    - Add policy for authenticated users to update their own profile
    - Add policy for authenticated users to insert their own profile (on sign-up)
    - Add policy for admin users to select all profiles
*/

-- Ensure RLS is enabled, but only if not already
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Authenticated users can view their own profile.'
      AND polrelid = 'profiles'::regclass
  ) THEN
    CREATE POLICY "Authenticated users can view their own profile."
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Allow authenticated users to update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Authenticated users can update their own profile.'
      AND polrelid = 'profiles'::regclass
  ) THEN
    CREATE POLICY "Authenticated users can update their own profile."
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Allow authenticated users to insert their own profile (on sign-up)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Authenticated users can insert their own profile.'
      AND polrelid = 'profiles'::regclass
  ) THEN
    CREATE POLICY "Authenticated users can insert their own profile."
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Allow admin users to select all profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Admins can view all profiles.'
      AND polrelid = 'profiles'::regclass
  ) THEN
    CREATE POLICY "Admins can view all profiles."
      ON profiles
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Allow admin users to update any profile's role (and other fields if needed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Admins can update any profile.'
      AND polrelid = 'profiles'::regclass
  ) THEN
    CREATE POLICY "Admins can update any profile."
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Allow admin users to delete any profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Admins can delete any profile.'
      AND polrelid = 'profiles'::regclass
  ) THEN
    CREATE POLICY "Admins can delete any profile."
      ON profiles
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;
