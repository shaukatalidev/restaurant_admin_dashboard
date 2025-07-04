import React, { useState } from 'react';
import { useMenu } from '../hooks/useMenu';
import { Plus, Edit2, Trash2, Save, X, CheckCircle } from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';

export const MenuManagement: React.FC = () => {
  const { categories, items, loading, addCategory, updateCategory, deleteCategory, addItem, updateItem, deleteItem } = useMenu();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [success, setSuccess] = useState('');

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    image_url: '',
    is_available: true,
    is_special: false
  });

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      await addCategory(newCategoryName);
      setNewCategoryName('');
      setSuccess('Category added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      await updateCategory(id, { name });
      setEditingCategory(null);
      setSuccess('Category updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all items in this category.')) return;
    
    try {
      await deleteCategory(id);
      setSuccess('Category deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.category_id || newItem.price <= 0) return;
    
    try {
      await addItem(newItem);
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category_id: '',
        image_url: '',
        is_available: true,
        is_special: false
      });
      setShowAddItem(false);
      setSuccess('Menu item added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateItem = async (id: string, updates: any) => {
    try {
      await updateItem(id, updates);
      setEditingItem(null);
      setSuccess('Menu item updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      await deleteItem(id);
      setSuccess('Menu item deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting item:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your restaurant's menu categories and items.
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

      {/* Add Category */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Category</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name (e.g., Appetizers, Main Course)"
            className="flex-1 px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
          />
          <button
            onClick={handleAddCategory}
            className="inline-flex items-center px-6 py-3.5 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-xl"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories and Items */}
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.id} className="bg-white shadow-lg rounded-2xl border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
              {editingCategory === category.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    defaultValue={category.name}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateCategory(category.id, (e.target as HTMLInputElement).value);
                      }
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                  />
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="p-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingCategory(category.id)}
                      className="p-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-3 text-red-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="px-8 py-6">
              {/* Category Items */}
              <div className="space-y-6">
                {items.filter(item => item.category_id === category.id).map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                          {item.is_special && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 font-medium">
                              Special
                            </span>
                          )}
                          {!item.is_available && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-red-100 text-red-800 border border-red-200 font-medium">
                              Unavailable
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        )}
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="mt-3 h-24 w-24 object-cover rounded-xl border border-gray-200"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <button
                          onClick={() => setEditingItem(item.id)}
                          className="p-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-3 text-red-400 hover:text-red-600 transition-colors duration-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Item Button */}
              <button
                onClick={() => {
                  setNewItem(prev => ({ ...prev, category_id: category.id }));
                  setShowAddItem(true);
                }}
                className="mt-6 inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Item to {category.name}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-2xl shadow-2xl rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Menu Item</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 resize-none"
                    placeholder="Describe the item..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                  <ImageUploader
                    onImageSelect={(url) => setNewItem(prev => ({ ...prev, image_url: url }))}
                    currentImage={newItem.image_url}
                    folder="menu"
                    placeholder="Upload menu item image"
                  />
                </div>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItem.is_available}
                      onChange={(e) => setNewItem(prev => ({ ...prev, is_available: e.target.checked }))}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Available</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItem.is_special}
                      onChange={(e) => setNewItem(prev => ({ ...prev, is_special: e.target.checked }))}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Special Item</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setShowAddItem(false)}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
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