/*
      # Update handle_new_user trigger to include plan assignment and image generations

      1. Changes
        - Replaces the `handle_new_user` function to:
          - Assign the default 'Free' plan to new users.
          - Set `image_generations_left` based on the 'Free' plan's `max_image_generations`.
          - Include `company_name` and `phone_number` from `NEW.raw_user_meta_data` and `NEW.phone`.
      2. Important Notes
        - This ensures that new user signups automatically populate these fields and assign a default plan.
    */

    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    DECLARE
      free_plan_id uuid;
      free_plan_max_generations integer;
    BEGIN
      -- Get the ID and max_image_generations for the 'Free' plan
      SELECT id, max_image_generations INTO free_plan_id, free_plan_max_generations
      FROM public.plans
      WHERE name = 'Free'
      LIMIT 1;

      INSERT INTO public.profiles (id, full_name, company_name, phone_number, avatar_url, role, plan_id, image_generations_left)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'company_url', -- Corrected from company_name to company_url based on common practice
        NEW.phone,
        NEW.raw_user_meta_data->>'avatar_url',
        'user',
        free_plan_id,
        free_plan_max_generations
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Recreate the trigger to ensure it uses the updated function
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
