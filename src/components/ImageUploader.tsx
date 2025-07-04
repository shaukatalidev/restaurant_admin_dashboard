import React, { useState, useRef } from 'react';
import { Upload, Link, X, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';
import { ImageUploadService, SAMPLE_IMAGES } from '../lib/imageUpload';

interface ImageUploaderProps {
  onImageSelect: (url: string) => void;
  currentImage?: string;
  folder: 'menu' | 'gallery' | 'offers';
  className?: string;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  currentImage,
  folder,
  className = '',
  placeholder = 'Upload or enter image URL'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'samples'>('upload');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlValidating, setUrlValidating] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleImages = SAMPLE_IMAGES[folder] || SAMPLE_IMAGES.menu;

  const handleFileSelect = async (file: File) => {
    setError('');
    setUploading(true);

    try {
      // Compress image if it's large
      const compressedFile = await ImageUploadService.compressImage(file);
      
      // Upload to Supabase
      const result = await ImageUploadService.uploadFile(compressedFile, folder);
      
      onImageSelect(result.url);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setError('Please drop a valid image file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    setError('');
    setUrlValidating(true);

    try {
      // Validate URL format
      if (!ImageUploadService.validateUrl(urlInput)) {
        throw new Error('Please enter a valid URL');
      }

      // Validate if URL points to an image
      const isValidImage = await ImageUploadService.validateImageUrl(urlInput);
      if (!isValidImage) {
        throw new Error('URL does not point to a valid image');
      }

      onImageSelect(urlInput);
      setIsOpen(false);
      setUrlInput('');
    } catch (err: any) {
      setError(err.message || 'Invalid image URL');
    } finally {
      setUrlValidating(false);
    }
  };

  const handleSampleSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`relative group border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 ${className}`}
      >
        {currentImage ? (
          <div className="relative">
            <img
              src={currentImage}
              alt="Current"
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center">
              <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Change Image
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
            <p className="mt-2 text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-200">
              {placeholder}
            </p>
          </div>
        )}
      </button>

      {/* Upload Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Select Image</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'upload'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('url')}
                  className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'url'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Link className="h-4 w-4 inline mr-2" />
                  Image URL
                </button>
                <button
                  onClick={() => setActiveTab('samples')}
                  className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'samples'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ImageIcon className="h-4 w-4 inline mr-2" />
                  Sample Images
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                      dragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {uploading ? (
                      <div className="py-8">
                        <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                        <p className="mt-4 text-gray-600">Uploading image...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-lg font-medium text-gray-900">
                          Drop your image here, or{' '}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            browse
                          </button>
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Supports: JPG, PNG, WebP, GIF (max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* URL Tab */}
              {activeTab === 'url' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      />
                      <button
                        onClick={handleUrlSubmit}
                        disabled={!urlInput.trim() || urlValidating}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                      >
                        {urlValidating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {urlInput && ImageUploadService.validateUrl(urlInput) && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <img
                        src={urlInput}
                        alt="URL Preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                        onError={() => setError('Failed to load image from URL')}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Samples Tab */}
              {activeTab === 'samples' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose from our curated collection of sample images:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sampleImages.map((imageUrl, index) => (
                      <button
                        key={index}
                        onClick={() => handleSampleSelect(imageUrl)}
                        className="relative group overflow-hidden rounded-lg border-2 border-transparent hover:border-blue-500 transition-all duration-200"
                      >
                        <img
                          src={imageUrl}
                          alt={`Sample ${index + 1}`}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                          <Check className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};