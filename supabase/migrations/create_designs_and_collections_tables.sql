/*
      # Create designs and collections tables

      1. New Tables
        - `designs`
          - `id` (uuid, primary key, default gen_random_uuid())
          - `name` (text, not null, default '')
          - `description` (text, default '')
          - `image_url` (text, not null, default '')
          - `created_by` (uuid, foreign key to profiles.id, not null)
          - `created_at` (timestamptz, default now())
        - `collections`
          - `id` (uuid, primary key, default gen_random_uuid())
          - `name` (text, not null, default '')
          - `description` (text, default '')
          - `created_by` (uuid, foreign key to profiles.id, not null)
          - `created_at` (timestamptz, default now())
      2. Security
        - Enable RLS on `designs` table
        - Add policies for `designs`:
          - Authenticated users can read all designs.
          - Authenticated users can insert designs.
          - Owners can update their designs.
          - Owners or admins can delete their designs.
        - Enable RLS on `collections` table
        - Add policies for `collections`:
          - Authenticated users can read all collections.
          - Authenticated users can insert collections.
          - Owners can update their collections.
          - Owners or admins can delete their collections.
    */

    CREATE TABLE IF NOT EXISTS designs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL DEFAULT '',
      description text DEFAULT '',
      image_url text NOT NULL DEFAULT '',
      created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can view designs"
      ON designs
      FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can create designs"
      ON designs
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);

    CREATE POLICY "Owners can update their designs"
      ON designs
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);

    CREATE POLICY "Owners or admins can delete their designs"
      ON designs
      FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');


    CREATE TABLE IF NOT EXISTS collections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL DEFAULT '',
      description text DEFAULT '',
      created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can view collections"
      ON collections
      FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can create collections"
      ON collections
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);

    CREATE POLICY "Owners can update their collections"
      ON collections
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);

    CREATE POLICY "Owners or admins can delete their collections"
      ON collections
      FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
