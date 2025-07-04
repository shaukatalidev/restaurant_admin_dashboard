import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Restaurant {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cuisine_types: string[];
  contact_number: string;
  cost_for_two: number;
  rating: number;
  offer_text: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantLocation {
  id: string;
  restaurant_id: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  maps_embed_link: string;
  latitude: number | null;
  longitude: number | null;
}

export interface OpeningHours {
  id: string;
  restaurant_id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
}

export interface RestaurantFeatures {
  id: string;
  restaurant_id: string;
  home_delivery: boolean;
  indoor_seating: boolean;
  air_conditioned: boolean;
  accepts_cards: boolean;
  family_friendly: boolean;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  display_order: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_special: boolean;
}

export interface GalleryImage {
  id: string;
  restaurant_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
}

export interface Offer {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  badge_text: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}