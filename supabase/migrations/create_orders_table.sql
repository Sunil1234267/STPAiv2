/*
      # Create orders table

      1. New Tables
        - `orders`
          - `id` (uuid, primary key, default gen_random_uuid())
          - `user_id` (uuid, foreign key to auth.users.id, not null)
          - `design_id` (uuid, foreign key to designs.id, nullable)
          - `collection_id` (uuid, foreign key to collections.id, nullable)
          - `order_type` (text, not null, e.g., 'custom_design', 'print_service')
          - `status` (text, not null, default 'pending')
          - `details` (jsonb, nullable, for custom order details)
          - `quote_amount` (numeric, nullable)
          - `created_at` (timestamptz, default now())
          - `updated_at` (timestamptz, default now())
      2. Security
        - Enable RLS on `orders` table
        - Add policies for authenticated users to perform CRUD operations on their own orders.
        - Add policies for 'admin' role to view and update all orders.
    */

    CREATE TABLE IF NOT EXISTS orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      design_id uuid REFERENCES designs(id) ON DELETE SET NULL, -- Assuming 'designs' table exists
      collection_id uuid REFERENCES collections(id) ON DELETE SET NULL, -- Assuming 'collections' table exists
      order_type text NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      details jsonb,
      quote_amount numeric,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

    -- Policies for users
    CREATE POLICY "Users can read their own orders"
      ON orders
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own orders"
      ON orders
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own orders"
      ON orders
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    -- Policies for admin
    CREATE POLICY "Admins can view all orders"
      ON orders
      FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

    CREATE POLICY "Admins can update all orders"
      ON orders
      FOR UPDATE
      TO authenticated
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
