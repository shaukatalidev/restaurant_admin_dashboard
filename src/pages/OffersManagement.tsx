import React, { useState } from 'react';
import { useOffers } from '../hooks/useOffers';
import { Plus, Edit2, Trash2, Save, X, CheckCircle, Calendar, Award } from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';

export const OffersManagement: React.FC = () => {
  const { offers, loading, addOffer, updateOffer, deleteOffer, toggleOfferStatus } = useOffers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  
  const [newOffer, setNewOffer] = useState({
    name: '',
    description: '',
    badge_text: '',
    image_url: '',
    is_active: true
  });

  const [editOffer, setEditOffer] = useState({
    name: '',
    description: '',
    badge_text: '',
    image_url: '',
    is_active: true
  });

  const handleAddOffer = async () => {
    if (!newOffer.name.trim()) return;
    
    try {
      await addOffer(newOffer);
      setNewOffer({
        name: '',
        description: '',
        badge_text: '',
        image_url: '',
        is_active: true
      });
      setShowAddForm(false);
      setSuccess('Offer added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding offer:', error);
    }
  };

  const handleUpdateOffer = async (id: string) => {
    try {
      await updateOffer(id, editOffer);
      setEditingOffer(null);
      setSuccess('Offer updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating offer:', error);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    
    try {
      await deleteOffer(id);
      setSuccess('Offer deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const startEditing = (offer: any) => {
    setEditOffer({
      name: offer.name,
      description: offer.description,
      badge_text: offer.badge_text,
      image_url: offer.image_url,
      is_active: offer.is_active
    });
    setEditingOffer(offer.id);
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
        <h1 className="text-3xl font-bold text-gray-900">Special Offers</h1>
        <p className="mt-2 text-gray-600">
          Create and manage special offers and promotions for your restaurant.
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

      {/* Add Offer Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-6 py-3.5 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-200 hover:shadow-xl"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Special Offer
        </button>
      </div>

      {/* Offers List */}
      <div className="space-y-6">
        {offers.length === 0 ? (
          <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-12 text-center">
            <Award className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No offers yet</h3>
            <p className="mt-2 text-gray-600">Create your first special offer to attract customers.</p>
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
              {editingOffer === offer.id ? (
                // Edit Form
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Offer</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Offer Name *</label>
                      <input
                        type="text"
                        value={editOffer.name}
                        onChange={(e) => setEditOffer(prev => ({ ...prev, name: e.target.value }))}
                        className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                        placeholder="Enter offer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={editOffer.description}
                        onChange={(e) => setEditOffer(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 resize-none"
                        placeholder="Describe the offer..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Badge Text</label>
                      <input
                        type="text"
                        value={editOffer.badge_text}
                        onChange={(e) => setEditOffer(prev => ({ ...prev, badge_text: e.target.value }))}
                        className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                        placeholder="e.g., 50% OFF, LIMITED TIME"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Offer Image</label>
                      <ImageUploader
                        onImageSelect={(url) => setEditOffer(prev => ({ ...prev, image_url: url }))}
                        currentImage={editOffer.image_url}
                        folder="offers"
                        placeholder="Upload offer image"
                      />
                    </div>
                    <div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editOffer.is_active}
                          onChange={(e) => setEditOffer(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-colors duration-200"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">Active Offer</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      onClick={() => setEditingOffer(null)}
                      className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateOffer(offer.id)}
                      className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Update Offer
                    </button>
                  </div>
                </div>
              ) : (
                // Display Offer
                <div className="flex">
                  {/* Offer Image */}
                  {offer.image_url && (
                    <div className="w-1/3">
                      <img
                        src={offer.image_url}
                        alt={offer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Offer Content */}
                  <div className={`${offer.image_url ? 'w-2/3' : 'w-full'} p-8`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-gray-900">{offer.name}</h3>
                          {offer.badge_text && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 border border-orange-200 font-bold">
                              {offer.badge_text}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            offer.is_active 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {offer.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        {offer.description && (
                          <p className="text-gray-600 mb-4 leading-relaxed">{offer.description}</p>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Created {new Date(offer.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-6">
                        <button
                          onClick={() => toggleOfferStatus(offer.id, !offer.is_active)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            offer.is_active
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {offer.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => startEditing(offer)}
                          className="p-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-3 text-red-400 hover:text-red-600 transition-colors duration-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Offer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-2xl shadow-2xl rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Create New Offer</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Offer Name *</label>
                  <input
                    type="text"
                    value={newOffer.name}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                    placeholder="Enter offer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newOffer.description}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 resize-none"
                    placeholder="Describe the offer..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Badge Text</label>
                  <input
                    type="text"
                    value={newOffer.badge_text}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, badge_text: e.target.value }))}
                    className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                    placeholder="e.g., 50% OFF, LIMITED TIME"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Offer Image</label>
                  <ImageUploader
                    onImageSelect={(url) => setNewOffer(prev => ({ ...prev, image_url: url }))}
                    currentImage={newOffer.image_url}
                    folder="offers"
                    placeholder="Upload offer image"
                  />
                </div>
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newOffer.is_active}
                      onChange={(e) => setNewOffer(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Active Offer</span>
                  </label>
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
                  onClick={handleAddOffer}
                  disabled={!newOffer.name.trim()}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};