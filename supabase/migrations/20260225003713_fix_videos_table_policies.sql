/*
  # Fix Videos Table Policies

  1. Changes
    - Update policies to allow public users to manage videos
    - This allows the video admin to work without authentication
    - In production, you may want to restrict this to authenticated users only

  2. Security Notes
    - Public access is enabled for demonstration purposes
    - Consider adding authentication before production deployment
*/

DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view active videos" ON videos;
  DROP POLICY IF EXISTS "Authenticated users can view all videos" ON videos;
  DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;
  DROP POLICY IF EXISTS "Authenticated users can update videos" ON videos;
  DROP POLICY IF EXISTS "Authenticated users can delete videos" ON videos;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Anyone can view videos"
  ON videos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert videos"
  ON videos FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update videos"
  ON videos FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete videos"
  ON videos FOR DELETE
  TO public
  USING (true);