/*
    # Update handle_new_user trigger for new profile columns

    1. Changes
      - Replaces the `handle_new_user` function to include `company_name` and `phone_number` when creating a new profile.
      - The `full_name` and `company_name` are extracted from `NEW.raw_user_meta_data`.
      - The `phone_number` is extracted from `NEW.phone`.
    2. Important Notes
      - This ensures that new user signups automatically populate these fields in the `profiles` table if provided during authentication.
  */

  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, full_name, company_name, phone_number, avatar_url, role)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'company_name',
      NEW.phone, -- Supabase auth.users table has a 'phone' column
      NEW.raw_user_meta_data->>'avatar_url',
      'user'
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Recreate the trigger to ensure it uses the updated function
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
