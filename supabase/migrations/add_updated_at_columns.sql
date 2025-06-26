/*
  # Add updated_at columns to designs and collections

  1. Schema Changes
    - Add `updated_at` column to `designs` table with default `now()`.
    - Add `updated_at` column to `collections` table with default `now()`.
  */

  -- Add 'updated_at' column to 'designs' table if it doesn't exist
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'updated_at') THEN
      ALTER TABLE public.designs ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
  END $$;

  -- Add 'updated_at' column to 'collections' table if it doesn't exist
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collections' AND column_name = 'updated_at') THEN
      ALTER TABLE public.collections ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
  END $$;
