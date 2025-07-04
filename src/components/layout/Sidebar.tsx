import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Info, 
  MapPin, 
  Clock, 
  Star, 
  Menu, 
  Image, 
  Calendar,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Basic Info', href: '/dashboard/basic-info', icon: Info },
  { name: 'Location', href: '/dashboard/location', icon: MapPin },
  { name: 'Opening Hours', href: '/dashboard/hours', icon: Clock },
  { name: 'Features', href: '/dashboard/features', icon: Star },
  { name: 'Menu Management', href: '/dashboard/menu', icon: Menu },
  { name: 'Gallery', href: '/dashboard/gallery', icon: Image },
  { name: 'Today\'s Special', href: '/dashboard/specials', icon: Calendar },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Restaurant Admin</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`
                  }
                >
                  <item.icon
                    className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-300 hover:text-white group w-full"
              >
                <LogOut className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};