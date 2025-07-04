import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRestaurantFeatures } from '../hooks/useRestaurantFeatures';
import { Save, Star, CheckCircle } from 'lucide-react';

interface FeaturesForm {
  home_delivery: boolean;
  indoor_seating: boolean;
  air_conditioned: boolean;
  accepts_cards: boolean;
  family_friendly: boolean;
}

const FEATURES = [
  {
    key: 'home_delivery' as keyof FeaturesForm,
    label: 'Home Delivery Available',
    description: 'Restaurant offers delivery service to customers'
  },
  {
    key: 'indoor_seating' as keyof FeaturesForm,
    label: 'Indoor Seating',
    description: 'Restaurant has indoor dining area'
  },
  {
    key: 'air_conditioned' as keyof FeaturesForm,
    label: 'Air Conditioned',
    description: 'Restaurant has air conditioning'
  },
  {
    key: 'accepts_cards' as keyof FeaturesForm,
    label: 'Accepts Cards',
    description: 'Restaurant accepts credit/debit card payments'
  },
  {
    key: 'family_friendly' as keyof FeaturesForm,
    label: 'Family Friendly',
    description: 'Restaurant is suitable for families with children'
  }
];

export const Features: React.FC = () => {
  const { features, updateFeatures, loading } = useRestaurantFeatures();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch
  } = useForm<FeaturesForm>();

  const watchedFeatures = watch();

  useEffect(() => {
    if (features) {
      setValue('home_delivery', features.home_delivery);
      setValue('indoor_seating', features.indoor_seating);
      setValue('air_conditioned', features.air_conditioned);
      setValue('accepts_cards', features.accepts_cards);
      setValue('family_friendly', features.family_friendly);
    }
  }, [features, setValue]);

  const onSubmit = async (data: FeaturesForm) => {
    setSaving(true);
    setSuccess(false);
    
    try {
      await updateFeatures(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating features:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Features</h1>
        <p className="mt-2 text-gray-600">
          Select the features and amenities your restaurant offers.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">Restaurant features updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Star className="h-6 w-6 mr-3 text-blue-600" />
              Available Features
            </h3>
          </div>
          <div className="px-8 py-6">
            <div className="space-y-6">
              {FEATURES.map((feature) => (
                <div key={feature.key} className="flex items-start p-6 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      {...register(feature.key)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    <label className="font-semibold text-gray-900 cursor-pointer">
                      {feature.label}
                    </label>
                    <p className="text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Selected Features Preview:</h4>
          <div className="flex flex-wrap gap-3">
            {FEATURES.filter(feature => watchedFeatures[feature.key]).map((feature) => (
              <span
                key={feature.key}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200 font-medium"
              >
                {feature.label}
              </span>
            ))}
            {FEATURES.filter(feature => watchedFeatures[feature.key]).length === 0 && (
              <span className="text-sm text-gray-500 italic">No features selected</span>
            )}
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