/*
      # Create collection_designs junction table

      1. New Tables
        - `collection_designs`
          - `collection_id` (uuid, foreign key to collections.id, not null)
          - `design_id` (uuid, foreign key to designs.id, not null)
          - `created_at` (timestamptz, default now())
          - Primary Key: (collection_id, design_id)
      2. Security
        - Enable RLS on `collection_designs` table
        - Add policies for `collection_designs`:
          - Authenticated users can read all entries.
          - Authenticated users can insert entries if they own the collection.
          - Owners of the collection can delete entries.
    */

    CREATE TABLE IF NOT EXISTS collection_designs (
      collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      design_id uuid NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      PRIMARY KEY (collection_id, design_id)
    );

    ALTER TABLE collection_designs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can view collection designs"
      ON collection_designs
      FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Owners of collection can add designs"
      ON collection_designs
      FOR INSERT
      TO authenticated
      WITH CHECK ((SELECT created_by FROM collections WHERE id = collection_id) = auth.uid());

    CREATE POLICY "Owners of collection can remove designs"
      ON collection_designs
      FOR DELETE
      TO authenticated
      USING ((SELECT created_by FROM collections WHERE id = collection_id) = auth.uid());
