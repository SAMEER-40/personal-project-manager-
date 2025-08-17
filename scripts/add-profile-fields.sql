-- Add missing profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;

-- Recreate policies with new fields
CREATE POLICY "Enable select for users based on user_id" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
