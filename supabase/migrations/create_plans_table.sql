/*
      # Create plans table

      1. New Tables
        - `plans`
          - `id` (uuid, primary key, default gen_random_uuid())
          - `name` (text, unique, not null) - Name of the plan (e.g., 'Free', 'Pro')
          - `description` (text, nullable) - Description of the plan
          - `max_image_generations` (integer, not null, default 0) - Maximum images a user can generate per plan cycle
          - `price` (numeric, not null, default 0.00) - Price of the plan
          - `created_at` (timestamptz, default now())
          - `updated_at` (timestamptz, default now())
      2. Security
        - Enable RLS on `plans` table
        - Add policy for authenticated users to read all plans
      3. Important Notes
        - Inserts a default 'Free' plan upon creation.
    */

    CREATE TABLE IF NOT EXISTS public.plans (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text UNIQUE NOT NULL,
      description text,
      max_image_generations integer NOT NULL DEFAULT 0,
      price numeric NOT NULL DEFAULT 0.00,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can read plans"
      ON public.plans
      FOR SELECT
      TO authenticated
      USING (true);

    -- Insert default plans if they don't exist
    INSERT INTO public.plans (name, description, max_image_generations, price)
    VALUES
      ('Free', 'Basic plan with limited image generations', 10, 0.00)
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO public.plans (name, description, max_image_generations, price)
    VALUES
      ('Pro', 'Advanced plan with more image generations', 100, 9.99)
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO public.plans (name, description, max_image_generations, price)
    VALUES
      ('Enterprise', 'Unlimited image generations for large teams', 999999, 99.99)
    ON CONFLICT (name) DO NOTHING;
