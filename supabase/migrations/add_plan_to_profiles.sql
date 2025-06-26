/*
      # Add plan_id and image_generations_left to profiles table

      1. Changes
        - Adds a new column `plan_id` (uuid, foreign key to `plans` table) to the `profiles` table.
        - Adds a new column `image_generations_left` (integer, not null, default 0) to the `profiles` table.
      2. Important Notes
        - `plan_id` will link a user's profile to their subscription plan.
        - `image_generations_left` will track the remaining image generations for the user's current plan cycle.
        - Existing profiles will have `plan_id` set to the ID of the 'Free' plan and `image_generations_left` set to the 'Free' plan's max generations.
    */

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'plan_id'
      ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN plan_id uuid REFERENCES public.plans(id) DEFAULT (SELECT id FROM public.plans WHERE name = 'Free');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'image_generations_left'
      ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN image_generations_left integer NOT NULL DEFAULT 0;
      END IF;

      -- Update existing profiles to set initial image_generations_left based on their assigned plan
      -- This is crucial for existing users before the trigger update
      UPDATE public.profiles p
      SET image_generations_left = COALESCE(pl.max_image_generations, 0)
      FROM public.plans pl
      WHERE p.plan_id = pl.id
      AND p.image_generations_left = 0; -- Only update if it's still default 0
    END $$;
