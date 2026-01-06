-- Add is_draft column to events table
ALTER TABLE public.events 
ADD COLUMN is_draft boolean NOT NULL DEFAULT false;