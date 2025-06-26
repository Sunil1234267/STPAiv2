/*
  # Refactor Designs and Collections Schema

  1. Schema Changes
    - Rename `created_by` to `user_id` in `designs` table.
    - Rename `created_by` to `user_id` in `collections` table.
    - Add `updated_at` column to `designs` table with default `now()`.
    - Add `updated_at` column to `collections` table with default `now()`.
    - Add `is_public` column to `designs` table with default `false`.
    - Remove `collection_id` column from `designs` table (if it exists), as a join table will manage this relationship.
    - Create new join table `collection_designs`:
      - `collection_id` (uuid, foreign key to `collections.id`)
      - `design_id` (uuid, foreign key to `designs.id`)
      - Composite primary key `(collection_id, design_id)`
      - `created_at` (timestamptz, default `now()`)

  2. Security (RLS Policies)
    - **`designs` table:**
      - Enable RLS.
      - Policy "Users can view public designs and their own": Allows authenticated users to select designs that are public or owned by them.
      - Policy "Users can create their own designs": Allows authenticated users to insert designs with their `user_id`.
      - Policy "Owners can update their designs": Allows authenticated users to update their own designs.
      - Policy "Owners can delete their designs": Allows authenticated users to delete their own designs.
    - **`collections` table:**
      - Enable RLS.
      - Policy "Users can view public collections and their own": Allows authenticated users to select collections that are public or owned by them.
      - Policy "Users can create their own collections": Allows authenticated users to insert collections with their `user_id`.
      - Policy "Owners can update their collections": Allows authenticated users to update their own collections.
      - Policy "Owners can delete their collections": Allows authenticated users to delete their own collections.
    - **`collection_designs` table:**
      - Enable RLS.
      - Policy "Users can view collection designs if collection is public or owned": Allows authenticated users to select entries if the associated collection is public or owned by them.
      - Policy "Owners can add designs to their collections": Allows authenticated users to insert entries if they own the associated collection.
      - Policy "Owners can remove designs from their collections": Allows authenticated users to delete entries if they own the associated collection.

  3. Important Notes
    - This migration handles renaming `created_by` to `user_id`. Existing foreign key constraints on `created_by` will be dropped and recreated on `user_id`.
    - Existing RLS policies on `designs` and `collections` will be dropped and new ones created to ensure consistency with the new schema and `is_public` logic.
    - After this migration, you MUST run `supabase gen types typescript --local > src/types/supabase.ts` to update your local TypeScript types to reflect the new schema.
*/

-- Drop existing RLS policies that might conflict with column renames or new logic
DROP POLICY IF EXISTS "Authenticated users can view designs" ON public.designs;
DROP POLICY IF EXISTS "Authenticated users can create designs" ON public.designs;
DROP POLICY IF EXISTS "Owners can update their designs" ON public.designs;
DROP POLICY IF EXISTS "Owners or admins can delete their designs" ON public.designs;

DROP POLICY IF EXISTS "Authenticated users can view collections" ON public.collections;
DROP POLICY IF EXISTS "Authenticated users can create collections" ON public.collections;
DROP POLICY IF EXISTS "Owners can update their collections" ON public.collections;
DROP POLICY IF EXISTS "Owners or admins can delete their collections" ON public.collections;
DROP POLICY IF EXISTS "Admins and contributors can update all collections" ON public.collections; -- From update_collections_rls_policies.sql

-- Drop existing foreign key constraints on 'created_by' before renaming
ALTER TABLE public.designs DROP CONSTRAINT IF EXISTS designs_created_by_fkey;
ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_created_by_fkey;

-- Rename 'created_by' to 'user_id' in 'designs' table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'created_by') THEN
    ALTER TABLE public.designs RENAME COLUMN created_by TO user_id;
  END IF;
END $$;

-- Rename 'created_by' to 'user_id' in 'collections' table
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

-- Re-add foreign key constraints using the new 'user_id' column
ALTER TABLE public.designs ADD CONSTRAINT designs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.collections ADD CONSTRAINT collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Remove the collection_id column from designs table as we are introducing a join table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'collection_id') THEN
    ALTER TABLE public.designs DROP COLUMN collection_id;
  END IF;
END $$;

-- Create collection_designs join table
CREATE TABLE IF NOT EXISTS public.collection_designs (
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  design_id uuid NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (collection_id, design_id)
);

-- Enable RLS for new table
ALTER TABLE public.collection_designs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for designs table
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public designs and their own"
  ON public.designs
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own designs"
  ON public.designs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their designs"
  ON public.designs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their designs"
  ON public.designs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for collections table
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public collections and their own"
  ON public.collections
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own collections"
  ON public.collections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their collections"
  ON public.collections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their collections"
  ON public.collections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for collection_designs table
CREATE POLICY "Users can view collection designs if collection is public or owned"
  ON public.collection_designs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND is_public = true) OR
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
  );

CREATE POLICY "Owners can add designs to their collections"
  ON public.collection_designs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
  );

CREATE POLICY "Owners can remove designs from their collections"
  ON public.collection_designs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
  );
