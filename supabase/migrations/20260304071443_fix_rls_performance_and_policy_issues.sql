/*
  # Fix RLS Performance and Policy Issues

  1. Replace auth.jwt() with (select auth.jwt()) in all admin policies for better query performance
  2. Drop duplicate permissive SELECT policies - merge public + admin into single policies per table
  3. Drop unused indexes on blog_posts, videos, and site_images

  Changes per table:
  - blog_posts: drop/recreate all admin policies with optimized auth calls, merge SELECT policies, drop unused index
  - videos: same treatment
  - site_images: same treatment
*/

-- ============================================================
-- BLOG POSTS - Drop old policies and recreate with (select auth.jwt())
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;

-- Single SELECT policy: public sees published posts; admins see all
CREATE POLICY "Select blog posts"
  ON blog_posts
  FOR SELECT
  USING (
    published = true
    OR (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can insert blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can update blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

DROP INDEX IF EXISTS idx_blog_posts_published;

-- ============================================================
-- VIDEOS - Drop old policies and recreate with (select auth.jwt())
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all videos" ON videos;
DROP POLICY IF EXISTS "Public can view active videos" ON videos;
DROP POLICY IF EXISTS "Admins can insert videos" ON videos;
DROP POLICY IF EXISTS "Admins can update videos" ON videos;
DROP POLICY IF EXISTS "Admins can delete videos" ON videos;

CREATE POLICY "Select videos"
  ON videos
  FOR SELECT
  USING (
    is_active = true
    OR (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can insert videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can update videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can delete videos"
  ON videos
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

DROP INDEX IF EXISTS idx_videos_section_name;
DROP INDEX IF EXISTS idx_videos_is_active;

-- ============================================================
-- SITE IMAGES - Drop old policies and recreate with (select auth.jwt())
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all site images" ON site_images;
DROP POLICY IF EXISTS "Public can view active site images" ON site_images;
DROP POLICY IF EXISTS "Admins can insert site images" ON site_images;
DROP POLICY IF EXISTS "Admins can update site images" ON site_images;
DROP POLICY IF EXISTS "Admins can delete site images" ON site_images;

CREATE POLICY "Select site images"
  ON site_images
  FOR SELECT
  USING (
    is_active = true
    OR (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can insert site images"
  ON site_images
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can update site images"
  ON site_images
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can delete site images"
  ON site_images
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

DROP INDEX IF EXISTS idx_site_images_section_is_active;
