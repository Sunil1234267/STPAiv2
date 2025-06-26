/*
    # Grant admin role to admin@admin.com

    1. Changes
      - Updates the `role` of the user with email `admin@admin.com` to 'admin' in the `profiles` table.
    2. Important Notes
      - This migration assumes the `role` column already exists in the `profiles` table.
      - This migration assumes a user with the email `admin@admin.com` already exists in `auth.users` and has a corresponding entry in `profiles`.
      - The `DO $$ BEGIN ... END $$` block ensures the update is performed safely.
  */

  DO $$
  BEGIN
    -- Check if the user exists in auth.users and then update their profile role
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@admin.com') THEN
      UPDATE public.profiles
      SET role = 'admin'
      WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@admin.com');
    END IF;
  END $$;
