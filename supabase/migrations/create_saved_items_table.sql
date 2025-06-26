/*
      # Create saved_items table

      1. New Tables
        - `saved_items`
          - `id` (uuid, primary key, default gen_random_uuid())
          - `user_id` (uuid, foreign key to auth.users.id, not null)
          - `item_type` (text, not null, e.g., 'design', 'collection', 'image')
          - `item_id` (uuid, not null, ID of the saved item)
          - `created_at` (timestamptz, default now())
      2. Security
        - Enable RLS on `saved_items` table
        - Add policies for authenticated users to perform CRUD operations on their own saved items.
    */

    CREATE TABLE IF NOT EXISTS saved_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      item_type text NOT NULL,
      item_id uuid NOT NULL, -- This could be design_id, collection_id, etc.
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can read their own saved items"
      ON saved_items
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own saved items"
      ON saved_items
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own saved items"
      ON saved_items
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
