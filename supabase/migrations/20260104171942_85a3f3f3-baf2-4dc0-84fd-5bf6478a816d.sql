-- Fix: Require authentication to view events (protects contact PII)
-- Drop the permissive public access policy
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view events" ON public.events
  FOR SELECT 
  TO authenticated
  USING (true);