-- Create a validation trigger function for events table
-- Using trigger instead of CHECK constraints for flexibility
CREATE OR REPLACE FUNCTION public.validate_event_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate title length (required, max 200 chars)
  IF NEW.title IS NULL OR length(NEW.title) = 0 THEN
    RAISE EXCEPTION 'Title is required';
  END IF;
  
  IF length(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Title too long (max 200 characters)';
  END IF;
  
  -- Validate description length (max 5000 chars)
  IF NEW.description IS NOT NULL AND length(NEW.description) > 5000 THEN
    RAISE EXCEPTION 'Description too long (max 5000 characters)';
  END IF;
  
  -- Validate organizer length (max 200 chars)
  IF NEW.organizer IS NOT NULL AND length(NEW.organizer) > 200 THEN
    RAISE EXCEPTION 'Organizer name too long (max 200 characters)';
  END IF;
  
  -- Validate location length (max 300 chars)
  IF NEW.location IS NOT NULL AND length(NEW.location) > 300 THEN
    RAISE EXCEPTION 'Location too long (max 300 characters)';
  END IF;
  
  -- Validate price length (max 100 chars)
  IF NEW.price IS NOT NULL AND length(NEW.price) > 100 THEN
    RAISE EXCEPTION 'Price too long (max 100 characters)';
  END IF;
  
  -- Validate contact format and length (only digits, spaces, +, -, (, ))
  IF NEW.contact IS NOT NULL THEN
    IF length(NEW.contact) > 50 THEN
      RAISE EXCEPTION 'Contact too long (max 50 characters)';
    END IF;
    
    IF NOT (NEW.contact ~ '^[0-9\s\+\-\(\)]+$') THEN
      RAISE EXCEPTION 'Invalid contact format (only digits, spaces, +, -, (, ) allowed)';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_event_before_insert_or_update ON public.events;
CREATE TRIGGER validate_event_before_insert_or_update
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.validate_event_input();