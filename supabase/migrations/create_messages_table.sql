/*
  # Create messages table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `chat_box_id` (uuid, foreign key to chat_boxes, not null)
      - `user_id` (uuid, foreign key to auth.users, not null)
      - `sender` (text, 'user' or 'bot', not null)
      - `content` (text, not null)
      - `created_at` (timestamp, default now())
      - `is_saved` (boolean, default false)
      - `image_url` (text, nullable)
  2. Security
    - Enable RLS on `messages` table
    - Add policies for authenticated users to perform CRUD on their own messages within their chat boxes
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_box_id uuid NOT NULL REFERENCES chat_boxes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender text NOT NULL, -- 'user' or 'bot'
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_saved boolean DEFAULT false,
  image_url text
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM chat_boxes WHERE id = chat_box_id AND user_id = auth.uid()));

CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM chat_boxes WHERE id = chat_box_id AND user_id = auth.uid()));

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM chat_boxes WHERE id = chat_box_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM chat_boxes WHERE id = chat_box_id AND user_id = auth.uid()));
