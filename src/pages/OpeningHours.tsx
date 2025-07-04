import React, { useState } from 'react';
import { useOpeningHours } from '../hooks/useOpeningHours';
import { Save, Clock, CheckCircle } from 'lucide-react';

const DAYS = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const OpeningHours: React.FC = () => {
  const { hours, updateHours, loading } = useOpeningHours();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleToggleDay = async (dayOfWeek: number, isOpen: boolean) => {
    try {
      await updateHours(dayOfWeek, { is_open: isOpen });
    } catch (error) {
      console.error('Error updating hours:', error);
    }
  };

  const handleTimeChange = async (dayOfWeek: number, field: 'open_time' | 'close_time', value: string) => {
    try {
      await updateHours(dayOfWeek, { [field]: value });
    } catch (error) {
      console.error('Error updating hours:', error);
    }
  };

  const saveAllChanges = async () => {
    setSaving(true);
    setSuccess(false);
    
    try {
      // All changes are already saved individually, just show success
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving hours:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Opening Hours</h1>
        <p className="mt-2 text-gray-600">
          Set your restaurant's operating hours for each day of the week.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">Opening hours updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-2xl border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Clock className="h-6 w-6 mr-3 text-blue-600" />
            Weekly Schedule
          </h3>
        </div>
        <div className="px-8 py-6">
          <div className="space-y-6">
            {DAYS.map((day, index) => {
              const dayHours = hours.find(h => h.day_of_week === index);
              const isOpen = dayHours?.is_open || false;
              
              return (
                <div key={day} className="flex items-center justify-between p-6 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-6">
                    <div className="w-28">
                      <span className="text-sm font-semibold text-gray-900">{day}</span>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOpen}
                        onChange={(e) => handleToggleDay(index, e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Open</span>
                    </label>
                  </div>
                  
                  {isOpen && (
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-700">From:</label>
                        <input
                          type="time"
                          value={dayHours?.open_time || '09:00'}
                          onChange={(e) => handleTimeChange(index, 'open_time', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 bg-white hover:border-gray-400"
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-700">To:</label>
                        <input
                          type="time"
                          value={dayHours?.close_time || '22:00'}
                          onChange={(e) => handleTimeChange(index, 'close_time', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 bg-white hover:border-gray-400"
                        />
                      </div>
                    </div>
                  )}
                  
                  {!isOpen && (
                    <span className="text-sm text-gray-500 italic font-medium">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveAllChanges}
          disabled={saving}
          className="inline-flex items-center px-8 py-3.5 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          {saving ? 'Saving...' : 'Confirm Changes'}
        </button>
      </div>
    </div>
  );
};