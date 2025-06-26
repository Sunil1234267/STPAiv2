/*
      # Add email column to profiles table

      1. Modified Tables
        - `profiles`
          - Added `email` (text, unique, nullable)
      2. Security
        - Updated RLS policies for `profiles` to ensure `email` can be read and updated by the owner.
    */

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'email'
      ) THEN
        ALTER TABLE profiles ADD COLUMN email text UNIQUE;
      END IF;
    END $$;

    -- Update RLS policies to include the new email column
    -- Policy for authenticated users to read their own data
    CREATE OR REPLACE POLICY "Users can read own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    -- Policy for authenticated users to update their own data
    CREATE OR REPLACE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);

    -- Policy for authenticated users to insert their own profile (if not exists)
    CREATE OR REPLACE POLICY "Users can insert own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
