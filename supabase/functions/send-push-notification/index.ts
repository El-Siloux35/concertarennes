import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  eventId?: string;
  tag?: string;
}

// Helper functions for Web Push encryption
function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

async function createVapidAuthHeader(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  subject: string
): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  // Create JWT header and payload
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key (PKCS8 format expected)
  // The private key should be base64url encoded raw 32-byte private key
  const privateKeyBytes = base64UrlDecode(vapidPrivateKey);

  // Create the full private key in JWK format for P-256
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: base64UrlEncode(privateKeyBytes),
    x: '', // Will be derived
    y: ''  // Will be derived
  };

  // We need to derive x and y from the public key
  const publicKeyBytes = base64UrlDecode(vapidPublicKey);
  // Public key is in uncompressed format: 0x04 || x || y
  if (publicKeyBytes[0] === 0x04 && publicKeyBytes.length === 65) {
    jwk.x = base64UrlEncode(publicKeyBytes.slice(1, 33));
    jwk.y = base64UrlEncode(publicKeyBytes.slice(33, 65));
  }

  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert signature from WebCrypto format to JWT format (raw r||s)
  const signatureB64 = base64UrlEncode(signature);

  return `vapid t=${unsignedToken}.${signatureB64}, k=${vapidPublicKey}`;
}

async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  // Extract
  const saltKey = await crypto.subtle.importKey('raw', salt, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', saltKey, ikm));

  // Expand
  const prkKey = await crypto.subtle.importKey('raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const infoWithCounter = concatUint8Arrays(info, new Uint8Array([1]));
  const okm = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, infoWithCounter));

  return okm.slice(0, length);
}

async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Export local public key
  const localPublicKeyBuffer = await crypto.subtle.exportKey('raw', localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyBuffer);

  // Import subscriber's public key
  const subscriberPublicKeyBytes = base64UrlDecode(p256dhKey);
  const subscriberPublicKey = await crypto.subtle.importKey(
    'raw',
    subscriberPublicKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret
  const sharedSecretBuffer = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberPublicKey },
    localKeyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBuffer);

  // Get auth secret
  const auth = base64UrlDecode(authSecret);

  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive PRK using auth secret
  const prkInfoPrefix = new TextEncoder().encode('WebPush: info\x00');
  const prkInfo = concatUint8Arrays(prkInfoPrefix, subscriberPublicKeyBytes, localPublicKey);
  const prk = await hkdf(auth, sharedSecret, prkInfo, 32);

  // Derive CEK (Content Encryption Key)
  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\x00');
  const cek = await hkdf(salt, prk, cekInfo, 16);

  // Derive nonce
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\x00');
  const nonce = await hkdf(salt, prk, nonceInfo, 12);

  // Import CEK for AES-GCM
  const aesKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);

  // Pad the payload (add 0x02 delimiter + padding)
  const payloadBytes = new TextEncoder().encode(payload);
  const paddedPayload = concatUint8Arrays(payloadBytes, new Uint8Array([2]));

  // Encrypt
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    aesKey,
    paddedPayload
  );
  const ciphertext = new Uint8Array(ciphertextBuffer);

  return { ciphertext, salt, localPublicKey };
}

function buildAes128GcmBody(
  ciphertext: Uint8Array,
  salt: Uint8Array,
  localPublicKey: Uint8Array
): Uint8Array {
  // Header format for aes128gcm:
  // salt (16 bytes) || rs (4 bytes, big endian) || idlen (1 byte) || keyid (idlen bytes) || ciphertext
  const rs = 4096; // record size
  const rsBytes = new Uint8Array(4);
  new DataView(rsBytes.buffer).setUint32(0, rs, false); // big endian

  const idlen = localPublicKey.length;
  const idlenByte = new Uint8Array([idlen]);

  return concatUint8Arrays(salt, rsBytes, idlenByte, localPublicKey, ciphertext);
}

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: NotificationPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const payloadString = JSON.stringify(payload);

    // Encrypt the payload
    const { ciphertext, salt, localPublicKey } = await encryptPayload(
      payloadString,
      subscription.p256dh,
      subscription.auth
    );

    // Build the body
    const body = buildAes128GcmBody(ciphertext, salt, localPublicKey);

    // Create VAPID authorization header
    const authHeader = await createVapidAuthHeader(
      subscription.endpoint,
      vapidPublicKey,
      vapidPrivateKey,
      vapidSubject
    );

    // Send the request
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Content-Length': body.length.toString(),
        'TTL': '86400',
        'Urgency': 'normal',
        'Authorization': authHeader,
      },
      body: body,
    });

    if (response.ok || response.status === 201) {
      return { success: true, statusCode: response.status };
    } else {
      const errorText = await response.text().catch(() => 'No error body');
      return { success: false, statusCode: response.status, error: errorText };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:contact@agenda35.fr";

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("VAPID keys not configured");
      return new Response(
        JSON.stringify({
          error: "VAPID keys not configured",
          help: "Generate VAPID keys at https://vapidkeys.com/ and set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your Edge Function secrets."
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { title, eventTitle, eventId } = body;

    // Create admin client
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get all push subscriptions
    const { data: subscriptions, error: subError } = await adminClient
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth");

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions found");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscribers" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Sending notifications to ${subscriptions.length} subscribers`);

    // Prepare notification payload
    const payload: NotificationPayload = {
      title: title || "Nouvel événement",
      body: eventTitle || "Un nouvel événement a été ajouté !",
      url: eventId ? `/event/${eventId}` : "/home",
      eventId,
      tag: `event-${eventId || 'new'}`,
    };

    // Send notifications to all subscribers
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        sendPushNotification(sub, payload, vapidPublicKey, vapidPrivateKey, vapidSubject)
      )
    );

    // Count successes and failures
    let sent = 0;
    let failed = 0;
    const failedEndpoints: string[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.success) {
        sent++;
      } else {
        failed++;
        failedEndpoints.push(subscriptions[index].endpoint);
        const errorMsg = result.status === "rejected"
          ? result.reason
          : `${result.value.statusCode}: ${result.value.error}`;
        errors.push(errorMsg);
        console.error(`Failed to send to endpoint:`, errorMsg);
      }
    });

    // Remove failed subscriptions that returned 404 or 410 (expired/unsubscribed)
    const expiredEndpoints = failedEndpoints.filter((_, idx) => {
      const result = results[idx];
      if (result.status === "fulfilled" && !result.value.success) {
        const statusCode = result.value.statusCode;
        return statusCode === 404 || statusCode === 410;
      }
      return false;
    });

    if (expiredEndpoints.length > 0) {
      const { error: deleteError } = await adminClient
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);

      if (deleteError) {
        console.error("Error cleaning up expired subscriptions:", deleteError);
      } else {
        console.log(`Cleaned up ${expiredEndpoints.length} expired subscriptions`);
      }
    }

    console.log(`Notifications sent: ${sent}, failed: ${failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        failed,
        expiredRemoved: expiredEndpoints.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined // Only show first 5 errors
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
