/*
  # Restaurant Admin Dashboard Schema

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `description` (text)
      - `cuisine_types` (text array)
      - `contact_number` (text)
      - `cost_for_two` (integer)
      - `rating` (decimal)
      - `offer_text` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `restaurant_locations`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `street` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `maps_embed_link` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)

    - `opening_hours`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `day_of_week` (integer 0-6, 0=Sunday)
      - `is_open` (boolean)
      - `open_time` (time)
      - `close_time` (time)

    - `restaurant_features`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `home_delivery` (boolean)
      - `indoor_seating` (boolean)
      - `air_conditioned` (boolean)
      - `accepts_cards` (boolean)
      - `family_friendly` (boolean)

    - `menu_categories`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `name` (text)
      - `display_order` (integer)

    - `menu_items`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `image_url` (text)
      - `is_available` (boolean)
      - `is_special` (boolean)

    - `gallery_images`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `image_url` (text)
      - `alt_text` (text)
      - `display_order` (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own restaurant data
*/

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  cuisine_types text[] DEFAULT '{}',
  contact_number text DEFAULT '',
  cost_for_two integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0.0,
  offer_text text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create restaurant_locations table
CREATE TABLE IF NOT EXISTS restaurant_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  street text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  zip_code text DEFAULT '',
  maps_embed_link text DEFAULT '',
  latitude decimal(10,8),
  longitude decimal(11,8)
);

-- Create opening_hours table
CREATE TABLE IF NOT EXISTS opening_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_open boolean DEFAULT false,
  open_time time,
  close_time time
);

-- Create restaurant_features table
CREATE TABLE IF NOT EXISTS restaurant_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  home_delivery boolean DEFAULT false,
  indoor_seating boolean DEFAULT false,
  air_conditioned boolean DEFAULT false,
  accepts_cards boolean DEFAULT false,
  family_friendly boolean DEFAULT false
);

-- Create menu_categories table
CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order integer DEFAULT 0
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES menu_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL,
  image_url text DEFAULT '',
  is_available boolean DEFAULT true,
  is_special boolean DEFAULT false
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text DEFAULT '',
  display_order integer DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for restaurants
CREATE POLICY "Users can manage their own restaurant"
  ON restaurants
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for restaurant_locations
CREATE POLICY "Users can manage their restaurant location"
  ON restaurant_locations
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Create policies for opening_hours
CREATE POLICY "Users can manage their restaurant hours"
  ON opening_hours
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Create policies for restaurant_features
CREATE POLICY "Users can manage their restaurant features"
  ON restaurant_features
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Create policies for menu_categories
CREATE POLICY "Users can manage their menu categories"
  ON menu_categories
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Create policies for menu_items
CREATE POLICY "Users can manage their menu items"
  ON menu_items
  FOR ALL
  TO authenticated
  USING (
    category_id IN (
      SELECT id FROM menu_categories 
      WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE user_id = auth.uid()
      )
    )
  );

-- Create policies for gallery_images
CREATE POLICY "Users can manage their gallery images"
  ON gallery_images
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON restaurants(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_locations_restaurant_id ON restaurant_locations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_opening_hours_restaurant_id ON opening_hours(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_features_restaurant_id ON restaurant_features(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant_id ON menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_restaurant_id ON gallery_images(restaurant_id);