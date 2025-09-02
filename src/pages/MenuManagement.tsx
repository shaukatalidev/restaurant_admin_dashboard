import React, { useState } from "react";
import { useMenu } from "../hooks/useMenu";
import { useGallery } from "../hooks/useGallery";
import { Plus, Edit2, Trash2, X, CheckCircle, Images } from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";

//extend type of newItem

type EditingItem = {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  is_available: boolean;
  is_special: boolean;
  id: string;
};

type MenuItemUpdate = {
  name?: string;
  description?: string;
  price?: number;
  category_id?: string;
  image_url?: string;
  is_available?: boolean;
  is_special?: boolean;
};

export const MenuManagement: React.FC = () => {
  const {
    categories,
    items,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
  } = useMenu();

  const {
    images: galleryImages,
    loading: galleryLoading,
    addImages: addGalleryImages,
    deleteImage: deleteGalleryImage,
  } = useGallery();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<EditingItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [success, setSuccess] = useState("");

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    image_url: "",
    is_available: true,
    is_special: false,
  });

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await addCategory(newCategoryName);
      setNewCategoryName("");
      setSuccess("Category added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      await updateCategory(id, { name });
      setEditingCategory(null);
      setSuccess("Category updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm(
        "Are you sure? This will also delete all items in this category."
      )
    )
      return;

    try {
      await deleteCategory(id);
      setSuccess("Category deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.category_id || newItem.price <= 0)
      return;

    try {
      await addItem(newItem);
      setNewItem({
        name: "",
        description: "",
        price: 0,
        category_id: "",
        image_url: "",
        is_available: true,
        is_special: false,
      });
      setShowAddItem(false);
      setSuccess("Menu item added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleUpdateItem = async (id: string, updates: MenuItemUpdate) => {
    try {
      await updateItem(id, updates);
      setSuccess("Menu item updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await deleteItem(id);
      setSuccess("Menu item deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleAddMenuImages = async (urls: string[]) => {
    try {
      await addGalleryImages(urls, "Menu showcase image");
      setSuccess("Menu images uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error uploading menu images:", error);
    }
  };

  const handleDeleteMenuImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu image?")) return;

    try {
      await deleteGalleryImage(id);
      setSuccess("Menu image deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting menu image:", error);
    }
  };

  // Filter to show only menu-related images
  const menuImages = galleryImages.filter((img) =>
    img.alt_text.toLowerCase().includes("menu")
  );

  if (loading || galleryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8 p-3 sm:p-0">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Menu Management</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Manage your restaurant's menu categories and items.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 sm:p-4 mx-1 sm:mx-0">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Category - Mobile Optimized */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-4 sm:p-8 mx-1 sm:mx-0">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Add New Category
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name (e.g., Appetizers)"
            className="flex-1 px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 text-sm sm:text-base"
          />
          <button
            onClick={handleAddCategory}
            className="inline-flex items-center justify-center px-4 sm:px-6 py-3 sm:py-3.5 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-xl whitespace-nowrap min-h-[48px]"
          >
            <Plus className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Menu Images Upload - Mobile Optimized */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-4 sm:p-8 mx-1 sm:mx-0">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Images className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Menu Images</h3>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
          Upload images that showcase your menu offerings, dishes, and food
          presentation. These images will appear in the menu section alongside
          individual menu items.
        </p>

        <div className="space-y-4 sm:space-y-6">
          {/* Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              Upload Menu Showcase Images
            </label>
            <ImageUploader
              onImageSelect={handleAddMenuImages}
              folder="menu"
              placeholder="Upload menu showcase images (multiple images supported)"
              className="w-full"
            />
          </div>

          {/* Current Images - Mobile Optimized Grid */}
          {menuImages.length > 0 && (
            <div>
              <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                Current Menu Images ({menuImages.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {menuImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative group bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 aspect-square"
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteMenuImage(image.id)}
                        className="opacity-0 group-hover:opacity-100 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {menuImages.length === 0 && (
            <div className="text-center py-8 sm:py-10 bg-gray-50 rounded-xl border border-gray-200">
              <Images className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-gray-400 mb-3" />
              <p className="text-gray-500 text-sm sm:text-base font-medium">No menu images uploaded yet</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Upload some images to showcase your menu offerings
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Categories and Items - Mobile Optimized */}
      <div className="space-y-4 sm:space-y-8">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white shadow-lg rounded-2xl border border-gray-100 mx-1 sm:mx-0"
          >
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
              {editingCategory === category.id ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    defaultValue={category.name}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleUpdateCategory(
                          category.id,
                          (e.target as HTMLInputElement).value
                        );
                      }
                    }}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 text-sm sm:text-base"
                  />
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="p-2.5 sm:p-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="h-4 sm:h-5 w-4 sm:w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 pr-4 truncate">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditingCategory(category.id)}
                      className="p-2.5 sm:p-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Edit2 className="h-4 sm:h-5 w-4 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2.5 sm:p-3 text-red-400 hover:text-red-600 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 className="h-4 sm:h-5 w-4 sm:w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 sm:px-8 py-4 sm:py-6">
              {/* Category Items - Mobile Optimized */}
              <div className="space-y-3 sm:space-y-6">
                {items
                  .filter((item) => item.category_id === category.id)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                              {item.name}
                            </h4>
                            <span className="text-base sm:text-lg font-bold text-green-600 whitespace-nowrap">
                              ₹{item.price}
                            </span>
                            {item.is_special && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 font-medium">
                                Special
                              </span>
                            )}
                            {!item.is_available && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800 border border-red-200 font-medium">
                                Unavailable
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed break-words">
                              {item.description}
                            </p>
                          )}
                          {item.image_url && (
                            <div className="mt-3">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-16 sm:h-24 w-16 sm:w-24 object-cover rounded-xl border border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex sm:flex-col items-center justify-end gap-2 sm:ml-6 flex-shrink-0">
                          <button
                            onClick={() => setEditItemData(item)}
                            className="p-2.5 sm:p-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            <Edit2 className="h-4 sm:h-5 w-4 sm:w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2.5 sm:p-3 text-red-400 hover:text-red-600 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            <Trash2 className="h-4 sm:h-5 w-4 sm:w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add Item Button - Mobile Optimized */}
              <button
                onClick={() => {
                  setNewItem((prev) => ({ ...prev, category_id: category.id }));
                  setShowAddItem(true);
                }}
                className="mt-4 sm:mt-6 inline-flex items-center px-4 sm:px-6 py-3 border border-gray-300 shadow-sm text-xs sm:text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md min-h-[48px] w-full sm:w-auto justify-center sm:justify-start"
              >
                <Plus className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                Add Item to {category.name}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Item Modal - Mobile Optimized */}
      {editItemData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
          <div className="relative top-2 sm:top-20 mx-auto border w-full max-w-sm sm:max-w-2xl shadow-2xl rounded-2xl bg-white max-h-[calc(100vh-16px)] sm:max-h-none overflow-y-auto">
            <div className="p-4 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Edit Menu Item
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editItemData.name}
                    onChange={(e) =>
                      setEditItemData({ ...editItemData, name: e.target.value })
                    }
                    className="block w-full px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editItemData.description}
                    onChange={(e) =>
                      setEditItemData({
                        ...editItemData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="block w-full px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the item..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editItemData.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") return;
                      const parsed = parseFloat(val);
                      if (!isNaN(parsed) && parsed >= 0) {
                        setEditItemData({ ...editItemData, price: parsed });
                      }
                    }}
                    onBlur={(e) => {
                      const parsed = parseFloat(e.target.value);
                      setEditItemData({
                        ...editItemData,
                        price: isNaN(parsed) ? 0 : parsed,
                      });
                    }}
                    className="block w-full px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image
                  </label>
                  <ImageUploader
                    onImageSelect={(url) =>
                      setEditItemData({ ...editItemData, image_url: url[0] })
                    }
                    currentImage={editItemData.image_url}
                    folder="menu"
                    placeholder="Upload menu item image"
                  />
                </div>

                <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editItemData.is_available}
                      onChange={(e) =>
                        setEditItemData({
                          ...editItemData,
                          is_available: e.target.checked,
                        })
                      }
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Available
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editItemData.is_special}
                      onChange={(e) =>
                        setEditItemData({
                          ...editItemData,
                          is_special: e.target.checked,
                        })
                      }
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Special
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={() => setEditItemData(null)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!editItemData.name.trim() || editItemData.price < 0)
                      return;

                    const updates: MenuItemUpdate = {
                      name: editItemData.name,
                      description: editItemData.description,
                      price: editItemData.price,
                      category_id: editItemData.category_id,
                      image_url: editItemData.image_url,
                      is_available: editItemData.is_available,
                      is_special: editItemData.is_special,
                    };

                    handleUpdateItem(editItemData.id, updates);
                    setEditItemData(null);
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg transition-all duration-200 min-h-[48px]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal - Mobile Optimized */}
      {showAddItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
          <div className="relative top-2 sm:top-20 mx-auto border w-full max-w-sm sm:max-w-2xl shadow-2xl rounded-2xl bg-white max-h-[calc(100vh-16px)] sm:max-h-none overflow-y-auto">
            <div className="p-4 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Add New Menu Item
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="block w-full px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 text-sm sm:text-base"
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="block w-full px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 resize-none text-sm sm:text-base"
                    placeholder="Describe the item..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={newItem.price === 0 ? "" : newItem.price}
                    min={0}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (value === "") {
                        setNewItem((prev) => ({ ...prev, price: 0 }));
                        return;
                      }

                      const parsed = parseFloat(value);
                      if (!isNaN(parsed) && parsed >= 0) {
                        setNewItem((prev) => ({ ...prev, price: parsed }));
                      }
                    }}
                    onBlur={(e) => {
                      const parsed = parseFloat(e.target.value);
                      const cleaned = isNaN(parsed) || parsed < 0 ? 0 : parsed;
                      setNewItem((prev) => ({ ...prev, price: cleaned }));
                    }}
                    className="block w-full px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 text-sm sm:text-base"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image
                  </label>
                  <ImageUploader
                    onImageSelect={(url) =>
                      setNewItem((prev) => ({ ...prev, image_url: url[0] }))
                    }
                    currentImage={newItem.image_url}
                    folder="menu"
                    placeholder="Upload menu item image"
                  />
                </div>
                <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItem.is_available}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          is_available: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Available
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItem.is_special}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          is_special: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Special Item
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={() => setShowAddItem(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl min-h-[48px]"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
