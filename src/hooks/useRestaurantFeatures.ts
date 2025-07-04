import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, RestaurantFeatures } from '../lib/supabase';
import { useRestaurant } from './useRestaurant';

export const useRestaurantFeatures = () => {
  const [features, setFeatures] = useState<RestaurantFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { restaurant } = useRestaurant();

  useEffect(() => {
    if (restaurant) {
      fetchFeatures();
    }
  }, [restaurant]);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurant_features')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setFeatures(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFeatures = async (updates: Partial<RestaurantFeatures>) => {
    try {
      if (features) {
        const { data, error } = await supabase
          .from('restaurant_features')
          .update(updates)
          .eq('id', features.id)
          .select()
          .single();

        if (error) throw error;
        setFeatures(data);
        return data;
      } else {
        const { data, error } = await supabase
          .from('restaurant_features')
          .insert([{
            restaurant_id: restaurant!.id,
            ...updates
          }])
          .select()
          .single();

        if (error) throw error;
        setFeatures(data);
        return data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    features,
    loading,
    error,
    fetchFeatures,
    updateFeatures
  };
};