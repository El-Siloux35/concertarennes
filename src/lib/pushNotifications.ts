import { supabase } from "@/integrations/supabase/client";

interface NotifyNewEventParams {
  eventId: string;
  eventTitle: string;
}

/**
 * Sends push notifications to all subscribed users about a new event.
 * This calls the Supabase Edge Function that handles the actual push sending.
 */
export async function notifyNewEvent({ eventId, eventTitle }: NotifyNewEventParams): Promise<void> {
  console.log('🔔 notifyNewEvent called:', { eventId, eventTitle });

  try {
    console.log('🔔 Calling Edge Function...');
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        title: 'Nouvel événement',
        eventTitle,
        eventId,
      },
    });

    if (error) {
      console.error('🔔 Error sending push notifications:', error);
      return;
    }

    console.log('🔔 Push notification result:', data);
  } catch (error) {
    // Don't throw - push notification failure shouldn't break the event creation
    console.error('🔔 Failed to send push notifications:', error);
  }
}
