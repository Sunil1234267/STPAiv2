/*
    # Add CHECK constraint to profiles.role column

    1. Changes
      - Adds a CHECK constraint to the `role` column in the `profiles` table, ensuring its value is one of 'admin', 'contributor', or 'user'.
    2. Important Notes
      - This migration assumes the `role` column already exists and is of type `text`.
      - Existing data that does not conform to these values will cause an error if this constraint is applied without prior data cleanup.
  */

  DO $$
  BEGIN
    -- Check if the constraint already exists to prevent errors on re-execution
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'profiles_role_check'
    ) THEN
      ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'contributor', 'user'));
    END IF;
  END $$;
