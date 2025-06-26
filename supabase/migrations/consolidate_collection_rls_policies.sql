/*
  # Consolidate and Correct RLS Policies for Collections and Collection Designs

  1. Changes
    - Drops all existing RLS policies on `collections` and `collection_designs` tables to ensure a clean slate.
    - Re-creates comprehensive RLS policies for `collections` to ensure:
      - `SELECT`: Authenticated users can view public collections or their own collections.
      - `INSERT`: Authenticated users can create their own collections.
      - `UPDATE`: Owners can update their collections. Additionally, users with 'admin' or 'contributor' roles can update any collection.
      - `DELETE`: Owners can delete their collections. Additionally, users with 'admin' or 'contributor' roles can delete any collection.
    - Re-creates comprehensive RLS policies for `collection_designs` to ensure:
      - `SELECT`: Authenticated users can view entries if the associated collection is public or owned by them.
      - `INSERT`: Authenticated users can add designs to collections they own.
      - `DELETE`: Authenticated users can remove designs from collections they own.

  2. Security
    - Ensures proper data access control based on ownership and `is_public` status.
    - Grants elevated privileges to 'admin' and 'contributor' roles for collection management.
    - Prevents unauthorized modifications or deletions.

  3. Important Notes
    - This migration aims to resolve potential conflicts or incorrect policy applications from previous migrations.
    - After this migration, you MUST run `supabase gen types typescript --local > src/types/supabase.ts` to update your local TypeScript types.
*/

-- Drop all existing RLS policies on collections to ensure a clean slate
DROP POLICY IF EXISTS "Users can view public collections and their own" ON public.collections;
DROP POLICY IF EXISTS "Users can create their own collections" ON public.collections;
DROP POLICY IF EXISTS "Owners can update their collections" ON public.collections;
DROP POLICY IF EXISTS "Owners can delete their collections" ON public.collections;
DROP POLICY IF EXISTS "Admins and contributors can update all collections" ON public.collections;
DROP POLICY IF EXISTS "Authenticated users can read all collections" ON public.collections;
DROP POLICY IF EXISTS "Authenticated users can insert their own collections" ON public.collections;
DROP POLICY IF EXISTS "Authenticated users can update their own collections" ON public.collections;


-- Drop all existing RLS policies on collection_designs to ensure a clean slate
DROP POLICY IF EXISTS "Users can view collection designs if collection is public or owned" ON public.collection_designs;
DROP POLICY IF EXISTS "Owners can add designs to their collections" ON public.collection_designs;
DROP POLICY IF EXISTS "Owners can remove designs from their collections" ON public.collection_designs;


-- Enable RLS for collections table (if not already enabled)
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

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

-- Enable RLS for collection_designs table (if not already enabled)
ALTER TABLE public.collection_designs ENABLE ROW LEVEL SECURITY;

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
