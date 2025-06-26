/*
  # Enable RLS and add policies for orders table

  1. Security
    - Enable RLS on `orders` table
    - Add policy for authenticated users to insert their own orders
    - Add policy for authenticated users to select their own orders
*/

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert their own orders."
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own orders."
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
