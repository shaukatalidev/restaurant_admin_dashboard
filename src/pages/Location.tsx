import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRestaurantLocation } from '../hooks/useRestaurantLocation';
import { Save, MapPin, CheckCircle } from 'lucide-react';

interface LocationForm {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  maps_embed_link: string;
  latitude: number | null;
  longitude: number | null;
}

export const Location: React.FC = () => {
  const { location, updateLocation, loading } = useRestaurantLocation();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LocationForm>();

  useEffect(() => {
    if (location) {
      setValue('street', location.street);
      setValue('city', location.city);
      setValue('state', location.state);
      setValue('zip_code', location.zip_code);
      setValue('maps_embed_link', location.maps_embed_link);
      setValue('latitude', location.latitude);
      setValue('longitude', location.longitude);
    }
  }, [location, setValue]);

  const onSubmit = async (data: LocationForm) => {
    setSaving(true);
    setSuccess(false);
    
    try {
      await updateLocation(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setSaving(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Location Information</h1>
        <p className="mt-2 text-gray-600">
          Update your restaurant's address and location details.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">Location information updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <MapPin className="h-6 w-6 mr-3 text-blue-600" />
              Address Details
            </h3>
          </div>
          <div className="px-8 py-6 space-y-8">
            <div>
              <label htmlFor="street" className="block text-sm font-semibold text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                {...register('street')}
                className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-gray-400"
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-gray-400"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  {...register('state')}
                  className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-gray-400"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label htmlFor="zip_code" className="block text-sm font-semibold text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  {...register('zip_code')}
                  className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-gray-400"
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>

            <div>
              <label htmlFor="maps_embed_link" className="block text-sm font-semibold text-gray-700 mb-2">
                Google Maps Embed Link
              </label>
              <input
                type="url"
                {...register('maps_embed_link')}
                className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-gray-400"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Get the embed link from Google Maps by clicking "Share" → "Embed a map"
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="latitude" className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('latitude', { valueAsNumber: true })}
                  className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-gray-400"
                  placeholder="e.g., 40.7128"
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('longitude', { valueAsNumber: true })}
                  className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 bg-white hover:border-gray-400"
                  placeholder="e.g., -74.0060"
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