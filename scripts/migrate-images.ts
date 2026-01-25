import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const OLD_PROJECT = "pfghllfusjlodgxumbir";
const NEW_URL = "https://pfvfssqlcfodwbsbiciu.supabase.co";
const NEW_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdmZzc3FsY2ZvZHdic2JpY2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTYwNTAsImV4cCI6MjA4MzM5MjA1MH0.Rw5DhXkWahsr-7_kP8lIWJQSmIxAyQzPYBb1iBQE9zo";

const newClient = createClient(NEW_URL, NEW_KEY);

// Images to migrate (from the exported events)
const images = [
  { eventId: 'ef0ded50-0844-4779-9c6c-5c83d8f23665', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767491834425.JPG' },
  { eventId: '3511bae3-7011-41f2-9a01-48a4f9a6cc9d', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767496376333.jpeg' },
  { eventId: '86393f50-6f5e-4a78-80f4-8817eda8c2ca', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767492862697.jpeg' },
  { eventId: 'cad1377a-200e-4c82-aa30-1b3f3d2259a6', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767539053702.jpg' },
  { eventId: 'aa3f91cd-abac-4641-abdb-dab10c0baeba', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767496814052.jpg' },
  { eventId: '0985ce02-ca23-4008-b3c9-9c90783fd9b7', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1768040868184.jpg' },
  { eventId: 'cc7aa2e6-1856-4c4d-ace1-39432f5af78c', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767967914076.jpg' },
  { eventId: 'e5286a9a-05a3-43d7-be21-9c72949e8319', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767967768192.jpg' },
  { eventId: '8773a2e2-f8db-4c80-acf4-f80bca8e811d', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1769202845137.jpg' },
  { eventId: '4f1a6d65-0e68-44d8-a240-96d7aa82c028', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767967552272.jpg' },
  { eventId: 'b1197717-f9b2-49a2-a0d9-1256c48aca1b', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/d96f2c2d-05c8-4a8f-ac56-201276b30458/1768650753575.jpg' },
  { eventId: '8be338fe-620f-40c0-b8d8-d6d9d9f17b8a', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1769183634320.jpg' },
  { eventId: 'cf67c7e8-83a6-4044-b95f-2ff0aec4bfca', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1769183927963.jpg' },
  { eventId: 'a05f8799-2e8f-4e3b-8089-11fed9ac463f', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767818970586.jpg' },
  { eventId: '3aa830fa-03fb-43be-a45c-f1ed7ada4884', url: 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767740373335.jpg' },
];

async function migrateImages() {
  console.log('🖼️  Migration des images...\n');

  const sqlUpdates: string[] = [];

  for (const img of images) {
    try {
      console.log(`📥 Téléchargement: ${img.url.split('/').pop()}`);

      // Download image from old storage
      const response = await fetch(img.url);
      if (!response.ok) {
        console.log(`   ⚠️  Image non trouvée, skip`);
        continue;
      }

      const buffer = await response.arrayBuffer();
      const fileName = img.url.split('/').pop()!;
      const filePath = `events/migrated/${fileName}`;

      console.log(`📤 Upload vers nouveau storage...`);

      // Upload to new storage
      const { data, error } = await newClient.storage
        .from('event-images')
        .upload(filePath, buffer, {
          contentType: response.headers.get('content-type') || 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.log(`   ❌ Erreur upload: ${error.message}`);
        continue;
      }

      // Get public URL
      const { data: urlData } = newClient.storage
        .from('event-images')
        .getPublicUrl(filePath);

      const newUrl = urlData.publicUrl;
      console.log(`   ✅ Nouvelle URL: ${newUrl}`);

      // Prepare SQL update
      sqlUpdates.push(`UPDATE events SET image_url = '${newUrl}' WHERE id = '${img.eventId}';`);

    } catch (err) {
      console.log(`   ❌ Erreur: ${err}`);
    }
  }

  console.log('\n📝 SQL pour mettre à jour les URLs:\n');
  console.log(sqlUpdates.join('\n'));

  // Save SQL to file
  fs.writeFileSync('update-image-urls.sql', sqlUpdates.join('\n'));
  console.log('\n💾 SQL sauvegardé dans update-image-urls.sql');
}

migrateImages().catch(console.error);
