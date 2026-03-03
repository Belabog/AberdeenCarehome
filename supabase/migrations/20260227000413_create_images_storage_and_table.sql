/*
  # Create Images Storage Bucket and Metadata Table

  ## Overview
  Sets up a Supabase Storage bucket for site images and a metadata table
  to track uploaded images with their assigned section names.

  ## New Storage Bucket
  - `images` bucket — public read access, accepts common image formats, 20 MB max per file

  ## New Tables
  - `site_images`
    - `id` (uuid, primary key)
    - `title` (text) — friendly name for the image
    - `alt_text` (text) — accessibility description
    - `storage_path` (text) — path inside the `images` bucket
    - `section_name` (text) — which part of the site uses this image (e.g., "home-card-1")
    - `is_active` (boolean) — whether this image is the active one for its section
    - `file_size` (bigint) — file size in bytes
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on `site_images`
  - Public SELECT so the site can read images without auth
  - INSERT/UPDATE/DELETE restricted to authenticated users only

  ## Notes
  - One active image per section_name is enforced at the application level
  - Public folder images remain as fallbacks during migration
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for images bucket"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Authenticated users can delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images');

CREATE TABLE IF NOT EXISTS site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  alt_text text NOT NULL DEFAULT '',
  storage_path text NOT NULL,
  section_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  file_size bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site images"
  ON site_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert site images"
  ON site_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site images"
  ON site_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site images"
  ON site_images FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_site_images_section_name ON site_images (section_name);
CREATE INDEX IF NOT EXISTS idx_site_images_is_active ON site_images (section_name, is_active);
