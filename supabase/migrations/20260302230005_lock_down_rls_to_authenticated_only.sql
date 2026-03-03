/*
  # Lock Down RLS Policies to Authenticated Users Only

  ## Summary
  Previously, write operations on blog_posts, videos, site_images, and their
  storage buckets were open to the public (unauthenticated). Now that an admin
  login system is in place, all write operations are restricted to authenticated
  users only.

  ## Changes

  ### blog_posts table
  - Drops permissive public INSERT/UPDATE/DELETE policies
  - Adds authenticated-only INSERT, UPDATE, DELETE policies
  - Public SELECT on published posts is retained
  - Authenticated SELECT on all posts is retained

  ### videos table
  - Drops permissive public INSERT/UPDATE/DELETE policies
  - Adds authenticated-only INSERT, UPDATE, DELETE policies
  - Public SELECT on active videos is retained

  ### site_images table
  - Drops permissive public INSERT/UPDATE/DELETE policies
  - Adds authenticated-only INSERT, UPDATE, DELETE policies
  - Public SELECT on all images is retained

  ### Storage: images bucket
  - Drops public INSERT/UPDATE/DELETE policies
  - Adds authenticated-only INSERT, UPDATE, DELETE policies
  - Public SELECT (download) is retained

  ### Storage: videos bucket
  - Drops public INSERT/UPDATE/DELETE policies
  - Adds authenticated-only INSERT, UPDATE, DELETE policies
  - Public SELECT (download) is retained
*/

-- ============================================================
-- blog_posts
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can delete blog posts" ON blog_posts;

CREATE POLICY "Authenticated users can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- videos
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert videos" ON videos;
DROP POLICY IF EXISTS "Anyone can update videos" ON videos;
DROP POLICY IF EXISTS "Anyone can delete videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON videos;

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

-- ============================================================
-- site_images
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert site_images" ON site_images;
DROP POLICY IF EXISTS "Anyone can update site_images" ON site_images;
DROP POLICY IF EXISTS "Anyone can delete site_images" ON site_images;

CREATE POLICY "Authenticated users can insert site_images"
  ON site_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site_images"
  ON site_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site_images"
  ON site_images FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- Storage: images bucket
-- ============================================================
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can update images" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete images" ON storage.objects;

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Authenticated users can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images');

-- ============================================================
-- Storage: videos bucket
-- ============================================================
DROP POLICY IF EXISTS "Anyone can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete videos storage" ON storage.objects;

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Authenticated users can update videos storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can delete videos storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'videos');
