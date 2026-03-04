/*
  # Recreate Site Images Table and Storage Bucket

  Restores the site_images table and images storage bucket.

  1. New Tables
    - `site_images` - Image metadata: title, alt_text, storage_path, section_name, is_active, etc.

  2. Storage
    - Recreates the `images` bucket (public, 20MB limit, image MIME types)

  3. Security
    - Enable RLS on site_images table
    - Public SELECT on active images
    - Admin-only write access
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  alt_text text,
  storage_path text NOT NULL,
  section_name text NOT NULL,
  is_active boolean DEFAULT true,
  file_size bigint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_site_images_section_is_active ON site_images(section_name, is_active);
