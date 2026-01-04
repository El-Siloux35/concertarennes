-- Allow public access to events (anyone can view)
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;

CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT 
  TO anon, authenticated
  USING (true);