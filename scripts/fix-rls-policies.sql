-- Drop and recreate RLS policies to fix user creation issues
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create a more permissive policy for user profile creation
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() = id AND 
    auth.jwt() ->> 'email' = email
  );

-- Also create a policy to handle profile creation during email confirmation
CREATE POLICY "Allow profile creation on email confirmation" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );
