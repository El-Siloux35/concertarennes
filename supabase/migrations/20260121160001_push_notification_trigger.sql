-- Enable the pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to send push notification when new event is published
CREATE OR REPLACE FUNCTION notify_new_event()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
  edge_function_url TEXT;
  request_id BIGINT;
BEGIN
  -- Only trigger for published events (not drafts)
  -- And only when event is newly published or updated from draft to published
  IF NEW.is_draft = false AND (OLD IS NULL OR OLD.is_draft = true) THEN
    -- Get the Supabase URL from environment (you'll need to set this)
    -- For now, we'll construct it from the known patterns
    -- In production, you should store these in vault secrets

    -- Get project ref from current database
    SELECT current_setting('app.settings.supabase_url', true) INTO supabase_url;
    SELECT current_setting('app.settings.service_role_key', true) INTO service_role_key;

    -- If settings aren't configured, try to use the edge function URL directly
    -- You'll need to configure this in your Supabase project settings
    IF supabase_url IS NULL THEN
      -- Log that we couldn't send notification
      RAISE NOTICE 'Push notification skipped: Supabase URL not configured';
      RETURN NEW;
    END IF;

    edge_function_url := supabase_url || '/functions/v1/send-push-notification';

    -- Make async HTTP request to the Edge Function
    SELECT net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'title', 'Nouvel événement',
        'eventTitle', NEW.title,
        'eventId', NEW.id
      )
    ) INTO request_id;

    RAISE NOTICE 'Push notification request sent with id: %', request_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new events
DROP TRIGGER IF EXISTS on_event_published ON public.events;
CREATE TRIGGER on_event_published
  AFTER INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_event();

-- Add helpful comment
COMMENT ON FUNCTION notify_new_event() IS
'Sends push notification to all subscribed users when a new event is published.
Requires pg_net extension and proper configuration of app.settings.supabase_url and app.settings.service_role_key.
Alternative: Use Supabase Database Webhooks in the dashboard for a simpler setup.';
