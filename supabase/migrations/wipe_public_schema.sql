/*
      # Wipe Public Schema

      This migration script is designed to completely remove all user-defined tables,
      types, functions, and triggers from the `public` schema of your Supabase database.
      It's intended for a full reset of your application's data model.

      1. Schema Cleanup
        - Drops all tables in the `public` schema that were previously defined.
        - Drops the `user_roles` ENUM type.
        - Drops the `handle_new_user` function and its associated trigger.
        - Revokes all RLS policies on the tables being dropped.

      Important Notes:
      - This script uses `IF EXISTS` to prevent errors if an object doesn't exist.
      - `CASCADE` is used with `DROP TABLE` and `DROP TYPE` to automatically drop
        dependent objects (like foreign keys, views, or policies).
      - This script does NOT affect Supabase's built-in schemas (e.g., `auth`, `storage`)
        or their data. It only targets objects within the `public` schema.
      - To delete user accounts, use the Supabase dashboard or client library functions.
      - For a complete database reset, use the "Reset Database" option in your Supabase project settings.
    */

    -- Revoke RLS policies before dropping tables to ensure clean removal
    -- Profiles policies
    DROP POLICY IF EXISTS "General users can read own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "General users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;

    -- Designs policies
    DROP POLICY IF EXISTS "All users can read designs" ON public.designs;
    DROP POLICY IF EXISTS "Contributors and Admins can insert designs" ON public.designs;
    DROP POLICY IF EXISTS "Contributors and Admins can update designs" ON public.designs;
    DROP POLICY IF EXISTS "Admins can delete designs" ON public.designs;

    -- Orders policies
    DROP POLICY IF EXISTS "General users can read own orders" ON public.orders;
    DROP POLICY IF EXISTS "General users can create orders" ON public.orders;
    DROP POLICY IF EXISTS "Contributors and Admins can read all orders" ON public.orders;
    DROP POLICY IF EXISTS "Contributors and Admins can update orders" ON public.orders;
    DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

    -- Order Items policies
    DROP POLICY IF EXISTS "General users can read own order items" ON public.order_items;
    DROP POLICY IF EXISTS "General users can insert order items" ON public.order_items;
    DROP POLICY IF EXISTS "Contributors and Admins can read all order items" ON public.order_items;
    DROP POLICY IF EXISTS "Contributors and Admins can update order items" ON public.order_items;
    DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;

    -- Collections policies
    DROP POLICY IF EXISTS "All users can read collections" ON public.collections;
    DROP POLICY IF EXISTS "Contributors and Admins can insert collections" ON public.collections;
    DROP POLICY IF EXISTS "Contributors and Admins can update collections" ON public.collections;
    DROP POLICY IF EXISTS "Admins can delete collections" ON public.collections;

    -- Collection Designs policies
    DROP POLICY IF EXISTS "All users can read collection designs" ON public.collection_designs;
    DROP POLICY IF EXISTS "Contributors and Admins can insert collection designs" ON public.collection_designs;
    DROP POLICY IF EXISTS "Contributors and Admins can delete collection designs" ON public.collection_designs;

    -- Coupons policies
    DROP POLICY IF EXISTS "All users can read active coupons" ON public.coupons;
    DROP POLICY IF EXISTS "Contributors and Admins can read all coupon details" ON public.coupons;
    DROP POLICY IF EXISTS "Contributors and Admins can insert coupons" ON public.coupons;
    DROP POLICY IF EXISTS "Contributors and Admins can update coupons" ON public.coupons;
    DROP POLICY IF EXISTS "Admins can delete coupons" ON public.coupons;

    -- User Queries policies
    DROP POLICY IF EXISTS "General users can read own queries" ON public.user_queries;
    DROP POLICY IF EXISTS "General users can create queries" ON public.user_queries;
    DROP POLICY IF EXISTS "General users can update own open queries" ON public.user_queries;
    DROP POLICY IF EXISTS "Contributors and Admins can read all queries" ON public.user_queries;
    DROP POLICY IF EXISTS "Contributors and Admins can update any query" ON public.user_queries;
    DROP POLICY IF EXISTS "Admins can delete queries" ON public.user_queries;

    -- Query Responses policies
    DROP POLICY IF EXISTS "General users can read responses to own queries" ON public.query_responses;
    DROP POLICY IF EXISTS "Contributors and Admins can read all query responses" ON public.query_responses;
    DROP POLICY IF EXISTS "Contributors and Admins can insert query responses" ON public.query_responses;
    DROP POLICY IF EXISTS "Contributors and Admins can update query responses" ON public.query_responses;
    DROP POLICY IF EXISTS "Admins can delete query responses" ON public.query_responses;


    -- Drop tables in reverse order of dependency or with CASCADE
    DROP TABLE IF EXISTS public.query_responses CASCADE;
    DROP TABLE IF EXISTS public.user_queries CASCADE;
    DROP TABLE IF EXISTS public.coupons CASCADE;
    DROP TABLE IF EXISTS public.collection_designs CASCADE;
    DROP TABLE IF EXISTS public.collections CASCADE;
    DROP TABLE IF EXISTS public.order_items CASCADE;
    DROP TABLE IF EXISTS public.orders CASCADE;
    DROP TABLE IF EXISTS public.designs CASCADE;
    DROP TABLE IF EXISTS public.profiles CASCADE;

    -- Drop the user_roles ENUM type if it exists, with CASCADE to remove dependent objects
    DROP TYPE IF EXISTS public.user_roles CASCADE;

    -- Drop the trigger and function if they exist
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user();

    -- Remove tables from realtime publication
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.profiles;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.orders;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.order_items;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.designs;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.collections;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.collection_designs;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.coupons;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.user_queries;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.query_responses;
