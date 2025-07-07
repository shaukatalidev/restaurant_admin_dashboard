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
        return <Home className="h-5 w-5" />;
      case "indoor_seating":
        return <Users className="h-5 w-5" />;
      case "air_conditioned":
        return <Wind className="h-5 w-5" />;
      case "accepts_cards":
        return <CreditCard className="h-5 w-5" />;
      case "family_friendly":
        return <Users className="h-5 w-5" />;
      default:
        return <Badge className="h-5 w-5" />;
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Restaurant Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The restaurant you're looking for doesn't exist."}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
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
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      {/* Floating Header */}
      <div
        className="fixed top-4 left-4 right-4 z-50 backdrop-blur-lg shadow-xl border rounded-2xl"
        style={{
          backgroundColor: currentTheme.colors.surface + "E6",
          borderColor: currentTheme.colors.primary + "20",
        }}
      >
        <div className="flex items-center justify-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <h1
                className="text-lg font-bold"
                style={{
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.fonts.heading,
                }}
              >
                {restaurant?.name}
              </h1>
              <div
                className="flex items-center justify-center space-x-2 text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                <div className="flex items-center">
                  <Star
                    className="h-4 w-4 mr-1"
                    style={{ color: currentTheme.colors.accent }}
                  />
                  <span>{restaurant?.rating || "0.0"}</span>
                </div>
                <span>•</span>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isOpenNow
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isOpenNow ? "Open" : "Closed"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-8 w-full">
        {/* Hero Section with Dynamic Background */}
        <div className="relative w-full h-[70vh] overflow-hidden">
          {/* Background Image Carousel */}
          <div className="absolute inset-0">
            {images.length > 0 ? (
              <div className="relative w-full h-full">
                <img
                  src={images[currentImageIndex]?.image_url}
                  alt={images[currentImageIndex]?.alt_text}
                  className="w-full h-full object-cover transition-opacity duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              </div>
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${currentTheme.gradients.hero}`}
              >
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            )}
          </div>

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full px-6 sm:px-8 lg:px-12 pb-12">
              <div className="max-w-4xl">
                <h1
                  className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight"
                  style={{ fontFamily: currentTheme.fonts.heading }}
                >
                  {restaurant?.name || "Restaurant Name"}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <span className="text-white font-semibold text-lg">
                      {restaurant?.rating || "0.0"}
                    </span>
                  </div>

                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                    <IndianRupee className="h-5 w-5 text-white mr-1" />
                    <span className="text-white font-semibold">
                      ₹{restaurant?.cost_for_two || 0} for two
                    </span>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-full font-semibold ${
                      isOpenNow
                        ? "bg-green-500/90 text-white border border-green-400"
                        : "bg-red-500/90 text-white border border-red-400"
                    }`}
                  >
                    {isOpenNow ? "🟢 Open Now" : "🔴 Closed"}
                  </div>
                </div>

                {restaurant?.cuisine_types &&
                  restaurant.cuisine_types.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {restaurant.cuisine_types
                        .slice(0, 4)
                        .map((cuisine, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30"
                          >
                            {cuisine}
                          </span>
                        ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 space-y-8">
          {/* SPECIAL OFFERS - PROMINENTLY DISPLAYED FIRST */}
          {activeOffers.length > 0 && (
            <div className="relative -mt-20 z-10">
              <div
                className={`${currentTheme.effects.borderRadius} ${currentTheme.effects.shadow} overflow-hidden border`}
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.primary + "20",
                }}
              >
                {/* Offers Header */}
                <div
                  className={`bg-gradient-to-r ${currentTheme.gradients.special} px-8 py-6`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award
                        className="h-8 w-8 mr-3"
                        style={{ color: currentTheme.colors.accent }}
                      />
                      <h2
                        className="text-3xl font-bold"
                        style={{
                          color: currentTheme.colors.text,
                          fontFamily: currentTheme.fonts.heading,
                        }}
                      >
                        🔥 Special Offers
                      </h2>
                    </div>
                    {activeOffers.length > 1 && (
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          {currentOfferIndex + 1} of {activeOffers.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Offers Carousel */}
                <div className="relative">
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-700 ease-in-out"
                      style={{
                        transform: `translateX(-${currentOfferIndex * 100}%)`,
                      }}
                    >
                      {activeOffers.map((offer, index) => (
                        <div key={offer.id} className="w-full flex-shrink-0">
                          <div className="p-8 lg:p-12">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                              {/* Offer Content */}
                              <div className="lg:col-span-2 space-y-4">
                                {offer.badge_text && (
                                  <span
                                    className="inline-block px-4 py-2 rounded-full text-sm font-bold border"
                                    style={{
                                      backgroundColor:
                                        currentTheme.colors.accent + "20",
                                      color: currentTheme.colors.accent,
                                      borderColor:
                                        currentTheme.colors.accent + "40",
                                    }}
                                  >
                                    🏷️ {offer.badge_text}
                                  </span>
                                )}

                                <h3
                                  className="text-3xl lg:text-4xl font-bold leading-tight"
                                  style={{
                                    color: currentTheme.colors.text,
                                    fontFamily: currentTheme.fonts.heading,
                                  }}
                                >
                                  {offer.name}
                                </h3>

                                {offer.description && (
                                  <p
                                    className="text-lg leading-relaxed"
                                    style={{
                                      color: currentTheme.colors.textSecondary,
                                    }}
                                  >
                                    {offer.description}
                                  </p>
                                )}

                                <div className="flex items-center space-x-4 pt-4">
                                  <button
                                    className={`bg-gradient-to-r ${currentTheme.gradients.button} text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${currentTheme.effects.shadow}`}
                                  >
                                    Claim Offer
                                  </button>
                                  <span
                                    className="text-sm flex items-center"
                                    style={{
                                      color: currentTheme.colors.textSecondary,
                                    }}
                                  >
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Limited Time
                                  </span>
                                </div>
                              </div>

                              {/* Offer Image */}
                              {offer.image_url && (
                                <div className="lg:col-span-1">
                                  <div
                                    className={`relative overflow-hidden ${currentTheme.effects.borderRadius} ${currentTheme.effects.shadow}`}
                                  >
                                    <img
                                      src={offer.image_url}
                                      alt={offer.name}
                                      className="w-full h-64 lg:h-80 object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  {activeOffers.length > 1 && (
                    <>
                      <button
                        onClick={prevOffer}
                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-all duration-300 border ${currentTheme.effects.shadow}`}
                        style={{
                          backgroundColor: currentTheme.colors.surface,
                          borderColor: currentTheme.colors.primary + "20",
                          color: currentTheme.colors.text,
                        }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextOffer}
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-all duration-300 border ${currentTheme.effects.shadow}`}
                        style={{
                          backgroundColor: currentTheme.colors.surface,
                          borderColor: currentTheme.colors.primary + "20",
                          color: currentTheme.colors.text,
                        }}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>

                      {/* Dots Indicator */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {activeOffers.map((_, dotIndex) => (
                          <button
                            key={dotIndex}
                            onClick={() => setCurrentOfferIndex(dotIndex)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                              dotIndex === currentOfferIndex
                                ? "scale-125"
                                : "hover:bg-gray-400"
                            }`}
                            style={{
                              backgroundColor:
                                dotIndex === currentOfferIndex
                                  ? currentTheme.colors.primary
                                  : currentTheme.colors.textSecondary + "60",
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Restaurant Details */}
          <div
            className={`${currentTheme.effects.borderRadius} ${currentTheme.effects.shadow} overflow-hidden border`}
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + "20",
            }}
          >
            <div className="p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* About & Cuisine */}
                <div className="lg:col-span-2 space-y-8">
                  {restaurant?.description && (
                    <div>
                      <h3
                        className="text-2xl font-bold mb-4 flex items-center"
                        style={{
                          color: currentTheme.colors.text,
                          fontFamily: currentTheme.fonts.heading,
                        }}
                      >
                        <Utensils
                          className="h-6 w-6 mr-3"
                          style={{ color: currentTheme.colors.primary }}
                        />
                        About Us
                      </h3>
                      <p
                        className="leading-relaxed text-lg"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        {restaurant.description}
                      </p>
                    </div>
                  )}

                  {restaurant?.cuisine_types &&
                    restaurant.cuisine_types.length > 0 && (
                      <div>
                        <h3
                          className="text-2xl font-bold mb-4"
                          style={{
                            color: currentTheme.colors.text,
                            fontFamily: currentTheme.fonts.heading,
                          }}
                        >
                          Cuisines We Serve
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {restaurant.cuisine_types.map((cuisine, index) => (
                            <span
                              key={index}
                              className={`px-4 py-2 ${currentTheme.effects.borderRadius} text-sm font-semibold border transition-all duration-200`}
                              style={{
                                backgroundColor:
                                  currentTheme.colors.primary + "10",
                                color: currentTheme.colors.primary,
                                borderColor: currentTheme.colors.primary + "30",
                              }}
                            >
                              {cuisine}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Contact & Info */}
                <div className="space-y-6">
                  <div
                    className={`bg-gradient-to-br ${currentTheme.gradients.card} ${currentTheme.effects.borderRadius} p-6 border`}
                    style={{ borderColor: currentTheme.colors.primary + "20" }}
                  >
                    <h3
                      className="text-xl font-bold mb-4"
                      style={{
                        color: currentTheme.colors.text,
                        fontFamily: currentTheme.fonts.heading,
                      }}
                    >
                      Contact & Location
                    </h3>

                    {restaurant?.contact_number && (
                      <div
                        className={`flex items-center mb-4 p-3 ${currentTheme.effects.borderRadius} ${currentTheme.effects.shadow}`}
                        style={{ backgroundColor: currentTheme.colors.surface }}
                      >
                        <Phone
                          className="h-5 w-5 mr-3"
                          style={{ color: currentTheme.colors.success }}
                        />
                        <div>
                          <p
                            className="text-sm"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            Phone
                          </p>
                          <p
                            className="font-semibold"
                            style={{ color: currentTheme.colors.text }}
                          >
                            {restaurant.contact_number}
                          </p>
                        </div>
                      </div>
                    )}

                    {location && (
                      <div
                        className={`flex items-start mb-4 p-3 ${currentTheme.effects.borderRadius} ${currentTheme.effects.shadow}`}
                        style={{ backgroundColor: currentTheme.colors.surface }}
                      >
                        <MapPin
                          className="h-5 w-5 mr-3 mt-1"
                          style={{ color: currentTheme.colors.error }}
                        />
                        <div>
                          <p
                            className="text-sm"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            Address
                          </p>
                          <p
                            className="font-semibold text-sm"
                            style={{ color: currentTheme.colors.text }}
                          >
                            {[
                              location.street,
                              location.city,
                              location.state,
                              location.zip_code,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <button
                            className="text-sm font-medium mt-1 flex items-center"
                            style={{ color: currentTheme.colors.primary }}
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Get Directions
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Opening Hours */}
                    <div
                      className={`p-3 ${currentTheme.effects.borderRadius} ${currentTheme.effects.shadow}`}
                      style={{ backgroundColor: currentTheme.colors.surface }}
                    >
                      <div className="flex items-center mb-3">
                        <Clock
                          className="h-5 w-5 mr-3"
                          style={{ color: currentTheme.colors.primary }}
                        />
                        <div>
                          <p
                            className="text-sm"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            Hours
                          </p>
                          <p
                            className="font-semibold"
                            style={{ color: currentTheme.colors.text }}
                          >
                            {isOpenNow ? "Open Now" : "Closed"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm">
                        {DAYS.slice(0, 3).map((day, index) => {
                          const dayHours = hours.find(
                            (h) => h.day_of_week === index
                          );
                          const isToday = index === new Date().getDay();
                          return (
                            <div
                              key={day}
                              className={`flex justify-between ${
                                isToday ? "font-semibold" : ""
                              }`}
                              style={{
                                color: isToday
                                  ? currentTheme.colors.primary
                                  : currentTheme.colors.textSecondary,
                              }}
                            >
                              <span>{day}</span>
                              <span>
                                {dayHours?.is_open
                                  ? `${dayHours.open_time} - ${dayHours.close_time}`
                                  : "Closed"}
                              </span>
                            </div>
                          );
                        })}
                        <button
                          className="text-sm font-medium mt-2"
                          style={{ color: currentTheme.colors.primary }}
                        >
                          View all hours
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          {features && (
            <div
              className={`${currentTheme.effects.borderRadius} ${currentTheme.effects.shadow} p-8 lg:p-12 border`}
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + "20",
              }}
            >
              <h2
                className="text-2xl lg:text-3xl font-bold mb-8 text-center"
                style={{
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.fonts.heading,
                }}
              >
                ✨ What Makes Us Special
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {Object.entries(features)
                  .filter(
                    ([key, value]) =>
                      key !== "id" && key !== "restaurant_id" && value === true
                  )
                  .map(([feature]) => (
                    <div
                      key={feature}
                      className={`text-center p-6 bg-gradient-to-br ${currentTheme.gradients.card} ${currentTheme.effects.borderRadius} border transition-all duration-200 hover:scale-105`}
                      style={{
                        borderColor: currentTheme.colors.success + "30",
                      }}
                    >
                      <div
                        className="mb-3 flex justify-center"
                        style={{ color: currentTheme.colors.success }}
                      >
                        {getFeatureIcon(feature)}
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: currentTheme.colors.success }}
                      >
                        {getFeatureLabel(feature)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ENHANCED MENU SECTION */}
          {categories.length > 0 && (
            <div
              className={`${currentTheme.effects.borderRadius} ${currentTheme.effects.shadow} border overflow-hidden`}
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + "20",
              }}
            >
              {/* Menu Header */}
              <div
                className={`bg-gradient-to-r ${currentTheme.gradients.header} px-8 py-8`}
              >
                <div className="text-center">
                  <h2
                    className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center justify-center"
                    style={{ fontFamily: currentTheme.fonts.heading }}
                  >
                    <Utensils className="h-10 w-10 mr-4" />
                    Our Delicious Menu
                  </h2>
                  <p className="text-white/80 text-lg">
                    Discover our carefully crafted dishes
                  </p>
                </div>
              </div>

              <div className="p-8 lg:p-12">
                {/* Search and Filter Bar */}
                <div className="mb-8 space-y-4">
                  {/* Search Bar */}
                  <div className="relative max-w-md mx-auto">
                    <Search
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5"
                      style={{ color: currentTheme.colors.textSecondary }}
                    />
                    <input
                      type="text"
                      placeholder="Search dishes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border ${currentTheme.effects.borderRadius} focus:outline-none focus:ring-2 transition-all duration-200`}
                      style={{
                        backgroundColor: currentTheme.colors.background,
                        borderColor: currentTheme.colors.primary + "30",
                        color: currentTheme.colors.text,
                      }}
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-6 py-3 ${
                        currentTheme.effects.borderRadius
                      } font-semibold transition-all duration-200 ${
                        selectedCategory === "all"
                          ? `bg-gradient-to-r ${currentTheme.gradients.button} text-white ${currentTheme.effects.shadow}`
                          : "border"
                      }`}
                      style={
                        selectedCategory !== "all"
                          ? {
                              backgroundColor: currentTheme.colors.background,
                              borderColor: currentTheme.colors.primary + "30",
                              color: currentTheme.colors.text,
                            }
                          : {}
                      }
                    >
                      All Items
                    </button>

                    {specialItems.length > 0 && (
                      <button
                        onClick={() => setSelectedCategory("specials")}
                        className={`px-6 py-3 ${
                          currentTheme.effects.borderRadius
                        } font-semibold transition-all duration-200 flex items-center ${
                          selectedCategory === "specials"
                            ? `bg-gradient-to-r ${currentTheme.gradients.special} text-white ${currentTheme.effects.shadow}`
                            : "border"
                        }`}
                        style={
                          selectedCategory !== "specials"
                            ? {
                                backgroundColor:
                                  currentTheme.colors.accent + "10",
                                borderColor: currentTheme.colors.accent + "30",
                                color: currentTheme.colors.accent,
                              }
                            : {}
                        }
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Today's Specials
                      </button>
                    )}

                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-6 py-3 ${
                          currentTheme.effects.borderRadius
                        } font-semibold transition-all duration-200 ${
                          selectedCategory === category.id
                            ? `bg-gradient-to-r ${currentTheme.gradients.button} text-white ${currentTheme.effects.shadow}`
                            : "border"
                        }`}
                        style={
                          selectedCategory !== category.id
                            ? {
                                backgroundColor: currentTheme.colors.background,
                                borderColor: currentTheme.colors.primary + "30",
                                color: currentTheme.colors.text,
                              }
                            : {}
                        }
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items Grid */}
                <div className="space-y-8">
                  {/* Special Items Section (when showing all or specials) */}
                  {(selectedCategory === "all" ||
                    selectedCategory === "specials") &&
                    specialItems.length > 0 && (
                      <div className="mb-12">
                        <div className="text-center mb-8">
                          <h3
                            className="text-2xl lg:text-3xl font-bold mb-2 flex items-center justify-center"
                            style={{
                              color: currentTheme.colors.text,
                              fontFamily: currentTheme.fonts.heading,
                            }}
                          >
                            <Sparkles
                              className="h-8 w-8 mr-3"
                              style={{ color: currentTheme.colors.accent }}
                            />
                            Chef's Special Recommendations
                          </h3>
                          <p
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            Limited time offerings crafted with love
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                          {specialItems.map((item) => (
                            <div
                              key={item.id}
                              className={`group relative overflow-hidden bg-gradient-to-br ${currentTheme.gradients.special} ${currentTheme.effects.borderRadius} ${currentTheme.effects.shadow} hover:${currentTheme.effects.shadowHover} transition-all duration-300 border-2`}
                              style={{
                                borderColor: currentTheme.colors.accent + "30",
                              }}
                            >
                              {/* Special Badge */}
                              <div className="absolute top-4 right-4 z-10">
                                <div
                                  className={`bg-gradient-to-r ${currentTheme.gradients.button} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center ${currentTheme.effects.shadow}`}
                                >
                                  <Flame className="h-3 w-3 mr-1" />
                                  SPECIAL
                                </div>
                              </div>

                              {/* Item Image */}
                              {item.image_url && (
                                <div className="relative overflow-hidden h-48">
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                </div>
                              )}

                              {/* Item Content */}
                              <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <h4
                                    className="font-bold text-xl transition-colors duration-200"
                                    style={{
                                      color: currentTheme.colors.text,
                                      fontFamily: currentTheme.fonts.heading,
                                    }}
                                  >
                                    {item.name}
                                  </h4>
                                  <div className="text-right">
                                    <div
                                      className="text-2xl font-bold"
                                      style={{
                                        color: currentTheme.colors.success,
                                      }}
                                    >
                                      ₹{item.price}
                                    </div>
                                    <div
                                      className="flex items-center text-sm"
                                      style={{
                                        color: currentTheme.colors.accent,
                                      }}
                                    >
                                      <Star className="h-4 w-4 mr-1 fill-current" />
                                      Special
                                    </div>
                                  </div>
                                </div>

                                {item.description && (
                                  <p
                                    className="text-sm leading-relaxed"
                                    style={{
                                      color: currentTheme.colors.textSecondary,
                                    }}
                                  >
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Regular Menu Items */}
                  {selectedCategory !== "specials" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredItems
                        .filter(
                          (item) =>
                            !item.is_special || selectedCategory === "all"
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            className={`group border ${currentTheme.effects.borderRadius} overflow-hidden hover:${currentTheme.effects.shadowHover} transition-all duration-300`}
                            style={{
                              backgroundColor: currentTheme.colors.surface,
                              borderColor: currentTheme.colors.primary + "20",
                            }}
                          >
                            {/* Item Image */}
                            {item.image_url && (
                              <div className="relative overflow-hidden h-48">
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                              </div>
                            )}

                            {/* Item Content */}
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <h4
                                  className="font-bold text-lg transition-colors duration-200"
                                  style={{
                                    color: currentTheme.colors.text,
                                    fontFamily: currentTheme.fonts.heading,
                                  }}
                                >
                                  {item.name}
                                </h4>
                                <div
                                  className="text-xl font-bold"
                                  style={{ color: currentTheme.colors.success }}
                                >
                                  ₹{item.price}
                                </div>
                              </div>

                              {item.description && (
                                <p
                                  className="text-sm leading-relaxed"
                                  style={{
                                    color: currentTheme.colors.textSecondary,
                                  }}
                                >
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* No Results Message */}
                  {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                      <div
                        className="mb-4"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        <Search className="h-16 w-16 mx-auto" />
                      </div>
                      <h3
                        className="text-xl font-semibold mb-2"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        No items found
                      </h3>
                      <p style={{ color: currentTheme.colors.textSecondary }}>
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Gallery */}
          {images.length > 0 && (
            <div
              className={`${currentTheme.effects.borderRadius} ${currentTheme.effects.shadow} p-8 lg:p-12 border`}
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + "20",
              }}
            >
              <h2
                className="text-2xl lg:text-3xl font-bold mb-8 text-center"
                style={{
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.fonts.heading,
                }}
              >
                📸 Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`group relative overflow-hidden ${currentTheme.effects.borderRadius} ${currentTheme.effects.shadow} hover:${currentTheme.effects.shadowHover} transition-all duration-300`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        View Image
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
