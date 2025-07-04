/*
  # Add theme support to restaurants table

  1. Changes
    - Add `theme_id` column to restaurants table to store selected theme
    - Set default theme to 'modern-elegance'

  2. Security
    - No changes to RLS policies needed as this is just adding a column
*/

-- Add theme_id column to restaurants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'theme_id'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN theme_id text DEFAULT 'modern-elegance';
  END IF;
END $$;