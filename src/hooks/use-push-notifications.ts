import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// VAPID public key - You need to generate this and set up the private key in your Edge Function
// Generate keys at: https://web-push-codelab.glitch.me/ or use web-push library
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      setIsSupported(supported);

      if (!supported) {
        setIsLoading(false);
        return;
      }

      // Check existing subscription with timeout
      try {
        // Wait for service worker with timeout (5 seconds)
        const registrationPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Service worker timeout')), 5000)
        );

        const registration = await Promise.race([registrationPromise, timeoutPromise]);

        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        }
      } catch {
        // Service worker not ready (common in dev mode)
      }

      setIsLoading(false);
    };

    checkSupport();
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications not supported');
      return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      setError('VAPID key not configured');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Permission denied');
        setIsLoading(false);
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Get subscription details
      const subscriptionJson = subscription.toJSON();
      const endpoint = subscriptionJson.endpoint!;
      const p256dh = subscriptionJson.keys!.p256dh;
      const auth = subscriptionJson.keys!.auth;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // First try to delete existing subscription with same endpoint
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint);

      // Then insert new subscription
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user?.id || null,
          endpoint,
          p256dh,
          auth,
        })
        .select();

      console.log('Insert result:', insertedData);

      if (dbError) {
        console.error('Error saving subscription:', dbError);
        console.error('Error details:', JSON.stringify(dbError, null, 2));
        setError(`Failed to save subscription: ${dbError.message}`);
        setIsLoading(false);
        return false;
      }

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Wait for service worker with timeout
      const registrationPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Service worker timeout')), 5000)
      );

      const registration = await Promise.race([registrationPromise, timeoutPromise]);

      if (!registration) {
        setIsSubscribed(false);
        setIsLoading(false);
        return true;
      }

      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Remove from Supabase
        const { error: dbError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);

        if (dbError) {
          // DB delete failed, continue with unsubscribe
        }

        // Unsubscribe from push manager
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
      setIsLoading(false);
      return false;
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
}
