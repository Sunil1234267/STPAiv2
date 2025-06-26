/*
      # Create designs, collections, and collection_designs tables

      1. New Tables
        - `designs`
          - `id` (uuid, primary key)
          - `created_at` (timestamp)
          - `name` (text, not null)
          - `description` (text)
          - `image_url` (text)
          - `user_id` (uuid, foreign key to auth.users)
          - `is_public` (boolean, default false)
        - `collections`
          - `id` (uuid, primary key)
          - `created_at` (timestamp)
          - `name` (text, not null)
          - `description` (text)
          - `user_id` (uuid, foreign key to auth.users)
          - `is_public` (boolean, default false)
        - `collection_designs`
          - `collection_id` (uuid, foreign key to collections)
          - `design_id` (uuid, foreign key to designs)
          - `created_at` (timestamp)
          - Composite primary key on `collection_id`, `design_id`
      2. Security
        - Enable RLS on `designs`, `collections`, and `collection_designs` tables
        - Add policies for authenticated users to manage their own designs and collections
        - Add policies for public access to public designs and collections
    */

    CREATE TABLE IF NOT EXISTS designs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz DEFAULT now(),
      name text NOT NULL DEFAULT '',
      description text DEFAULT '',
      image_url text DEFAULT '',
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      is_public boolean DEFAULT false
    );

    ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can create designs"
      ON designs
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can view their own designs"
      ON designs
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id OR is_public = true);

    CREATE POLICY "Public can view public designs"
      ON designs
      FOR SELECT
      TO public
      USING (is_public = true);

    CREATE POLICY "Authenticated users can update their own designs"
      ON designs
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can delete their own designs"
      ON designs
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE TABLE IF NOT EXISTS collections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz DEFAULT now(),
      name text NOT NULL DEFAULT '',
      description text DEFAULT '',
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      is_public boolean DEFAULT false
    );

    ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can create collections"
      ON collections
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can view their own collections"
      ON collections
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id OR is_public = true);

    CREATE POLICY "Public can view public collections"
      ON collections
      FOR SELECT
      TO public
      USING (is_public = true);

    CREATE POLICY "Authenticated users can update their own collections"
      ON collections
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can delete their own collections"
      ON collections
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE TABLE IF NOT EXISTS collection_designs (
      collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
      design_id uuid REFERENCES designs(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      PRIMARY KEY (collection_id, design_id)
    );

    ALTER TABLE collection_designs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can manage collection designs"
      ON collection_designs
      FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND user_id = auth.uid())
        AND
        EXISTS (SELECT 1 FROM designs WHERE id = design_id AND user_id = auth.uid())
      );

    CREATE POLICY "Public can view public collection designs"
      ON collection_designs
      FOR SELECT
      TO public
      USING (
        EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND is_public = true)
        AND
        EXISTS (SELECT 1 FROM designs WHERE id = design_id AND is_public = true)
      );
