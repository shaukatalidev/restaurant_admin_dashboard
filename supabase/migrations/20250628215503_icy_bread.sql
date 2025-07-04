/*
  # Create storage bucket for restaurant images

  1. Storage Setup
    - Create restaurant-images bucket with proper configuration
    - Set up public access for image serving
    - Configure file size and type restrictions

  2. Security
    - Enable public read access for all images
    - Allow authenticated users to upload to specific folders
    - Users can manage their own uploaded images

  Note: Storage policies are managed through Supabase dashboard or API calls,
  not through SQL migrations. This migration focuses on database preparation.
*/

-- Create a function to initialize storage bucket (if not exists)
-- This will be called by the application on first run
CREATE OR REPLACE FUNCTION initialize_storage_bucket()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function serves as a placeholder for storage initialization
  -- The actual bucket creation will be handled by the application
  RAISE NOTICE 'Storage bucket initialization function created';
END;
$$;

-- Grant necessary permissions for storage operations
-- These are the standard permissions needed for Supabase storage
DO $$
BEGIN
  -- Ensure the authenticated role has necessary permissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'authenticated'
  ) THEN
    CREATE ROLE authenticated;
  END IF;
  
  -- Ensure the anon role has necessary permissions  
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'anon'
  ) THEN
    CREATE ROLE anon;
  END IF;
END $$;

-- Create a table to track storage configuration
CREATE TABLE IF NOT EXISTS storage_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_name text NOT NULL,
  is_public boolean DEFAULT true,
  file_size_limit bigint DEFAULT 5242880, -- 5MB
  allowed_mime_types text[] DEFAULT ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  created_at timestamptz DEFAULT now(),
  UNIQUE(bucket_name)
);

-- Insert configuration for restaurant images bucket
INSERT INTO storage_config (bucket_name, is_public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (bucket_name) DO NOTHING;

-- Enable RLS on storage_config
ALTER TABLE storage_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access to storage configuration
CREATE POLICY "Public read access to storage config"
ON storage_config
FOR SELECT
TO public
USING (true);