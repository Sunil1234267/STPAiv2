/*
  # Update RLS policies for designs table

  1. Changes
    - Updates RLS policies for the `designs` table to allow 'admin' and 'contributor' roles to update any design.
    - Authenticated users can read all designs.
    - Authenticated users can insert their own designs.
    - Authenticated users can update their own designs.
  2. Security
    - Ensures only authorized users can modify design data.
*/

-- Enable RLS on designs table (if not already enabled)
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (if any)
DROP POLICY IF EXISTS "Authenticated users can read designs" ON public.designs;
DROP POLICY IF EXISTS "Authenticated users can insert their own designs" ON public.designs;
DROP POLICY IF EXISTS "Authenticated users can update their own designs" ON public.designs;

-- Policy for Admins and Contributors: Full update access
CREATE POLICY "Admins and contributors can update all designs"
  ON public.designs
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

-- Policy for Authenticated Users: Read all designs
CREATE POLICY "Authenticated users can read all designs"
  ON public.designs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for Authenticated Users: Insert their own designs
CREATE POLICY "Authenticated users can insert their own designs"
  ON public.designs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for Authenticated Users: Update their own designs
CREATE POLICY "Authenticated users can update their own designs"
  ON public.designs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
