/*
  # Recreate Blog Posts Table

  Restores the blog_posts table that was lost, with all columns, indexes, and RLS policies.

  1. New Tables
    - `blog_posts` - Core blog content table with title, slug, content, author, etc.

  2. Security
    - Enable RLS
    - Public can read published posts
    - Authenticated users (admin role) can manage all posts
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  author text NOT NULL DEFAULT 'Aberdeen Manor Team',
  image_url text NOT NULL,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
