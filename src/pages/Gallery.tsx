import React, { useState, useEffect } from "react";
import { useGallery } from "../hooks/useGallery";
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  Camera,
} from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";

export const Gallery: React.FC = () => {
  const { images, loading, addImages, updateImage, deleteImage } = useGallery();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [altText, setAltText] = useState("");
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [newImage, setNewImage] = useState<{
    image_urls: string[];
  }>({
    image_urls: [],
  });

  const [newBannerImage, setNewBannerImage] = useState<{
    image_urls: string[];
  }>({
    image_urls: [],
  });

  const [bannerAltText, setBannerAltText] = useState("");
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Auto-advance hero carousel (similar to PublicRestaurantView)
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const handleAddImage = async () => {
    if (newImage.image_urls.length === 0) return;

    try {
      await addImages(
        newImage.image_urls, 
        altText,
        false  
      );

      setNewImage({ image_urls: [] });
      setAltText("");
      setShowAddForm(false);
      setSuccess("Images added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding image(s):", error);
    }
  };

  const handleAddBannerImage = async () => {
    if (newBannerImage.image_urls.length === 0) return;

    try {
      await addImages(
        newBannerImage.image_urls,
        bannerAltText || "Hero Banner Image",
        true  
      );

      setNewBannerImage({ image_urls: [] });
      setBannerAltText("");
      setShowBannerForm(false);
      setSuccess("Banner image(s) added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding banner image(s):", error);
    }
  };

  const handleUpdateImage = async (id: string, altText: string) => {
    try {
      await updateImage(id, { alt_text: altText });
      setEditingImage(null);
      setSuccess("Image updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating image:", error);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await deleteImage(id);
      setSuccess("Image deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const nextHeroImage = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % images.length);
  };

  const prevHeroImage = () => {
    setCurrentHeroIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Photo Gallery</h1>
        <p className="mt-2 text-gray-600">
          Manage your restaurant's photo gallery to showcase your ambiance and
          dishes.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Banner Images Preview Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">
              Banner Images Preview
            </h2>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Eye className="h-4 w-4 mr-1" />
            <span>Public view preview</span>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">No hero images</p>
              <p className="text-gray-400 text-sm">
                Add images to see hero preview
              </p>
            </div>
          </div>
        ) : (
          <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
            {/* Hero Image */}
            <img
              src={images[currentHeroIndex]?.image_url}
              alt={images[currentHeroIndex]?.alt_text}
              className="w-full h-full object-cover transition-opacity duration-1000"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {/* Hero Content Preview */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="font-semibold text-sm">
                    Public Restaurant View
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevHeroImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200"
                  title="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextHeroImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200"
                  title="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentHeroIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentHeroIndex
                          ? "bg-white scale-125"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Current Image Info */}
            <div className="absolute top-4 right-4">
              <div className="bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                {images[currentHeroIndex]?.alt_text || "No description"}
              </div>
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              These images will appear in the hero carousel on your restaurant's public page.
              {images.length > 1 && ` They will auto-rotate every 4 seconds.`}
            </p>
          </div>
        )}
      </div>

      {/* Button Section with both buttons */}
      <div className="flex justify-end items-center gap-4">
        {/* Add Banner Image Button */}
        <button
          onClick={() => setShowBannerForm(true)}
          className="inline-flex items-center px-6 py-3.5 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:shadow-xl"
        >
          <Camera className="h-5 w-5 mr-2" />
          Add Banner Image
        </button>

        {/* Original Add Image Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-6 py-3.5 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-xl"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Image
        </button>
      </div>

      {/* Gallery Management Section */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-8">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Gallery Management
          </h3>
          <p className="text-gray-600 text-sm">
            Manage all your gallery images. These images are used in the hero
            carousel and gallery section.
          </p>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No images
            </h3>
            <p className="mt-2 text-gray-600">
              Get started by adding your first image.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-xl overflow-hidden shadow-md">
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="w-full h-56 object-cover group-hover:opacity-75 transition-opacity duration-200"
                  />
                </div>

                {/* ✅ Show Banner or Hero badge based on is_banner field */}
                <div className="absolute top-3 left-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                    image.is_banner 
                      ? "bg-purple-600 text-white" 
                      : index < 5 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-600 text-white"
                  }`}>
                    <Star className="h-3 w-3 mr-1" />
                    {image.is_banner ? "Banner" : `Regular #${index + 1}`}
                  </div>
                </div>

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingImage(image.id)}
                      title="Edit Image"
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Edit2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      title="Delete image"
                      onClick={() => handleDeleteImage(image.id)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
                {editingImage === image.id ? (
                  <div className="mt-3">
                    <input
                      type="text"
                      defaultValue={image.alt_text}
                      placeholder="Image description"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateImage(
                            image.id,
                            (e.target as HTMLInputElement).value
                          );
                        }
                      }}
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                    />
                    <button
                      onClick={() => setEditingImage(null)}
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-gray-600 font-medium">
                    {image.alt_text || "No description"}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Banner Image Modal */}
      {showBannerForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-2xl shadow-2xl rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Add New Banner Image
                {newBannerImage.image_urls.length > 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Banner images will be prominently displayed in the hero section
                of your restaurant's public page.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banner Image
                  </label>
                  <ImageUploader
                    onImageSelect={(urls) =>
                      setNewBannerImage((prev) => ({
                        ...prev,
                        image_urls: urls,
                      }))
                    }
                    currentImage={newBannerImage.image_urls}
                    folder="gallery"
                    placeholder="Upload banner image(s) for hero section"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={bannerAltText}
                    onChange={(e) => setBannerAltText(e.target.value)}
                    placeholder="Describe the banner image..."
                    className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                  />
                  {newBannerImage.image_urls.length > 1 && (
                    <p className="text-sm text-gray-500 mt-1">
                      The same description will be applied to all uploaded
                      banner images.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setShowBannerForm(false)}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBannerImage}
                  disabled={newBannerImage.image_urls.length === 0}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Add Banner{" "}
                  {newBannerImage.image_urls.length > 1 ? "Images" : "Image"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Original Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-2xl shadow-2xl rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Add New Image{newImage.image_urls.length > 1 ? "s" : ""}
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image
                  </label>
                  <ImageUploader
                    onImageSelect={(urls) =>
                      setNewImage((prev) => ({ ...prev, image_urls: urls }))
                    }
                    currentImage={newImage.image_urls}
                    folder="gallery"
                    placeholder="Upload gallery image(s)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image..."
                    className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                  />
                  {newImage.image_urls.length > 1 && (
                    <p className="text-sm text-gray-500 mt-1">
                      The same description will be applied to all uploaded
                      images.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddImage}
                  disabled={newImage.image_urls.length === 0}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Add {newImage.image_urls.length > 1 ? "Images" : "Image"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
