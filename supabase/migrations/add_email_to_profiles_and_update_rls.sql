/*
      # Add email column to profiles table and update RLS

      1. Modified Tables
        - `profiles`
          - Added `email` (text, unique, nullable) column. This column will store the user's email from Supabase Auth, allowing it to be updated directly in the profile table.
      2. Security
        - Updated RLS policy for `profiles` to allow authenticated users to update their own `email` in addition to other profile fields.
    */

    DO $$
    BEGIN
      -- Add email column if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'email'
      ) THEN
        ALTER TABLE profiles ADD COLUMN email text UNIQUE;
      END IF;
    END $$;

    -- Update RLS policy for profiles to allow email updates
    -- Ensure RLS is enabled first (should be from initial setup)
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- Drop existing update policy if it exists to replace it
    DROP POLICY IF EXISTS "Authenticated users can update their own profile." ON profiles;

    -- Create or replace the update policy
    CREATE POLICY "Authenticated users can update their own profile."
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);

    -- Ensure select policy exists and is correct
    DROP POLICY IF EXISTS "Authenticated users can view their own profile." ON profiles;
    CREATE POLICY "Authenticated users can view their own profile."
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    -- Ensure insert policy exists and is correct
    DROP POLICY IF EXISTS "Authenticated users can create their own profile." ON profiles;
    CREATE POLICY "Authenticated users can create their own profile."
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);

    -- Ensure delete policy exists and is correct (if needed, typically not for profiles)
    -- For profiles, we usually don't allow direct deletion by users.
    -- If a delete policy was previously added, consider removing it or restricting it.
    -- For this context, we assume no user-initiated profile deletion.
