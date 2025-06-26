/*
      # Update messages table for chatbot functionality

      This migration ensures the `messages` table has the necessary columns for the chatbot
      and sets up Row Level Security (RLS) policies.

      1. Table Changes
        - `messages`
          - Ensures `sender` column (text) exists.
          - Ensures `content` column (text) exists.
          - Ensures `image_url` column (text) exists.
          - Ensures `is_saved` column (boolean) exists with a default of `false`.
          - Ensures `created_at` column (timestamptz) exists with a default of `now()`.
      2. Security
        - Enables RLS on `messages` table.
        - Adds RLS policies for:
          - `SELECT`: Authenticated users can read messages belonging to their chat boxes.
          - `INSERT`: Authenticated users can create messages for their own chat boxes.
          - `UPDATE`: Authenticated users can update their own messages (e.g., `is_saved` status).
          - `DELETE`: Authenticated users can delete their own messages.
    */

    -- Ensure the messages table exists with all necessary columns
    CREATE TABLE IF NOT EXISTS messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      chat_box_id uuid REFERENCES chat_boxes(id) ON DELETE CASCADE NOT NULL,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      sender text NOT NULL DEFAULT 'user', -- 'user' or 'bot'
      content text NOT NULL DEFAULT '',
      image_url text,
      is_saved boolean NOT NULL DEFAULT false,
      created_at timestamptz DEFAULT now()
    );

    -- Add sender column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender') THEN
        ALTER TABLE messages ADD COLUMN sender text NOT NULL DEFAULT 'user';
      END IF;
    END $$;

    -- Add content column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'content') THEN
        ALTER TABLE messages ADD COLUMN content text NOT NULL DEFAULT '';
      END IF;
    END $$;

    -- Add image_url column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'image_url') THEN
        ALTER TABLE messages ADD COLUMN image_url text;
      END IF;
    END $$;

    -- Add is_saved column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_saved') THEN
        ALTER TABLE messages ADD COLUMN is_saved boolean NOT NULL DEFAULT false;
      END IF;
    END $$;

    -- Add created_at column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'created_at') THEN
        ALTER TABLE messages ADD COLUMN created_at timestamptz DEFAULT now();
      END IF;
    END $$;

    -- Enable Row Level Security
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

    -- Policy for authenticated users to select their own messages within their chat boxes
    DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
    CREATE POLICY "Users can read their own messages"
      ON messages FOR SELECT
      TO authenticated
      USING (
        (auth.uid() = user_id) AND
        EXISTS (SELECT 1 FROM chat_boxes WHERE id = chat_box_id AND user_id = auth.uid())
      );

    -- Policy for authenticated users to insert messages into their own chat boxes
    DROP POLICY IF EXISTS "Users can create their own messages" ON messages;
    CREATE POLICY "Users can create their own messages"
      ON messages FOR INSERT
      TO authenticated
      WITH CHECK (
        (auth.uid() = user_id) AND
        EXISTS (SELECT 1 FROM chat_boxes WHERE id = chat_box_id AND user_id = auth.uid())
      );

    -- Policy for authenticated users to update their own messages (e.g., is_saved)
    DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
    CREATE POLICY "Users can update their own messages"
      ON messages FOR UPDATE
      TO authenticated
      USING (
        (auth.uid() = user_id) AND
        EXISTS (SELECT 1 FROM chat_boxes WHERE id = chat_box_id AND user_id = auth.uid())
      );

    -- Policy for authenticated users to delete their own messages
    DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
    CREATE POLICY "Users can delete their own messages"
      ON messages FOR DELETE
      TO authenticated
      USING (
        (auth.uid() = user_id) AND
        EXISTS (SELECT 1 FROM chat_boxes WHERE id = chat_box_id AND user_id = auth.uid())
      );
