-- Add missing columns to events table for the create event form
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS organizer TEXT,
ADD COLUMN IF NOT EXISTS venue TEXT,
ADD COLUMN IF NOT EXISTS price TEXT,
ADD COLUMN IF NOT EXISTS contact TEXT;

-- Create storage bucket for event images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for event images uploads
CREATE POLICY "Users can upload event images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Create storage policy for public access to event images
CREATE POLICY "Event images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-images');