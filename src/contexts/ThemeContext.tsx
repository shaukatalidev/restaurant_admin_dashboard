import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface Theme {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
  };
  gradients: {
    hero: string;
    header: string;
    card: string;
    button: string;
    special: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  effects: {
    shadow: string;
    shadowHover: string;
    borderRadius: string;
    animation: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'modern-elegance',
    name: 'Modern Elegance',
    description: 'Clean, sophisticated design with subtle gradients and premium feel',
    preview: '🎨 Minimalist & Professional',
    colors: {
      primary: '#1e40af',
      secondary: '#7c3aed',
      accent: '#f59e0b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    gradients: {
      hero: 'from-blue-600 via-purple-600 to-indigo-700',
      header: 'from-blue-600 to-purple-600',
      card: 'from-gray-50 to-blue-50',
      button: 'from-blue-500 to-purple-500',
      special: 'from-yellow-50 via-orange-50 to-red-50',
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-xl',
      shadowHover: 'shadow-2xl',
      borderRadius: 'rounded-3xl',
      animation: 'transition-all duration-300',
    },
  },
  {
    id: 'warm-rustic',
    name: 'Warm Rustic',
    description: 'Cozy, earthy tones with organic shapes and warm atmosphere',
    preview: '🍂 Cozy & Inviting',
    colors: {
      primary: '#92400e',
      secondary: '#dc2626',
      accent: '#f59e0b',
      background: '#fef7ed',
      surface: '#fffbeb',
      text: '#451a03',
      textSecondary: '#78716c',
      success: '#16a34a',
      warning: '#ea580c',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-amber-600 via-orange-600 to-red-600',
      header: 'from-amber-600 to-orange-600',
      card: 'from-orange-50 to-amber-50',
      button: 'from-orange-500 to-red-500',
      special: 'from-yellow-100 via-amber-100 to-orange-100',
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      borderRadius: 'rounded-2xl',
      animation: 'transition-all duration-500',
    },
  },
  {
    id: 'vibrant-tropical',
    name: 'Vibrant Tropical',
    description: 'Bold, energetic colors with tropical vibes and playful elements',
    preview: '🌺 Bold & Energetic',
    colors: {
      primary: '#059669',
      secondary: '#7c2d12',
      accent: '#f59e0b',
      background: '#ecfdf5',
      surface: '#f0fdf4',
      text: '#064e3b',
      textSecondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    gradients: {
      hero: 'from-emerald-500 via-teal-500 to-cyan-500',
      header: 'from-green-500 to-emerald-600',
      card: 'from-emerald-50 to-teal-50',
      button: 'from-emerald-500 to-teal-500',
      special: 'from-lime-100 via-emerald-100 to-teal-100',
    },
    fonts: {
      heading: 'Poppins, system-ui, sans-serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-xl',
      shadowHover: 'shadow-2xl',
      borderRadius: 'rounded-3xl',
      animation: 'transition-all duration-300 hover:scale-105',
    },
  },
  {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    description: 'Premium dark theme with gold accents and sophisticated atmosphere',
    preview: '🖤 Premium & Sophisticated',
    colors: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      accent: '#ef4444',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    gradients: {
      hero: 'from-gray-900 via-gray-800 to-black',
      header: 'from-gray-800 to-gray-900',
      card: 'from-gray-800 to-gray-900',
      button: 'from-yellow-500 to-amber-500',
      special: 'from-yellow-900/20 via-amber-900/20 to-orange-900/20',
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-2xl',
      shadowHover: 'shadow-3xl',
      borderRadius: 'rounded-2xl',
      animation: 'transition-all duration-400',
    },
  },
  {
    id: 'fresh-mint',
    name: 'Fresh Mint',
    description: 'Clean, fresh design with mint greens and crisp whites',
    preview: '🌿 Fresh & Clean',
    colors: {
      primary: '#059669',
      secondary: '#0d9488',
      accent: '#06b6d4',
      background: '#f0fdfa',
      surface: '#ffffff',
      text: '#134e4a',
      textSecondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    gradients: {
      hero: 'from-emerald-400 via-teal-400 to-cyan-400',
      header: 'from-emerald-500 to-teal-500',
      card: 'from-emerald-50 to-cyan-50',
      button: 'from-emerald-500 to-cyan-500',
      special: 'from-mint-100 via-emerald-100 to-cyan-100',
    },
    fonts: {
      heading: 'Nunito, system-ui, sans-serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      borderRadius: 'rounded-3xl',
      animation: 'transition-all duration-300',
    },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Calming blues and whites inspired by coastal dining experiences',
    preview: '🌊 Coastal & Serene',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#06b6d4',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0c4a6e',
      textSecondary: '#64748b',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-sky-400 via-blue-500 to-cyan-500',
      header: 'from-blue-500 to-cyan-500',
      card: 'from-sky-50 to-blue-50',
      button: 'from-sky-500 to-blue-500',
      special: 'from-cyan-50 via-sky-50 to-blue-50',
    },
    fonts: {
      heading: 'Montserrat, system-ui, sans-serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      borderRadius: 'rounded-2xl',
      animation: 'transition-all duration-300',
    },
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Warm sunset colors creating a romantic dining atmosphere',
    preview: '🌅 Romantic & Warm',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fbbf24',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#9a3412',
      textSecondary: '#78716c',
      success: '#16a34a',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-orange-400 via-red-400 to-pink-400',
      header: 'from-orange-500 to-red-500',
      card: 'from-orange-50 to-red-50',
      button: 'from-orange-500 to-pink-500',
      special: 'from-yellow-100 via-orange-100 to-red-100',
    },
    fonts: {
      heading: 'Crimson Text, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      borderRadius: 'rounded-3xl',
      animation: 'transition-all duration-400',
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural greens and browns for organic, eco-friendly restaurants',
    preview: '🌲 Natural & Organic',
    colors: {
      primary: '#166534',
      secondary: '#15803d',
      accent: '#84cc16',
      background: '#f7fee7',
      surface: '#ffffff',
      text: '#14532d',
      textSecondary: '#6b7280',
      success: '#16a34a',
      warning: '#eab308',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-green-600 via-emerald-600 to-teal-600',
      header: 'from-green-700 to-emerald-700',
      card: 'from-green-50 to-emerald-50',
      button: 'from-green-600 to-emerald-600',
      special: 'from-lime-100 via-green-100 to-emerald-100',
    },
    fonts: {
      heading: 'Merriweather, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      borderRadius: 'rounded-2xl',
      animation: 'transition-all duration-300',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Luxurious purples and golds for upscale dining establishments',
    preview: '👑 Luxurious & Regal',
    colors: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#fbbf24',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#581c87',
      textSecondary: '#6b7280',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-purple-600 via-violet-600 to-indigo-600',
      header: 'from-purple-700 to-violet-700',
      card: 'from-purple-50 to-violet-50',
      button: 'from-purple-600 to-violet-600',
      special: 'from-yellow-100 via-purple-100 to-violet-100',
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-xl',
      shadowHover: 'shadow-2xl',
      borderRadius: 'rounded-3xl',
      animation: 'transition-all duration-400',
    },
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: 'Soft pinks and whites perfect for Asian cuisine and delicate dining',
    preview: '🌸 Delicate & Elegant',
    colors: {
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#f472b6',
      background: '#fdf2f8',
      surface: '#ffffff',
      text: '#831843',
      textSecondary: '#6b7280',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-pink-400 via-rose-400 to-red-400',
      header: 'from-pink-500 to-rose-500',
      card: 'from-pink-50 to-rose-50',
      button: 'from-pink-500 to-rose-500',
      special: 'from-pink-100 via-rose-100 to-red-100',
    },
    fonts: {
      heading: 'Dancing Script, cursive',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      borderRadius: 'rounded-3xl',
      animation: 'transition-all duration-300',
    },
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Deep blues with silver accents for sophisticated evening dining',
    preview: '🌙 Sophisticated & Mysterious',
    colors: {
      primary: '#1e3a8a',
      secondary: '#1e40af',
      accent: '#94a3b8',
      background: '#f1f5f9',
      surface: '#ffffff',
      text: '#0f172a',
      textSecondary: '#64748b',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-blue-900 via-blue-800 to-indigo-800',
      header: 'from-blue-800 to-indigo-800',
      card: 'from-blue-50 to-indigo-50',
      button: 'from-blue-700 to-indigo-700',
      special: 'from-slate-100 via-blue-100 to-indigo-100',
    },
    fonts: {
      heading: 'Roboto Slab, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-xl',
      shadowHover: 'shadow-2xl',
      borderRadius: 'rounded-2xl',
      animation: 'transition-all duration-400',
    },
  },
  {
    id: 'spice-market',
    name: 'Spice Market',
    description: 'Rich reds and oranges inspired by Indian and Middle Eastern cuisine',
    preview: '🌶️ Spicy & Vibrant',
    colors: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      accent: '#f59e0b',
      background: '#fef2f2',
      surface: '#ffffff',
      text: '#7f1d1d',
      textSecondary: '#6b7280',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-red-600 via-orange-600 to-yellow-500',
      header: 'from-red-600 to-orange-600',
      card: 'from-red-50 to-orange-50',
      button: 'from-red-600 to-orange-600',
      special: 'from-yellow-100 via-orange-100 to-red-100',
    },
    fonts: {
      heading: 'Libre Baskerville, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      borderRadius: 'rounded-2xl',
      animation: 'transition-all duration-300',
    },
  },
  {
    id: 'lavender-fields',
    name: 'Lavender Fields',
    description: 'Soft purples and lavenders for a calming, French-inspired atmosphere',
    preview: '💜 Calming & French',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: '#f5f3ff',
      surface: '#ffffff',
      text: '#5b21b6',
      textSecondary: '#6b7280',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-violet-400 via-purple-400 to-indigo-400',
      header: 'from-violet-500 to-purple-500',
      card: 'from-violet-50 to-purple-50',
      button: 'from-violet-500 to-purple-500',
      special: 'from-indigo-100 via-violet-100 to-purple-100',
    },
    fonts: {
      heading: 'Cormorant Garamond, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      borderRadius: 'rounded-3xl',
      animation: 'transition-all duration-300',
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm golds and creams for a luxurious, timeless dining experience',
    preview: '✨ Luxurious & Timeless',
    colors: {
      primary: '#d97706',
      secondary: '#b45309',
      accent: '#fbbf24',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#92400e',
      textSecondary: '#78716c',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-amber-400 via-yellow-400 to-orange-400',
      header: 'from-amber-500 to-yellow-500',
      card: 'from-amber-50 to-yellow-50',
      button: 'from-amber-500 to-yellow-500',
      special: 'from-yellow-100 via-amber-100 to-orange-100',
    },
    fonts: {
      heading: 'Cinzel, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-xl',
      shadowHover: 'shadow-2xl',
      borderRadius: 'rounded-2xl',
      animation: 'transition-all duration-400',
    },
  },
  {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    description: 'Cool whites and icy blues for modern, minimalist establishments',
    preview: '❄️ Cool & Minimalist',
    colors: {
      primary: '#0891b2',
      secondary: '#0e7490',
      accent: '#06b6d4',
      background: '#f0fdff',
      surface: '#ffffff',
      text: '#164e63',
      textSecondary: '#64748b',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-cyan-400 via-blue-400 to-indigo-400',
      header: 'from-cyan-500 to-blue-500',
      card: 'from-cyan-50 to-blue-50',
      button: 'from-cyan-500 to-blue-500',
      special: 'from-sky-100 via-cyan-100 to-blue-100',
    },
    fonts: {
      heading: 'Source Sans Pro, sans-serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      borderRadius: 'rounded-3xl',
      animation: 'transition-all duration-300',
    },
  },
  {
    id: 'terracotta-earth',
    name: 'Terracotta Earth',
    description: 'Earthy terracotta and clay tones for Mediterranean and rustic dining',
    preview: '🏺 Mediterranean & Rustic',
    colors: {
      primary: '#c2410c',
      secondary: '#ea580c',
      accent: '#f97316',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#9a3412',
      textSecondary: '#78716c',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-orange-700 via-red-600 to-amber-600',
      header: 'from-orange-600 to-red-600',
      card: 'from-orange-50 to-amber-50',
      button: 'from-orange-600 to-red-600',
      special: 'from-amber-100 via-orange-100 to-red-100',
    },
    fonts: {
      heading: 'Vollkorn, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      borderRadius: 'rounded-2xl',
      animation: 'transition-all duration-300',
    },
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Electric colors and dark backgrounds for modern, trendy establishments',
    preview: '⚡ Electric & Trendy',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    gradients: {
      hero: 'from-emerald-400 via-cyan-400 to-blue-400',
      header: 'from-emerald-500 to-cyan-500',
      card: 'from-slate-800 to-slate-700',
      button: 'from-emerald-500 to-cyan-500',
      special: 'from-emerald-900/20 via-cyan-900/20 to-blue-900/20',
    },
    fonts: {
      heading: 'Orbitron, monospace',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-2xl',
      shadowHover: 'shadow-3xl',
      borderRadius: 'rounded-2xl',
      animation: 'transition-all duration-300',
    },
  },
  {
    id: 'sage-garden',
    name: 'Sage Garden',
    description: 'Muted greens and soft grays for farm-to-table and organic restaurants',
    preview: '🌱 Organic & Peaceful',
    colors: {
      primary: '#6b7280',
      secondary: '#4b5563',
      accent: '#84cc16',
      background: '#f9fafb',
      surface: '#ffffff',
      text: '#374151',
      textSecondary: '#6b7280',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-gray-500 via-green-500 to-emerald-500',
      header: 'from-gray-600 to-green-600',
      card: 'from-gray-50 to-green-50',
      button: 'from-gray-600 to-green-600',
      special: 'from-lime-100 via-gray-100 to-green-100',
    },
    fonts: {
      heading: 'Lora, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      borderRadius: 'rounded-2xl',
      animation: 'transition-all duration-300',
    },
  },
  {
    id: 'copper-bronze',
    name: 'Copper Bronze',
    description: 'Rich metallic tones for industrial chic and steakhouse atmospheres',
    preview: '🔥 Industrial & Bold',
    colors: {
      primary: '#b45309',
      secondary: '#92400e',
      accent: '#f59e0b',
      background: '#fefce8',
      surface: '#ffffff',
      text: '#78350f',
      textSecondary: '#6b7280',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-amber-700 via-orange-700 to-red-700',
      header: 'from-amber-600 to-orange-600',
      card: 'from-amber-50 to-orange-50',
      button: 'from-amber-600 to-orange-600',
      special: 'from-yellow-100 via-amber-100 to-orange-100',
    },
    fonts: {
      heading: 'Oswald, sans-serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-xl',
      shadowHover: 'shadow-2xl',
      borderRadius: 'rounded-xl',
      animation: 'transition-all duration-400',
    },
  },
  {
    id: 'pearl-white',
    name: 'Pearl White',
    description: 'Pure whites with pearl accents for elegant, high-end dining',
    preview: '🤍 Pure & Elegant',
    colors: {
      primary: '#6b7280',
      secondary: '#4b5563',
      accent: '#d1d5db',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    gradients: {
      hero: 'from-gray-100 via-white to-gray-100',
      header: 'from-gray-200 to-gray-300',
      card: 'from-white to-gray-50',
      button: 'from-gray-600 to-gray-700',
      special: 'from-gray-100 via-white to-gray-100',
    },
    fonts: {
      heading: 'Didot, serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      shadow: 'shadow-2xl',
      shadowHover: 'shadow-3xl',
      borderRadius: 'rounded-3xl',
      animation: 'transition-all duration-400',
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => Promise<void>;
  themes: Theme[];
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserTheme();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('theme_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.theme_id) {
        const theme = THEMES.find(t => t.id === data.theme_id);
        if (theme) {
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const setTheme = async (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;

    setCurrentTheme(theme);

    if (user) {
      try {
        const { error } = await supabase
          .from('restaurants')
          .update({ theme_id: themeId })
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  const value = {
    currentTheme,
    setTheme,
    themes: THEMES,
    loading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};