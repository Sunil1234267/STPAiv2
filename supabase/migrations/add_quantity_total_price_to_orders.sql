/*
  # Add quantity and total_price to orders table

  1. Modified Tables
    - `orders`
      - Add `quantity` (integer, default 1)
      - Add `total_price` (numeric, default 0.00)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE orders ADD COLUMN quantity integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE orders ADD COLUMN total_price numeric DEFAULT 0.00;
  END IF;
END $$;
