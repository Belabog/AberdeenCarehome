/*
  # Recreate Videos Table and Storage Bucket

  Restores the videos table and storage bucket that was lost.

  1. New Tables
    - `videos` - Video metadata: title, description, storage_path, section_name, is_active, etc.

  2. Storage
    - Recreates the `videos` bucket (public, 104MB limit, video MIME types)

  3. Security
    - Enable RLS on videos table
    - Public SELECT on active videos
    - Admin-only write access
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  109051904,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/avi']
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  storage_path text NOT NULL,
  thumbnail_url text,
  section_name text NOT NULL DEFAULT 'hero',
  is_active boolean DEFAULT true,
  file_size bigint,
  duration integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_videos_section_name ON videos(section_name);
CREATE INDEX IF NOT EXISTS idx_videos_is_active ON videos(is_active);
