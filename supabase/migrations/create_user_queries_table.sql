/*
      # Create user_queries table

      1. New Tables
        - `user_queries`
          - `id` (uuid, primary key)
          - `user_id` (uuid, foreign key to auth.users, nullable)
          - `name` (text, not null)
          - `email` (text, not null)
          - `subject` (text, not null)
          - `message` (text, not null)
          - `created_at` (timestamp, default now())
          - `status` (text, default 'pending')
      2. Security
        - Enable RLS on `user_queries` table
        - Add policy for authenticated users to insert their own queries
        - Add policy for authenticated users to read their own queries
        - Add policy for admin users to read all queries
    */

    CREATE TABLE IF NOT EXISTS user_queries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      name text NOT NULL,
      email text NOT NULL,
      subject text NOT NULL,
      message text NOT NULL,
      created_at timestamptz DEFAULT now(),
      status text DEFAULT 'pending'
    );

    ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can insert their own queries"
      ON user_queries
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can read their own queries"
      ON user_queries
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    -- Policy for admin to read all queries (assuming 'admin' role in profiles table)
    CREATE POLICY "Admins can read all user queries"
      ON user_queries
      FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
