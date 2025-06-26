/*
    # Add company_name and phone_number columns to profiles table

    1. Changes
      - Adds a new column `company_name` (text, nullable) to the `profiles` table.
      - Adds a new column `phone_number` (text, unique, nullable) to the `profiles` table.
    2. Important Notes
      - These columns are added to store additional user profile information.
      - `phone_number` is set as unique to prevent duplicate phone numbers across profiles.
  */

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'company_name'
    ) THEN
      ALTER TABLE public.profiles
      ADD COLUMN company_name text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'phone_number'
    ) THEN
      ALTER TABLE public.profiles
      ADD COLUMN phone_number text UNIQUE;
    END IF;
  END $$;
