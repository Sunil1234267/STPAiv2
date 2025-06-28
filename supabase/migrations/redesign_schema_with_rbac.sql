/*
  # Complete Schema Redesign with Role-Based Access Control (Collections Removed)

  This migration performs a complete overhaul of the Supabase schema, dropping all existing
  application-specific tables and types, and then recreating them with a robust
  Role-Based Access Control (RBAC) system. It defines three distinct user roles:
  'general_user', 'contributor', and 'admin', each with specific permissions.

  This version explicitly removes the 'collections' and 'collection_designs' tables
  and all related logic as per the updated project scope.

  1. Schema Reset
    - Drops any potential phantom table named `user_roles`.
    - Drops all application tables, the `user_roles` ENUM type, and the `handle_new_user` function and trigger
      to ensure a clean and consistent starting point.

  2. New Types
    - `user_roles` (ENUM): Defines the roles 'general_user', 'contributor', 'admin'.

  3. New Tables and their Features
    - `profiles`
      - Stores user profile information, linked to `auth.users`.
      - Includes `role` column to assign user roles.
      - Features: Basic profile management.
    - `designs`
      - Stores information about design assets.
      - Features:
        - General User: View designs.
        - Contributor/Admin: Create, update designs (including images).
    - `orders`
      - Manages customer orders.
      - Features:
        - General User: Create and view their own orders.
        - Contributor/Admin: View and manage (update status, details) all orders.
    - `order_items`
      - Details for items within an order.
      - Features: Linked to `orders` features.
    - `coupons`
      - Manages discount coupons.
      - Features:
        - General User: View active coupons.
        - Contributor/Admin: Create, view all, update, delete coupons.
    - `user_queries`
      - Stores user support queries.
      - Features:
        - General User: Create and view their own queries, update their own open queries.
        - Contributor/Admin: View and manage (update status) all queries.
    - `query_responses`
      - Stores responses to user queries.
      - Features:
        - General User: View responses to their own queries.
        - Contributor/Admin: Create, view all, update, delete responses.
    - `saved_items`
      - Stores user's saved designs or articles.
      - Features:
        - General User: Save and view their own designs/articles.

  4. Security (Row Level Security - RLS)
    - RLS is enabled for all new tables.
    - Policies are meticulously defined for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`
      operations, ensuring that each role has precisely the access required for its features.
    - Policies leverage `auth.uid()` and subqueries to check the user's role from the `profiles` table.

  5. Triggers
    - `handle_new_user()`: A function that automatically creates a `profiles` entry for new users
      signing up via `auth.users`, assigning them the 'general_user' role by default.
    - `on_auth_user_created`: A trigger that executes `handle_new_user()` after a new user is created.

  6. Realtime
    - All new tables are added to the `supabase_realtime` publication for real-time data updates.

  Important Notes:
  - All `DROP` statements are defensive (`IF EXISTS`) and include `CASCADE` to handle dependencies.
  - All `CREATE TABLE` statements use `IF NOT EXISTS` for idempotency.
  - Default values are provided for common columns like `created_at`, `status`, and numeric fields.
  - The `email` column is added to `profiles` for easier access and consistency, though `auth.users` also stores it.
*/

-- Ensure the public schema exists
CREATE SCHEMA IF NOT EXISTS public;

-- 1. Schema Reset: Drop all application-specific tables, types, functions, and triggers
-- Explicitly drop any potential phantom table named 'user_roles' first, as hinted by the error.
DROP TABLE IF EXISTS public.user_roles CASCADE;

DROP TABLE IF EXISTS public.query_responses CASCADE;
DROP TABLE IF EXISTS public.user_queries CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
-- Removed collection_designs and collections tables
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.designs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.saved_items CASCADE; -- Added saved_items table drop

-- Drop the user_roles ENUM type if it exists, with CASCADE to remove dependent objects
DROP TYPE IF EXISTS public.user_roles CASCADE;

-- Drop the trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. New Types: Create ENUM for user roles
CREATE TYPE public.user_roles AS ENUM ('general_user', 'contributor', 'admin');

-- 3. New Tables and their Features

-- profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  email text UNIQUE NOT NULL, -- Added email for convenience
  avatar_url text,
  website text,
  role public.user_roles DEFAULT 'general_user' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
-- General users can read their own profile
CREATE POLICY "General users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Authenticated users can insert their own profile
CREATE POLICY "Authenticated users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- General users can update their own profile
CREATE POLICY "General users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admins can delete any profile
CREATE POLICY "Admins can delete any profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- designs table
CREATE TABLE IF NOT EXISTS public.designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  price numeric DEFAULT 0.00 NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz
);
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for designs table
-- All users can read designs
CREATE POLICY "All users can read designs"
  ON public.designs FOR SELECT
  USING (true);

