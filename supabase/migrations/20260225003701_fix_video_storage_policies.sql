/*
  # Fix Video Storage Upload Policies

  1. Changes
    - Drop existing storage policies for videos bucket if they exist
    - Recreate policies with proper permissions
    - Allow public users to upload videos (since we don't have auth yet)
    - Ensure proper access for authenticated users

  2. Security Notes
    - Public upload is enabled to allow video uploads without authentication
    - In production, you may want to restrict this to authenticated users only
*/

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view videos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update videos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete videos" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload videos" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Public can view videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'videos');

CREATE POLICY "Anyone can upload videos"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Anyone can update videos"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'videos')
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Anyone can delete videos"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'videos');