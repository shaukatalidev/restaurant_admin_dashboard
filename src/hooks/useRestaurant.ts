import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Restaurant } from '../lib/supabase';

export const useRestaurant = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRestaurant();
    }
  }, [user]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setRestaurant(data);
      } else {
        // Create default restaurant if none exists
        const { data: newRestaurant, error: createError } = await supabase
          .from('restaurants')
          .insert([{
            user_id: user!.id,
            name: 'My Restaurant',
            description: '',
            cuisine_types: [],
            contact_number: '',
            cost_for_two: 0,
            rating: 0,
            offer_text: ''
          }])
          .select()
          .single();

        if (createError) throw createError;
        setRestaurant(newRestaurant);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (updates: Partial<Restaurant>) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurant!.id)
        .select()
        .single();

      if (error) throw error;
      setRestaurant(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    restaurant,
    loading,
    error,
    fetchRestaurant,
    updateRestaurant
  };
};