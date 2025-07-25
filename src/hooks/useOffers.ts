import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Offer } from '../lib/supabase';
import { useRestaurant } from './useRestaurant';

export const useOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { restaurant } = useRestaurant();

  useEffect(() => {
    if (restaurant) {
      fetchOffers();
    }
  }, [restaurant]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addOffer = async (offer: Omit<Offer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .insert([{
          ...offer,
          restaurant_id: restaurant!.id
        }])
        .select()
        .single();

      if (error) throw error;
      setOffers(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateOffer = async (id: string, updates: Partial<Offer>) => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setOffers(prev => prev.map(o => o.id === id ? data : o));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteOffer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setOffers(prev => prev.filter(o => o.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const toggleOfferStatus = async (id: string, isActive: boolean) => {
    try {
      await updateOffer(id, { is_active: isActive });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    offers,
    loading,
    error,
    fetchOffers,
    addOffer,
    updateOffer,
    deleteOffer,
    toggleOfferStatus
  };
};