-- Contributors and Admins can insert designs
CREATE POLICY "Contributors and Admins can insert designs"
  ON public.designs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Contributors and Admins can update designs
CREATE POLICY "Contributors and Admins can update designs"
  ON public.designs FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Admins can delete designs
CREATE POLICY "Admins can delete designs"
  ON public.designs FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_date timestamptz DEFAULT now() NOT NULL,
  total_amount numeric DEFAULT 0.00 NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  shipping_address text,
  billing_address text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders table
-- General users can read and insert their own orders
CREATE POLICY "General users can read own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "General users can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Contributors and Admins can read all orders
CREATE POLICY "Contributors and Admins can read all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Contributors and Admins can update orders
CREATE POLICY "Contributors and Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Admins can delete orders
CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  design_id uuid REFERENCES public.designs(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 NOT NULL,
  price_at_purchase numeric DEFAULT 0.00 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_items table
-- General users can read and insert order items for their own orders
CREATE POLICY "General users can read own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));

CREATE POLICY "General users can insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));

-- Contributors and Admins can read all order items
CREATE POLICY "Contributors and Admins can read all order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Contributors and Admins can update order items
CREATE POLICY "Contributors and Admins can update order items"
  ON public.order_items FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Admins can delete order items
CREATE POLICY "Admins can delete order items"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text DEFAULT 'percentage' NOT NULL, -- e.g., 'percentage', 'fixed'
  value numeric DEFAULT 0.00 NOT NULL,
  valid_from timestamptz DEFAULT now() NOT NULL,
  valid_until timestamptz,
  is_active boolean DEFAULT true NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons table
-- All users can read active coupons (limited info)
CREATE POLICY "All users can read active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true);

-- Contributors and Admins can read all coupon details
CREATE POLICY "Contributors and Admins can read all coupon details"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Contributors and Admins can insert coupons
CREATE POLICY "Contributors and Admins can insert coupons"
  ON public.coupons FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Contributors and Admins can update coupons
CREATE POLICY "Contributors and Admins can update coupons"
  ON public.coupons FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Admins can delete coupons
CREATE POLICY "Admins can delete coupons"
  ON public.coupons FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- user_queries table
CREATE TABLE IF NOT EXISTS public.user_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open' NOT NULL, -- e.g., 'open', 'in_progress', 'closed'
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz
);
ALTER TABLE public.user_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_queries table
-- General users can read and insert their own queries
CREATE POLICY "General users can read own queries"
  ON public.user_queries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "General users can create queries"
  ON public.user_queries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- General users can update their own queries (if status is 'open')
CREATE POLICY "General users can update own open queries"
  ON public.user_queries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'open');

-- Contributors and Admins can read all queries
CREATE POLICY "Contributors and Admins can read all queries"
  ON public.user_queries FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Contributors and Admins can update any query (e.g., status)
CREATE POLICY "Contributors and Admins can update any query"
  ON public.user_queries FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Admins can delete queries
CREATE POLICY "Admins can delete queries"
  ON public.user_queries FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- query_responses table
CREATE TABLE IF NOT EXISTS public.query_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid REFERENCES public.user_queries(id) ON DELETE CASCADE NOT NULL,
  responder_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  response_text text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz
);
ALTER TABLE public.query_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for query_responses table
-- General users can read responses to their own queries
CREATE POLICY "General users can read responses to own queries"
  ON public.query_responses FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_queries WHERE id = query_id AND user_id = auth.uid()));

-- Contributors and Admins can read all query responses
CREATE POLICY "Contributors and Admins can read all query responses"
  ON public.query_responses FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Contributors and Admins can insert query responses
CREATE POLICY "Contributors and Admins can insert query responses"
  ON public.query_responses FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Contributors and Admins can update query responses
CREATE POLICY "Contributors and Admins can update query responses"
  ON public.query_responses FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('contributor', 'admin')));

-- Admins can delete query responses
CREATE POLICY "Admins can delete query responses"
  ON public.query_responses FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- saved_items table (for saving designs and articles)
CREATE TABLE IF NOT EXISTS public.saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_type text NOT NULL, -- 'design' or 'article'
  item_id uuid NOT NULL, -- ID of the saved design or article
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, item_type, item_id) -- Ensure a user can only save an item once
);
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_items table
-- Authenticated users can read their own saved items
CREATE POLICY "Authenticated users can read own saved items"
  ON public.saved_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own saved items
CREATE POLICY "Authenticated users can insert own saved items"
  ON public.saved_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own saved items
CREATE POLICY "Authenticated users can delete own saved items"
  ON public.saved_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- 5. Triggers: Function to handle new user creation in profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (NEW.id, NEW.email, NEW.email, 'general_user'); -- Using email as default username and email
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user function after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Realtime: Set up Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.designs;
-- Removed collections and collection_designs from realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_queries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.query_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_items; -- Added saved_items to realtime publication
