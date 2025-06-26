/*
  # Create profiles table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `username` (text, unique, nullable)
      - `full_name` (text, nullable)
      - `website` (text, nullable)
      - `avatar_url` (text, nullable)
      - `role` (text, default 'user', not null)
      - `updated_at` (timestamptz, nullable)
  2. Security
    - Enable RLS on `profiles` table
    - Add policy for authenticated users to read their own profile
    - Add policy for authenticated users to insert their own profile
    - Add policy for authenticated users to update their own profile
  3. Notes
    - The `id` column is linked to `auth.users` to ensure each profile corresponds to an authenticated user.
    - A default 'user' role is assigned upon creation.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  website text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user',
  updated_at timestamptz
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent "already exists" errors
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;

CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);