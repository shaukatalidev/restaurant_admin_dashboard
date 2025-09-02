import React, { useState, useEffect } from 'react';
import { useMenu } from '../hooks/useMenu';
import { useRestaurant } from '../hooks/useRestaurant';
import { Save, Calendar, CheckCircle, Star } from 'lucide-react';

export const TodaysSpecial: React.FC = () => {
  const { items, loading: menuLoading, updateItem } = useMenu();
  const { restaurant, updateRestaurant, loading: restaurantLoading } = useRestaurant();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [offerText, setOfferText] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setOfferText(restaurant.offer_text || '');
    }
  }, [restaurant]);

  useEffect(() => {
    const specialItems = items.filter(item => item.is_special).map(item => item.id);
    setSelectedItems(specialItems);
  }, [items]);

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    
    try {
      // Update restaurant offer text
      await updateRestaurant({ offer_text: offerText });
      
      // ✅ FIX: Uncomment and implement the menu items update
      const updatePromises = items.map(async (item) => {
        const shouldBeSpecial = selectedItems.includes(item.id);
        if (item.is_special !== shouldBeSpecial) {
          return updateItem(item.id, { is_special: shouldBeSpecial }); // ✅ This works now!
        }
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises.filter(Boolean));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating specials:', error);
      // Add error state handling if needed
    } finally {
      setSaving(false);
    }
  };
  if (menuLoading || restaurantLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const availableItems = items.filter(item => item.is_available);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Today's Special</h1>
        <p className="mt-2 text-gray-600">
          Select special dishes and set promotional offers for today.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">Today's specials updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      {/* Offer Banner */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 mr-3 text-blue-600" />
            Special Offer Banner
          </h3>
        </div>
        <div className="px-8 py-6">
          <div>
            <label htmlFor="offer_text" className="block text-sm font-semibold text-gray-700 mb-2">
              Promotional Text
            </label>
            <input
              type="text"
              id="offer_text"
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              placeholder="e.g., 10% OFF on all orders, Free delivery above ₹500"
              className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-gray-400"
            />
            <p className="mt-2 text-sm text-gray-500">
              This text will be displayed as a promotional banner on your restaurant page.
            </p>
          </div>
          
          {offerText && (
            <div className="mt-6 p-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg">
              <p className="text-white font-semibold text-center text-lg">{offerText}</p>
            </div>
          )}
        </div>
      </div>

      {/* Special Items Selection */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Star className="h-6 w-6 mr-3 text-blue-600" />
            Special Menu Items
          </h3>
          <p className="mt-2 text-gray-600">
            Select items to feature as today's specials. These will be highlighted on your menu.
          </p>
        </div>
        <div className="px-8 py-6">
          {availableItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No menu items available. Add items in Menu Management first.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {availableItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-6 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`item-${item.id}`}
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <div className="ml-4">
                      <label htmlFor={`item-${item.id}`} className="text-sm font-semibold text-gray-900 cursor-pointer">
                        {item.name}
                      </label>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                    {selectedItems.includes(item.id) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 font-medium">
                        <Star className="h-3 w-3 mr-1" />
                        Special
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Items Preview */}
      {selectedItems.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8">
          <h4 className="text-xl font-semibold text-yellow-800 mb-4">Today's Special Items Preview</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items
              .filter(item => selectedItems.includes(item.id))
              .map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-xl border border-yellow-300 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900">{item.name}</h5>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                      <div className="flex items-center text-yellow-600 text-sm mt-1">
                        <Star className="h-4 w-4 mr-1" />
                        Special
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-8 py-3.5 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};