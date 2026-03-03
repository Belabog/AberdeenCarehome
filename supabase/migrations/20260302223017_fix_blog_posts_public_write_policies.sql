/*
  # Fix blog_posts RLS policies to allow public writes

  ## Problem
  The blog_posts table only allows `authenticated` users to INSERT, UPDATE, and DELETE.
  The admin panel uses the anonymous Supabase client (no login system), so all save
  attempts are blocked by the database - silently failing.

  ## Changes
  1. Drop the three authenticated-only write policies
  2. Add replacement policies granting INSERT, UPDATE, DELETE to the `public` role

  ## Tables Modified
  - `blog_posts`
    - Removed: "Authenticated users can insert blog posts" (INSERT, authenticated)
    - Removed: "Authenticated users can update blog posts" (UPDATE, authenticated)
    - Removed: "Authenticated users can delete blog posts" (DELETE, authenticated)
    - Added: "Anyone can insert blog posts" (INSERT, public)
    - Added: "Anyone can update blog posts" (UPDATE, public)
    - Added: "Anyone can delete blog posts" (DELETE, public)

  ## Notes
  This matches the pattern already applied to the images and videos storage buckets.
*/

DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete blog posts" ON blog_posts;

CREATE POLICY "Anyone can insert blog posts"
  ON blog_posts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update blog posts"
  ON blog_posts
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO public
  USING (true);
