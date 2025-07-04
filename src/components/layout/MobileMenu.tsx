import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Basic Info', href: '/dashboard/basic-info' },
  { name: 'Location', href: '/dashboard/location' },
  { name: 'Opening Hours', href: '/dashboard/hours' },
  { name: 'Features', href: '/dashboard/features' },
  { name: 'Menu Management', href: '/dashboard/menu' },
  { name: 'Gallery', href: '/dashboard/gallery' },
  { name: 'Today\'s Special', href: '/dashboard/specials' },
  { name: 'Settings', href: '/dashboard/settings' },
];

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="md:hidden">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Restaurant Admin</h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } block px-3 py-2 rounded-md text-base font-medium border-l-4 border-transparent`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md text-base font-medium flex items-center"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};