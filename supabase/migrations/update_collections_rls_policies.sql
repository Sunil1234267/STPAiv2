/*
  # Update RLS policies for collections table

  1. Changes
    - Updates RLS policies for the `collections` table to allow 'admin' and 'contributor' roles to update any collection.
    - Authenticated users can read all collections.
    - Authenticated users can insert their own collections.
    - Authenticated users can update their own collections.
  2. Security
    - Ensures only authorized users can modify collection data.
*/

-- Enable RLS on collections table (if not already enabled)
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (if any)
DROP POLICY IF EXISTS "Authenticated users can read collections" ON public.collections;
DROP POLICY IF EXISTS "Authenticated users can insert their own collections" ON public.collections;
DROP POLICY IF EXISTS "Authenticated users can update their own collections" ON public.collections;

-- Policy for Admins and Contributors: Full update access
CREATE POLICY "Admins and contributors can update all collections"
  ON public.collections
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'contributor')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'contributor')
  );

-- Policy for Authenticated Users: Read all collections
CREATE POLICY "Authenticated users can read all collections"
  ON public.collections
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for Authenticated Users: Insert their own collections
CREATE POLICY "Authenticated users can insert their own collections"
  ON public.collections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for Authenticated Users: Update their own collections
CREATE POLICY "Authenticated users can update their own collections"
  ON public.collections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
