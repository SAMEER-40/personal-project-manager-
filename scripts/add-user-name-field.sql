-- Add name field to users table for personalized greetings
ALTER TABLE users ADD COLUMN IF NOT EXISTS name text;

-- Update RLS policies to include name field
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;

CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON users
    FOR UPDATE USING (auth.uid() = id);
