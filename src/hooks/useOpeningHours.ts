import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, OpeningHours } from '../lib/supabase';
import { useRestaurant } from './useRestaurant';

export const useOpeningHours = () => {
  const [hours, setHours] = useState<OpeningHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { restaurant } = useRestaurant();

  useEffect(() => {
    if (restaurant) {
      fetchHours();
    }
  }, [restaurant]);

  const fetchHours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opening_hours')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .order('day_of_week');

      if (error) throw error;

      // Initialize with default hours for all days if none exist
      if (!data || data.length === 0) {
        const defaultHours = Array.from({ length: 7 }, (_, i) => ({
          restaurant_id: restaurant!.id,
          day_of_week: i,
          is_open: false,
          open_time: '09:00',
          close_time: '22:00'
        }));

        const { data: newHours, error: insertError } = await supabase
          .from('opening_hours')
          .insert(defaultHours)
          .select();

        if (insertError) throw insertError;
        setHours(newHours || []);
      } else {
        setHours(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateHours = async (dayOfWeek: number, updates: Partial<OpeningHours>) => {
    try {
      const existingHour = hours.find(h => h.day_of_week === dayOfWeek);
      
      if (existingHour) {
        // Ensure time values are properly formatted (HH:MM)
        const formattedUpdates = { ...updates };
        if (formattedUpdates.open_time) {
          formattedUpdates.open_time = formatTimeString(formattedUpdates.open_time);
        }
        if (formattedUpdates.close_time) {
          formattedUpdates.close_time = formatTimeString(formattedUpdates.close_time);
        }

        const { data, error } = await supabase
          .from('opening_hours')
          .update(formattedUpdates)
          .eq('id', existingHour.id)
          .select()
          .single();

        if (error) throw error;
        
        setHours(prev => prev.map(h => h.id === existingHour.id ? data : h));
        return data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Helper function to format time string to HH:MM format
  const formatTimeString = (timeStr: string): string => {
    if (!timeStr) return '09:00';
    
    // If it's already in HH:MM format, return as is
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }
    
    // If it's in HH:MM:SS format, extract HH:MM
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr.substring(0, 5);
    }
    
    // Default fallback
    return '09:00';
  };

  return {
    hours,
    loading,
    error,
    fetchHours,
    updateHours,
    formatTimeString
  };
};