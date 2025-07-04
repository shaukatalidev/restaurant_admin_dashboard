/*
  # Add public read access for restaurant data

  1. Security Changes
    - Add public read policies for all restaurant-related tables
    - Allow anonymous users to view restaurant information
    - Maintain existing authenticated user policies for write operations

  2. Tables affected
    - restaurants
    - restaurant_locations  
    - opening_hours
    - restaurant_features
    - menu_categories
    - menu_items
    - gallery_images
    - offers (only active ones)
*/

-- Add public read policy for restaurants
CREATE POLICY "Public can view restaurants"
  ON restaurants
  FOR SELECT
  TO public
  USING (true);

-- Add public read policy for restaurant_locations
CREATE POLICY "Public can view restaurant locations"
  ON restaurant_locations
  FOR SELECT
  TO public
  USING (true);

-- Add public read policy for opening_hours
CREATE POLICY "Public can view opening hours"
  ON opening_hours
  FOR SELECT
  TO public
  USING (true);

-- Add public read policy for restaurant_features
CREATE POLICY "Public can view restaurant features"
  ON restaurant_features
  FOR SELECT
  TO public
  USING (true);

-- Add public read policy for menu_categories
CREATE POLICY "Public can view menu categories"
  ON menu_categories
  FOR SELECT
  TO public
  USING (true);

-- Add public read policy for menu_items
CREATE POLICY "Public can view menu items"
  ON menu_items
  FOR SELECT
  TO public
  USING (true);

-- Add public read policy for gallery_images
CREATE POLICY "Public can view gallery images"
  ON gallery_images
  FOR SELECT
  TO public
  USING (true);

-- Add public read policy for offers (only active ones)
CREATE POLICY "Public can view active offers"
  ON offers
  FOR SELECT
  TO public
  USING (is_active = true);