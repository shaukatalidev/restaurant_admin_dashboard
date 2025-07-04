import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRestaurant } from '../hooks/useRestaurant';
import { Save, AlertCircle, CheckCircle, X } from 'lucide-react';

interface BasicInfoForm {
  name: string;
  description: string;
  cuisine_types: string[];
  contact_number: string;
  cost_for_two: number;
  rating: number;
  offer_text: string;
}

export const BasicInfo: React.FC = () => {
  const { restaurant, updateRestaurant, loading } = useRestaurant();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cuisineInput, setCuisineInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BasicInfoForm>();

  const watchedCuisineTypes = watch('cuisine_types', []);

  useEffect(() => {
    if (restaurant) {
      setValue('name', restaurant.name);
      setValue('description', restaurant.description);
      setValue('cuisine_types', restaurant.cuisine_types || []);
      setValue('contact_number', restaurant.contact_number);
      setValue('cost_for_two', restaurant.cost_for_two);
      setValue('rating', restaurant.rating);
      setValue('offer_text', restaurant.offer_text);
    }
  }, [restaurant, setValue]);

  const onSubmit = async (data: BasicInfoForm) => {
    setSaving(true);
    setSuccess(false);
    
    try {
      await updateRestaurant(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating restaurant:', error);
    } finally {
      setSaving(false);
    }
  };

  const addCuisineType = () => {
    if (cuisineInput.trim() && !watchedCuisineTypes.includes(cuisineInput.trim())) {
      const newCuisineTypes = [...watchedCuisineTypes, cuisineInput.trim()];
      setValue('cuisine_types', newCuisineTypes);
      setCuisineInput('');
    }
  };

  const removeCuisineType = (cuisine: string) => {
    const newCuisineTypes = watchedCuisineTypes.filter(c => c !== cuisine);
    setValue('cuisine_types', newCuisineTypes);
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
        <h1 className="text-3xl font-bold text-blue-900">Basic Information</h1>
        <p className="mt-2 text-blue-700">
          Update your restaurant's basic information and details.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">Restaurant information updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white shadow-lg rounded-2xl border border-blue-100">
          <div className="px-8 py-6 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-xl font-semibold text-blue-900">Restaurant Details</h3>
          </div>
          <div className="px-8 py-6 space-y-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-blue-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Restaurant name is required' })}
                  className="block w-full px-4 py-3.5 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-blue-400"
                  placeholder="Enter restaurant name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contact_number" className="block text-sm font-semibold text-blue-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  {...register('contact_number')}
                  className="block w-full px-4 py-3.5 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-blue-400"
                  placeholder="Enter contact number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-blue-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="block w-full px-4 py-3.5 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-blue-400 resize-none"
                placeholder="Describe your restaurant..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-2">
                Cuisine Types
              </label>
              <div className="mb-4 flex flex-wrap gap-2">
                {watchedCuisineTypes.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {cuisine}
                    <button
                      type="button"
                      onClick={() => removeCuisineType(cuisine)}
                      className="ml-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={cuisineInput}
                  onChange={(e) => setCuisineInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCuisineType())}
                  className="flex-1 px-4 py-3.5 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-blue-400"
                  placeholder="Add cuisine type"
                />
                <button
                  type="button"
                  onClick={addCuisineType}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div>
                <label htmlFor="cost_for_two" className="block text-sm font-semibold text-blue-700 mb-2">
                  Cost for Two (₹)
                </label>
                <input
                  type="number"
                  {...register('cost_for_two', { valueAsNumber: true })}
                  className="block w-full px-4 py-3.5 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-blue-400"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-semibold text-blue-700 mb-2">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...register('rating', { valueAsNumber: true })}
                  className="block w-full px-4 py-3.5 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-blue-400"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label htmlFor="offer_text" className="block text-sm font-semibold text-blue-700 mb-2">
                  Special Offer
                </label>
                <input
                  type="text"
                  {...register('offer_text')}
                  className="block w-full px-4 py-3.5 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-blue-400"
                  placeholder="e.g., 10% OFF on all orders"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
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
      </form>
    </div>
  );
};