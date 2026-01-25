// Generate VAPID keys for Web Push notifications
// Run with: npx ts-node scripts/generate-vapid-keys.ts

async function generateVapidKeys() {
  // Generate ECDSA key pair on P-256 curve
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  // Export public key in raw format (uncompressed point: 0x04 || x || y)
  const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const publicKeyBytes = new Uint8Array(publicKeyBuffer);

  // Export private key in JWK format to get the 'd' parameter
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

  // The 'd' parameter is already base64url encoded in JWK
  const privateKeyBase64url = privateKeyJwk.d!;

  // Convert public key to base64url
  const publicKeyBase64url = base64UrlEncode(publicKeyBytes);

  console.log('\n🔑 VAPID Keys Generated\n');
  console.log('═'.repeat(80));
  console.log('\n📱 For your .env and Vercel (frontend):\n');
  console.log(`VITE_VAPID_PUBLIC_KEY="${publicKeyBase64url}"`);
  console.log('\n🔒 For Supabase Edge Function secrets (backend):\n');
  console.log(`VAPID_PUBLIC_KEY: ${publicKeyBase64url}`);
  console.log(`VAPID_PRIVATE_KEY: ${privateKeyBase64url}`);
  console.log('\n═'.repeat(80));
  console.log('\n📝 Commands to set Supabase secrets:\n');
  console.log(`npx supabase secrets set VAPID_PUBLIC_KEY="${publicKeyBase64url}" VAPID_PRIVATE_KEY="${privateKeyBase64url}"`);
  console.log('\n⚠️  IMPORTANT: After updating keys, you must:');
  console.log('1. Update VITE_VAPID_PUBLIC_KEY in Vercel environment variables');
  console.log('2. Clear the push_subscriptions table (subscriptions are tied to the old key)');
  console.log('3. Re-deploy your app');
  console.log('4. Users must re-enable notifications\n');
}

function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

generateVapidKeys().catch(console.error);
