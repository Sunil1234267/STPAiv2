/*
    # Add role column to profiles table

    1. Changes
      - Adds a new column `role` to the `profiles` table.
      - Sets a default value of 'user' and makes it non-nullable.
    2. Important Notes
      - This migration ensures the `profiles` table has the necessary `role` column for role-based access control.
  */

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
      ALTER TABLE public.profiles
      ADD COLUMN role text NOT NULL DEFAULT 'user';
    END IF;
  END $$;