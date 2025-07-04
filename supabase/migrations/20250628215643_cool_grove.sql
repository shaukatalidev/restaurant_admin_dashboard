/*
  # Storage Configuration for Restaurant Images

  1. Storage Configuration
    - Updates the storage_config table with bucket information
    - This table tracks our storage bucket settings

  Note: The actual storage bucket and policies need to be created through the Supabase dashboard:
  1. Go to Storage in your Supabase dashboard
  2. Create a new bucket named 'restaurant-images'
  3. Set it as public
  4. Configure the following policies:
     - Allow authenticated users to upload to menu/, gallery/, offers/ folders
     - Allow public read access
     - Allow authenticated users to update/delete their own files
*/

-- Update storage_config table with bucket information
INSERT INTO storage_config (
  bucket_name,
  is_public,
  file_size_limit,
  allowed_mime_types
) VALUES (
  'restaurant-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (bucket_name) DO UPDATE SET
  is_public = EXCLUDED.is_public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;