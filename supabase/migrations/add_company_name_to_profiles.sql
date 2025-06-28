/*
  # Add company_name to profiles table

  1. Modified Tables
    - `profiles`
      - Added `company_name` (text, nullable)

  2. Security
    - No security changes.
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS company_name text;
