
/*
  # Fix Image Upload Permissions

  ## Problem
  The images storage bucket and site_images table were configured to require authentication
  for uploads, but the admin interface has no login system. This prevented anyone from
  uploading images through the admin page.

  ## Changes

  ### Storage Policies (storage.objects)
  - Removed: "Authenticated users can upload images" (INSERT, authenticated role)
  - Added: "Anyone can upload images" (INSERT, public role) — matches videos bucket pattern
  - Removed: "Authenticated users can delete images" (DELETE, authenticated role)
  - Added: "Anyone can delete images" (DELETE, public role) — matches videos bucket pattern
  - Added: "Anyone can update images" (UPDATE, public role) — matches videos bucket pattern

  ### site_images Table Policies
  - Added: Public INSERT policy so anonymous users can save image metadata after uploading
  - Added: Public UPDATE policy so anonymous users can update image records
  - Added: Public DELETE policy so anonymous users can delete image records

  ## Notes
  - This matches the existing pattern used by the videos bucket and videos table
  - The images bucket is already public for SELECT (read access), this just opens write access
*/

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

CREATE POLICY "Anyone can upload images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Anyone can delete images"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'images');

CREATE POLICY "Anyone can update images"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'images')
  WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated users can insert site_images" ON site_images;
DROP POLICY IF EXISTS "Authenticated users can update site_images" ON site_images;
DROP POLICY IF EXISTS "Authenticated users can delete site_images" ON site_images;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Anyone can insert site_images'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can insert site_images" ON site_images FOR INSERT TO public WITH CHECK (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Anyone can update site_images'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can update site_images" ON site_images FOR UPDATE TO public USING (true) WITH CHECK (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Anyone can delete site_images'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can delete site_images" ON site_images FOR DELETE TO public USING (true)';
  END IF;
END $$;
