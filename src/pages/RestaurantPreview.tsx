import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurant } from "../hooks/useRestaurant";
import { useRestaurantLocation } from "../hooks/useRestaurantLocation";
import { useOpeningHours } from "../hooks/useOpeningHours";
import { useRestaurantFeatures } from "../hooks/useRestaurantFeatures";
import { useMenu } from "../hooks/useMenu";
import { useGallery } from "../hooks/useGallery";
import { useOffers } from "../hooks/useOffers";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Phone,
  Utensils,
  Wifi,
  Car,
  CreditCard,
  Users,
  Home,
  Wind,
  Badge,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Award,
  Heart,
  Share2,
  Navigation,
  Calendar,
  Filter,
  Search,
  Flame,
  Crown,
  Sparkles,
} from "lucide-react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const RestaurantPreview: React.FC = () => {
  const navigate = useNavigate();
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const { location } = useRestaurantLocation();
  const { hours } = useOpeningHours();
  const { features } = useRestaurantFeatures();
  const { categories, items } = useMenu();
  const { images } = useGallery();
  const { offers } = useOffers();

  // Carousel state
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const activeOffers = offers.filter((offer) => offer.is_active);

  // Menu state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Auto-advance carousel
  useEffect(() => {
    if (activeOffers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % activeOffers.length);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [activeOffers.length]);

  // Auto-advance gallery
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [images.length]);

  const nextOffer = () => {
    setCurrentOfferIndex((prev) => (prev + 1) % activeOffers.length);
  };

  const prevOffer = () => {
    setCurrentOfferIndex(
      (prev) => (prev - 1 + activeOffers.length) % activeOffers.length
    );
  };

  // Filter items based on category and search
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

  if (restaurantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  const specialItems = items.filter(
    (item) => item.is_special && item.is_available
  );
  const todayHours = hours.find((h) => h.day_of_week === new Date().getDay());
  const isOpenNow = todayHours?.is_open || false;

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

  console.log("Component rendered. Restaurant data:", restaurant);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 w-full">
      {/* Floating Header */}
      <div className="fixed top-4 left-4 right-4 bg-white/90 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">
                {restaurant?.name}
              </h1>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
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

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200">
              <Heart className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200">
              <Share2 className="h-5 w-5" />
            </button>
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
              <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            )}
          </div>

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full px-6 sm:px-8 lg:px-12 pb-12">
              <div className="max-w-4xl">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight">
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
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Offers Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 text-white mr-3" />
                      <h2 className="text-3xl font-bold text-white">
                        🔥 Special Offers
                      </h2>
                    </div>
                    {activeOffers.length > 1 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-white/80 text-sm font-medium">
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
                                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-full text-sm font-bold border border-orange-200">
                                    🏷️ {offer.badge_text}
                                  </span>
                                )}

                                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                  {offer.name}
                                </h3>

                                {offer.description && (
                                  <p className="text-gray-600 text-lg leading-relaxed">
                                    {offer.description}
                                  </p>
                                )}

                                <div className="flex items-center space-x-4 pt-4">
                                  <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                                    Claim Offer
                                  </button>
                                  <span className="text-sm text-gray-500 flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Limited Time
                                  </span>
                                </div>
                              </div>

                              {/* Offer Image */}
                              {offer.image_url && (
                                <div className="lg:col-span-1">
                                  <div className="relative overflow-hidden rounded-2xl shadow-xl">
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
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl hover:shadow-2xl text-gray-700 p-3 rounded-full transition-all duration-300 border border-gray-200 hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextOffer}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl hover:shadow-2xl text-gray-700 p-3 rounded-full transition-all duration-300 border border-gray-200 hover:bg-gray-50"
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
                                ? "bg-orange-500 scale-125"
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
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
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* About & Cuisine */}
                <div className="lg:col-span-2 space-y-8">
                  {restaurant?.description && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <Utensils className="h-6 w-6 mr-3 text-blue-600" />
                        About Us
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {restaurant.description}
                      </p>
                    </div>
                  )}

                  {restaurant?.cuisine_types &&
                    restaurant.cuisine_types.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Cuisines We Serve
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {restaurant.cuisine_types.map((cuisine, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-800 rounded-xl text-sm font-semibold border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
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
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Contact & Location
                    </h3>

                    {restaurant?.contact_number && (
                      <div className="flex items-center mb-4 p-3 bg-white rounded-xl shadow-sm">
                        <Phone className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-semibold text-gray-900">
                            {restaurant.contact_number}
                          </p>
                        </div>
                      </div>
                    )}

                    {location && (
                      <div className="flex items-start mb-4 p-3 bg-white rounded-xl shadow-sm">
                        <MapPin className="h-5 w-5 text-red-600 mr-3 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {[
                              location.street,
                              location.city,
                              location.state,
                              location.zip_code,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <button className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-700 flex items-center">
                            <Navigation className="h-4 w-4 mr-1" />
                            Get Directions
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Opening Hours */}
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <div className="flex items-center mb-3">
                        <Clock className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Hours</p>
                          <p className="font-semibold text-gray-900">
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
                                isToday
                                  ? "font-semibold text-blue-600"
                                  : "text-gray-600"
                              }`}
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
                        <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-700">
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
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
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
                      className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <div className="text-green-600 mb-3 flex justify-center">
                        {getFeatureIcon(feature)}
                      </div>
                      <span className="text-sm font-semibold text-green-800">
                        {getFeatureLabel(feature)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ENHANCED MENU SECTION */}
          {categories.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Menu Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8">
                <div className="text-center">
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center justify-center">
                    <Utensils className="h-10 w-10 mr-4" />
                    Our Delicious Menu
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Discover our carefully crafted dishes
                  </p>
                </div>
              </div>

              <div className="p-8 lg:p-12">
                {/* Search and Filter Bar */}
                <div className="mb-8 space-y-4">
                  {/* Search Bar */}
                  <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search dishes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                        selectedCategory === "all"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Items
                    </button>

                    {specialItems.length > 0 && (
                      <button
                        onClick={() => setSelectedCategory("specials")}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center ${
                          selectedCategory === "specials"
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                            : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
                        }`}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Today's Specials
                      </button>
                    )}

                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
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
                          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 mr-3 text-yellow-500" />
                            Chef's Special Recommendations
                          </h3>
                          <p className="text-gray-600">
                            Limited time offerings crafted with love
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                          {specialItems.map((item) => (
                            <div
                              key={item.id}
                              className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-yellow-200 hover:border-yellow-300"
                            >
                              {/* Special Badge */}
                              <div className="absolute top-4 right-4 z-10">
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
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
                                  <h4 className="font-bold text-gray-900 text-xl group-hover:text-orange-600 transition-colors duration-200">
                                    {item.name}
                                  </h4>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">
                                      ₹{item.price}
                                    </div>
                                    <div className="flex items-center text-yellow-500 text-sm">
                                      <Star className="h-4 w-4 mr-1 fill-current" />
                                      Special
                                    </div>
                                  </div>
                                </div>

                                {item.description && (
                                  <p className="text-gray-600 text-sm leading-relaxed">
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
                            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-300"
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
                                <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-200">
                                  {item.name}
                                </h4>
                                <div className="text-xl font-bold text-green-600">
                                  ₹{item.price}
                                </div>
                              </div>

                              {item.description && (
                                <p className="text-gray-600 text-sm leading-relaxed">
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
                      <div className="text-gray-400 mb-4">
                        <Search className="h-16 w-16 mx-auto" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No items found
                      </h3>
                      <p className="text-gray-500">
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
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
                📸 Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
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
