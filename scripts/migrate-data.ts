import { createClient } from '@supabase/supabase-js';

// Source: Lovable project (pfghllfusjlodgxumbir)
const SOURCE_URL = "https://pfghllfusjlodgxumbir.supabase.co";
const SOURCE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZ2hsbGZ1c2psb2RneHVtYmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NzcyOTksImV4cCI6MjA4MzA1MzI5OX0.I4CwGHM8ebS3qmlzOoCE1ZhQQlMlrmkMrzNt_4voqpU";

// Destination: Your project (pfvfssqlcfodwbsbiciu)
const DEST_URL = "https://pfvfssqlcfodwbsbiciu.supabase.co";
const DEST_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdmZzc3FsY2ZvZHdic2JpY2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTYwNTAsImV4cCI6MjA4MzM5MjA1MH0.Rw5DhXkWahsr-7_kP8lIWJQSmIxAyQzPYBb1iBQE9zo";

const sourceClient = createClient(SOURCE_URL, SOURCE_KEY);
const destClient = createClient(DEST_URL, DEST_KEY);

async function migrateData() {
  console.log('🚀 Starting migration from Lovable to your project...\n');

  // 1. Fetch events from source
  console.log('📦 Fetching events from Lovable...');
  const { data: events, error: eventsError } = await sourceClient
    .from('events')
    .select('*');

  if (eventsError) {
    console.error('❌ Error fetching events:', eventsError.message);
  } else {
    console.log(`✅ Found ${events?.length || 0} events`);
    if (events && events.length > 0) {
      console.log('Events:', JSON.stringify(events, null, 2));
    }
  }

  // 2. Fetch profiles from source
  console.log('\n📦 Fetching profiles from Lovable...');
  const { data: profiles, error: profilesError } = await sourceClient
    .from('profiles')
    .select('*');

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError.message);
  } else {
    console.log(`✅ Found ${profiles?.length || 0} profiles`);
    if (profiles && profiles.length > 0) {
      console.log('Profiles:', JSON.stringify(profiles, null, 2));
    }
  }

  // 3. Fetch user_roles from source
  console.log('\n📦 Fetching user_roles from Lovable...');
  const { data: userRoles, error: rolesError } = await sourceClient
    .from('user_roles')
    .select('*');

  if (rolesError) {
    console.error('❌ Error fetching user_roles:', rolesError.message);
  } else {
    console.log(`✅ Found ${userRoles?.length || 0} user_roles`);
    if (userRoles && userRoles.length > 0) {
      console.log('User roles:', JSON.stringify(userRoles, null, 2));
    }
  }

  console.log('\n📊 Summary:');
  console.log(`- Events: ${events?.length || 0}`);
  console.log(`- Profiles: ${profiles?.length || 0}`);
  console.log(`- User roles: ${userRoles?.length || 0}`);

  // Save data to JSON files for manual review/import
  const fs = await import('fs');

  if (events && events.length > 0) {
    fs.writeFileSync('migration-events.json', JSON.stringify(events, null, 2));
    console.log('\n💾 Events saved to migration-events.json');
  }

  if (profiles && profiles.length > 0) {
    fs.writeFileSync('migration-profiles.json', JSON.stringify(profiles, null, 2));
    console.log('💾 Profiles saved to migration-profiles.json');
  }

  if (userRoles && userRoles.length > 0) {
    fs.writeFileSync('migration-user-roles.json', JSON.stringify(userRoles, null, 2));
    console.log('💾 User roles saved to migration-user-roles.json');
  }

  console.log('\n✨ Data export complete!');
  console.log('Next step: Import this data into your Supabase project via the dashboard or SQL.');
}

migrateData().catch(console.error);
