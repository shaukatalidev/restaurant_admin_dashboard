import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, GalleryImage } from '../lib/supabase';
import { useRestaurant } from './useRestaurant';

export const useGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { restaurant } = useRestaurant();

  useEffect(() => {
    if (restaurant) {
      fetchImages();
    }
  }, [restaurant]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .order('display_order');

      if (error) throw error;
      setImages(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addImages = async (image_url: string[], alt_text: string) => {
    try {
      // Map each newImage to include restaurant_id and display_order
      const imagesToInsert = image_url.map((img, index) => ({
        restaurant_id: restaurant!.id,
        image_url: img,
        alt_text: alt_text,
        display_order: images.length + index,
      }));

      const { data, error } = await supabase
        .from('gallery_images')
        .insert(imagesToInsert)
        .select();

      if (error) throw error;
      setImages(prev => [...prev, ...data]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };


  const updateImage = async (id: string, updates: Partial<GalleryImage>) => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setImages(prev => prev.map(i => i.id === id ? data : i));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setImages(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    images,
    loading,
    error,
    fetchImages,
    addImages,
    updateImage,
    deleteImage
  };
};