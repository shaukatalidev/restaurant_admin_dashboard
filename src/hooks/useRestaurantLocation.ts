import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, RestaurantLocation } from '../lib/supabase';
import { useRestaurant } from './useRestaurant';

export const useRestaurantLocation = () => {
  const [location, setLocation] = useState<RestaurantLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { restaurant } = useRestaurant();

  useEffect(() => {
    if (restaurant) {
      fetchLocation();
    }
  }, [restaurant]);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurant_locations')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setLocation(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (updates: Partial<RestaurantLocation>) => {
    try {
      if (location) {
        const { data, error } = await supabase
          .from('restaurant_locations')
          .update(updates)
          .eq('id', location.id)
          .select()
          .single();

        if (error) throw error;
        setLocation(data);
        return data;
      } else {
        const { data, error } = await supabase
          .from('restaurant_locations')
          .insert([{
            restaurant_id: restaurant!.id,
            ...updates
          }])
          .select()
          .single();

        if (error) throw error;
        setLocation(data);
        return data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    location,
    loading,
    error,
    fetchLocation,
    updateLocation
  };
};