-- =====================================================
-- SCRIPT D'IMPORT DES DONNÉES DE LOVABLE
-- Exécutez ce script dans le SQL Editor de Supabase:
-- https://supabase.com/dashboard/project/pfvfssqlcfodwbsbiciu/sql/new
-- =====================================================

-- 1. Supprimer les données existantes (optionnel - à décommenter si nécessaire)
-- DELETE FROM events;
-- DELETE FROM profiles;

-- 2. Désactiver temporairement les contraintes de clé étrangère
ALTER TABLE events DISABLE TRIGGER ALL;
ALTER TABLE profiles DISABLE TRIGGER ALL;

-- 3. Insérer les profils
INSERT INTO profiles (id, pseudo, avatar_url, created_at, updated_at) VALUES
('c339acf8-510a-477d-9fac-64d2ca24479d', 'El-Siloux35-2026', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/avatars/c339acf8-510a-477d-9fac-64d2ca24479d/1767740074840.jpeg', '2026-01-04T00:47:06.460681+00:00', '2026-01-07T20:51:29.635343+00:00'),
('d96f2c2d-05c8-4a8f-ac56-201276b30458', 'Meghy', NULL, '2026-01-17T11:45:06.915498+00:00', '2026-01-17T11:45:06.915498+00:00'),
('abe3e3ce-897d-4a85-9496-1316f0521ea1', 'Robin', NULL, '2026-01-18T16:37:23.2318+00:00', '2026-01-18T16:37:23.2318+00:00')
ON CONFLICT (id) DO UPDATE SET
  pseudo = EXCLUDED.pseudo,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = EXCLUDED.updated_at;

-- 4. Insérer les événements
INSERT INTO events (id, user_id, title, description, date, location, image_url, created_at, updated_at, organizer, venue, price, contact, style, is_draft) VALUES
('ef0ded50-0844-4779-9c6c-5c83d8f23665', 'c339acf8-510a-477d-9fac-64d2ca24479d', 'BELLUM / MUFFA au plan B', 'CE SOIR !
20h // Prix libre

BELLUM (punk/post-punk, Getaria, Pays Basque)
https://mendekudiskak.bandcamp.com/album/092-bellum-gure-gerra-12

MUFFA (punk hardcore, Padova, Italie)
https://muffapd.bandcamp.com/album/liquido-livido-livido-eterno

Plan B, 33 rue Saint-Melaine, 35000 Rennes', '2026-01-07', 'Plan B', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767491834425.JPG', '2026-01-04T01:57:15.015265+00:00', '2026-01-07T20:52:28.169962+00:00', 'PAPIERS NOIRS présente :', 'bars', 'Prix libre', NULL, 'concert', false),
('3511bae3-7011-41f2-9a01-48a4f9a6cc9d', 'c339acf8-510a-477d-9fac-64d2ca24479d', 'Zitounz / Lila666', 'Vous ne savez pas quoi faire en Noël et le Nouvel An,
Le Fan Club revient pour un dernier tour de piste avant 2026 🏁


⛽ @zitounarap

ZITOUNA
rap new wave (live)
Saint Étienne

🔧 @lula_sixsixsix

LULA666
ritmos caribeños (dj set ++)
Rennes Sud

Rdv dès 20h30 au Bistro de la cité

Prix Libre', '2026-01-11', 'Bistro de la cité', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767496376333.jpeg', '2026-01-04T03:12:56.871717+00:00', '2026-01-09T14:00:32.98358+00:00', 'Le fan club', 'bars', 'Liiiibre', '0643549647', 'concert,projection', false),
('86393f50-6f5e-4a78-80f4-8817eda8c2ca', 'c339acf8-510a-477d-9fac-64d2ca24479d', '📽 PROJECTION & DISCUSSIONS 🍻', 'https://www.instagram.com/p/DSK7GKLirpK/

➡️ Ce mercredi soir à 20h, rendez-vous au 10 rue des Trente (proximité La Mabilais/Colombier) pour la projection d''un documentaire sur les révoltes au Chili en 2019.', '2026-01-11', 'Les Ombres', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767492862697.jpeg', '2026-01-04T02:14:23.439545+00:00', '2026-01-10T13:29:33.030428+00:00', 'Inter rébellion', 'ombres-electriques', '5 balles', NULL, 'concert,exposition,projection', false),
('cad1377a-200e-4c82-aa30-1b3f3d2259a6', 'c339acf8-510a-477d-9fac-64d2ca24479d', 'Concert de la mort', 'Jdjjfjfnnf''f
Uufydufufjfknfhuzbdodbeb Dudu je dis-je dysne dudjbddud. Svjahegzvbesjxkd shdubdjdjfj.', '2026-01-22', 'Maison', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767539053702.jpg', '2026-01-04T01:30:56.850169+00:00', '2026-01-17T11:05:41.413735+00:00', 'Coucou', 'autres', 'Libre', '0643549647', NULL, false),
('aa3f91cd-abac-4641-abdb-dab10c0baeba', 'c339acf8-510a-477d-9fac-64d2ca24479d', 'PROFONDEURS', 'Performance musicale en solo pour un public allongé ou assis.', '2026-01-06', 'Tnb', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767496814052.jpg', '2026-01-04T03:20:14.646535+00:00', '2026-01-06T22:56:17.129759+00:00', 'Det wood', 'ombres-electriques', '5 balles', NULL, 'projection', false),
('0985ce02-ca23-4008-b3c9-9c90783fd9b7', 'c339acf8-510a-477d-9fac-64d2ca24479d', 'Hildegarde ** Vabaira ** Almond Butyl', 'Vendredi 30 janvier aux ADV
par La Sophiste 18h-01h
Gaufres sacrées d''ingrédients banales et spéciaux
Début des concerts 19h30', '2026-01-30', 'Adv', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1768040868184.jpg', '2026-01-10T10:27:49.17917+00:00', '2026-01-10T10:27:49.17917+00:00', 'Adv', NULL, '8 balles', NULL, 'concert', false),
('cc7aa2e6-1856-4c4d-ace1-39432f5af78c', 'c339acf8-510a-477d-9fac-64d2ca24479d', 'Amanda Yung // Cannablich //Hilldegade B2B Vabaira', 'Jeudi 22 Janvier au Melody Maker', '2026-01-24', 'Mélody Maker', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767967914076.jpg', '2026-01-09T14:11:54.6846+00:00', '2026-01-17T08:44:55.401297+00:00', 'Release party', 'bars', 'Prix pallier 3 /5 / 10 €', NULL, 'concert', false),
('e5286a9a-05a3-43d7-be21-9c72949e8319', 'c339acf8-510a-477d-9fac-64d2ca24479d', '🎲 Anita // Crash and learn / 6e.mE 🎲', 'Au BabaZula (métro gros chêne) à 21h :
2 projets qui arrivent de Toulouse pour une courte virée dans le grand ouest + 1 jeunes liveur de Rennes, à prix libre, le tout monté sur gros caissons.
À la semaine pro !', '2026-01-14', 'BabaZula', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767967768192.jpg', '2026-01-09T14:09:28.772981+00:00', '2026-01-09T14:09:28.772981+00:00', 'SHK Sound system', 'bars', 'Prix libre', NULL, 'concert', false),
('8773a2e2-f8db-4c80-acf4-f80bca8e811d', 'c339acf8-510a-477d-9fac-64d2ca24479d', 'Test', 'Test', '2026-01-29', 'Test', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1769202845137.jpg', '2026-01-23T21:14:05.941428+00:00', '2026-01-23T21:14:05.941428+00:00', 'Test', 'bars', 'Test', NULL, 'concert', false),
('4f1a6d65-0e68-44d8-a240-96d7aa82c028', 'c339acf8-510a-477d-9fac-64d2ca24479d', 'Géométrie variable / Donimo / DJ Aube', 'Demain jeudi 8 janvier,
Capital Taboulé et l''Alaph vous invite à leur 2ème aprèm concerts au BAM.', '2026-01-27', 'BAM', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767967552272.jpg', '2026-01-09T14:05:52.999934+00:00', '2026-01-17T08:45:05.02118+00:00', 'L''Alaph', 'autres', '5 euros', '0643549647', 'concert', false),
('b1197717-f9b2-49a2-a0d9-1256c48aca1b', 'd96f2c2d-05c8-4a8f-ac56-201276b30458', 'Jul Président', 'Révolution Danse Révolution Danse', '2026-01-22', 'St Anne', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/d96f2c2d-05c8-4a8f-ac56-201276b30458/1768650753575.jpg', '2026-01-17T11:52:34.764404+00:00', '2026-01-17T11:52:34.764404+00:00', 'Le fun', NULL, 'Gratuit', NULL, 'autres', false),
('8be338fe-620f-40c0-b8d8-d6d9d9f17b8a', 'c339acf8-510a-477d-9fac-64d2ca24479d', 'Test notif', 'Test notif', '2026-01-22', 'Test notif', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1769183634320.jpg', '2026-01-23T15:53:55.120053+00:00', '2026-01-23T15:53:55.120053+00:00', 'Test notif', 'bars', '1', NULL, 'concert', false),
('cf67c7e8-83a6-4044-b95f-2ff0aec4bfca', 'c339acf8-510a-477d-9fac-64d2ca24479d', 'Test notif', 'Test notif', '2026-01-29', 'Test notif', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1769183927963.jpg', '2026-01-23T15:58:48.51183+00:00', '2026-01-23T15:58:48.51183+00:00', 'Test notif', 'bars', 'Test notif', NULL, 'concert', false),
('a05f8799-2e8f-4e3b-8089-11fed9ac463f', 'c339acf8-510a-477d-9fac-64d2ca24479d', 'Test', 'Bbfbfbf', '2026-01-08', 'N''imp', 'https://pfghllfusjlodgxumbir.supabase.co/storage/v1/object/public/event-images/events/c339acf8-510a-477d-9fac-64d2ca24479d/1767818970586.jpg', '2026-01-07T20:49:31.247974+00:00', '2026-01-07T20:52:35.717603+00:00', 'Maison', 'bars', '1', NULL, 'concert', false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  date = EXCLUDED.date,
  location = EXCLUDED.location,
  image_url = EXCLUDED.image_url,
  updated_at = EXCLUDED.updated_at,
  organizer = EXCLUDED.organizer,
  venue = EXCLUDED.venue,
  price = EXCLUDED.price,
  contact = EXCLUDED.contact,
  style = EXCLUDED.style,
  is_draft = EXCLUDED.is_draft;

-- 5. Réactiver les triggers
ALTER TABLE events ENABLE TRIGGER ALL;
ALTER TABLE profiles ENABLE TRIGGER ALL;

-- 6. Vérifier l'import
SELECT 'Events importés:' as info, COUNT(*) as count FROM events
UNION ALL
SELECT 'Profiles importés:', COUNT(*) FROM profiles;
