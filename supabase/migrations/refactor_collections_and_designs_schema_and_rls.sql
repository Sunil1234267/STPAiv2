/*
  # Refactor Collections and Designs Schema with Consolidated RLS - V5

  This migration addresses the `null value in column "user_id" violates not-null constraint` error
  by first making the `user_id` columns in `designs` and `collections` nullable, then setting
  orphaned `user_id`s to `NULL`, and finally re-applying foreign key constraints.

  1. Schema Changes
    - **`designs` table:**
      - Ensures creation with `id`, `user_id`, `name`, `image_url`, `is_public`, `created_at`, `updated_at` columns.
      - **CRITICAL:** Alters `user_id` to be nullable (`DROP NOT NULL`).
      - Renames `created_by` to `user_id` if `created_by` exists.
      - Adds `updated_at` and `is_public` columns if they don't exist.
      - Removes `collection_id` column if it exists.
      - Sets `user_id` to `NULL` for any existing rows where the `user_id` does not exist in `public.profiles`.
    - **`collections` table:**
      - Ensures creation with `id`, `user_id`, `name`, `description`, `is_public`, `created_at`, `updated_at` columns.
      - **CRITICAL:** Alters `user_id` to be nullable (`DROP NOT NULL`).
      - Renames `created_by` to `user_id` if `created_by` exists.
      - Adds `updated_at` and `is_public` columns if they don't exist.
      - Sets `user_id` to `NULL` for any existing rows where the `user_id` does not exist in `public.profiles`.
    - **`collection_designs` table:**
      - Creates or ensures existence of this join table with `collection_id`, `design_id`, and `created_at`.
      - Sets `(collection_id, design_id)` as a composite primary key.
      - Establishes foreign key constraints to `collections.id` and `designs.id` with `ON DELETE CASCADE`.

  2. Security (RLS Policies)
    - **`designs` table:**
      - Enable RLS.
      - Policy "Designs: Select public or owned": Allows authenticated users to select designs that are public or owned by them.
      - Policy "Designs: Insert owned": Allows authenticated users to insert designs with their `user_id`.
      - Policy "Designs: Update owned": Allows authenticated users to update their own designs.
      - Policy "Designs: Delete owned": Allows authenticated users to delete their own designs.
    - **`collections` table:**
      - Enable RLS.
      - Policy "Collections: Select public or owned": Allows authenticated users to select collections that are public or owned by them.
      - Policy "Collections: Insert owned": Allows authenticated users to insert collections with their `user_id`.
      - Policy "Collections: Update owned or by admin/contributor": Allows authenticated users to update their own collections, or any collection if they are an 'admin' or 'contributor'.
      - Policy "Collections: Delete owned or by admin/contributor": Allows authenticated users to delete their own collections, or any collection if they are an 'admin' or 'contributor'.
    - **`collection_designs` table:**
      - Enable RLS.
      - Policy "Collection Designs: Select if collection public or owned": Allows authenticated users to select entries if the associated collection is public or owned by them.
      - Policy "Collection Designs: Insert if collection owned": Allows authenticated users to insert entries if they own the associated collection.
      - Policy "Collection Designs: Delete if collection owned": Allows authenticated users to delete entries if they own the associated collection.

  3. Important Notes
    - This migration drops and recreates RLS policies to ensure consistency.
    - After this migration, you MUST run `npx supabase gen types typescript --project-id "YOUR_SUPABASE_PROJECT_ID" --schema public > src/types/supabase.ts` to update your local TypeScript types.
*/

-- Ensure all tables exist with all necessary columns at the very beginning
CREATE TABLE IF NOT EXISTS public.designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, -- Directly use user_id
  name text NOT NULL, -- Renamed from title
  image_url text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, -- Directly use user_id
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_designs (
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  design_id uuid NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (collection_id, design_id)
);

-- Drop existing RLS policies to ensure a clean slate before re-creating
DO $$
DECLARE
  policy_name text;
BEGIN
  FOR policy_name IN (SELECT polname FROM pg_policy WHERE polrelid = 'public.designs'::regclass) LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.designs;';
  END LOOP;
  FOR policy_name IN (SELECT polname FROM pg_policy WHERE polrelid = 'public.collections'::regclass) LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.collections;';
  END LOOP;
  FOR policy_name IN (SELECT polname FROM pg_policy WHERE polrelid = 'public.collection_designs'::regclass) LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.collection_designs;';
  END LOOP;
END $$;

-- Drop existing foreign key constraints on 'created_by' before renaming (if they exist)
ALTER TABLE public.designs DROP CONSTRAINT IF EXISTS designs_created_by_fkey;
ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_created_by_fkey;

-- Rename 'created_by' to 'user_id' in 'designs' table if 'created_by' exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'created_by') THEN
    ALTER TABLE public.designs RENAME COLUMN created_by TO user_id;
  END IF;
END $$;

-- Rename 'created_by' to 'user_id' in 'collections' table if 'created_by' exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collections' AND column_name = 'created_by') THEN
    ALTER TABLE public.collections RENAME COLUMN created_by TO user_id;
  END IF;
END $$;

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

-- Add 'is_public' column to 'designs' table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'is_public') THEN
    ALTER TABLE public.designs ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;

-- Add 'is_public' column to 'collections' table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collections' AND column_name = 'is_public') THEN
    ALTER TABLE public.collections ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;

-- Remove the collection_id column from designs table as we are introducing a join table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'collection_id') THEN
    ALTER TABLE public.designs DROP COLUMN collection_id;
  END IF;
END $$;

-- CRITICAL: Alter user_id columns to be nullable before attempting to set them to NULL
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collections' AND column_name = 'user_id' AND is_nullable = 'NO') THEN
    ALTER TABLE public.collections ALTER COLUMN user_id DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'user_id' AND is_nullable = 'NO') THEN
    ALTER TABLE public.designs ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- Set user_id to NULL for any rows in collections where the user_id does not exist in public.profiles
DO $$
BEGIN
  UPDATE public.collections
  SET user_id = NULL
  WHERE user_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = public.collections.user_id);
END $$;

-- Set user_id to NULL for any rows in designs where the user_id does not exist in public.profiles
DO $$
BEGIN
  UPDATE public.designs
  SET user_id = NULL
  WHERE user_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = public.designs.user_id);
END $$;

-- Re-add foreign key constraints using the new 'user_id' column (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'designs_user_id_fkey') THEN
    ALTER TABLE public.designs ADD CONSTRAINT designs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'collections_user_id_fkey') THEN
    ALTER TABLE public.collections ADD CONSTRAINT collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS for all tables
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_designs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for designs table
CREATE POLICY "Designs: Select public or owned"
  ON public.designs
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Designs: Insert owned"
  ON public.designs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Designs: Update owned"
  ON public.designs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Designs: Delete owned"
  ON public.designs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for collections table
CREATE POLICY "Collections: Select public or owned"
  ON public.collections
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Collections: Insert owned"
  ON public.collections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Collections: Update owned or by admin/contributor"
  ON public.collections
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'contributor')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'contributor')
  );

CREATE POLICY "Collections: Delete owned or by admin/contributor"
  ON public.collections
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'contributor')
  );

-- RLS Policies for collection_designs table
CREATE POLICY "Collection Designs: Select if collection public or owned"
  ON public.collection_designs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND is_public = true) OR
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
  );

CREATE POLICY "Collection Designs: Insert if collection owned"
  ON public.collection_designs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
  );

CREATE POLICY "Collection Designs: Delete if collection owned"
  ON public.collection_designs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
  );
