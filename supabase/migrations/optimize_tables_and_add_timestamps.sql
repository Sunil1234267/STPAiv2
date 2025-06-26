/*
      # Database Schema Optimization

      1. Modified Tables
        - `profiles`
          - Add `created_at` column with `DEFAULT now()`.
          - Modify `updated_at` to have `DEFAULT now()` and an `ON UPDATE` trigger.
          - Add index on `plan_id` for faster lookups.
        - `plans`
          - Add `created_at` column with `DEFAULT now()`.
          - Modify `updated_at` to have `DEFAULT now()` and an `ON UPDATE` trigger.
          - Add index on `name` for faster lookups.
      2. New Functions/Triggers
        - `set_updated_at()`: A generic function to update `updated_at` columns.
        - Triggers `set_profiles_updated_at` and `set_plans_updated_at` to use this function.
      3. Security
        - No direct RLS policy changes, but improved performance can indirectly benefit security by making policy checks faster.
    */

    -- Function to set updated_at timestamp
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Add created_at and update updated_at for profiles table
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE public.profiles ADD COLUMN created_at timestamptz DEFAULT now();
      END IF;

      -- Ensure updated_at has a default and trigger
      UPDATE public.profiles SET updated_at = now() WHERE updated_at IS NULL;
      ALTER TABLE public.profiles ALTER COLUMN updated_at SET DEFAULT now();
    END $$;

    -- Create or replace trigger for profiles table
    DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
    CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

    -- Add created_at and update updated_at for plans table
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'created_at') THEN
        ALTER TABLE public.plans ADD COLUMN created_at timestamptz DEFAULT now();
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'updated_at') THEN
        ALTER TABLE public.plans ADD COLUMN updated_at timestamptz DEFAULT now();
      END IF;

      UPDATE public.plans SET updated_at = now() WHERE updated_at IS NULL;
      ALTER TABLE public.plans ALTER COLUMN updated_at SET DEFAULT now();
    END $$;

    -- Create or replace trigger for plans table
    DROP TRIGGER IF EXISTS set_plans_updated_at ON public.plans;
    CREATE TRIGGER set_plans_updated_at
    BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

    -- Add index to profiles.plan_id
    CREATE INDEX IF NOT EXISTS idx_profiles_plan_id ON public.profiles (plan_id);

    -- Add index to plans.name
    CREATE INDEX IF NOT EXISTS idx_plans_name ON public.plans (name);
