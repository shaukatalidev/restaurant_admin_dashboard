/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  MapPin,
  Clock,
  Star,
  Phone,
  Utensils,
  Home,
  Wind,
  CreditCard,
  Users,
  Badge,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Award,
  Navigation,
  Calendar,
  Menu,
  Search,
  Flame,
  Crown,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine_types: string[];
  contact_number: string;
  cost_for_two: number;
  rating: number;
  offer_text: string;
  theme_id: string;
}

interface RestaurantLocation {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  maps_embed_link: string;
}

interface OpeningHours {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

interface RestaurantFeatures {
  home_delivery: boolean;
  indoor_seating: boolean;
  air_conditioned: boolean;
  accepts_cards: boolean;
  family_friendly: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_special: boolean;
}

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
}

interface Offer {
  id: string;
  name: string;
  description: string;
  badge_text: string;
  image_url: string;
  is_active: boolean;
}

export const PublicRestaurantView: React.FC = () => {
  const { restaurantName } = useParams<{ restaurantName: string }>();
  const { currentTheme } = useTheme();
  
  // State
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [location, setLocation] = useState<RestaurantLocation | null>(null);
  const [hours, setHours] = useState<OpeningHours[]>([]);
  const [features, setFeatures] = useState<RestaurantFeatures | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Menu state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Carousel state
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const activeOffers = offers.filter((offer) => offer.is_active);

  // Convert URL-friendly name back to search for restaurant
  const getSearchableName = (urlName: string) => {
    return urlName.replace(/-/g, " ");
  };

  useEffect(() => {
    if (restaurantName) {
      fetchRestaurantData();
    }
  }, [restaurantName]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const searchName = getSearchableName(restaurantName!);

      // Fetch restaurant by name (case insensitive)
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .ilike("name", searchName)
        .single();

      if (restaurantError) {
        if (restaurantError.code === "PGRST116") {
          setError("Restaurant not found");
        } else {
          throw restaurantError;
        }
        return;
      }

      setRestaurant(restaurantData);

      // Fetch all related data
      const [
        locationResult,
        hoursResult,
        featuresResult,
        categoriesResult,
        itemsResult,
        imagesResult,
        offersResult,
      ] = await Promise.all([
        supabase
          .from("restaurant_locations")
          .select("*")
          .eq("restaurant_id", restaurantData.id)
          .maybeSingle(),
        supabase
          .from("opening_hours")
          .select("*")
          .eq("restaurant_id", restaurantData.id)
          .order("day_of_week"),
        supabase
          .from("restaurant_features")
          .select("*")
          .eq("restaurant_id", restaurantData.id)
          .maybeSingle(),
        supabase
          .from("menu_categories")
          .select("*")
          .eq("restaurant_id", restaurantData.id)
          .order("display_order"),
        supabase
          .from("menu_items")
          .select("*, menu_categories!inner(restaurant_id)")
          .eq("menu_categories.restaurant_id", restaurantData.id),
        supabase
          .from("gallery_images")
          .select("*")
          .eq("restaurant_id", restaurantData.id)
          .order("display_order"),
        supabase
          .from("offers")
          .select("*")
          .eq("restaurant_id", restaurantData.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);

      setLocation(locationResult.data);
      setHours(hoursResult.data || []);
      setFeatures(featuresResult.data);
      setCategories(categoriesResult.data || []);
      setItems(itemsResult.data || []);
      setImages(imagesResult.data || []);
      setOffers(offersResult.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load restaurant data");
    } finally {
      setLoading(false);
    }
  };

  // Auto-advance carousels
  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [offers.length]);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "specials" && item.is_special) ||
      item.category_id === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return item.is_available && matchesCategory && matchesSearch;
  });

  const nextOffer = () => {
    setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
  };

  const prevOffer = () => {
    setCurrentOfferIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "home_delivery":
        return <Home className="h-4 w-4" />;
      case "indoor_seating":
        return <Users className="h-4 w-4" />;
      case "air_conditioned":
        return <Wind className="h-4 w-4" />;
      case "accepts_cards":
        return <CreditCard className="h-4 w-4" />;
      case "family_friendly":
        return <Users className="h-4 w-4" />;
      default:
        return <Badge className="h-4 w-4" />;
    }
  };

  const getFeatureLabel = (feature: string) => {
    switch (feature) {
      case "home_delivery":
        return "Home Delivery";
      case "indoor_seating":
        return "Indoor Seating";
      case "air_conditioned":
        return "Air Conditioned";
      case "accepts_cards":
        return "Cards Accepted";
      case "family_friendly":
        return "Family Friendly";
      default:
        return feature;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4"
               style={{ 
                 borderColor: currentTheme.colors.primary + "30",
                 borderTopColor: currentTheme.colors.primary 
               }}></div>
          <p style={{ color: currentTheme.colors.textSecondary }} className="font-medium">
            Loading restaurant...
          </p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold mb-2"
              style={{ color: currentTheme.colors.text }}>
            Restaurant Not Found
          </h1>
          <p className="mb-6"
             style={{ color: currentTheme.colors.textSecondary }}>
            {error || "The restaurant you're looking for doesn't exist."}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
            style={{ 
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.surface 
            }}
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  const specialItems = items.filter(
    (item) => item.is_special && item.is_available
  );
  const todayHours = hours.find((h) => h.day_of_week === new Date().getDay());
  const isOpenNow = todayHours?.is_open || false;

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Header */}
      <div className="sticky top-0 z-50"
           style={{ 
             backgroundColor: currentTheme.colors.surface,
             borderBottom: `1px solid ${currentTheme.colors.primary}20`
           }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold"
              style={{ 
                color: currentTheme.colors.text,
                fontFamily: currentTheme.fonts.heading 
              }}>
            {restaurant?.name}
          </h1>
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 fill-current" style={{ color: currentTheme.colors.accent }} />
                <span className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>
                  {restaurant?.rating || "0.0"}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isOpenNow ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {isOpenNow ? "Open" : "Closed"}
              </span>
            </div>
          </div> */}
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-3">
              <Menu className="h-4 w-4 mr-1 fill-current" style={{ color: currentTheme.colors.primary}}
              onClick={() => console.log("Menu")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image with Restaurant Info */}
      <div className="relative h-64">
        {images.length > 0 ? (
          <img
            src={images[currentImageIndex]?.image_url}
            alt={images[currentImageIndex]?.alt_text}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${currentTheme.gradients.hero}`}></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
              <IndianRupee className="h-4 w-4 mr-1" />
              <span className="font-semibold text-sm">₹{restaurant?.cost_for_two || 0} for two</span>
            </div>
            {restaurant?.cuisine_types?.slice(0, 2).map((cuisine, index) => (
              <span key={index} className="px-3 py-1 bg-black/30 backdrop-blur-sm text-white rounded-full text-sm">
                {cuisine}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Restaurant Information Section */}
        <div className="bg-white shadow-lg border border-gray-100 p-4"
             style={{
               backgroundColor: currentTheme.colors.surface,
               borderColor: currentTheme.colors.primary + "10"
             }}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1"
                  style={{ 
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.fonts.heading 
                  }}>
                {restaurant?.name}
              </h2>
              <p className="text-sm font-medium mb-1"
                 style={{ color: currentTheme.colors.textSecondary }}>
                {location?.city && location?.state ? `${location.city}, ${location.state}` : 'Location'}
              </p>
              {location && (
                <p className="text-xs leading-relaxed"
                   style={{ color: currentTheme.colors.textSecondary }}>
                  {[
                    location.street,
                    location.city,
                    location.state,
                    location.zip_code,
                    'India'
                  ].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
              isOpenNow ? "text-white" : "text-white"
            }`}
                 style={{ 
                   backgroundColor: isOpenNow 
                     ? currentTheme.colors.success || '#22c55e'
                     : currentTheme.colors.error || '#ef4444'
                 }}>
              {isOpenNow ? "Open Now" : "Closed"}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 fill-current" 
                    style={{ color: currentTheme.colors.accent || '#fbbf24' }} />
              <span className="font-bold text-sm mr-1"
                    style={{ color: currentTheme.colors.text }}>
                {restaurant?.rating || "5.0"} Superb
              </span>
              <span className="text-xs"
                    style={{ color: currentTheme.colors.textSecondary }}>
                (22 Reviews)
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg"
                    style={{ color: currentTheme.colors.primary }}>
                Rs. {restaurant?.cost_for_two || 'Unknown'}
              </span>
              <span className="text-sm ml-1"
                    style={{ color: currentTheme.colors.textSecondary }}>
                for 2 pax
              </span>
            </div>
          </div>
        </div>

        {/* Special Offers */}
        {activeOffers.length > 0 && (
          <div className="px-4">
            <div className="rounded-xl shadow-lg border overflow-hidden"
                 style={{
                   backgroundColor: currentTheme.colors.surface,
                   borderColor: currentTheme.colors.primary + "20"
                 }}>
              <div className={`bg-gradient-to-r ${currentTheme.gradients.special} p-4`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center"
                      style={{ 
                        color: currentTheme.colors.text,
                        fontFamily: currentTheme.fonts.heading 
                      }}>
                    <Award className="h-5 w-5 mr-2" 
                           style={{ color: currentTheme.colors.accent }} />
                    Special Offers
                  </h2>
                  {activeOffers.length > 1 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm"
                            style={{ color: currentTheme.colors.textSecondary }}>
                        Offer {currentOfferIndex + 1}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative overflow-hidden">
                <div className="flex transition-transform duration-700 ease-in-out"
                     style={{ transform: `translateX(-${currentOfferIndex * 100}%)` }}>
                  {activeOffers.map((offer) => (
                    <div key={offer.id} className="w-full flex-shrink-0 p-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          {/* Badge Text */}
                          {offer.badge_text && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                                  style={{
                                    backgroundColor: currentTheme.colors.accent + "20",
                                    color: currentTheme.colors.accent,
                                    border: `1px solid ${currentTheme.colors.accent}40`
                                  }}>
                              {offer.badge_text}
                            </span>
                          )}
                          
                          {/* Offer Name */}
                          <h3 className="text-lg font-bold mb-1"
                              style={{ 
                                color: currentTheme.colors.text,
                                fontFamily: currentTheme.fonts.heading 
                              }}>
                            {offer.name}
                          </h3>
                          
                          {/* Description */}
                          {offer.description && (
                            <p className="text-sm leading-relaxed"
                               style={{ color: currentTheme.colors.textSecondary }}>
                              {offer.description}
                            </p>
                          )}
                          
                          {/* Active Offer Indicator */}
                          <div className="flex items-center mt-2">
                            <div className="w-3 h-3 rounded-full mr-2"
                                 style={{ backgroundColor: currentTheme.colors.success }}>
                            </div>
                            <span className="text-xs font-medium"
                                  style={{ color: currentTheme.colors.success }}>
                              Active Offer
                            </span>
                          </div>
                        </div>
                        
                        {/* Offer Image */}
                        {offer.image_url && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden border"
                               style={{ borderColor: currentTheme.colors.primary + "20" }}>
                            <img src={offer.image_url} alt={offer.name} 
                                 className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {activeOffers.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {activeOffers.map((_, dotIndex) => (
                      <button
                        key={dotIndex}
                        onClick={() => setCurrentOfferIndex(dotIndex)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          dotIndex === currentOfferIndex ? "scale-125" : ""
                        }`}
                        style={{
                          backgroundColor: dotIndex === currentOfferIndex 
                            ? currentTheme.colors.primary 
                            : currentTheme.colors.textSecondary + "60"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Our Delicious Menu */}
        {categories.length > 0 && (
        <div className="px-4">
          <div className="rounded-xl shadow-lg border overflow-hidden"
               style={{
                 backgroundColor: currentTheme.colors.surface,
                 borderColor: currentTheme.colors.primary + "20"
               }}>
            <div className={`bg-gradient-to-r ${currentTheme.gradients.header} p-4`}>
              <div className="flex items-center justify-center">
                <h2 className="text-xl font-bold flex items-center"
                    style={{ 
                      color: currentTheme.colors.text,
                      fontFamily: currentTheme.fonts.heading 
                    }}>
                  <Utensils className="h-5 w-5 mr-2" 
                           style={{ color: currentTheme.colors.accent }} />
                  Our Delicious Menu
                </h2>
              </div>
            </div>

            <div className="p-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === "all" 
                      ? `bg-gradient-to-r ${currentTheme.gradients.button} text-white` 
                      : "border"
                  }`}
                  style={selectedCategory !== "all" ? {
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.primary + "30",
                    color: currentTheme.colors.text
                  } : {}}>
                  All Items
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      selectedCategory === category.id 
                        ? `bg-gradient-to-r ${currentTheme.gradients.button} text-white` 
                        : "border"
                    }`}
                    style={selectedCategory !== category.id ? {
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.primary + "30",
                      color: currentTheme.colors.text
                    } : {}}>
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredItems.map((item) => (
                  <div key={item.id} 
                       className="rounded-lg overflow-hidden border"
                       style={{
                         backgroundColor: currentTheme.colors.surface,
                         borderColor: currentTheme.colors.primary + "20"
                       }}>
                    {/* Item Image */}
                                        <div className="relative aspect-square">
                      {item.image_url ? (
                        <>
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                          {item.is_special && (
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-1 rounded-full text-xs font-bold flex items-center"
                                    style={{
                                      backgroundColor: currentTheme.colors.error || '#ef4444',
                                      color: 'white'
                                    }}>
                                <Flame className="h-3 w-3 mr-1" />
                                SPECIAL
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                             style={{ backgroundColor: currentTheme.colors.background }}>
                          <Utensils className="h-8 w-8"
                                    style={{ color: currentTheme.colors.textSecondary }} />
                        </div>
                      )}
                    </div>
                    
                    {/* Item Content */}
                    <div className="p-3">
                      {/* Item Name with Veg Indicator */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h4 className="font-bold text-sm leading-tight"
                                style={{ 
                                  color: currentTheme.colors.text,
                                  fontFamily: currentTheme.fonts.heading 
                                }}>
                              {item.name}
                            </h4>
                          </div>
                          
                          {/* Description */}
                          {item.description && (
                            <p className="text-xs leading-tight mb-2"
                               style={{ 
                                 color: currentTheme.colors.textSecondary,
                                 overflow: 'hidden',
                                 display: '-webkit-box',
                                 WebkitLineClamp: 2,
                                 WebkitBoxOrient: 'vertical'
                               }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <span className="text-lg font-bold"
                              style={{ color: currentTheme.colors.textSecondary || '#22c55e' }}>
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">No items found</p>
                </div>
              )}
            </div>
          </div>
          </div>
        )}

        {/* Chef's Special Recommendations */}
        {specialItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-amber-200">
            <div className="p-4 border-b border-amber-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                Chef's Special Recommendations
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specialItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex gap-3 p-2 rounded-lg border border-amber-200">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      <span className="text-sm font-bold text-green-600">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* About Us */}
        {restaurant?.description && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-blue-500" />
              About Us
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {restaurant.description}
            </p>
          </div>
        )}

        {/* Contact & Location */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Contact & Location
          </h3>
          
          <div className="space-y-3">
            {restaurant?.contact_number && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">
                  {restaurant.contact_number}
                </span>
              </div>
            )}
            
            {location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    {[location.street, location.city, location.state, location.zip_code]
                      .filter(Boolean).join(", ")}
                  </p>
                  <button className="text-sm text-blue-500 font-medium mt-1 flex items-center">
                    <Navigation className="h-3 w-3 mr-1" />
                    Get Directions
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-700">
                {isOpenNow ? "Open Now" : "Closed"}
              </span>
            </div>
          </div>
        </div>

        {/* What Makes Us Special */}
        {features && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              What Makes Us Special
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(features)
                .filter(([key, value]) => key !== "id" && key !== "restaurant_id" && value === true)
                .map(([feature]) => (
                  <div key={feature} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <div className="text-green-600">
                      {getFeatureIcon(feature)}
                    </div>
                    <span className="text-xs font-medium text-green-700">
                      {getFeatureLabel(feature)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {images.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              📸 Gallery
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.slice(0, 6).map((image) => (
                <div key={image.id} className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={image.image_url} 
                    alt={image.alt_text} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiet Night Info */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <h4 className="font-bold text-lg text-gray-900 mb-2">
              Quiet Night
            </h4>
            <p className="text-sm text-gray-600">
              Perfect for intimate dining
            </p>
          </div>
          
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-gray-900">25-30</div>
              <div>mins</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">₹{restaurant?.cost_for_two || 0}</div>
              <div>for two</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                <Star className="h-3 w-3 fill-current text-yellow-400" />
                {restaurant?.rating || "0.0"}
              </div>
              <div>rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
