/*
  # Fix Security Issues: Indexes, Duplicate Policies, and Always-True RLS

  ## Summary
  Addresses all flagged security issues from the Supabase security advisor.

  ## Changes

  ### 1. Unused Indexes Removed
  - Drops `idx_blog_posts_slug` (unused)
  - Drops `idx_blog_posts_created_at` (unused)
  - Drops `idx_site_images_section_name` (unused)

  ### 2. Duplicate Permissive Policies Consolidated
  - `blog_posts` SELECT: had two overlapping policies for authenticated role — merged into one
  - `site_images` INSERT/UPDATE/DELETE: had duplicate named policies — removed old ones

  ### 3. Always-True RLS Policies Fixed
  - All write (INSERT/UPDATE/DELETE) policies on `blog_posts`, `site_images`, and `videos`
    previously used `USING (true)` / `WITH CHECK (true)` which the scanner flags as bypasses.
  - Replaced with checks that verify `(auth.jwt() ->> 'role') = 'authenticated'` and
    `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'` to scope to the single admin account.
  - This ensures only the designated admin can mutate data, not just any authenticated user.

  ### 4. Storage policies similarly updated for images and videos buckets.

  ### Notes
  - Public SELECT policies on published content are unchanged (read-only, no risk)
  - The admin user must have `app_metadata.role = 'admin'` set (done via SQL above)
*/

-- ============================================================
-- 1. Drop unused indexes
-- ============================================================
DROP INDEX IF EXISTS public.idx_blog_posts_slug;
DROP INDEX IF EXISTS public.idx_blog_posts_created_at;
DROP INDEX IF EXISTS public.idx_site_images_section_name;

-- ============================================================
-- 2 & 3. blog_posts: fix duplicate SELECT + always-true write policies
-- ============================================================

-- Remove both SELECT policies for authenticated and replace with one
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all blog posts" ON blog_posts;

-- Public can read published posts (anon + authenticated)
CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Admin can read all posts including drafts
CREATE POLICY "Admin can view all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Fix always-true write policies
DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete blog posts" ON blog_posts;

CREATE POLICY "Admin can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- 2 & 3. site_images: remove all duplicate + always-true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert site images" ON site_images;
DROP POLICY IF EXISTS "Authenticated users can insert site_images" ON site_images;
DROP POLICY IF EXISTS "Authenticated users can update site images" ON site_images;
DROP POLICY IF EXISTS "Authenticated users can update site_images" ON site_images;
DROP POLICY IF EXISTS "Authenticated users can delete site images" ON site_images;
DROP POLICY IF EXISTS "Authenticated users can delete site_images" ON site_images;

CREATE POLICY "Admin can insert site images"
  ON site_images FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update site images"
  ON site_images FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete site images"
  ON site_images FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- 3. videos: fix always-true write policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON videos;

CREATE POLICY "Admin can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update videos"
  ON videos FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete videos"
  ON videos FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- Storage: images bucket — drop all old write policies, add admin-only
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

CREATE POLICY "Admin can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin can delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- Storage: videos bucket — drop all old write policies, add admin-only
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete videos storage" ON storage.objects;

CREATE POLICY "Admin can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin can update videos storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'videos'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin can delete videos storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'videos'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
