/*
  # Create Video Storage System

  1. New Tables
    - `videos`
      - `id` (uuid, primary key) - Unique identifier for each video
      - `title` (text) - Display name for the video
      - `description` (text, nullable) - Optional description
      - `storage_path` (text) - Path to video file in Supabase Storage
      - `thumbnail_url` (text, nullable) - URL to video thumbnail/poster image
      - `section_name` (text) - Which section this video is assigned to (hero, about, etc.)
      - `is_active` (boolean) - Whether this video is currently active for its section
      - `file_size` (bigint, nullable) - File size in bytes
      - `duration` (integer, nullable) - Video duration in seconds
      - `created_at` (timestamptz) - Upload timestamp
      - `updated_at` (timestamptz) - Last modified timestamp

  2. Storage
    - Create `videos` bucket for storing video files
    - Set public access for read operations
    - Configure file size limits and allowed MIME types

  3. Security
    - Enable RLS on `videos` table
    - Add policies for public read access
    - Add policies for authenticated admin users to insert/update/delete

  4. Indexes
    - Add index on `section_name` and `is_active` for fast queries
*/

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  storage_path text NOT NULL UNIQUE,
  thumbnail_url text,
  section_name text NOT NULL DEFAULT 'hero',
  is_active boolean DEFAULT false,
  file_size bigint,
  duration integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active videos"
  ON videos FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all videos"
  ON videos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete videos"
  ON videos FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_videos_section_active ON videos(section_name, is_active);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  104857600,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Authenticated users can update videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'videos')
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Authenticated users can delete videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'videos');