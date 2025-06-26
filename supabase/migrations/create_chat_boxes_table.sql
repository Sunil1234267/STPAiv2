/*
      # Create chat_boxes table

      1. New Tables
        - `chat_boxes`
          - `id` (uuid, primary key)
          - `user_id` (uuid, foreign key to auth.users, not null)
          - `name` (text, not null, default 'New Chat')
          - `created_at` (timestamp, default now())
          - `updated_at` (timestamp, default now())
      2. Security
        - Enable RLS on `chat_boxes` table
        - Add policies for authenticated users to perform CRUD on their own chat boxes
    */

    CREATE TABLE IF NOT EXISTS chat_boxes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name text NOT NULL DEFAULT 'New Chat',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE chat_boxes ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can create their own chat boxes"
      ON chat_boxes
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can read their own chat boxes"
      ON chat_boxes
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own chat boxes"
      ON chat_boxes
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own chat boxes"
      ON chat_boxes
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
