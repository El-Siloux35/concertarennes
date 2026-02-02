import { supabase } from "@/integrations/supabase/client";

interface NotifyNewEventParams {
  eventId: string;
  eventTitle: string;
  eventLocation?: string;
  eventDate?: string;
  eventPrice?: string;
  eventImage?: string;
  organizerName?: string;
}

/**
 * Sends push notifications to all subscribed users about a new event.
 * This calls the Supabase Edge Function that handles the actual push sending.
 */
export async function notifyNewEvent({ eventId, eventTitle, eventLocation, eventDate, eventPrice, eventImage, organizerName }: NotifyNewEventParams): Promise<void> {

  try {
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        eventTitle,
        eventLocation,
        eventDate,
        eventPrice,
        eventImage,
        organizerName,
        eventId,
      },
    });

    if (error) return;

    console.log('🔔 Push notification result:', data);
  } catch (error) {
    console.error('🔔 Failed to send push notifications:', error);
  }
}
