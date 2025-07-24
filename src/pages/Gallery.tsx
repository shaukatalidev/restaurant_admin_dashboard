import React, { useState } from "react";
import { useGallery } from "../hooks/useGallery";
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";

export const Gallery: React.FC = () => {
  const { images, loading, addImages, updateImage, deleteImage } = useGallery();
  const [showAddForm, setShowAddForm] = useState(false);
  const [altText, setAltText] = useState("");
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [newImage, setNewImage] = useState<{
    image_urls: string[];
  }>({
    image_urls: [],
  });

  const handleAddImage = async () => {
    if (newImage.image_urls.length === 0) return;

    try {
      await addImages(newImage.image_urls, altText);

      setNewImage({ image_urls: [] });
      setAltText("");
      setShowAddForm(false);
      setSuccess("Images added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding image(s):", error);
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

      {/* Add Image Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-6 py-3.5 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-xl"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Image
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-8">
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
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-xl overflow-hidden shadow-md">
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="w-full h-56 object-cover group-hover:opacity-75 transition-opacity duration-200"
                  />
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
