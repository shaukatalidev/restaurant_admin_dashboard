import { useState } from 'react';
import { ImageUploadService } from '../lib/imageUpload';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, folder: 'menu' | 'gallery' | 'offers') => {
    setUploading(true);
    setError(null);

    try {
      // Compress image if needed
      const compressedFile = await ImageUploadService.compressImage(file);
      
      // Upload to Supabase
      const result = await ImageUploadService.uploadFile(compressedFile, folder);
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const validateUrl = async (url: string) => {
    setError(null);

    try {
      if (!ImageUploadService.validateUrl(url)) {
        throw new Error('Invalid URL format');
      }

      const isValidImage = await ImageUploadService.validateImageUrl(url);
      if (!isValidImage) {
        throw new Error('URL does not point to a valid image');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const deleteImage = async (imageUrl: string) => {
    const filePath = ImageUploadService.extractFilePathFromUrl(imageUrl);
    if (filePath) {
      await ImageUploadService.deleteFile(filePath);
    }
  };

  return {
    uploading,
    error,
    uploadImage,
    validateUrl,
    deleteImage,
    clearError: () => setError(null)
  };
};