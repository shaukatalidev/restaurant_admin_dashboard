import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ThemeSelector } from "../components/ThemeSelector";
import { PublicUrlCard } from "../components/PublicUrlCard";
import { BasicInfo } from "./BasicInfo";
import { Location } from "./Location";
import { OpeningHours } from "./OpeningHours";
import { Features } from "./Features";
import { MenuManagement } from "./MenuManagement";
import { Gallery } from "./Gallery";
import { OffersManagement } from "./OffersManagement";
import { TodaysSpecial } from "./TodaysSpecial";
import {
  Home,
  Info,
  MapPin,
  Clock,
  Star,
  Menu,
  Image,
  Calendar,
  // Settings,
  LogOut,
  // Eye,
  Award,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "overview", icon: Home },
  { name: "Basic Info", href: "basic-info", icon: Info },
  { name: "Location", href: "location", icon: MapPin },
  { name: "Opening Hours", href: "hours", icon: Clock },
  { name: "Features", href: "features", icon: Star },
  { name: "Menu Management", href: "menu", icon: Menu },
  { name: "Gallery", href: "gallery", icon: Image },
  { name: "Special Offers", href: "offers", icon: Award },
  { name: "Today's Special", href: "specials", icon: Calendar },
];

export const SinglePageDashboard: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const [activeSection, setActiveSection] = useState("overview");
  const { signOut } = useAuth();
  // const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // const handlePreview = () => {
  //   navigate("/preview");
  // };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div className="text-center py-16">
              <h1 className="text-4xl font-bold text-blue-900 mb-4">
                Welcome to Your Restaurant Dashboard
              </h1>
              <p className="text-xl text-blue-700 mb-8">
                Manage your restaurant information and settings from here.
              </p>
              <div className="flex justify-center gap-4">
                {/* <button
                  onClick={handlePreview}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Preview Restaurant
                </button> */}
                <ThemeSelector />
              </div>
            </div>

            {/* Public URL Card */}
            <div className="max-w-2xl mx-auto">
              <PublicUrlCard />
            </div>
          </div>
        );
      case "basic-info":
        return <BasicInfo />;
      case "location":
        return <Location />;
      case "hours":
        return <OpeningHours />;
      case "features":
        return <Features />;
      case "menu":
        return <MenuManagement />;
      case "gallery":
        return <Gallery />;
      case "offers":
        return <OffersManagement />;
      case "specials":
        return <TodaysSpecial />;
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Sidebar */}
          <div
            className="relative flex-1 flex flex-col max-w-xs w-full 
      bg-gradient-to-b from-blue-800 to-purple-800 shadow-xl 
      transform transition-transform duration-300 translate-x-0"
          >
            {/* Close button inside the sidebar header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-900 to-purple-900">
              <h2 className="text-white text-lg font-semibold">Menu</h2>
              <button
                aria-label="hide sidebar"
                onClick={() => setShowSidebar(false)}
                className="text-white focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="mt-2 px-2 space-y-1 overflow-y-auto flex-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveSection(item.href);
                    setShowSidebar(false);
                  }}
                  className={`${
                    activeSection === item.href
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left`}
                >
                  <item.icon
                    className={`${
                      activeSection === item.href
                        ? "text-yellow-300"
                        : "text-blue-300"
                    } mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-200`}
                    aria-hidden="true"
                  />
                  {item.name}
                </button>
              ))}

              <button
                onClick={handleSignOut}
                className="flex items-center text-blue-100 hover:text-white w-full px-2 py-2 text-sm font-medium rounded-md hover:bg-red-600 transition-all duration-200"
              >
                <LogOut className="text-blue-300 mr-3 flex-shrink-0 h-6 w-6" />
                Sign out
              </button>
            </nav>
          </div>

          {/* Backdrop */}
          <div
            className="flex-shrink-0 w-full bg-black bg-opacity-50"
            onClick={() => setShowSidebar(false)}
          ></div>
        </div>
      )}

      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-gradient-to-b from-blue-800 to-purple-800 shadow-2xl">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-blue-900 to-purple-900">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    Restaurant Admin
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setActiveSection(item.href)}
                    className={`${
                      activeSection === item.href
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-blue-100 hover:bg-blue-700 hover:text-white"
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left`}
                  >
                    <item.icon
                      className={`${
                        activeSection === item.href
                          ? "text-yellow-300"
                          : "text-blue-300"
                      } mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-200`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </button>
                ))}
              </nav>
              <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
                <div className="flex flex-col space-y-2 w-full">
                  {/* <button
                    onClick={handlePreview}
                    className="flex items-center text-blue-100 hover:text-white group w-full px-2 py-2 text-sm font-medium rounded-md hover:bg-blue-700 transition-all duration-200"
                  >
                    <Eye className="text-blue-300 mr-3 flex-shrink-0 h-6 w-6" />
                    Preview
                  </button> */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-blue-100 hover:text-white group w-full px-2 py-2 text-sm font-medium rounded-md hover:bg-red-600 transition-all duration-200"
                  >
                    <LogOut className="text-blue-300 mr-3 flex-shrink-0 h-6 w-6" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden bg-gradient-to-r from-blue-900 to-purple-900 px-4 py-3 flex items-center justify-between shadow-md">
          <button
            aria-label="show side bar"
            onClick={() => setShowSidebar(true)}
            className="text-white focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-white font-semibold text-lg">Restaurant Admin</h1>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
