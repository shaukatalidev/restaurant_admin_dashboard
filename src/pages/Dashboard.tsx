import React from 'react';
import { useRestaurant } from '../hooks/useRestaurant';
import { useMenu } from '../hooks/useMenu';
import { useGallery } from '../hooks/useGallery';
import { useOffers } from '../hooks/useOffers';
import { useOpeningHours } from '../hooks/useOpeningHours';
import { useRestaurantFeatures } from '../hooks/useRestaurantFeatures';
import { useRestaurantLocation } from '../hooks/useRestaurantLocation';
import { 
  Store, 
  MapPin, 
  Clock, 
  Star, 
  Menu, 
  Image, 
  Calendar,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Phone,
  MapIcon,
  Utensils,
  Camera,
  Tag,
  Timer,
  Shield
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const { categories, items, loading: menuLoading } = useMenu();
  const { images, loading: galleryLoading } = useGallery();
  const { offers, loading: offersLoading } = useOffers();
  const { hours, loading: hoursLoading } = useOpeningHours();
  const { features, loading: featuresLoading } = useRestaurantFeatures();
  const { location, loading: locationLoading } = useRestaurantLocation();

  const loading = restaurantLoading || menuLoading || galleryLoading || offersLoading || hoursLoading || featuresLoading || locationLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalMenuItems = items.length;
  const availableItems = items.filter(item => item.is_available).length;
  const specialItems = items.filter(item => item.is_special).length;
  const totalImages = images.length;
  const activeOffers = offers.filter(offer => offer.is_active).length;
  const totalOffers = offers.length;
  
  // Calculate opening days
  const openDays = hours.filter(h => h.is_open).length;
  
  // Calculate enabled features
  const enabledFeatures = features ? Object.entries(features)
    .filter(([key, value]) => key !== 'id' && key !== 'restaurant_id' && value === true)
    .length : 0;

  // Check completion status
  const hasBasicInfo = restaurant?.name && restaurant?.description;
  const hasLocation = location?.street || location?.city;
  const hasHours = hours.some(h => h.is_open);
  const hasMenu = totalMenuItems > 0;
  const hasImages = totalImages > 0;

  const completionItems = [
    { name: 'Basic Information', completed: hasBasicInfo, icon: Store },
    { name: 'Location Details', completed: hasLocation, icon: MapPin },
    { name: 'Opening Hours', completed: hasHours, icon: Clock },
    { name: 'Menu Items', completed: hasMenu, icon: Menu },
    { name: 'Gallery Images', completed: hasImages, icon: Image },
  ];

  const completionPercentage = Math.round((completionItems.filter(item => item.completed).length / completionItems.length) * 100);

  const stats = [
    {
      name: 'Restaurant Rating',
      value: restaurant?.rating || '0.0',
      icon: Star,
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Customer rating'
    },
    {
      name: 'Cost for Two',
      value: `₹${restaurant?.cost_for_two || 0}`,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100',
      description: 'Average dining cost'
    },
    {
      name: 'Menu Categories',
      value: categories.length,
      icon: Menu,
      color: 'text-purple-600 bg-purple-100',
      description: `${totalMenuItems} total items`
    },
    {
      name: 'Gallery Images',
      value: totalImages,
      icon: Image,
      color: 'text-blue-600 bg-blue-100',
      description: 'Restaurant photos'
    },
    {
      name: 'Active Offers',
      value: activeOffers,
      icon: Award,
      color: 'text-orange-600 bg-orange-100',
      description: `${totalOffers} total offers`
    },
    {
      name: 'Open Days',
      value: `${openDays}/7`,
      icon: Clock,
      color: 'text-indigo-600 bg-indigo-100',
      description: 'Days per week'
    },
  ];

  const quickActions = [
    {
      name: 'Update Basic Info',
      description: 'Modify restaurant name, description, and contact details',
      href: '/dashboard/basic-info',
      icon: Store,
      color: 'bg-blue-500 hover:bg-blue-600',
      status: hasBasicInfo ? 'Complete' : 'Incomplete'
    },
    {
      name: 'Manage Menu',
      description: 'Add, edit, or remove menu items and categories',
      href: '/dashboard/menu',
      icon: Menu,
      color: 'bg-green-500 hover:bg-green-600',
      status: hasMenu ? `${totalMenuItems} items` : 'No items'
    },
    {
      name: 'Update Gallery',
      description: 'Upload new photos or manage existing images',
      href: '/dashboard/gallery',
      icon: Image,
      color: 'bg-purple-500 hover:bg-purple-600',
      status: hasImages ? `${totalImages} images` : 'No images'
    },
    {
      name: 'Manage Offers',
      description: 'Create and manage special offers and promotions',
      href: '/dashboard/offers',
      icon: Award,
      color: 'bg-orange-500 hover:bg-orange-600',
      status: activeOffers > 0 ? `${activeOffers} active` : 'No offers'
    },
  ];

  const detailedStats = [
    {
      category: 'Menu Statistics',
      icon: Utensils,
      color: 'text-green-600 bg-green-100',
      items: [
        { label: 'Total Categories', value: categories.length },
        { label: 'Total Menu Items', value: totalMenuItems },
        { label: 'Available Items', value: availableItems },
        { label: 'Special Items', value: specialItems },
        { label: 'Unavailable Items', value: totalMenuItems - availableItems },
      ]
    },
    {
      category: 'Content & Media',
      icon: Camera,
      color: 'text-blue-600 bg-blue-100',
      items: [
        { label: 'Gallery Images', value: totalImages },
        { label: 'Menu Item Images', value: items.filter(item => item.image_url).length },
        { label: 'Offer Images', value: offers.filter(offer => offer.image_url).length },
        { label: 'Total Media Files', value: totalImages + items.filter(item => item.image_url).length + offers.filter(offer => offer.image_url).length },
      ]
    },
    {
      category: 'Promotions & Offers',
      icon: Tag,
      color: 'text-orange-600 bg-orange-100',
      items: [
        { label: 'Total Offers', value: totalOffers },
        { label: 'Active Offers', value: activeOffers },
        { label: 'Inactive Offers', value: totalOffers - activeOffers },
        { label: 'Special Offer Text', value: restaurant?.offer_text ? 'Set' : 'Not Set' },
      ]
    },
    {
      category: 'Restaurant Features',
      icon: Shield,
      color: 'text-purple-600 bg-purple-100',
      items: [
        { label: 'Enabled Features', value: enabledFeatures },
        { label: 'Home Delivery', value: features?.home_delivery ? 'Yes' : 'No' },
        { label: 'Indoor Seating', value: features?.indoor_seating ? 'Yes' : 'No' },
        { label: 'Air Conditioned', value: features?.air_conditioned ? 'Yes' : 'No' },
        { label: 'Accepts Cards', value: features?.accepts_cards ? 'Yes' : 'No' },
      ]
    },
  ];

  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold leading-7 text-blue-900 sm:text-4xl sm:truncate">
            Welcome back, {restaurant?.name || 'Restaurant Owner'}!
          </h2>
          <p className="mt-2 text-lg text-blue-700">
            Here's an overview of your restaurant's current status and statistics.
          </p>
        </div>
      </div>

      {/* Completion Status */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">Setup Progress</h3>
            <p className="text-blue-100">Complete your restaurant profile</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{completionPercentage}%</div>
            <div className="text-blue-100">Complete</div>
          </div>
        </div>
        
        <div className="w-full bg-blue-400/30 rounded-full h-3 mb-6">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {completionItems.map((item) => (
            <div key={item.name} className="flex items-center space-x-3">
              {item.completed ? (
                <CheckCircle className="h-6 w-6 text-green-300" />
              ) : (
                <XCircle className="h-6 w-6 text-red-300" />
              )}
              <div>
                <item.icon className="h-5 w-5 mb-1" />
                <p className="text-sm font-medium">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-xl rounded-2xl border border-blue-100 hover:shadow-2xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center justify-center p-4 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
                <div className="ml-6 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-semibold text-blue-700 truncate">{stat.name}</dt>
                    <dd className="text-3xl font-bold text-blue-900">{stat.value}</dd>
                    <dd className="text-sm text-blue-600">{stat.description}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {detailedStats.map((section) => (
          <div key={section.category} className="bg-white shadow-xl rounded-2xl border border-blue-100">
            <div className="px-6 py-4 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center">
                <div className={`inline-flex items-center justify-center p-2 rounded-lg ${section.color} mr-3`}>
                  <section.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900">{section.category}</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-blue-100 last:border-b-0">
                    <span className="text-sm font-medium text-blue-700">{item.label}</span>
                    <span className="text-lg font-bold text-blue-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-xl rounded-2xl border border-blue-100">
        <div className="px-8 py-6 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-xl font-semibold text-blue-900">Quick Actions</h3>
          <p className="text-blue-700 mt-1">Manage your restaurant settings and content</p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {quickActions.map((action) => (
              <a
                key={action.name}
                href={action.href}
                className="relative rounded-2xl p-6 bg-white border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`inline-flex items-center justify-center p-3 rounded-xl text-white ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-blue-900 group-hover:text-blue-700 transition-colors duration-200">{action.name}</h4>
                      <p className="text-sm text-blue-600">{action.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      action.status.includes('Complete') || action.status.includes('items') || action.status.includes('images') || action.status.includes('active')
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {action.status}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurant Information Summary */}
      <div className="bg-white shadow-xl rounded-2xl border border-blue-100">
        <div className="px-8 py-6 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-xl font-semibold text-blue-900">Restaurant Information</h3>
          <p className="text-blue-700 mt-1">Current status of your restaurant details</p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                <Phone className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Contact Number</p>
                  <p className="text-blue-900 font-semibold">{restaurant?.contact_number || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                <MapIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Location</p>
                  <p className="text-blue-900 font-semibold">{hasLocation ? 'Configured' : 'Not set'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                <Timer className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Operating Days</p>
                  <p className="text-blue-900 font-semibold">{openDays} days per week</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                <Tag className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Cuisine Types</p>
                  <p className="text-blue-900 font-semibold">{restaurant?.cuisine_types?.length || 0} types</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                <Eye className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Profile Status</p>
                  <p className="text-blue-900 font-semibold">{completionPercentage}% Complete</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                <Settings className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Features Enabled</p>
                  <p className="text-blue-900 font-semibold">{enabledFeatures} features</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};