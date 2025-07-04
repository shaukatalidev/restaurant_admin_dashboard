import React, { useState } from "react";
import { useTheme, THEMES } from "../contexts/ThemeContext";
import { Palette, Check, Eye, Save, X } from "lucide-react";

export const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, loading } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState(currentTheme.id);
  const [saving, setSaving] = useState(false);

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      await setTheme(previewTheme);
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving theme:", error);
    } finally {
      setSaving(false);
    }
  };

  const selectedTheme =
    THEMES.find((t) => t.id === previewTheme) || currentTheme;

  return (
    <>
      {/* Theme Selector Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
      >
        <Palette className="h-4 w-4 mr-2" />
        Themes
      </button>

      {/* Theme Selector Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Choose Your Theme
                  </h2>
                  <p className="text-blue-100 mt-1">
                    Customize your restaurant's appearance
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Theme Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {THEMES.map((theme) => (
                  <div
                    key={theme.id}
                    className={`relative group cursor-pointer transition-all duration-300 ${
                      previewTheme === theme.id
                        ? "ring-4 ring-blue-500 ring-offset-4"
                        : "hover:scale-105"
                    }`}
                    onClick={() => setPreviewTheme(theme.id)}
                  >
                    {/* Theme Preview Card */}
                    <div
                      className={`${theme.effects.borderRadius} overflow-hidden ${theme.effects.shadow} hover:${theme.effects.shadowHover} transition-all duration-300`}
                    >
                      {/* Theme Header Preview */}
                      <div
                        className={`bg-gradient-to-r ${theme.gradients.header} p-4 text-white`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3
                              className="font-bold text-lg"
                              style={{ fontFamily: theme.fonts.heading }}
                            >
                              {theme.name}
                            </h3>
                            <p className="text-sm opacity-90">
                              {theme.preview}
                            </p>
                          </div>
                          {previewTheme === theme.id && (
                            <div className="bg-white/20 rounded-full p-2">
                              <Check className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Theme Content Preview */}
                      <div
                        style={{ backgroundColor: theme.colors.background }}
                        className="p-4 space-y-3"
                      >
                        {/* Sample Card */}
                        <div
                          style={{ backgroundColor: theme.colors.surface }}
                          className={`p-3 ${theme.effects.borderRadius} border`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4
                              className="font-semibold text-sm"
                              style={{
                                color: theme.colors.text,
                                fontFamily: theme.fonts.heading,
                              }}
                            >
                              Sample Dish
                            </h4>
                            <span
                              className="font-bold text-sm"
                              style={{ color: theme.colors.success }}
                            >
                              ₹299
                            </span>
                          </div>
                          <p
                            className="text-xs mb-3"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            Delicious sample description
                          </p>
                          <button
                            className={`bg-gradient-to-r ${theme.gradients.button} text-white px-3 py-1 rounded-lg text-xs font-semibold`}
                          >
                            Add to Cart
                          </button>
                        </div>

                        {/* Color Palette */}
                        <div className="flex space-x-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: theme.colors.primary }}
                            title="Primary"
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: theme.colors.secondary }}
                            title="Secondary"
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: theme.colors.accent }}
                            title="Accent"
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: theme.colors.success }}
                            title="Success"
                          />
                        </div>
                      </div>

                      {/* Theme Description */}
                      <div className="p-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                          {theme.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Font:</span>{" "}
                            {theme.fonts.heading.split(",")[0]}
                          </div>
                          {currentTheme.id === theme.id && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview Section */}
              {previewTheme !== currentTheme.id && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Preview: {selectedTheme.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {selectedTheme.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setPreviewTheme(currentTheme.id)}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveTheme}
                        disabled={saving}
                        className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {saving ? "Saving..." : "Apply Theme"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
