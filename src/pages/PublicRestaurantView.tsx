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
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  X,
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
  // Add custom CSS for hiding scrollbars
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuGalleryExpanded, setMenuGalleryExpanded] = useState(false);
  
  // Full-screen image viewer state
  const [fullScreenImage, setFullScreenImage] = useState<{
    url: string;
    alt: string;
    images: { url: string; alt: string; name?: string }[];
    currentIndex: number;
  } | null>(null);
  
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

  // Keyboard event handling for full-screen viewer
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!fullScreenImage) return;
      
      if (e.key === 'Escape') {
        closeImageViewer();
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      }
    };

    if (fullScreenImage) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [fullScreenImage]);

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setSidebarOpen(false);
    }
  };

  // Full-screen image viewer functions
  const openImageViewer = (imageUrl: string, imageAlt: string, allImages: { url: string; alt: string; name?: string }[], startIndex: number) => {
    setFullScreenImage({
      url: imageUrl,
      alt: imageAlt,
      images: allImages,
      currentIndex: startIndex
    });
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  };

  const closeImageViewer = () => {
    setFullScreenImage(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!fullScreenImage) return;
    
    const newIndex = direction === 'next' 
      ? (fullScreenImage.currentIndex + 1) % fullScreenImage.images.length
      : (fullScreenImage.currentIndex - 1 + fullScreenImage.images.length) % fullScreenImage.images.length;
    
    const newImage = fullScreenImage.images[newIndex];
    setFullScreenImage({
      ...fullScreenImage,
      url: newImage.url,
      alt: newImage.alt,
      currentIndex: newIndex
    });
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "home_delivery":
        return <Home />;
      case "indoor_seating":
        return <Users />;
      case "air_conditioned":
        return <Wind />;
      case "accepts_cards":
        return <CreditCard />;
      case "family_friendly":
        return <Users />;
      default:
        return <Badge />;
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
               <button 
                 onClick={() => setSidebarOpen(true)}
                 className="p-2 rounded-lg transition-colors duration-200"
                 style={{ backgroundColor: currentTheme.colors.primary + "10" }}>
                 <Menu className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
               </button>
             </div>
           </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <div 
            className="fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b"
                 style={{ borderColor: currentTheme.colors.primary + "20" }}>
              <h3 className="text-xl font-bold"
                  style={{ 
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.fonts.heading 
                  }}>
                Navigation
              </h3>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg transition-colors duration-200"
                style={{ backgroundColor: currentTheme.colors.primary + "10" }}>
                <X className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
              </button>
            </div>
            
            {/* Navigation Links */}
            <div className="p-6">
              <div className="space-y-4">
                <button
                  onClick={() => scrollToSection('restaurant-info')}
                  className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                  style={{ backgroundColor: currentTheme.colors.primary + "10" }}
                >
                  <Star className="h-5 w-5 mr-3" style={{ color: currentTheme.colors.primary }} />
                  <span style={{ color: currentTheme.colors.text }}>Restaurant Info</span>
                </button>
                
                {activeOffers.length > 0 && (
                  <button
                    onClick={() => scrollToSection('special-offers')}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{ backgroundColor: currentTheme.colors.accent + "10" }}
                  >
                    <Award className="h-5 w-5 mr-3" style={{ color: currentTheme.colors.accent }} />
                    <span style={{ color: currentTheme.colors.text }}>Special Offers</span>
                  </button>
                )}
                
                {categories.length > 0 && (
                  <button
                    onClick={() => scrollToSection('menu')}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{ backgroundColor: currentTheme.colors.success + "10" }}
                  >
                    <Utensils className="h-5 w-5 mr-3" style={{ color: currentTheme.colors.success }} />
                    <span style={{ color: currentTheme.colors.text }}>Our Menu</span>
                  </button>
                )}
                
                {specialItems.length > 0 && (
                  <button
                    onClick={() => scrollToSection('chef-special')}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{ backgroundColor: currentTheme.colors.accent + "10" }}
                  >
                    <Sparkles className="h-5 w-5 mr-3" style={{ color: currentTheme.colors.accent }} />
                    <span style={{ color: currentTheme.colors.text }}>Chef's Special</span>
                  </button>
                )}
                
                {restaurant?.description && (
                  <button
                    onClick={() => scrollToSection('about-us')}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{ backgroundColor: currentTheme.colors.primary + "10" }}
                  >
                    <Utensils className="h-5 w-5 mr-3" style={{ color: currentTheme.colors.primary }} />
                    <span style={{ color: currentTheme.colors.text }}>About Us</span>
                  </button>
                )}
                
                <button
                  onClick={() => scrollToSection('contact-location')}
                  className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                  style={{ backgroundColor: currentTheme.colors.error + "10" }}
                >
                  <MapPin className="h-5 w-5 mr-3" style={{ color: currentTheme.colors.error }} />
                  <span style={{ color: currentTheme.colors.text }}>Contact & Location</span>
                </button>
                
                {features && (
                  <button
                    onClick={() => scrollToSection('features')}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{ backgroundColor: currentTheme.colors.success + "10" }}
                  >
                    <Badge className="h-5 w-5 mr-3" style={{ color: currentTheme.colors.success }} />
                    <span style={{ color: currentTheme.colors.text }}>What Makes Us Special</span>
                  </button>
                )}
                
                {images.length > 0 && (
                  <button
                    onClick={() => scrollToSection('gallery')}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{ backgroundColor: currentTheme.colors.accent + "10" }}
                  >
                    <Star className="h-5 w-5 mr-3" style={{ color: currentTheme.colors.accent }} />
                    <span style={{ color: currentTheme.colors.text }}>Gallery</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

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
        <div id="restaurant-info" className="bg-white shadow-lg border border-gray-100 p-4"
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
          <div id="special-offers">
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
         <div id="menu">
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

              {/* Menu Items - 2 Rows Horizontal Scroll */}
              <div className="space-y-4">
                {/* Create two arrays for two rows */}
                {(() => {
                  const itemsPerRow = Math.ceil(filteredItems.length / 2);
                  const firstRow = filteredItems.slice(0, itemsPerRow);
                  const secondRow = filteredItems.slice(itemsPerRow);
                  
                  return (
                    <>
                      {/* First Row */}
                      <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex space-x-3 pb-2" style={{ minWidth: 'max-content' }}>
                          {firstRow.map((item) => (
                            <div key={item.id} 
                                 className="flex-shrink-0 w-40 rounded-lg overflow-hidden border"
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
                                <div className="mb-2">
                                  <h4 className="font-bold text-sm leading-tight mb-1"
                                    style={{
                                      color: currentTheme.colors.text,
                                        fontFamily: currentTheme.fonts.heading 
                                      }}>
                                    {item.name}
                                  </h4>
                                  
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
                                
                                {/* Price */}
                                <div className="text-center">
                                  <span className="text-lg font-bold"
                                        style={{ color: currentTheme.colors.success || '#22c55e' }}>
                                      ₹{item.price}
                                  </span>
                                    </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Second Row */}
                      {secondRow.length > 0 && (
                        <div className="overflow-x-auto scrollbar-hide">
                          <div className="flex space-x-3 pb-2" style={{ minWidth: 'max-content' }}>
                            {secondRow.map((item) => (
                              <div key={item.id} 
                                   className="flex-shrink-0 w-40 rounded-lg overflow-hidden border"
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
                                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity duration-200" 
                                        onClick={() => {
                                          const menuImages = filteredItems
                                            .filter(i => i.image_url)
                                            .map(i => ({ url: i.image_url, alt: i.name, name: i.name }));
                                          const currentIndex = menuImages.findIndex(img => img.url === item.image_url);
                                          openImageViewer(item.image_url, item.name, menuImages, currentIndex);
                                        }}
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
                                  <div className="mb-2">
                                    <h4 className="font-bold text-sm leading-tight mb-1"
                                        style={{ 
                                          color: currentTheme.colors.text,
                                          fontFamily: currentTheme.fonts.heading 
                                        }}>
                                      {item.name}
                                    </h4>
                                    
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
                                  
                                  {/* Price */}
                                  <div className="text-center">
                                    <span className="text-lg font-bold"
                                          style={{ color: currentTheme.colors.success || '#22c55e' }}>
                                      ₹{item.price}
                                    </span>
                                  </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    </>
                  );
                })()}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-2" 
                          style={{ color: currentTheme.colors.textSecondary }} />
                  <p style={{ color: currentTheme.colors.textSecondary }}>
                    No items found
                  </p>
                </div>
              )}

              {/* Menu Images Gallery */}
              {filteredItems.filter(item => item.image_url).length > 0 && (
                <div className="mt-8 pt-6 border-t"
                     style={{ borderColor: currentTheme.colors.primary + "20" }}>
                  {!menuGalleryExpanded ? (
                    /* Collapsed View - One main image with count overlay */
                    <div className="relative">
                      <div className="grid grid-cols-3 gap-2 h-32">
                        {/* Main Image */}
                        <div className="col-span-2 rounded-lg overflow-hidden border"
                             style={{ borderColor: currentTheme.colors.primary + "20" }}>
                          {filteredItems.find(item => item.image_url) && (
                            <img 
                              src={filteredItems.find(item => item.image_url)?.image_url} 
                              alt="Menu item"
                              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity duration-200"
                              onClick={() => {
                                const menuImages = filteredItems
                                  .filter(i => i.image_url)
                                  .map(i => ({ url: i.image_url, alt: i.name, name: i.name }));
                                openImageViewer(filteredItems.find(item => item.image_url)!.image_url, filteredItems.find(item => item.image_url)!.name, menuImages, 0);
                              }}
                            />
                          )}
                        </div>

                        {/* Second Image with Overlay */}
                        <div className="relative rounded-lg overflow-hidden border"
                             style={{ borderColor: currentTheme.colors.primary + "20" }}>
                          {filteredItems.filter(item => item.image_url)[1] && (
                            <>
                              <img 
                                src={filteredItems.filter(item => item.image_url)[1]?.image_url} 
                                alt="Menu item"
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => {
                                  const menuImages = filteredItems
                                    .filter(i => i.image_url)
                                    .map(i => ({ url: i.image_url, alt: i.name, name: i.name }));
                                  openImageViewer(filteredItems.filter(item => item.image_url)[1]!.image_url, filteredItems.filter(item => item.image_url)[1]!.name, menuImages, 1);
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                <button 
                                  onClick={() => setMenuGalleryExpanded(true)}
                                  className="text-white font-bold text-sm"
                                >
                                  +{filteredItems.filter(item => item.image_url).length - 1} More...
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Expanded View - Horizontal Scrollable */
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold"
                            style={{ 
                              color: currentTheme.colors.text,
                              fontFamily: currentTheme.fonts.heading 
                            }}>
                          Menu Images
                        </h4>
                        <button 
                          onClick={() => setMenuGalleryExpanded(false)}
                          className="text-sm font-medium px-3 py-1 rounded-lg"
                          style={{ 
                            color: currentTheme.colors.primary,
                            backgroundColor: currentTheme.colors.primary + "10"
                          }}
                        >
                          Collapse
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex space-x-3 pb-2" style={{ minWidth: 'max-content' }}>
                          {filteredItems.filter(item => item.image_url).map((item, index) => (
                            <div key={`menu-img-${index}`} 
                                 className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border hover:scale-105 transition-transform duration-300"
                                 style={{ borderColor: currentTheme.colors.primary + "20" }}>
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="w-full h-full object-cover cursor-pointer" 
                                onClick={() => {
                                  const menuImages = filteredItems
                                    .filter(i => i.image_url)
                                    .map(i => ({ url: i.image_url, alt: i.name, name: i.name }));
                                  openImageViewer(item.image_url, item.name, menuImages, index);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
        )}

        {/* Chef's Special Recommendations */}
        {specialItems.length > 0 && (
          <div id="chef-special">
            <div className="rounded-xl shadow-lg border overflow-hidden"
                            style={{
                              backgroundColor: currentTheme.colors.surface,
                   borderColor: currentTheme.colors.primary + "20"
                 }}>
              {/* Header Section */}
              <div className="text-center py-6 px-4"
                   style={{ backgroundColor: currentTheme.colors.background }}>
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 fill-current" 
                        style={{ color: currentTheme.colors.accent || '#fbbf24' }} />
                </div>
                <h3 className="text-xl font-bold mb-2"
                    style={{ 
                      color: currentTheme.colors.text,
                      fontFamily: currentTheme.fonts.heading 
                    }}>
                  Chef's Special Recommendations
                </h3>
                <p className="text-sm"
                   style={{ color: currentTheme.colors.textSecondary }}>
                  Limited time offerings crafted with love
                </p>
              </div>

              {/* Horizontal Scrollable Items */}
              <div className="p-4">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex space-x-4 pb-2" style={{ minWidth: 'max-content' }}>
                    {specialItems.map((item) => (
                      <div key={item.id} className="flex-shrink-0 w-48">
                        <div className="text-center">
                          {/* Circular Image with Price Badge */}
                          <div className="relative inline-block mb-3">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 mx-auto"
                                 style={{ borderColor: currentTheme.colors.primary + "30" }}>
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"
                                     style={{ backgroundColor: currentTheme.colors.background }}>
                                  <Utensils className="h-8 w-8"
                                            style={{ color: currentTheme.colors.textSecondary }} />
                              </div>
                            )}
                            </div>
                            
                            {/* Vegetarian Indicator */}
                            <div className="absolute top-0 left-0">
                              <div className="w-4 h-4 border rounded-sm flex items-center justify-center"
                                   style={{ 
                                     borderColor: currentTheme.colors.success || '#22c55e',
                                     backgroundColor: currentTheme.colors.surface
                                   }}>
                                <div className="w-2 h-2 rounded-full"
                                     style={{ backgroundColor: currentTheme.colors.success || '#22c55e' }}>
                                </div>
                              </div>
                            </div>
                            
                            {/* Price Badge */}
                            <div className="absolute -top-1 -right-1">
                              <div className="px-2 py-1 rounded text-xs font-bold border"
                                   style={{
                                     backgroundColor: currentTheme.colors.surface,
                                     borderColor: currentTheme.colors.primary + "30",
                                     color: currentTheme.colors.text
                                   }}>
                                Rs. {item.price}
                              </div>
                            </div>
                          </div>
                          
                          {/* Item Name */}
                          <h4 className="font-bold text-sm mb-2 leading-tight"
                                  style={{
                                    color: currentTheme.colors.text,
                                fontFamily: currentTheme.fonts.heading 
                              }}>
                                  {item.name}
                                </h4>
                          
                          {/* Description */}
                              {item.description && (
                            <div className="text-xs leading-relaxed"
                                 style={{ color: currentTheme.colors.textSecondary }}>
                              <p className="mb-1">
                                {item.description.length > 80 
                                  ? `${item.description.substring(0, 80)}...` 
                                  : item.description}
                              </p>
                              {item.description.length > 80 && (
                                <button className="font-medium"
                                        style={{ color: currentTheme.colors.primary }}>
                                  Read more
                                </button>
                              )}
                            </div>
                              )}
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>
                    </div>
                  )}

                {/* About Us */}
        {restaurant?.description && (
          <div id="about-us" className="rounded-xl shadow-lg border p-4"
               style={{
                 backgroundColor: currentTheme.colors.surface,
                 borderColor: currentTheme.colors.primary + "20"
               }}>
            <h3 className="text-lg font-bold mb-3 flex items-center"
                style={{ 
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.fonts.heading 
                }}>
              <Utensils className="h-5 w-5 mr-2" style={{ color: currentTheme.colors.primary }} />
              About Us
            </h3>
            <p className="text-sm leading-relaxed"
               style={{ color: currentTheme.colors.textSecondary }}>
              {restaurant.description}
            </p>
          </div>
        )}

                {/* Contact & Location */}
        <div id="contact-location" className="rounded-xl shadow-lg border p-6"
             style={{
               backgroundColor: currentTheme.colors.surface,
               borderColor: currentTheme.colors.primary + "20"
             }}>
          <h3 className="text-2xl font-bold mb-6"
              style={{ 
                color: currentTheme.colors.text,
                fontFamily: currentTheme.fonts.heading 
              }}>
            Contact & Location
          </h3>
          
          <div className="space-y-6">
            {/* Address Section */}
            {location && (
              <div>
                <h4 className="text-lg font-semibold mb-2"
                    style={{ 
                      color: currentTheme.colors.text,
                      fontFamily: currentTheme.fonts.heading 
                    }}>
                  Address
                </h4>
                <p className="text-base mb-2"
                   style={{ color: currentTheme.colors.textSecondary }}>
                  {[
                    location.street,
                    location.city,
                    location.state,
                    location.zip_code,
                    'US'
                  ].filter(Boolean).join(', ')}
                </p>
                <button className="text-base font-medium"
                        style={{ color: currentTheme.colors.primary }}>
                  Get Directions
                </button>
              </div>
            )}

            {/* Hours Section */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-semibold"
                    style={{ 
                      color: currentTheme.colors.text,
                      fontFamily: currentTheme.fonts.heading 
                    }}>
                  Hours
                </h4>
                <span className="text-base font-medium"
                      style={{ 
                        color: isOpenNow 
                          ? currentTheme.colors.success || '#22c55e'
                          : currentTheme.colors.error || '#ef4444'
                      }}>
                  {isOpenNow ? "Open Now" : "Closed"}
                </span>
              </div>
              
              <div className="space-y-1">
                {DAYS.map((day, index) => {
                  const dayHours = hours.find((h) => h.day_of_week === index);
                  const isToday = index === new Date().getDay();
                  return (
                    <div key={day} className="flex justify-between text-sm">
                      <span style={{ 
                        color: isToday 
                          ? currentTheme.colors.text 
                          : currentTheme.colors.textSecondary,
                        fontWeight: isToday ? 'bold' : 'normal'
                      }}>
                        {day}:
                      </span>
                      <span style={{ 
                        color: isToday 
                          ? currentTheme.colors.text 
                          : currentTheme.colors.textSecondary,
                        fontWeight: isToday ? 'bold' : 'normal'
                      }}>
                        {dayHours?.is_open 
                          ? `${dayHours.open_time} - ${dayHours.close_time}`
                          : "Closed"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Section */}
            {restaurant?.contact_number && (
              <div>
                <h4 className="text-lg font-semibold mb-2"
                    style={{ 
                      color: currentTheme.colors.text,
                      fontFamily: currentTheme.fonts.heading 
                    }}>
                  Contact
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-lg"
                        style={{ color: currentTheme.colors.textSecondary }}>
                    {restaurant.contact_number}
                  </span>
                  <button className="text-base font-medium"
                          style={{ color: currentTheme.colors.primary }}>
                    Call now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

                {/* What Makes Us Special */}
        {features && (
          <div id="features" className="rounded-xl shadow-lg border p-6"
               style={{
                 backgroundColor: currentTheme.colors.surface,
                 borderColor: currentTheme.colors.primary + "20"
               }}>
            <h3 className="text-2xl font-bold mb-8 text-center"
                style={{ 
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.fonts.heading 
                }}>
              What Makes Us Special
            </h3>
            <div className="grid grid-cols-2 gap-8">
              {Object.entries(features)
                .filter(([key, value]) => key !== "id" && key !== "restaurant_id" && value === true)
                .map(([feature], index) => {
                  const colors = [
                    currentTheme.colors.success || '#22c55e',    // Green
                    currentTheme.colors.primary || '#3b82f6',    // Blue  
                    currentTheme.colors.accent || '#8b5cf6',     // Purple
                    currentTheme.colors.error || '#ef4444'       // Red
                  ];
                  const iconColor = colors[index % colors.length];
                  
                  const descriptions = {
                    'home_delivery': 'Fast delivery to your door',
                    'indoor_seating': 'Comfortable dining space', 
                    'air_conditioned': 'Cool and comfortable',
                    'accepts_cards': 'Easy payment options',
                    'family_friendly': 'Perfect for all ages'
                  };
                  
                  return (
                    <div key={feature} className="text-center p-4">
                      {/* Icon */}
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                             style={{ backgroundColor: iconColor + "10" }}>
                          <div style={{ color: iconColor }}>
                            {React.cloneElement(getFeatureIcon(feature), { 
                              className: "h-8 w-8" 
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h4 className="text-lg font-bold mb-2"
                          style={{ 
                            color: currentTheme.colors.text,
                            fontFamily: currentTheme.fonts.heading 
                          }}>
                        {getFeatureLabel(feature)}
                      </h4>
                      
                      {/* Description */}
                      <p className="text-sm"
                         style={{ color: currentTheme.colors.textSecondary }}>
                        {descriptions[feature as keyof typeof descriptions] || 'Great service feature'}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

                  {/* Gallery */}
        {images.length > 0 && (
          <div id="gallery" className="rounded-xl shadow-lg border p-6"
               style={{
                 backgroundColor: currentTheme.colors.surface,
                 borderColor: currentTheme.colors.primary + "20"
               }}>
            {/* Header Section */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <Star className="h-8 w-8 fill-current" 
                      style={{ color: currentTheme.colors.accent || '#fbbf24' }} />
              </div>
              <h3 className="text-2xl font-bold mb-2"
                  style={{ 
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.fonts.heading 
                  }}>
                Gallery
              </h3>
              <p className="text-sm"
                 style={{ color: currentTheme.colors.textSecondary }}>
                Limited time offerings crafted with love
              </p>
            </div>

            {/* Horizontally Scrollable Gallery */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-4 pb-2" style={{ minWidth: 'max-content' }}>
                {images.map((image, index) => (
                  <div key={image.id} 
                       className="flex-shrink-0 w-64 aspect-[4/3] rounded-lg overflow-hidden border hover:scale-105 transition-transform duration-300"
                       style={{ borderColor: currentTheme.colors.primary + "20" }}>
                    <img 
                      src={image.image_url} 
                      alt={image.alt_text} 
                      className="w-full h-full object-cover cursor-pointer" 
                      onClick={() => {
                        const galleryImages = images.map(img => ({ 
                          url: img.image_url, 
                          alt: img.alt_text, 
                          name: img.alt_text 
                        }));
                        openImageViewer(image.image_url, image.alt_text, galleryImages, index);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t"
                style={{ 
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.primary + "20"
                }}>
          <div className="px-4 py-8">
            {/* Quick Links and Logo Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Quick Links - Left Column */}
              <div>
                <h4 className="text-lg font-bold mb-4"
                    style={{ 
                      color: currentTheme.colors.text,
                      fontFamily: currentTheme.fonts.heading 
                    }}>
                  Quick Links
                </h4>
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <a href="#" className="block text-sm hover:underline"
                     style={{ color: currentTheme.colors.textSecondary }}>
                    Home
                  </a>
                  <a href="#" className="block text-sm hover:underline"
                     style={{ color: currentTheme.colors.textSecondary }}>
                    About Us
                  </a>
                  <a href="#" className="block text-sm hover:underline"
                     style={{ color: currentTheme.colors.textSecondary }}>
                    Contact
                  </a>
                  <a href="#" className="block text-sm hover:underline"
                     style={{ color: currentTheme.colors.textSecondary }}>
                    Menu
                  </a>
                </div>
                <div className="text-center lg:text-right mr-4">
                <img 
                  src="/assets/image.png" 
                  alt="EnerZy Flow" 
                  className="h-16 mx-auto lg:mx-0 lg:ml-auto mb-4"
                />
                <div className="flex justify-center lg:justify-end space-x-4 mr-4 ">
                  <a href="#" className="p-2 rounded-full transition-colors duration-200"
                     style={{ 
                       backgroundColor: currentTheme.colors.primary + "10",
                       color: currentTheme.colors.primary 
                     }}>
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="p-2 rounded-full transition-colors duration-200"
                     style={{ 
                       backgroundColor: currentTheme.colors.primary + "10",
                       color: currentTheme.colors.primary 
                     }}>
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="p-2 rounded-full transition-colors duration-200"
                     style={{ 
                       backgroundColor: currentTheme.colors.primary + "10",
                       color: currentTheme.colors.primary 
                     }}>
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="p-2 rounded-full transition-colors duration-200"
                     style={{ 
                       backgroundColor: currentTheme.colors.primary + "10",
                       color: currentTheme.colors.primary 
                     }}>
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
                </div>
                
                
              </div>

              {/* Logo Section */}
              
            </div>

            {/* Copyright and Powered By Section */}
            <div className="border-t pt-6 flex flex-col lg:flex-row justify-between items-center gap-2"
                 style={{ borderColor: currentTheme.colors.primary + "20" }}>
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: currentTheme.colors.textSecondary }}>
                  Powered By
                </span>
                <span className="font-bold"
                      style={{ color: currentTheme.colors.primary }}>
                  EnerZyFlow
                </span>
              </div>
              
              <div className="text-sm"
                   style={{ color: currentTheme.colors.textSecondary }}>
                © 2025 All Rights Reserved
              </div>
            </div>
          </div>
        </footer>
        
      </div>

      {/* Full-Screen Image Viewer Modal */}
      {fullScreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeImageViewer}
            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-50 px-4 py-2 rounded-full bg-black bg-opacity-50 text-white text-sm">
            {fullScreenImage.currentIndex + 1} of {fullScreenImage.images.length}
          </div>

          {/* Previous Button */}
          {fullScreenImage.images.length > 1 && (
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next Button */}
          {fullScreenImage.images.length > 1 && (
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Main Image */}
          <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={fullScreenImage.url}
              alt={fullScreenImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Image Info */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md text-center">
            <div className="px-4 py-2 rounded-full bg-black bg-opacity-50 text-white text-sm">
              {fullScreenImage.alt}
            </div>
          </div>

          {/* Click outside to close */}
          <div 
            className="absolute inset-0 z-40" 
            onClick={closeImageViewer}
          ></div>
        </div>
      )}
    </div>
  );
};
