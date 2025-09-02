/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  MapPin,
  Star,
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
  Menu,
  Search,
  Flame,
  Sparkles,
  Facebook,
  Instagram,
  X,
  Info,
  Tag,
  Phone,
  Gift,
  Linkedin,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import SpinWheel from "./SpinWheel";
import mainLogo from "../assets/image.png";
import { useHorizontalScroll } from "../hooks/useHorizontalScroll";

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
  is_spin: boolean;
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
  is_banner: boolean;
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
    const style = document.createElement("style");
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
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [bannerImages, setBannerImages] = useState<GalleryImage[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isOpenNow, setIsOpenNow] = useState(false);

  // Menu state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categoriesScrollRef = useHorizontalScroll();
  const menuItemsScrollRef = useHorizontalScroll();
  const specialItemsScrollRef = useHorizontalScroll();
  const galleryScrollRef = useHorizontalScroll();

  // Carousel state
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Full-screen image viewer state
  const [fullScreenImage, setFullScreenImage] = useState<{
    url: string;
    alt: string;
    images: { url: string; alt: string; name?: string }[];
    currentIndex: number;
  } | null>(null);

  // Touch states for swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const activeOffers = offers.filter((offer) => offer.is_active);

  // Convert URL-friendly name back to search for restaurant
  const getSearchableName = (urlName: string) => {
    return urlName.replace(/-/g, " ");
  };

  // ADD ALL ENHANCED FUNCTIONS HERE:
  const resetZoomAndPan = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setImageLoaded(false);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  // const handleDoubleClick = () => {
  //   if (zoomLevel === 1) {
  //     setZoomLevel(2);
  //   } else {
  //     setZoomLevel(1);
  //     setPanPosition({ x: 0, y: 0 });
  //   }
  // };

  // // Mouse handlers for desktop pan
  // const handleMouseDown = (e: React.MouseEvent) => {
  //   if (zoomLevel > 1) {
  //     setIsDragging(true);
  //     setDragStart({
  //       x: e.clientX - panPosition.x,
  //       y: e.clientY - panPosition.y,
  //     });
  //   }
  // };

  // const handleMouseMove = (e: React.MouseEvent) => {
  //   if (isDragging && zoomLevel > 1) {
  //     setPanPosition({
  //       x: e.clientX - dragStart.x,
  //       y: e.clientY - dragStart.y,
  //     });
  //   }
  // };

  // const handleMouseUp = () => {
  //   setIsDragging(false);
  // };

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
      setShowSpinWheel(restaurantData.is_spin || false);

      const [
        locationResult,
        hoursResult,
        featuresResult,
        categoriesResult,
        itemsResult,
        bannerImagesResult,
        galleryImagesResult,
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
          .eq("is_banner", true)
          .order("display_order"),
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
      setBannerImages(bannerImagesResult.data ?? []);
      setGalleryImages(galleryImagesResult.data ?? []);
      setOffers(offersResult.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load restaurant data");
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = () => {
    if (location) {
      window.open(location.maps_embed_link, "_blank", "noopener,noreferrer");
    }
  };

  const formatTime12Hour = (time24h: string): string => {
    if (!time24h) return "";

    const [hours, minutes] = time24h.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    // Always show minutes with proper padding
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
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
    if (bannerImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [bannerImages.length]);

  // Add this useEffect to calculate if restaurant is open now
  useEffect(() => {
    const checkIfOpen = () => {
      if (!hours || hours.length === 0) {
        setIsOpenNow(false);
        return;
      }

      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentTime = now.toTimeString().slice(0, 5); // Get HH:MM format

      // Find today's hours
      const todayHours = hours.find((h) => h.day_of_week === currentDay);

      if (!todayHours || !todayHours.is_open) {
        setIsOpenNow(false);
        return;
      }

      // Compare current time with opening hours
      const openTime = todayHours.open_time;
      const closeTime = todayHours.close_time;

      // Convert times to minutes for easy comparison
      const timeToMinutes = (time: any) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const currentMinutes = timeToMinutes(currentTime);
      const openMinutes = timeToMinutes(openTime);
      const closeMinutes = timeToMinutes(closeTime);

      // Handle cases where closing time is after midnight
      if (closeMinutes < openMinutes) {
        // Restaurant closes after midnight (e.g., opens at 18:00, closes at 02:00)
        setIsOpenNow(
          currentMinutes >= openMinutes || currentMinutes < closeMinutes
        );
      } else {
        // Normal hours (e.g., opens at 09:00, closes at 22:00)
        setIsOpenNow(
          currentMinutes >= openMinutes && currentMinutes < closeMinutes
        );
      }
    };

    // Check immediately when hours data changes
    checkIfOpen();

    // Update every minute to keep status current
    const interval = setInterval(checkIfOpen, 60000);

    return () => clearInterval(interval);
  }, [hours]); // Re-run when hours data changes

  // REPLACE THE EXISTING navigateImage WITH THIS:
  const navigateImageEnhanced = useCallback(
    (direction: "prev" | "next") => {
      if (!fullScreenImage) return;

      const newIndex =
        direction === "next"
          ? (fullScreenImage.currentIndex + 1) % fullScreenImage.images.length
          : (fullScreenImage.currentIndex - 1 + fullScreenImage.images.length) %
            fullScreenImage.images.length;

      const newImage = fullScreenImage.images[newIndex];
      setFullScreenImage({
        ...fullScreenImage,
        url: newImage.url,
        alt: newImage.alt,
        currentIndex: newIndex,
      });

      // Reset zoom and pan for new image
      resetZoomAndPan();
    },
    [fullScreenImage]
  );

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!fullScreenImage) return;

      switch (e.key) {
        case "Escape":
          closeImageViewerEnhanced();
          break;
        case "ArrowLeft":
          e.preventDefault();
          navigateImageEnhanced("prev"); // Works regardless of zoom level
          break;
        case "ArrowRight":
          e.preventDefault();
          navigateImageEnhanced("next"); // Works regardless of zoom level
          break;
        case " ": // Spacebar
          e.preventDefault();
          navigateImageEnhanced("next");
          break;
        case "=":
        case "+":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0": // Reset zoom
          e.preventDefault();
          setZoomLevel(1);
          setPanPosition({ x: 0, y: 0 });
          break;
      }
    };

    if (fullScreenImage) {
      document.addEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "unset";
    };
  }, [fullScreenImage, navigateImageEnhanced]);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "specials" && item.is_special) ||
      item.category_id === selectedCategory;

    return item.is_available && matchesCategory;
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setSidebarOpen(false);
    }
  };

  // Full-screen image viewer functions
  const closeImageViewerEnhanced = () => {
    setFullScreenImage(null);
    resetZoomAndPan();
    document.body.style.overflow = "unset";
  };

  const openImageViewerEnhanced = (
    imageUrl: string,
    imageAlt: string,
    allImages: { url: string; alt: string; name?: string }[],
    startIndex: number
  ) => {
    setFullScreenImage({
      url: imageUrl,
      alt: imageAlt,
      images: allImages,
      currentIndex: startIndex,
    });
    resetZoomAndPan();
    document.body.style.overflow = "hidden";
  };

  // Touch handlers for swipe support
  const minSwipeDistance = 50;

  // REPLACE EXISTING TOUCH HANDLERS WITH THESE:
  const handleTouchStartEnhanced = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - for panning or navigation swipe
      setTouchEnd(null);
      setTouchStart(e.touches[0].clientX);

      if (zoomLevel > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - panPosition.x,
          y: e.touches[0].clientY - panPosition.y,
        });
      }
    } else if (e.touches.length === 2) {
      // Two touches - could implement pinch zoom here
      e.preventDefault();
    }
  };

  const handleTouchMoveEnhanced = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchEnd(e.touches[0].clientX);

      if (isDragging && zoomLevel > 1) {
        setPanPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        });
      }
    }
  };

  const handleTouchEndEnhanced = () => {
    setIsDragging(false);

    if (!touchStart || !touchEnd || zoomLevel > 1) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && fullScreenImage) {
      navigateImageEnhanced("next");
    }
    if (isRightSwipe && fullScreenImage) {
      navigateImageEnhanced("prev");
    }
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4"
            style={{
              borderColor: currentTheme.colors.primary + "30",
              borderTopColor: currentTheme.colors.primary,
            }}
          ></div>
          <p
            style={{ color: currentTheme.colors.textSecondary }}
            className="font-medium"
          >
            Loading restaurant...
          </p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🍽️</div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: currentTheme.colors.text }}
          >
            Restaurant Not Found
          </h1>
          <p
            className="mb-6"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {error || "The restaurant you're looking for doesn't exist."}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.surface,
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

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      {/* FIXED: Sticky Header with proper containment */}
      <div
        className="sticky top-0 z-[100] backdrop-blur-md w-full"
        style={{
          backgroundColor: currentTheme.colors.surface + "F0",
          borderBottom: `2px solid ${currentTheme.colors.primary}30`,
          boxShadow: `0 4px 20px ${currentTheme.colors.primary}10`,
        }}
      >
        <div className="w-full max-w-full mx-auto px-2 sm:px-4 py-2">
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-[1fr_auto] gap-4 items-center w-full">
            {/* Left Section - Restaurant Info */}
            <div className="min-w-0 max-w-full">
              <div className="flex items-center space-x-2 lg:space-x-4 min-w-0">
                <div className="min-w-0 flex-1">
                  <h1
                    className="text-lg xl:text-2xl font-bold mb-1 truncate"
                    style={{
                      color: currentTheme.colors.text,
                      fontFamily: currentTheme.fonts.heading,
                    }}
                  >
                    {restaurant?.name}
                  </h1>
                  <div className="flex items-center space-x-1 lg:space-x-2 text-sm flex-wrap">
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Star
                        className="h-3 w-3 xl:h-4 xl:w-4 fill-current"
                        style={{ color: currentTheme.colors.accent }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: currentTheme.colors.text }}
                      >
                        {restaurant?.rating ?? "0.0"}
                      </span>
                    </div>
                    {location && (
                      <div className="flex items-center space-x-1 min-w-0 max-w-[100px] lg:max-w-[150px]">
                        <MapPin
                          className="h-3 w-3 xl:h-4 xl:w-4 flex-shrink-0"
                          style={{ color: currentTheme.colors.primary }}
                        />
                        <span
                          className="opacity-70 text-xs xl:text-sm truncate"
                          style={{ color: currentTheme.colors.text }}
                        >
                          {location.city}, {location.state}
                        </span>
                      </div>
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0`}
                      style={{
                        backgroundColor: isOpenNow
                          ? currentTheme.colors.success + "20"
                          : currentTheme.colors.error + "20",
                        color: isOpenNow
                          ? currentTheme.colors.success
                          : currentTheme.colors.error,
                      }}
                    >
                      {isOpenNow ? "Open" : "Closed"}
                      {(() => {
                        const todayHours = hours.find(
                          (h) => h.day_of_week === new Date().getDay()
                        );
                        return todayHours && isOpenNow ? (
                          <span className="ml-1 opacity-70 hidden xl:inline">
                            • Closes {formatTime12Hour(todayHours.close_time)}
                          </span>
                        ) : null;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Navigation */}
            <nav className="flex items-center space-x-1 flex-shrink-0">
              {[
                {
                  id: "restaurant-info",
                  label: "Info",
                  icon: Info,
                  color: currentTheme.colors.primary,
                },
                {
                  id: "menu",
                  label: "Menu",
                  icon: Utensils,
                  show: categories.length > 0,
                  color: currentTheme.colors.success,
                },
                {
                  id: "special-offers",
                  label: "Offers",
                  icon: Tag,
                  show: activeOffers.length > 0,
                  color: currentTheme.colors.accent,
                },
                {
                  id: "gallery",
                  label: "Gallery",
                  icon: Star,
                  show: images.length > 0,
                  color: currentTheme.colors.accent,
                },
                {
                  id: "contact-location",
                  label: "Contact",
                  icon: Phone,
                  color: currentTheme.colors.error,
                },
              ]
                .filter((item) => item.show !== false)
                .slice(0, 4)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="flex items-center space-x-1 px-1 xl:px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex-shrink-0"
                    style={{
                      color: currentTheme.colors.text,
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        (item.color || currentTheme.colors.primary) + "15";
                      e.currentTarget.style.color =
                        item.color || currentTheme.colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = currentTheme.colors.text;
                    }}
                  >
                    <item.icon
                      className="h-5 w-5 flex-shrink-0"
                      style={{
                        color: item.color || currentTheme.colors.primary,
                      }}
                    />
                    <span className="hidden xl:inline text-xs xl:text-base truncate max-w-[60px]">
                      {item.label}
                    </span>
                  </button>
                ))}
            </nav>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <h1
                className="text-lg md:text-xl font-bold truncate max-w-[200px] sm:max-w-[300px]"
                style={{
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.fonts.heading,
                }}
              >
                {restaurant?.name}
              </h1>
              <div className="md:flex items-center space-x-2 hidden">
                <div className="flex items-center space-x-1">
                  <Star
                    className="h-4 w-4 fill-current"
                    style={{ color: currentTheme.colors.accent }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {restaurant?.rating ?? "0.0"}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0`}
                  style={{
                    backgroundColor: isOpenNow
                      ? currentTheme.colors.success + "20"
                      : currentTheme.colors.error + "20",
                    color: isOpenNow
                      ? currentTheme.colors.success
                      : currentTheme.colors.error,
                  }}
                >
                  {isOpenNow ? "Open" : "Closed"}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                aria-label="Open Menu"
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 rounded-lg transition-colors duration-200"
                style={{ backgroundColor: currentTheme.colors.primary + "10" }}
              >
                <Menu
                  className="h-5 w-5"
                  style={{ color: currentTheme.colors.primary }}
                />
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
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: currentTheme.colors.primary + "20" }}
            >
              <h3
                className="text-xl font-bold"
                style={{
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.fonts.heading,
                }}
              >
                Navigation
              </h3>
              <button
                aria-label="Close Sidebar"
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg transition-colors duration-200"
                style={{ backgroundColor: currentTheme.colors.primary + "10" }}
              >
                <X
                  className="h-5 w-5"
                  style={{ color: currentTheme.colors.primary }}
                />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-6">
              <div className="space-y-4">
                <button
                  onClick={() => scrollToSection("restaurant-info")}
                  className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                  style={{
                    backgroundColor: currentTheme.colors.primary + "10",
                  }}
                >
                  <Star
                    className="h-5 w-5 mr-3"
                    style={{ color: currentTheme.colors.primary }}
                  />
                  <span style={{ color: currentTheme.colors.text }}>
                    Restaurant Info
                  </span>
                </button>

                {activeOffers.length > 0 && (
                  <button
                    onClick={() => scrollToSection("special-offers")}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{
                      backgroundColor: currentTheme.colors.accent + "10",
                    }}
                  >
                    <Award
                      className="h-5 w-5 mr-3"
                      style={{ color: currentTheme.colors.accent }}
                    />
                    <span style={{ color: currentTheme.colors.text }}>
                      Special Offers
                    </span>
                  </button>
                )}

                {categories.length > 0 && (
                  <button
                    onClick={() => scrollToSection("menu")}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{
                      backgroundColor: currentTheme.colors.success + "10",
                    }}
                  >
                    <Utensils
                      className="h-5 w-5 mr-3"
                      style={{ color: currentTheme.colors.success }}
                    />
                    <span style={{ color: currentTheme.colors.text }}>
                      Our Menu
                    </span>
                  </button>
                )}

                {specialItems.length > 0 && (
                  <button
                    onClick={() => scrollToSection("chef-special")}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{
                      backgroundColor: currentTheme.colors.accent + "10",
                    }}
                  >
                    <Sparkles
                      className="h-5 w-5 mr-3"
                      style={{ color: currentTheme.colors.accent }}
                    />
                    <span style={{ color: currentTheme.colors.text }}>
                      Chef's Special
                    </span>
                  </button>
                )}

                {restaurant?.description && (
                  <button
                    onClick={() => scrollToSection("about-us")}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{
                      backgroundColor: currentTheme.colors.primary + "10",
                    }}
                  >
                    <Utensils
                      className="h-5 w-5 mr-3"
                      style={{ color: currentTheme.colors.primary }}
                    />
                    <span style={{ color: currentTheme.colors.text }}>
                      About Us
                    </span>
                  </button>
                )}

                <button
                  onClick={() => scrollToSection("contact-location")}
                  className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                  style={{ backgroundColor: currentTheme.colors.error + "10" }}
                >
                  <MapPin
                    className="h-5 w-5 mr-3"
                    style={{ color: currentTheme.colors.error }}
                  />
                  <span style={{ color: currentTheme.colors.text }}>
                    Contact & Location
                  </span>
                </button>

                {features && (
                  <button
                    onClick={() => scrollToSection("features")}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{
                      backgroundColor: currentTheme.colors.success + "10",
                    }}
                  >
                    <Badge
                      className="h-5 w-5 mr-3"
                      style={{ color: currentTheme.colors.success }}
                    />
                    <span style={{ color: currentTheme.colors.text }}>
                      What Makes Us Special
                    </span>
                  </button>
                )}

                {images.length > 0 && (
                  <button
                    onClick={() => scrollToSection("gallery")}
                    className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{
                      backgroundColor: currentTheme.colors.accent + "10",
                    }}
                  >
                    <Star
                      className="h-5 w-5 mr-3"
                      style={{ color: currentTheme.colors.accent }}
                    />
                    <span style={{ color: currentTheme.colors.text }}>
                      Gallery
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* FIXED: Main Content Container */}
      <div className="w-full max-w-full">
        {/* Hero Image with Restaurant Info */}
        <div className="relative h-64 md:h-80 lg:h-[32rem] rounded-xl overflow-hidden shadow-2xl group mx-4">
          {bannerImages.length > 0 ? (
            <>
              <img
                src={bannerImages[currentImageIndex]?.image_url}
                alt={bannerImages[currentImageIndex]?.alt_text}
                className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110"
              />
              {/* Image Navigation Dots */}
              {bannerImages.length > 1 && (
                <div className="absolute top-4 right-4 flex space-x-1">
                  {bannerImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? "bg-white scale-125"
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${currentTheme.gradients.hero}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        {/* FIXED: Content Container with proper spacing */}
        <div className="space-y-4 px-4 mt-4">
          {/* Restaurant Information Section */}
          <div className="space-y-6">
            <div
              id="restaurant-info"
              className="shadow-md rounded-xl border overflow-hidden"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + "10",
              }}
            >
              {/* Header Section with Background */}
              <div
                className="px-6 py-4 border-b"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.primary + "10",
                }}
              >
                <div className="flex items-start justify-between">
                  {/* Left Section - Name and Location */}
                  <div className="flex-1">
                    <h2
                      className="text-3xl font-bold mb-2 leading-tight"
                      style={{
                        color: currentTheme.colors.text,
                        fontFamily: currentTheme.fonts.heading,
                      }}
                    >
                      {restaurant?.name}
                    </h2>
                    <div className="flex items-center text-base mb-2">
                      <MapPin
                        className="h-4 w-4 mr-2"
                        style={{ color: currentTheme.colors.primary }}
                      />
                      <span
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        {location?.city && location?.state
                          ? `${location.city}, ${location.state}`
                          : "Location"}
                      </span>
                    </div>
                    {location && (
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        {[
                          location.street,
                          location.city,
                          location.state,
                          location.zip_code,
                          "India",
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Right Section - Status and Quick Info */}
                  <div className="text-right space-y-3">
                    {/* Status Badge */}
                    <div
                      className="px-4 py-2 rounded-full font-semibold text-sm shadow-sm inline-block"
                      style={{
                        backgroundColor: isOpenNow
                          ? currentTheme.colors.success || "#22c55e"
                          : currentTheme.colors.error || "#ef4444",
                        color: currentTheme.colors.surface,
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full animate-pulse`}
                          style={{
                            backgroundColor: currentTheme.colors.surface + "80",
                          }}
                        />
                        <span>{isOpenNow ? "Open Now" : "Closed"}</span>
                      </div>
                    </div>

                    {/* Today's Hours */}
                    {todayHours && (
                      <div className="text-sm">
                        <span
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          Today:{" "}
                        </span>
                        <span
                          style={{ color: currentTheme.colors.text }}
                          className="font-medium"
                        >
                          {todayHours.is_open
                            ? `${formatTime12Hour(
                                todayHours.open_time
                              )} - ${formatTime12Hour(todayHours.close_time)}`
                            : "Closed"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Section */}
              <div className="p-6">
                {/* Rating and Price Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Rating Card */}
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.accent + "20",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="p-2 rounded-full mr-3"
                          style={{
                            backgroundColor: currentTheme.colors.accent + "20",
                          }}
                        >
                          <Star
                            className="h-5 w-5 fill-current"
                            style={{
                              color: currentTheme.colors.accent || "#fbbf24",
                            }}
                          />
                        </div>
                        <div>
                          <div
                            className="font-bold text-xl"
                            style={{ color: currentTheme.colors.text }}
                          >
                            {restaurant?.rating || "5.0"}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            Excellent
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-sm font-medium"
                          style={{ color: currentTheme.colors.text }}
                        >
                          Genuine Reviews
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          from our trusted customers
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Card */}
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.primary + "20",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="p-2 rounded-full mr-3"
                          style={{
                            backgroundColor: currentTheme.colors.primary + "20",
                          }}
                        >
                          <IndianRupee
                            className="h-5 w-5"
                            style={{ color: currentTheme.colors.primary }}
                          />
                        </div>
                        <div>
                          <div
                            className="font-bold text-xl"
                            style={{ color: currentTheme.colors.primary }}
                          >
                            ₹{restaurant?.cost_for_two || "Unknown"}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            For two people
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-sm font-medium"
                          style={{ color: currentTheme.colors.success }}
                        >
                          Great Value
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          Average cost
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cuisines Section */}
                {restaurant?.cuisine_types &&
                  restaurant.cuisine_types.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <Utensils
                          className="h-5 w-5 mr-2"
                          style={{ color: currentTheme.colors.accent }}
                        />
                        <h4
                          className="text-lg font-semibold"
                          style={{
                            color: currentTheme.colors.text,
                            fontFamily: currentTheme.fonts.heading,
                          }}
                        >
                          Cuisines Available
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {restaurant.cuisine_types.map((cuisine, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                            style={{
                              backgroundColor:
                                index % 2 === 0
                                  ? currentTheme.colors.accent + "15"
                                  : currentTheme.colors.primary + "15",
                              color:
                                index % 2 === 0
                                  ? currentTheme.colors.accent
                                  : currentTheme.colors.primary,
                              border: `1px solid ${
                                index % 2 === 0
                                  ? currentTheme.colors.accent + "30"
                                  : currentTheme.colors.primary + "30"
                              }`,
                            }}
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Features Section */}
                {features &&
                  Object.entries(features).some(
                    ([key, value]) =>
                      key !== "id" && key !== "restaurant_id" && value === true
                  ) && (
                    <div>
                      <div className="flex items-center mb-3">
                        <Badge
                          className="h-5 w-5 mr-2"
                          style={{ color: currentTheme.colors.success }}
                        />
                        <h4
                          className="text-lg font-semibold"
                          style={{
                            color: currentTheme.colors.text,
                            fontFamily: currentTheme.fonts.heading,
                          }}
                        >
                          What We Offer
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Delivery Available */}
                        {features?.home_delivery && (
                          <div
                            className="flex items-center p-3 rounded-lg border hover:shadow-md transition-shadow"
                            style={{
                              backgroundColor:
                                currentTheme.colors.success + "10",
                              borderColor: currentTheme.colors.success + "20",
                            }}
                          >
                            <Home
                              className="h-4 w-4 mr-2"
                              style={{ color: currentTheme.colors.success }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: currentTheme.colors.success }}
                            >
                              Delivery
                            </span>
                          </div>
                        )}

                        {/* Cards Accepted */}
                        {features?.accepts_cards && (
                          <div
                            className="flex items-center p-3 rounded-lg border hover:shadow-md transition-shadow"
                            style={{
                              backgroundColor:
                                currentTheme.colors.primary + "10",
                              borderColor: currentTheme.colors.primary + "20",
                            }}
                          >
                            <CreditCard
                              className="h-4 w-4 mr-2"
                              style={{ color: currentTheme.colors.primary }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: currentTheme.colors.primary }}
                            >
                              Cards
                            </span>
                          </div>
                        )}

                        {/* Air Conditioned */}
                        {features?.air_conditioned && (
                          <div
                            className="flex items-center p-3 rounded-lg border hover:shadow-md transition-shadow"
                            style={{
                              backgroundColor:
                                currentTheme.colors.accent + "10",
                              borderColor: currentTheme.colors.accent + "20",
                            }}
                          >
                            <Wind
                              className="h-4 w-4 mr-2"
                              style={{ color: currentTheme.colors.accent }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: currentTheme.colors.accent }}
                            >
                              AC
                            </span>
                          </div>
                        )}

                        {/* Family Friendly */}
                        {features?.family_friendly && (
                          <div
                            className="flex items-center p-3 rounded-lg border hover:shadow-md transition-shadow"
                            style={{
                              backgroundColor:
                                currentTheme.colors.success + "10",
                              borderColor: currentTheme.colors.success + "20",
                            }}
                          >
                            <Users
                              className="h-4 w-4 mr-2"
                              style={{ color: currentTheme.colors.success }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: currentTheme.colors.success }}
                            >
                              Family
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* COMPLETELY REWRITTEN: Special Offers Section */}
          {activeOffers.length > 0 && (
            <section id="special-offers" className="relative w-full max-w-full">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: [
                    "radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                    "radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
                    "radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
                  ].join(", "),
                  backgroundSize: "100px 100px, 150px 150px, 120px 120px",
                }}
              />

              <div
                className="relative rounded-xl shadow-lg border backdrop-blur-sm w-full"
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.primary + "20",
                }}
              >
                {/* Enhanced Header */}
                <header
                  className={`bg-gradient-to-r ${currentTheme.gradients.special} py-6 relative`}
                >
                  <Gift
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 text-yellow-300 animate-bounce hidden md:block"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))",
                      animationDelay: "0s",
                    }}
                  />
                  <Gift
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 text-yellow-300 animate-bounce hidden md:block"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))",
                      animationDelay: "0.3s",
                    }}
                  />

                  <div className="absolute top-2 left-1/4 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-60"></div>
                  <div className="absolute bottom-3 right-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-40"></div>
                  <div
                    className="absolute top-4 right-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-bounce opacity-50"
                    style={{ animationDelay: "0.5s" }}
                  ></div>

                  <div className="flex items-center justify-center gap-4 flex-wrap relative z-10">
                    <h2
                      className="flex items-center gap-3 font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-wide text-center"
                      style={{
                        fontFamily: currentTheme.fonts.heading,
                        color: currentTheme.colors.text,
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Award
                        className="h-6 w-6 sm:h-8 sm:w-8 lg:h-9 lg:w-9 drop-shadow-md"
                        style={{
                          color: currentTheme.colors.accent,
                          filter:
                            "drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))",
                        }}
                      />
                      Special Offers
                    </h2>

                    <span
                      className="inline-flex items-center px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm lg:text-base font-black shadow-lg animate-pulse"
                      style={{
                        backgroundColor: currentTheme.colors.accent,
                        color: currentTheme.colors.surface,
                        boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)",
                      }}
                    >
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Exciting Coupons
                    </span>
                  </div>

                  {activeOffers.length > 1 && (
                    <div className="mt-4 text-center">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-black/20 backdrop-blur-sm"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></div>
                        Offer {currentOfferIndex + 1} of {activeOffers.length}
                      </span>
                    </div>
                  )}
                </header>

                {/* FIXED: Mobile-Responsive Carousel Container */}
                <div className="relative bg-gradient-to-b from-transparent to-black/5 py-4 sm:py-8">
                  <div className="w-full px-4 sm:px-6 lg:px-8">
                    {/* UPDATED: Responsive container with auto height */}
                    <div className="w-full overflow-hidden relative min-h-[500px] sm:min-h-[400px] lg:h-[400px]">
                      {activeOffers.map((offer, index) => (
                        <div
                          key={offer.id}
                          className="absolute w-full top-0 left-0 transition-all duration-700 ease-out z-10"
                          style={{
                            transform:
                              index === currentOfferIndex
                                ? "translateX(0)"
                                : index < currentOfferIndex
                                ? "translateX(-100%)"
                                : "translateX(100%)",
                            opacity: index === currentOfferIndex ? 1 : 0,
                            display:
                              Math.abs(index - currentOfferIndex) <= 1
                                ? "block"
                                : "none",
                          }}
                        >
                          {/* FIXED: Mobile-first responsive layout */}
                          <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-4 sm:gap-6 lg:gap-8 w-full h-full">
                            {/* FIXED: Text Content - Mobile friendly */}
                            <div className="w-full lg:w-1/2 xl:w-2/5 space-y-4 sm:space-y-6 order-1 lg:order-1">
                              {/* Enhanced badges section */}
                              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                                {offer.badge_text && (
                                  <span
                                    className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md"
                                    style={{
                                      backgroundColor:
                                        currentTheme.colors.accent,
                                      color: currentTheme.colors.surface,
                                      boxShadow:
                                        "0 4px 12px rgba(245, 158, 11, 0.3)",
                                    }}
                                  >
                                    <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    {offer.badge_text}
                                  </span>
                                )}

                                {index === 0 && (
                                  <span
                                    className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse"
                                    style={{
                                      backgroundColor:
                                        currentTheme.colors.error,
                                      color: currentTheme.colors.surface,
                                    }}
                                  >
                                    <Flame className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                    NEW
                                  </span>
                                )}

                                <span
                                  className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border-2 border-dashed"
                                  style={{
                                    borderColor: currentTheme.colors.accent,
                                    color: currentTheme.colors.accent,
                                    backgroundColor:
                                      currentTheme.colors.accent + "10",
                                  }}
                                >
                                  ⏰ Limited Time
                                </span>
                              </div>

                              {/* FIXED: Responsive heading with better mobile sizing */}
                              <h3
                                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-center lg:text-left"
                                style={{
                                  color: currentTheme.colors.text,
                                  fontFamily: currentTheme.fonts.heading,
                                }}
                              >
                                {offer.name}
                              </h3>

                              {/* FIXED: Responsive description */}
                              {offer.description && (
                                <p
                                  className="text-sm sm:text-base lg:text-lg leading-relaxed text-center lg:text-left"
                                  style={{
                                    color: currentTheme.colors.textSecondary,
                                  }}
                                >
                                  {offer.description}
                                </p>
                              )}

                              {/* Active offer indicator */}
                              <div className="flex items-center justify-center lg:justify-start gap-2">
                                <div
                                  className="w-3 h-3 rounded-full animate-pulse"
                                  style={{
                                    backgroundColor:
                                      currentTheme.colors.success,
                                  }}
                                />
                                <span
                                  className="text-sm sm:text-base font-semibold"
                                  style={{ color: currentTheme.colors.success }}
                                >
                                  Active Offer
                                </span>
                              </div>
                            </div>

                            {/* FIXED: Image Section - Mobile responsive */}
                            {offer.image_url && (
                              <div className="flex-shrink-0 order-2 lg:order-2 lg:ml-auto">
                                <div className="relative group">
                                  {/* FIXED: Responsive image container */}
                                  <div
                                    className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-xl overflow-hidden border-2 shadow-2xl bg-gray-100 mx-auto cursor-pointer"
                                    style={{
                                      borderColor:
                                        currentTheme.colors.primary + "30",
                                    }}
                                  >
                                    <img
                                      src={
                                        Array.isArray(offer.image_url)
                                          ? offer.image_url[0]
                                          : typeof offer.image_url ===
                                              "string" &&
                                            offer.image_url.startsWith("[")
                                          ? JSON.parse(offer.image_url)[0]
                                          : offer.image_url
                                      }
                                      alt={offer.name}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                      }}
                                    />

                                    {/* Overlay effects */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    {/* Discount badge */}
                                    <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-10">
                                      <div
                                        className="px-2 py-1 sm:px-3 sm:py-1 rounded-full font-bold text-xs sm:text-sm shadow-lg transform rotate-12"
                                        style={{
                                          backgroundColor:
                                            currentTheme.colors.error,
                                          color: currentTheme.colors.surface,
                                        }}
                                      >
                                        25% OFF
                                      </div>
                                    </div>

                                    {/* Decorative elements */}
                                    <div className="absolute top-2 left-2">
                                      <div
                                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-pulse"
                                        style={{
                                          backgroundColor:
                                            currentTheme.colors.accent + "60",
                                        }}
                                      ></div>
                                    </div>
                                  </div>

                                  {/* Shadow effect */}
                                  <div
                                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-4 rounded-full opacity-20 blur-md"
                                    style={{
                                      backgroundColor:
                                        currentTheme.colors.primary,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation dots */}
                  {activeOffers.length > 1 && (
                    <div className="flex justify-center mt-4 sm:mt-8">
                      <div className="flex gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg">
                        {activeOffers.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentOfferIndex(i)}
                            aria-label={`View offer ${i + 1}`}
                            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 transform hover:scale-110 ${
                              i === currentOfferIndex
                                ? "scale-125 shadow-md"
                                : "opacity-60 hover:opacity-80"
                            }`}
                            style={{
                              backgroundColor:
                                i === currentOfferIndex
                                  ? currentTheme.colors.primary
                                  : currentTheme.colors.textSecondary,
                              boxShadow:
                                i === currentOfferIndex
                                  ? `0 4px 12px ${currentTheme.colors.primary}40`
                                  : "none",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {showSpinWheel && (
            <div className="relative">
              <SpinWheel />
            </div>
          )}

          {/* FIXED: Our Delicious Menu */}
          {categories.length > 0 && (
            <div id="menu">
              <div
                className="rounded-xl shadow-lg border overflow-hidden"
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.primary + "20",
                }}
              >
                {/* Enhanced Header */}
                <div
                  className={`bg-gradient-to-r ${currentTheme.gradients.header} p-6`}
                >
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <Utensils
                          className="h-6 w-6"
                          style={{ color: currentTheme.colors.accent }}
                        />
                        <h2
                          className="text-2xl font-bold"
                          style={{
                            color: currentTheme.colors.text,
                            fontFamily: currentTheme.fonts.heading,
                          }}
                        >
                          Our Delicious Menu
                        </h2>
                        <Utensils
                          className="h-6 w-6 drop-shadow-md"
                          style={{ color: currentTheme.colors.accent }}
                        />
                      </div>
                      <p
                        className="text-sm opacity-80"
                        style={{ color: currentTheme.colors.text }}
                      >
                        Crafted with love, served with passion
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Enhanced Category Filter */}
                  <div className="mb-6">
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ color: currentTheme.colors.text }}
                    >
                      Browse Categories
                    </h3>

                    {/* UPDATED: Horizontal scrollable container for mobile */}
                    <div className="w-full overflow-hidden">
                      <div
                        ref={categoriesScrollRef}
                        className="overflow-x-auto scrollbar-hide"
                      >
                        {/* UPDATED: Category Filter Buttons - Remove Focus Outline */}
                        <div className="flex gap-3 pb-2 w-max">
                          <button
                            onClick={() => setSelectedCategory("all")}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-0 ${
                              selectedCategory === "all"
                                ? `bg-gradient-to-r ${currentTheme.gradients.button} text-white shadow-lg`
                                : "border-2 hover:shadow-md"
                            }`}
                            style={
                              selectedCategory !== "all"
                                ? {
                                    backgroundColor:
                                      currentTheme.colors.background,
                                    borderColor:
                                      currentTheme.colors.primary + "40",
                                    color: currentTheme.colors.text,
                                  }
                                : {}
                            }
                          >
                            <span className="flex items-center gap-2 whitespace-nowrap">
                              🍽️ All Items
                              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                {filteredItems.length}
                              </span>
                            </span>
                          </button>

                          {categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => setSelectedCategory(category.id)}
                              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-0 ${
                                selectedCategory === category.id
                                  ? `bg-gradient-to-r ${currentTheme.gradients.button} text-white shadow-lg`
                                  : "border-2 hover:shadow-md"
                              }`}
                              style={
                                selectedCategory !== category.id
                                  ? {
                                      backgroundColor:
                                        currentTheme.colors.background,
                                      borderColor:
                                        currentTheme.colors.primary + "40",
                                      color: currentTheme.colors.text,
                                    }
                                  : {}
                              }
                            >
                              <span className="flex items-center gap-2 whitespace-nowrap">
                                {category.name}
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                  {
                                    items.filter(
                                      (item) =>
                                        item.category_id === category.id &&
                                        item.is_available
                                    ).length
                                  }
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/*Scroll indicator for mobile */}
                    <div className="flex justify-center mt-2 sm:hidden">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/5">
                        <span
                          className="text-xs"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          Swipe to see more →
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FIXED: Single Horizontal Scrolling Row */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: currentTheme.colors.text }}
                      >
                        {selectedCategory === "all"
                          ? "All Menu Items"
                          : categories.find((c) => c.id === selectedCategory)
                              ?.name || "Menu Items"}
                      </h3>
                      <span
                        className="text-sm px-3 py-1 rounded-full bg-black/5"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        {filteredItems.length} items
                      </span>
                    </div>

                    {/* FIXED: Horizontal Scroll Container with proper containment */}
                    <div className="w-full overflow-hidden">
                      <div
                        ref={menuItemsScrollRef}
                        className="overflow-x-auto scrollbar-hide"
                      >
                        <div className="flex gap-4 pb-2 w-max">
                          {filteredItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex-shrink-0 w-56 rounded-xl overflow-hidden border-2 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                              style={{
                                backgroundColor: currentTheme.colors.surface,
                                borderColor: currentTheme.colors.primary + "20",
                              }}
                            >
                              <div className="relative aspect-square group">
                                {item.image_url ? (
                                  <>
                                    <img
                                      src={item.image_url}
                                      alt={item.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                                      onClick={() => {
                                        // const menuImages = filteredItems
                                        //   .filter((i) => i.image_url)
                                        //   .map((i) => ({
                                        //     url: i.image_url,
                                        //     alt: i.name,
                                        //     name: i.name,
                                        //   }));
                                        // const currentIndex =
                                        //   menuImages.findIndex(
                                        //     (img) => img.url === item.image_url
                                        //   );
                                        // openImageViewerEnhanced(
                                        //   item.image_url,
                                        //   item.name,
                                        //   menuImages,
                                        //   currentIndex
                                        // );
                                      }}
                                    />
                                    {/* ✅ FIX HERE: Added 'pointer-events-none' to the overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                  </>
                                ) : (
                                  <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{
                                      backgroundColor:
                                        currentTheme.colors.background,
                                    }}
                                  >
                                    <div className="text-center">
                                      <Utensils
                                        className="h-12 w-12 mx-auto mb-2"
                                        style={{
                                          color:
                                            currentTheme.colors.textSecondary,
                                        }}
                                      />
                                      <p
                                        className="text-xs"
                                        style={{
                                          color:
                                            currentTheme.colors.textSecondary,
                                        }}
                                      >
                                        No Image
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Enhanced Special Badge */}
                                {item.is_special && (
                                  <div className="absolute top-3 right-3">
                                    <div
                                      className="px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg animate-pulse"
                                      style={{
                                        backgroundColor:
                                          currentTheme.colors.error,
                                        color: currentTheme.colors.surface,
                                      }}
                                    >
                                      <Flame className="h-3 w-3 mr-1" />
                                      CHEF'S SPECIAL
                                    </div>
                                  </div>
                                )}

                                {/* Vegetarian Indicator */}
                                <div className="absolute top-3 left-3">
                                  <div
                                    className="w-5 h-5 border-2 rounded-sm flex items-center justify-center shadow-sm"
                                    style={{
                                      borderColor:
                                        currentTheme.colors.success ||
                                        "#22c55e",
                                      backgroundColor:
                                        currentTheme.colors.surface,
                                    }}
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        backgroundColor:
                                          currentTheme.colors.success ||
                                          "#22c55e",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Item Content */}
                              <div className="p-4">
                                <div className="mb-3">
                                  <h4
                                    className="font-bold text-base leading-tight mb-2"
                                    style={{
                                      color: currentTheme.colors.text,
                                      fontFamily: currentTheme.fonts.heading,
                                    }}
                                  >
                                    {item.name}
                                  </h4>

                                  {/* Enhanced Description */}
                                  {item.description && (
                                    <p
                                      className="text-xs leading-relaxed mb-3"
                                      style={{
                                        color:
                                          currentTheme.colors.textSecondary,
                                        overflow: "hidden",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                      }}
                                    >
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                {/* Enhanced Price Section */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <IndianRupee
                                      className="h-5 w-5"
                                      style={{
                                        color:
                                          currentTheme.colors.success ||
                                          "#22c55e",
                                      }}
                                    />
                                    <span
                                      className="text-xl font-bold"
                                      style={{
                                        color:
                                          currentTheme.colors.success ||
                                          "#22c55e",
                                      }}
                                    >
                                      {item.price}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Scroll Indicator */}
                    {filteredItems.length > 3 && (
                      <div className="flex justify-center mt-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5">
                          <span
                            className="text-xs"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            Scroll horizontally to see more →
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* No Items Found */}
                  {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <Search
                          className="h-16 w-16 mx-auto mb-4 opacity-50"
                          style={{ color: currentTheme.colors.textSecondary }}
                        />
                      </div>
                      <h3
                        className="text-xl font-semibold mb-2"
                        style={{ color: currentTheme.colors.text }}
                      >
                        No items found
                      </h3>
                      <p
                        className="text-sm mb-4"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Try selecting a different category
                      </p>
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="px-6 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                        style={{
                          backgroundColor: currentTheme.colors.primary,
                          color: currentTheme.colors.surface,
                        }}
                      >
                        View All Items
                      </button>
                    </div>
                  )}

                  {/* IMPROVED: Enhanced Menu Gallery */}
                  {(() => {
                    const menuGalleryImages = galleryImages.filter(
                      (img) =>
                        img.alt_text.toLowerCase() === "menu showcase image"
                    );

                    // Combine all menu images for consistent indexing
                    const allMenuImages = [
                      ...menuGalleryImages.map((img) => ({
                        url: img.image_url,
                        alt: img.alt_text,
                        name: img.alt_text,
                        type: "gallery",
                      })),
                    ];

                    return (
                      menuGalleryImages.length > 0 && (
                        <div
                          className="mt-8 pt-6 border-t"
                          style={{
                            borderColor: currentTheme.colors.primary + "20",
                          }}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-6">
                            <h4
                              className="text-xl font-bold flex items-center gap-2"
                              style={{
                                color: currentTheme.colors.text,
                                fontFamily: currentTheme.fonts.heading,
                              }}
                            >
                              <Star
                                className="h-6 w-6"
                                style={{
                                  color: currentTheme.colors.accent,
                                }}
                              />
                              Menu Gallery
                            </h4>
                            <span
                              className="text-sm px-3 py-1 rounded-full bg-black/5"
                              style={{
                                color: currentTheme.colors.textSecondary,
                              }}
                            >
                              {allMenuImages.length} Beautiful Images
                            </span>
                          </div>

                          {/* Description */}
                          <p
                            className="text-center text-sm leading-relaxed max-w-md mx-auto mb-6"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            Explore our delicious menu items and restaurant
                            ambiance
                          </p>

                          {/* Horizontal Scrollable Gallery - Same as Main Gallery */}
                          <div className="w-full overflow-hidden">
                            <div
                              ref={menuItemsScrollRef}
                              className="overflow-x-auto scrollbar-hide"
                            >
                              <div className="flex space-x-4 pb-2 w-max">
                                {allMenuImages.map((image, index) => (
                                  <div
                                    key={`menu-${index}`}
                                    className="flex-shrink-0 group relative"
                                  >
                                    <div
                                      className="w-64 aspect-[4/3] rounded-lg overflow-hidden border-2 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
                                      style={{
                                        borderColor:
                                          currentTheme.colors.primary + "20",
                                      }}
                                    >
                                      <img
                                        src={image.url}
                                        alt={image.alt}
                                        className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                                        onClick={() => {
                                          openImageViewerEnhanced(
                                            image.url,
                                            image.alt,
                                            allMenuImages,
                                            index
                                          );
                                        }}
                                      />

                                      {/* Image overlay - Same as Main Gallery */}
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center pointer-events-none">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center"
                                            style={{
                                              backgroundColor:
                                                currentTheme.colors.primary,
                                            }}
                                          >
                                            <svg
                                              className="w-6 h-6"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                              style={{
                                                color: currentTheme.colors.text,
                                              }}
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                              />
                                            </svg>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Image caption - Same as Main Gallery */}
                                    <div className="mt-2 px-2">
                                      <p
                                        className="text-xs text-center leading-tight"
                                        style={{
                                          color:
                                            currentTheme.colors.textSecondary,
                                        }}
                                      >
                                        {image.name.length > 30
                                          ? `${image.name.substring(0, 30)}...`
                                          : image.name}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Bottom decorative element - Same as Main Gallery */}
                          <div className="flex justify-center mt-8">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: currentTheme.colors.accent,
                                }}
                              />
                              <div
                                className="w-8 h-px"
                                style={{
                                  backgroundColor:
                                    currentTheme.colors.accent + "50",
                                }}
                              />
                              <div
                                className="w-3 h-3 rounded-full border-2"
                                style={{
                                  borderColor: currentTheme.colors.accent,
                                }}
                              />
                              <div
                                className="w-8 h-px"
                                style={{
                                  backgroundColor:
                                    currentTheme.colors.accent + "50",
                                }}
                              />
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: currentTheme.colors.accent,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* FIXED: Chef's Special Recommendations */}
          {specialItems.length > 0 && (
            <div id="chef-special" className="relative">
              {/* Background Decorative Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-red-200/20 to-pink-200/20 rounded-full blur-xl"></div>
              </div>

              <div
                className="relative rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-sm"
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.primary + "30",
                }}
              >
                {/* Enhanced Header Section */}
                <div
                  className={`relative bg-gradient-to-r ${
                    currentTheme.gradients.special ||
                    "from-orange-400 via-red-400 to-pink-400"
                  } overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/30 rounded-full animate-pulse"></div>
                    <div className="absolute top-8 right-8 w-6 h-6 border-2 border-white/30 rounded-full animate-pulse delay-100"></div>
                    <div className="absolute bottom-6 left-12 w-4 h-4 border-2 border-white/30 rounded-full animate-pulse delay-200"></div>
                    <div className="absolute bottom-4 right-6 w-10 h-10 border-2 border-white/30 rounded-full animate-pulse delay-300"></div>
                  </div>

                  <div className="relative text-center py-8 px-6">
                    {/* Main Icon with Glow Effect */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-lg scale-150"></div>
                        <div
                          className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
                          style={{
                            backgroundColor: currentTheme.colors.accent + "40",
                          }}
                        >
                          <Star
                            className="h-8 w-8 fill-current animate-pulse"
                            style={{
                              color: currentTheme.colors.surface,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Title */}
                    <h3
                      className="text-3xl md:text-4xl font-extrabold mb-3 tracking-wide"
                      style={{
                        color: currentTheme.colors.text,
                        fontFamily: currentTheme.fonts.heading,
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      Chef's Special
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="h-px bg-white/30 flex-1 max-w-12"></div>
                      <span
                        className="text-lg font-medium"
                        style={{
                          color: currentTheme.colors.text,
                          opacity: 0.9,
                        }}
                      >
                        ✨ Recommendations ✨
                      </span>
                      <div className="h-px bg-white/30 flex-1 max-w-12"></div>
                    </div>
                    <p
                      className="text-sm max-w-md mx-auto leading-relaxed"
                      style={{
                        color: currentTheme.colors.text,
                        opacity: 0.8,
                      }}
                    >
                      Handcrafted masterpieces by our executive chef • Limited
                      time offerings
                    </p>

                    {/* Items Count Badge */}
                    <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                      <span
                        className="font-bold text-sm"
                        style={{ color: currentTheme.colors.surface }}
                      >
                        {specialItems.length}
                      </span>
                      <span
                        className="text-xs"
                        style={{
                          color: currentTheme.colors.text,
                          opacity: 0.9,
                        }}
                      >
                        Exclusive Dishes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Items Section */}
                <div className="p-6 lg:p-8">
                  {/* Scroll Hint */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-1 h-8 bg-gradient-to-b ${
                          currentTheme.gradients.button ||
                          "from-orange-400 to-red-400"
                        } rounded-full`}
                      ></div>
                      <div>
                        <h4
                          className="text-lg font-bold"
                          style={{ color: currentTheme.colors.text }}
                        >
                          Today's Specials
                        </h4>
                        <p
                          className="text-xs"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          Swipe to explore more →
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FIXED: Enhanced Horizontal Scrollable Items */}
                  <div className="relative">
                    <div className="w-full overflow-hidden">
                      <div
                        ref={specialItemsScrollRef}
                        className="overflow-x-auto scrollbar-hide"
                      >
                        <div className="flex gap-6 pb-4 w-max">
                          {specialItems.map((item, index) => (
                            <div
                              key={item.id}
                              className="flex-shrink-0 w-80 group cursor-pointer"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <div
                                className="relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border overflow-hidden"
                                style={{
                                  backgroundColor: currentTheme.colors.surface,
                                  borderColor:
                                    currentTheme.colors.primary + "20",
                                }}
                              >
                                {/* Special Badge */}
                                <div className="absolute top-4 left-4 z-10">
                                  <div
                                    className={`px-3 py-1 bg-gradient-to-r ${
                                      currentTheme.gradients.button ||
                                      "from-orange-400 to-red-400"
                                    } text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1`}
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    SPECIAL
                                  </div>
                                </div>

                                {/* FIXED: Top-Right Corner - Veg Indicator and Price */}
                                <div
                                  className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full px-3 py-1 shadow-lg border-2"
                                  style={{
                                    backgroundColor:
                                      currentTheme.colors.surface,
                                    borderColor:
                                      currentTheme.colors.primary + "30",
                                  }}
                                >
                                  {/* Vegetarian Indicator */}
                                  <div
                                    className="w-5 h-5 border-2 border-green-500 rounded-sm flex items-center justify-center"
                                    style={{
                                      backgroundColor:
                                        currentTheme.colors.surface,
                                    }}
                                  >
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                  </div>

                                  {/* Price */}
                                  <div className="flex items-center gap-1">
                                    <IndianRupee
                                      className="w-3 h-3"
                                      style={{
                                        color: currentTheme.colors.primary,
                                      }}
                                    />
                                    <span
                                      className="font-bold text-sm"
                                      style={{
                                        color: currentTheme.colors.primary,
                                      }}
                                    >
                                      {item.price}
                                    </span>
                                  </div>
                                </div>

                                {/* Enhanced Image Section */}
                                <div className="relative pt-6 pb-4 px-6">
                                  <div className="relative mx-auto w-32 h-32">
                                    {/* Glow Effect Behind Image */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-200/50 to-red-200/50 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>

                                    {/* Main Image Container */}
                                    <div
                                      className="relative w-full h-full rounded-full overflow-hidden border-4 shadow-xl group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                                      style={{
                                        borderColor:
                                          currentTheme.colors.primary + "60",
                                      }}
                                      onClick={() => {
                                        if (item.image_url) {
                                          // const specialImages = specialItems
                                          //   .filter((i) => i.image_url)
                                          //   .map((i) => ({
                                          //     url: i.image_url,
                                          //     alt: i.name,
                                          //     name: i.name,
                                          //   }));
                                          // const currentIndex =
                                          //   specialImages.findIndex(
                                          //     (img) =>
                                          //       img.url === item.image_url
                                          //   );
                                          // openImageViewerEnhanced(
                                          //   item.image_url,
                                          //   item.name,
                                          //   specialImages,
                                          //   currentIndex
                                          // );
                                        }
                                      }}
                                    >
                                      {item.image_url ? (
                                        <img
                                          src={item.image_url}
                                          alt={item.name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                      ) : (
                                        <div
                                          className="w-full h-full flex items-center justify-center bg-gradient-to-br"
                                          style={{
                                            backgroundImage:
                                              "linear-gradient(to bottom right, #f3f4f6, #e5e7eb)",
                                          }}
                                        >
                                          <Utensils
                                            className="h-12 w-12"
                                            style={{
                                              color:
                                                currentTheme.colors
                                                  .textSecondary,
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Enhanced Content Section */}
                                <div className="px-6 pb-6">
                                  {/* Description with better text handling */}
                                  {item.description && (
                                    <div className="text-center mb-4">
                                      <p
                                        className="text-sm leading-relaxed"
                                        style={{
                                          color:
                                            currentTheme.colors.textSecondary,
                                        }}
                                      >
                                        {item.description.length > 120
                                          ? `${item.description.substring(
                                              0,
                                              120
                                            )}...`
                                          : item.description}
                                      </p>
                                      {item.description.length > 120 && (
                                        <button
                                          className="text-xs font-semibold hover:underline transition-colors duration-200 mt-2"
                                          style={{
                                            color: currentTheme.colors.primary,
                                          }}
                                        >
                                          Read more
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {/* Dish Name Display */}
                                  <div className="mt-4 text-center">
                                    <h4
                                      className="text-xl font-bold leading-tight"
                                      style={{
                                        color: currentTheme.colors.text,
                                        fontFamily: currentTheme.fonts.heading,
                                      }}
                                    >
                                      {item.name}
                                    </h4>
                                  </div>
                                </div>

                                {/* Hover Overlay Effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Scroll Indicators */}
                    {specialItems.length > 3 && (
                      <div className="flex justify-center mt-6 gap-2">
                        {[...Array(Math.ceil(specialItems.length / 3))].map(
                          (_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full transition-colors duration-300 hover:bg-gray-400"
                              style={{
                                backgroundColor:
                                  currentTheme.colors.textSecondary + "60",
                              }}
                            ></div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Us */}
          {restaurant?.description && (
            <div
              id="about-us"
              className="relative rounded-2xl shadow-2xl border overflow-hidden"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + "20",
              }}
            >
              {/* Background Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100/30 to-transparent rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-xl"></div>

              {/* Header Section */}
              <div className="relative p-8 pb-6">
                <div className="flex items-center justify-center mb-6">
                  {/* Icon with glow effect */}
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full blur-lg opacity-30"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    ></div>
                    <div
                      className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.primary + "30",
                      }}
                    >
                      <Utensils
                        className="h-8 w-8 animate-pulse"
                        style={{ color: currentTheme.colors.primary }}
                      />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3
                  className="text-3xl font-bold text-center mb-2 tracking-wide"
                  style={{
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.fonts.heading,
                  }}
                >
                  About Us
                </h3>

                {/* Subtitle with decorative line */}
                <div className="flex items-center justify-center mb-8">
                  <div
                    className="h-px flex-1 max-w-24"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, #d1d5db, transparent)",
                    }}
                  ></div>
                  <span
                    className="mx-4 text-sm font-medium uppercase tracking-wider"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Our Story
                  </span>
                  <div
                    className="h-px flex-1 max-w-24"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, #d1d5db, transparent)",
                    }}
                  ></div>
                </div>
              </div>

              {/* Content Section */}
              <div className="relative px-8 pb-8">
                <div className="max-w-4xl mx-auto">
                  {/* Quote mark decoration */}
                  <div className="relative">
                    <div
                      className="absolute -top-4 -left-2 text-6xl font-serif opacity-20 leading-none"
                      style={{ color: currentTheme.colors.primary }}
                    >
                      "
                    </div>

                    {/* Description text */}
                    <p
                      className="text-lg leading-relaxed text-center font-medium relative z-10 italic"
                      style={{
                        color: currentTheme.colors.text,
                        lineHeight: "1.8",
                      }}
                    >
                      {restaurant.description}
                    </p>

                    <div
                      className="absolute -bottom-4 -right-2 text-6xl font-serif opacity-20 leading-none rotate-180"
                      style={{ color: currentTheme.colors.primary }}
                    >
                      "
                    </div>
                  </div>

                  {/* Bottom decorative element */}
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: currentTheme.colors.primary }}
                      />
                      <div
                        className="w-8 h-px"
                        style={{
                          backgroundColor: currentTheme.colors.primary + "50",
                        }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: currentTheme.colors.primary }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom accent border */}
              <div
                className="h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
                style={{ color: currentTheme.colors.primary }}
              />
            </div>
          )}

          {/* Contact & Location */}
          <div
            id="contact-location"
            className="relative rounded-2xl shadow-2xl border overflow-hidden"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + "20",
            }}
          >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-100/20 to-transparent rounded-full blur-2xl" />

            {/* Header Section */}
            <div className="relative p-8 pb-6">
              <div className="flex items-center justify-center mb-6">
                {/* Icon with glow effect */}
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-lg opacity-30"
                    style={{ backgroundColor: currentTheme.colors.primary }}
                  />
                  <div
                    className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2"
                    style={{
                      backgroundColor: currentTheme.colors.surface,
                      borderColor: currentTheme.colors.primary + "30",
                    }}
                  >
                    <MapPin
                      className="h-8 w-8 animate-pulse"
                      style={{ color: currentTheme.colors.primary }}
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3
                className="text-3xl font-bold text-center mb-2 tracking-wide"
                style={{
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.fonts.heading,
                }}
              >
                Contact & Location
              </h3>

              {/* Subtitle with decorative line */}
              <div className="flex items-center justify-center mb-8">
                <div
                  className="h-px flex-1 max-w-24"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, #d1d5db, transparent)",
                  }}
                />
                <span
                  className="mx-4 text-sm font-medium uppercase tracking-wider"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  Get In Touch
                </span>
                <div
                  className="h-px flex-1 max-w-24"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, #d1d5db, transparent)",
                  }}
                />
              </div>
            </div>

            {/* Main Content - 2 Column Layout */}
            <div className="relative px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Hours Section (Full Height) */}
                <div className="relative group">
                  <div
                    className="p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.primary + "20",
                    }}
                  >
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: currentTheme.colors.success + "10",
                        }}
                      >
                        <svg
                          className="h-6 w-6"
                          style={{ color: currentTheme.colors.success }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12,6 12,12 16,14" />
                        </svg>
                      </div>
                    </div>

                    {/* Title with Status */}
                    <div className="text-center mb-6">
                      <h4
                        className="text-xl font-bold mb-3"
                        style={{
                          color: currentTheme.colors.text,
                          fontFamily: currentTheme.fonts.heading,
                        }}
                      >
                        Operating Hours
                      </h4>
                      <span
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: isOpenNow
                            ? currentTheme.colors.success + "20"
                            : currentTheme.colors.error + "20",
                          color: isOpenNow
                            ? currentTheme.colors.success
                            : currentTheme.colors.error,
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{
                            backgroundColor: isOpenNow
                              ? currentTheme.colors.success
                              : currentTheme.colors.error,
                          }}
                        />
                        {isOpenNow ? "Open Now" : "Closed"}
                      </span>
                    </div>

                    {/* Hours List */}
                    <div className="space-y-3">
                      {DAYS.map((day, index) => {
                        const dayHours = hours.find(
                          (h) => h.day_of_week === index
                        );
                        const isToday = index === new Date().getDay();
                        return (
                          <div
                            key={day}
                            className={`flex justify-between items-center text-sm p-3 rounded-lg ${
                              isToday ? "shadow-sm" : ""
                            }`}
                            style={{
                              backgroundColor: isToday
                                ? currentTheme.colors.primary + "08"
                                : "transparent",
                              borderLeft: isToday
                                ? `3px solid ${currentTheme.colors.primary}`
                                : "3px solid transparent",
                            }}
                          >
                            <span
                              className="font-medium"
                              style={{
                                color: isToday
                                  ? currentTheme.colors.text
                                  : currentTheme.colors.textSecondary,
                                fontWeight: isToday ? "bold" : "normal",
                              }}
                            >
                              {day}
                            </span>
                            <span
                              style={{
                                color: isToday
                                  ? currentTheme.colors.text
                                  : currentTheme.colors.textSecondary,
                                fontWeight: isToday ? "bold" : "normal",
                              }}
                            >
                              {dayHours?.is_open
                                ? `${formatTime12Hour(
                                    dayHours.open_time
                                  )} - ${formatTime12Hour(dayHours.close_time)}`
                                : "Closed"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact & Address (Stacked) */}
                <div className="space-y-6">
                  {/* Contact Section (Top Right) */}
                  {restaurant?.contact_number && (
                    <div className="relative group">
                      <div
                        className="p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        style={{
                          backgroundColor: currentTheme.colors.background,
                          borderColor: currentTheme.colors.primary + "20",
                        }}
                      >
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor:
                                currentTheme.colors.accent + "10",
                            }}
                          >
                            <Phone
                              className="h-6 w-6"
                              style={{ color: currentTheme.colors.accent }}
                            />
                          </div>
                        </div>

                        {/* Title */}
                        <h4
                          className="text-xl font-bold text-center mb-4"
                          style={{
                            color: currentTheme.colors.text,
                            fontFamily: currentTheme.fonts.heading,
                          }}
                        >
                          Contact Us
                        </h4>

                        {/* Phone Number */}
                        <div className="text-center mb-4">
                          <span
                            className="text-lg font-semibold"
                            style={{ color: currentTheme.colors.text }}
                          >
                            {restaurant.contact_number}
                          </span>
                        </div>

                        {/* Action Button */}
                        <div className="text-center">
                          <button
                            className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md w-full justify-center"
                            style={{
                              backgroundColor:
                                currentTheme.colors.accent + "10",
                              color: currentTheme.colors.accent,
                            }}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address Section (Bottom Right) */}
                  {location && (
                    <div className="relative group">
                      <div
                        className="p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        style={{
                          backgroundColor: currentTheme.colors.background,
                          borderColor: currentTheme.colors.primary + "20",
                        }}
                      >
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor:
                                currentTheme.colors.primary + "10",
                            }}
                          >
                            <MapPin
                              className="h-6 w-6"
                              style={{ color: currentTheme.colors.primary }}
                            />
                          </div>
                        </div>

                        {/* Title */}
                        <h4
                          className="text-xl font-bold text-center mb-4"
                          style={{
                            color: currentTheme.colors.text,
                            fontFamily: currentTheme.fonts.heading,
                          }}
                        >
                          Our Location
                        </h4>

                        {/* Address Text */}
                        <p
                          className="text-sm text-center leading-relaxed mb-4"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          {[
                            location.street,
                            location.city,
                            location.state,
                            location.zip_code,
                            "India",
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>

                        {/* Action Button */}
                        <div className="text-center">
                          <button
                            onClick={handleGetDirections}
                            className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md w-full justify-center"
                            style={{
                              backgroundColor:
                                currentTheme.colors.primary + "10",
                              color: currentTheme.colors.primary,
                            }}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Get Directions
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom decorative element */}
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentTheme.colors.primary }}
                  />
                  <div
                    className="w-8 h-px"
                    style={{
                      backgroundColor: currentTheme.colors.primary + "50",
                    }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border-2"
                    style={{ borderColor: currentTheme.colors.primary }}
                  />
                  <div
                    className="w-8 h-px"
                    style={{
                      backgroundColor: currentTheme.colors.primary + "50",
                    }}
                  />
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentTheme.colors.primary }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom accent border */}
            <div
              className="h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
              style={{ color: currentTheme.colors.primary }}
            />
          </div>

          {/* What Makes Us Special */}
          {features && (
            <div
              id="features"
              className="relative rounded-2xl shadow-2xl border overflow-hidden"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + "20",
              }}
            >
              {/* Background Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-100/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-2xl" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-green-100/10 to-yellow-100/10 rounded-full blur-xl" />

              {/* Header Section */}
              <div className="relative p-8 pb-6">
                <div className="flex items-center justify-center mb-6">
                  {/* Icon with glow effect */}
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full blur-lg opacity-30"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    />
                    <div
                      className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.primary + "30",
                      }}
                    >
                      <Badge
                        className="h-8 w-8 animate-pulse"
                        style={{ color: currentTheme.colors.primary }}
                      />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3
                  className="text-3xl font-bold text-center mb-2 tracking-wide"
                  style={{
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.fonts.heading,
                  }}
                >
                  What Makes Us Special
                </h3>

                {/* Subtitle with decorative line */}
                <div className="flex items-center justify-center mb-8">
                  <div
                    className="h-px flex-1 max-w-24"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, #d1d5db, transparent)",
                    }}
                  />
                  <span
                    className="mx-4 text-sm font-medium uppercase tracking-wider"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Our Promise
                  </span>
                  <div
                    className="h-px flex-1 max-w-24"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, #d1d5db, transparent)",
                    }}
                  />
                </div>
              </div>

              {/* Features Grid */}
              <div className="relative px-8 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(features)
                    .filter(
                      ([key, value]) =>
                        key !== "id" &&
                        key !== "restaurant_id" &&
                        value === true
                    )
                    .map(([feature], index) => {
                      const colors = [
                        currentTheme.colors.success || "#22c55e", // Green
                        currentTheme.colors.primary || "#3b82f6", // Blue
                        currentTheme.colors.accent || "#8b5cf6", // Purple
                        currentTheme.colors.error || "#ef4444", // Red
                        "#f59e0b", // Amber
                        "#06b6d4", // Cyan
                      ];
                      const iconColor = colors[index % colors.length];

                      const descriptions = {
                        home_delivery: "Fast delivery to your door",
                        indoor_seating: "Comfortable dining space",
                        air_conditioned: "Cool and comfortable",
                        accepts_cards: "Easy payment options",
                        family_friendly: "Perfect for all ages",
                      };

                      return (
                        <div key={feature} className="relative group">
                          <div
                            className="p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full"
                            style={{
                              backgroundColor: currentTheme.colors.background,
                              borderColor: currentTheme.colors.primary + "20",
                            }}
                          >
                            {/* Icon with enhanced styling */}
                            <div className="flex justify-center mb-6">
                              <div className="relative">
                                {/* Outer glow ring */}
                                <div
                                  className="absolute inset-0 rounded-full blur-md opacity-20"
                                  style={{ backgroundColor: iconColor }}
                                />

                                {/* Main icon container */}
                                <div
                                  className="relative w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 border-2"
                                  style={{
                                    backgroundColor: iconColor + "10",
                                    borderColor: iconColor + "30",
                                  }}
                                >
                                  <div style={{ color: iconColor }}>
                                    {React.cloneElement(
                                      getFeatureIcon(feature),
                                      {
                                        className: "h-8 w-8",
                                      }
                                    )}
                                  </div>
                                </div>

                                {/* Animated ring on hover */}
                                <div
                                  className="absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-ping"
                                  style={{ borderColor: iconColor }}
                                />
                              </div>
                            </div>

                            {/* Title */}
                            <h4
                              className="text-lg font-bold mb-3 text-center"
                              style={{
                                color: currentTheme.colors.text,
                                fontFamily: currentTheme.fonts.heading,
                              }}
                            >
                              {getFeatureLabel(feature)}
                            </h4>

                            {/* Description */}
                            <p
                              className="text-sm text-center leading-relaxed"
                              style={{
                                color: currentTheme.colors.textSecondary,
                              }}
                            >
                              {descriptions[
                                feature as keyof typeof descriptions
                              ] || "Great service feature"}
                            </p>

                            {/* Bottom accent line */}
                            <div
                              className="mt-4 mx-auto w-12 h-1 rounded-full transition-all duration-300 group-hover:w-16"
                              style={{ backgroundColor: iconColor + "30" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Bottom decorative element */}
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    />
                    <div
                      className="w-8 h-px"
                      style={{
                        backgroundColor: currentTheme.colors.primary + "50",
                      }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border-2"
                      style={{ borderColor: currentTheme.colors.primary }}
                    />
                    <div
                      className="w-8 h-px"
                      style={{
                        backgroundColor: currentTheme.colors.primary + "50",
                      }}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom accent border */}
              <div
                className="h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
                style={{ color: currentTheme.colors.primary }}
              />
            </div>
          )}

          {/* Gallery */}
          {/* Gallery */}
          {galleryImages.length > 0 && (
            <div
              id="gallery"
              className="relative rounded-2xl shadow-2xl border overflow-hidden"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + "20",
              }}
            >
              {/* Background Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-yellow-100/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-100/20 to-transparent rounded-full blur-2xl" />
              <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-r from-blue-100/10 to-purple-100/10 rounded-full blur-xl" />

              {/* Header Section */}
              <div className="relative p-8 pb-6">
                <div className="flex items-center justify-center mb-6">
                  {/* Icon with glow effect */}
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full blur-lg opacity-30"
                      style={{ backgroundColor: currentTheme.colors.accent }}
                    />
                    <div
                      className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.accent + "30",
                      }}
                    >
                      <Star
                        className="h-8 w-8 fill-current animate-pulse"
                        style={{ color: currentTheme.colors.accent }}
                      />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3
                  className="text-3xl font-bold text-center mb-2 tracking-wide"
                  style={{
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.fonts.heading,
                  }}
                >
                  Our Gallery
                </h3>

                {/* Subtitle with decorative line */}
                <div className="flex items-center justify-center mb-4">
                  <div
                    className="h-px flex-1 max-w-24"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, #d1d5db, transparent)",
                    }}
                  />
                  <span
                    className="mx-4 text-sm font-medium uppercase tracking-wider"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Visual Stories
                  </span>
                  <div
                    className="h-px flex-1 max-w-24"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, #d1d5db, transparent)",
                    }}
                  />
                </div>

                {/* Description */}
                <p
                  className="text-center text-sm leading-relaxed max-w-md mx-auto"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  Discover the ambiance and delicious moments that make our
                  restaurant special
                </p>
              </div>

              {/* Gallery Content */}
              <div className="relative px-8 pb-8">
                {/* Stats Bar */}
                <div className="flex items-center justify-center mb-6">
                  <div
                    className="px-4 py-2 rounded-full border"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.primary + "20",
                    }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {galleryImages.length} Beautiful Images
                    </span>
                  </div>
                </div>

                {/* Horizontally Scrollable Gallery */}
                <div className="w-full overflow-hidden">
                  <div
                    ref={galleryScrollRef}
                    className="overflow-x-auto scrollbar-hide"
                  >
                    <div className="flex space-x-4 pb-2 w-max">
                      {galleryImages.map((image, index) => (
                        <div
                          key={image.id}
                          className="flex-shrink-0 group relative"
                        >
                          <div
                            className="w-64 aspect-[4/3] rounded-lg overflow-hidden border-2 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
                            style={{
                              borderColor: currentTheme.colors.primary + "20",
                            }}
                          >
                            <img
                              src={image.image_url}
                              alt={image.alt_text}
                              className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                              onClick={() => {
                                const allGalleryImages = galleryImages.map(
                                  (img) => ({
                                    url: img.image_url,
                                    alt: img.alt_text,
                                    name: img.alt_text,
                                  })
                                );
                                openImageViewerEnhanced(
                                  image.image_url,
                                  image.alt_text,
                                  allGalleryImages,
                                  index
                                );
                              }}
                            />

                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center pointer-events-none">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div
                                  className="w-12 h-12 rounded-full flex items-center justify-center"
                                  style={{
                                    backgroundColor:
                                      currentTheme.colors.primary,
                                  }}
                                >
                                  <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{
                                      color: currentTheme.colors.text,
                                    }}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Image caption */}
                          <div className="mt-2 px-2">
                            <p
                              className="text-xs text-center leading-tight"
                              style={{
                                color: currentTheme.colors.textSecondary,
                              }}
                            >
                              {image.alt_text.length > 30
                                ? `${image.alt_text.substring(0, 30)}...`
                                : image.alt_text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom decorative element */}
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    {/* ... decorative dots and lines ... */}
                  </div>
                </div>
              </div>

              {/* Bottom accent border */}
              <div
                className="h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
                style={{ color: currentTheme.colors.accent }}
              />
            </div>
          )}

          {/* Footer */}
          <footer
            className="relative mt-16 overflow-hidden"
            style={{
              backgroundColor: currentTheme.colors.surface,
            }}
          >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-gradient-to-r from-pink-100/15 to-yellow-100/15 rounded-full blur-xl" />

            {/* Top Border with Gradient */}
            <div
              className="h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-30"
              style={{ color: currentTheme.colors.primary }}
            />

            <div className="relative px-6 py-12">
              {/* Main Footer Content */}
              <div className="max-w-7xl mx-auto">
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
                  {/* Brand Section - Enhanced */}
                  <div className="lg:col-span-1 text-center lg:text-left">
                    <div className="relative inline-block mb-6">
                      {/* Logo with glow effect */}
                      <div
                        className="absolute inset-0 rounded-xl blur-md opacity-20"
                        style={{ backgroundColor: currentTheme.colors.primary }}
                      />
                      <img
                        src={mainLogo}
                        alt="EnerZy Flow"
                        className="relative h-20 w-auto mx-auto lg:mx-0 drop-shadow-lg"
                      />
                    </div>

                    <p
                      className="text-sm leading-relaxed mb-6 max-w-xs mx-auto lg:mx-0"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      Empowering restaurants with digital excellence. Create
                      stunning online experiences for your customers.
                    </p>

                    {/* Enhanced Social Media Icons */}
                    <div className="flex justify-center lg:justify-start space-x-3">
                      {[
                        {
                          icon: Facebook,
                          label: "Facebook",
                          color: "#1877f2",
                          url: "https://www.facebook.com/share/19obQzdUev/",
                        },
                        {
                          icon: Instagram,
                          label: "Instagram",
                          color: "#e4405f",
                          url: "https://www.instagram.com/enerzyflow?igsh=cWhqNDc4MTNwenE1",
                        },
                        {
                          icon: Linkedin,
                          label: "Linkedin",
                          color: "#ff0000",
                          url: "https://www.linkedin.com/company/106605789/admin/page-posts/published/",
                        },
                      ].map(({ icon: Icon, label, color, url }) => (
                        <a
                          key={label}
                          aria-label={`${label} Page`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative"
                        >
                          {/* Hover background effect */}
                          <div
                            className="absolute inset-0 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                            style={{ backgroundColor: color + "15" }}
                          />

                          {/* Main icon container */}
                          <div
                            className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                            style={{
                              backgroundColor:
                                currentTheme.colors.primary + "10",
                            }}
                          >
                            <Icon
                              className="h-5 w-5 transition-all duration-300"
                              style={{
                                color: currentTheme.colors.primary,
                              }}
                            />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="lg:col-span-1">
                    <h4
                      className="text-lg font-bold mb-6 flex items-center"
                      style={{
                        color: currentTheme.colors.text,
                        fontFamily: currentTheme.fonts.heading,
                      }}
                    >
                      <div
                        className="w-1 h-6 rounded-full mr-3"
                        style={{ backgroundColor: currentTheme.colors.primary }}
                      />
                      Quick Links
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: "Home", href: "#" },
                        { label: "About Us", href: "#about-us" },
                        { label: "Our Menu", href: "#menu" },
                        { label: "Gallery", href: "#gallery" },
                        { label: "Contact", href: "#contact-location" },
                      ].map(({ label, href }) => (
                        <a
                          key={label}
                          href={href}
                          className="group flex items-center text-sm transition-all duration-200 hover:translate-x-1"
                          style={{ color: currentTheme.colors.textSecondary }}
                          onClick={(e) => {
                            if (href.startsWith("#")) {
                              e.preventDefault();
                              const element = document.getElementById(
                                href.substring(1)
                              );
                              if (element) {
                                element.scrollIntoView({ behavior: "smooth" });
                              }
                            }
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full mr-3 transition-all duration-200"
                            style={{
                              backgroundColor:
                                currentTheme.colors.textSecondary + "40",
                            }}
                          />
                          <span className="group-hover:font-medium transition-all duration-200">
                            {label}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="lg:col-span-1">
                    <h4
                      className="text-lg font-bold mb-6 flex items-center"
                      style={{
                        color: currentTheme.colors.text,
                        fontFamily: currentTheme.fonts.heading,
                      }}
                    >
                      <div
                        className="w-1 h-6 rounded-full mr-3"
                        style={{ backgroundColor: currentTheme.colors.accent }}
                      />
                      Our Services
                    </h4>
                    <div className="space-y-3">
                      {[
                        "Digital Menu Creation",
                        "Restaurant Websites",
                        "Online Ordering",
                        "Brand Development",
                        "Marketing Solutions",
                      ].map((service) => (
                        <div
                          key={service}
                          className="flex items-center text-sm"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full mr-3"
                            style={{
                              backgroundColor:
                                currentTheme.colors.accent + "60",
                            }}
                          />
                          {service}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="lg:col-span-1">
                    <h4
                      className="text-lg font-bold mb-6 flex items-center"
                      style={{
                        color: currentTheme.colors.text,
                        fontFamily: currentTheme.fonts.heading,
                      }}
                    >
                      <div
                        className="w-1 h-6 rounded-full mr-3"
                        style={{ backgroundColor: currentTheme.colors.success }}
                      />
                      Get in Touch
                    </h4>

                    <div className="space-y-4">
                      {/* Email */}
                      <div className="group">
                        <div className="flex items-start">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200"
                            style={{
                              backgroundColor:
                                currentTheme.colors.success + "15",
                            }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              style={{ color: currentTheme.colors.success }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p
                              className="text-xs font-medium mb-1"
                              style={{ color: currentTheme.colors.text }}
                            >
                              Email
                            </p>
                            <a
                              href="mailto:support@energyflow.com"
                              className="text-sm hover:underline transition-all duration-200"
                              style={{
                                color: currentTheme.colors.textSecondary,
                              }}
                            >
                              support@enerzyflow.com
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="group">
                        <div className="flex items-start">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200"
                            style={{
                              backgroundColor:
                                currentTheme.colors.primary + "15",
                            }}
                          >
                            <Phone
                              className="w-4 h-4"
                              style={{ color: currentTheme.colors.primary }}
                            />
                          </div>
                          <div>
                            <p
                              className="text-xs font-medium mb-1"
                              style={{ color: currentTheme.colors.text }}
                            >
                              Call Us
                            </p>
                            <a
                              href="tel:+90025 20720"
                              className="text-sm hover:underline transition-all duration-200"
                              style={{
                                color: currentTheme.colors.textSecondary,
                              }}
                            >
                              +91 90025 20720
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Separator */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    />
                    <div
                      className="w-16 h-px"
                      style={{
                        backgroundColor: currentTheme.colors.primary + "50",
                      }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{ borderColor: currentTheme.colors.primary }}
                    />
                    <div
                      className="w-16 h-px"
                      style={{
                        backgroundColor: currentTheme.colors.primary + "50",
                      }}
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    />
                  </div>
                </div>

                {/* Bottom Section */}
                <div
                  className="flex flex-col lg:flex-row justify-between items-center gap-6 pt-8 border-t"
                  style={{ borderColor: currentTheme.colors.primary + "20" }}
                >
                  {/* Powered by section with enhanced styling */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Powered by
                      </span>
                      <div
                        className="px-4 py-2 rounded-full border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
                        style={{
                          borderColor: currentTheme.colors.primary + "30",
                          backgroundColor: currentTheme.colors.primary + "05",
                        }}
                      >
                        <a
                          href="https://www.enerzyflow.com/"
                          className="font-bold text-sm"
                          style={{ color: currentTheme.colors.primary }}
                        >
                          EnerZyFlow
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Copyright with enhanced styling */}
                  <div className="flex items-center gap-4">
                    <div
                      className="text-sm font-medium"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      © 2025 All Rights Reserved
                    </div>

                    {/* Additional links */}
                    <div className="hidden lg:flex items-center gap-4 text-xs">
                      <a
                        href="#"
                        className="hover:underline transition-all duration-200"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Privacy Policy
                      </a>
                      <span
                        style={{
                          color: currentTheme.colors.textSecondary + "50",
                        }}
                      >
                        •
                      </span>
                      <a
                        href="#"
                        className="hover:underline transition-all duration-200"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Terms of Service
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom accent border */}
            <div
              className="h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
              style={{ color: currentTheme.colors.primary }}
            />
          </footer>
        </div>
      </div>

      {/* Clean Full-Screen Image Viewer - Only Image and Navigation */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
          }}
          onClick={closeImageViewerEnhanced}
          onTouchStart={handleTouchStartEnhanced}
          onTouchMove={handleTouchMoveEnhanced}
          onTouchEnd={handleTouchEndEnhanced}
        >
          {/* Close Button */}
          <button
            aria-label="Close Image Viewer"
            onClick={(e) => {
              e.stopPropagation();
              closeImageViewerEnhanced();
            }}
            className="fixed top-4 right-4 z-[100] p-3 rounded-full bg-black bg-opacity-80 text-white hover:bg-opacity-100 transition-all duration-200 backdrop-blur-sm border border-white/20"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            <X className="h-6 w-6" />
          </button>

          <div className="fixed top-4 left-4 z-[100] px-4 py-2 rounded-full bg-black bg-opacity-80 text-white text-sm backdrop-blur-sm border border-white/20">
            {fullScreenImage.currentIndex + 1} of{" "}
            {fullScreenImage.images.length}
          </div>

          {/* Previous/Next Navigation Buttons */}
          {fullScreenImage.images.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                aria-label="Previous Image"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImageEnhanced("prev");
                }}
                className="fixed left-4 top-1/2 transform -translate-y-1/2 z-[100] p-4 rounded-full bg-black bg-opacity-80 text-white hover:bg-opacity-100 transition-all duration-200 backdrop-blur-sm border border-white/20 group"
                style={{
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                <ChevronLeft className="h-8 w-8 group-hover:scale-110 transition-transform duration-200" />
              </button>

              {/* Next Button */}
              <button
                aria-label="Next Image"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImageEnhanced("next");
                }}
                className="fixed right-4 top-1/2 transform -translate-y-1/2 z-[100] p-4 rounded-full bg-black bg-opacity-80 text-white hover:bg-opacity-100 transition-all duration-200 backdrop-blur-sm border border-white/20 group"
                style={{
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                <ChevronRight className="h-8 w-8 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </>
          )}

          {/* Main Image */}
          <div className="fixed inset-0 flex items-center justify-center">
            <img
              src={fullScreenImage.url}
              alt={fullScreenImage.alt}
              className="select-none max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicRestaurantView;
