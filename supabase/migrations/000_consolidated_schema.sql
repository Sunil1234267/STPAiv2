
-- Create the schema
CREATE SCHEMA IF NOT EXISTS stpa;

-- Grant usage on the schema to the necessary roles
GRANT USAGE ON SCHEMA stpa TO postgres, anon, authenticated, service_role;

-- Set the search path for the current session
SET search_path = stpa, public;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS stpa.collection_designs CASCADE;
DROP TABLE IF EXISTS stpa.collections CASCADE;
DROP TABLE IF EXISTS stpa.designs CASCADE;
DROP TABLE IF EXISTS stpa.messages CASCADE;
DROP TABLE IF EXISTS stpa.chat_boxes CASCADE;
DROP TABLE IF EXISTS stpa.orders CASCADE;
DROP TABLE IF EXISTS stpa.user_queries CASCADE;
DROP TABLE IF EXISTS stpa.saved_items CASCADE;
DROP TABLE IF EXISTS stpa.profiles CASCADE;
DROP TABLE IF EXISTS stpa.plans CASCADE;

-- Create the plans table
CREATE TABLE stpa.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    max_image_generations INTEGER NOT NULL DEFAULT 0,
    price NUMERIC NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the profiles table
CREATE TABLE stpa.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT UNIQUE,
    website TEXT,
    avatar_url TEXT,
    company_name TEXT,
    phone_number TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'contributor', 'user')),
    plan_id UUID REFERENCES stpa.plans(id),
    image_generations_left INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the collections table
CREATE TABLE stpa.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES stpa.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the designs table
CREATE TABLE stpa.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES stpa.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the collection_designs table
CREATE TABLE stpa.collection_designs (
    collection_id UUID NOT NULL REFERENCES stpa.collections(id) ON DELETE CASCADE,
    design_id UUID NOT NULL REFERENCES stpa.designs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (collection_id, design_id)
);

-- Create the orders table
CREATE TABLE stpa.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    design_id UUID REFERENCES stpa.designs(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES stpa.collections(id) ON DELETE SET NULL,
    order_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    details JSONB,
    quote_amount NUMERIC,
    quantity INTEGER DEFAULT 1,
    total_price NUMERIC DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the chat_boxes table
CREATE TABLE stpa.chat_boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the messages table
CREATE TABLE stpa.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_box_id UUID NOT NULL REFERENCES stpa.chat_boxes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    is_saved BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the saved_items table
CREATE TABLE stpa.saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL,
    item_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the user_queries table
CREATE TABLE stpa.user_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Set up RLS
ALTER TABLE stpa.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE stpa.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stpa.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE stpa.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stpa.collection_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stpa.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stpa.chat_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stpa.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stpa.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stpa.user_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Plans
CREATE POLICY "Authenticated users can read plans" ON stpa.plans FOR SELECT TO authenticated USING (true);

-- Profiles
CREATE POLICY "Users can manage their own profile" ON stpa.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON stpa.profiles FOR ALL USING (EXISTS (SELECT 1 FROM stpa.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Collections
CREATE POLICY "Authenticated users can view collections" ON stpa.collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own collections" ON stpa.collections FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can manage all collections" ON stpa.collections FOR ALL USING (EXISTS (SELECT 1 FROM stpa.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Designs
CREATE POLICY "Authenticated users can view designs" ON stpa.designs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own designs" ON stpa.designs FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can manage all designs" ON stpa.designs FOR ALL USING (EXISTS (SELECT 1 FROM stpa.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Collection Designs
CREATE POLICY "Authenticated users can view collection designs" ON stpa.collection_designs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own collection designs" ON stpa.collection_designs FOR ALL USING ((SELECT created_by FROM stpa.collections WHERE id = collection_id) = auth.uid()) WITH CHECK ((SELECT created_by FROM stpa.collections WHERE id = collection_id) = auth.uid());

-- Orders
CREATE POLICY "Users can manage their own orders" ON stpa.orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON stpa.orders FOR ALL USING (EXISTS (SELECT 1 FROM stpa.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Chat Boxes
CREATE POLICY "Users can manage their own chat boxes" ON stpa.chat_boxes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Messages
CREATE POLICY "Users can manage their own messages" ON stpa.messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Saved Items
CREATE POLICY "Users can manage their own saved items" ON stpa.saved_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Queries
CREATE POLICY "Users can manage their own queries" ON stpa.user_queries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all user queries" ON stpa.user_queries FOR ALL USING (EXISTS (SELECT 1 FROM stpa.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Indexes
CREATE INDEX ON stpa.profiles (plan_id);
CREATE INDEX ON stpa.orders (user_id);
CREATE INDEX ON stpa.orders (design_id);
CREATE INDEX ON stpa.orders (collection_id);
CREATE INDEX ON stpa.chat_boxes (user_id);
CREATE INDEX ON stpa.messages (chat_box_id);
CREATE INDEX ON stpa.messages (user_id);
CREATE INDEX ON stpa.saved_items (user_id);
CREATE INDEX ON stpa.user_queries (user_id);

-- Insert default plans
INSERT INTO stpa.plans (name, description, max_image_generations, price)
VALUES
    ('Free', 'Basic plan with limited image generations', 10, 0.00),
    ('Pro', 'Advanced plan with more image generations', 100, 9.99),
    ('Enterprise', 'Unlimited image generations for large teams', 999999, 99.99)
ON CONFLICT (name) DO NOTHING;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id uuid;
  free_plan_max_generations integer;
BEGIN
  -- Get the ID and max_image_generations for the 'Free' plan
  SELECT id, max_image_generations INTO free_plan_id, free_plan_max_generations
  FROM stpa.plans
  WHERE name = 'Free'
  LIMIT 1;

  INSERT INTO stpa.profiles (id, full_name, email, avatar_url, role, plan_id, image_generations_left)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    'user',
    free_plan_id,
    free_plan_max_generations
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
