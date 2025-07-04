import React, { useState } from 'react';
import { useRestaurant } from '../hooks/useRestaurant';
import { Copy, ExternalLink, Check, Share2, Globe } from 'lucide-react';

export const PublicUrlCard: React.FC = () => {
  const { restaurant } = useRestaurant();
  const [copied, setCopied] = useState(false);

  // Convert restaurant name to URL-friendly format
  const getUrlFriendlyName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const publicUrl = restaurant?.name 
    ? `${window.location.origin}/${getUrlFriendlyName(restaurant.name)}`
    : '';

  const copyToClipboard = async () => {
    if (!publicUrl) return;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openInNewTab = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
  };

  const shareUrl = async () => {
    if (navigator.share && publicUrl) {
      try {
        await navigator.share({
          title: `${restaurant?.name} - Restaurant Menu`,
          text: `Check out ${restaurant?.name}'s menu and information`,
          url: publicUrl,
        });
      } catch (err) {
        // Fallback to copy if share fails
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (!restaurant?.name) {
    return (
      <div className="bg-white shadow-xl rounded-2xl border border-blue-100 p-8">
        <div className="text-center">
          <Globe className="mx-auto h-12 w-12 text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Public Restaurant URL</h3>
          <p className="text-blue-600 text-sm">
            Add your restaurant name in Basic Info to generate your public URL
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl border border-blue-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center">
          <Globe className="h-6 w-6 text-white mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-white">Public Restaurant URL</h3>
            <p className="text-blue-100 text-sm">Share this link with your customers</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* URL Display */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-700 mb-1">Your Public URL:</p>
              <p className="text-sm font-mono text-blue-900 truncate" title={publicUrl}>
                {publicUrl}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={copyToClipboard}
            className={`inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              copied
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </>
            )}
          </button>

          <button
            onClick={openInNewTab}
            className="inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-sm bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview
          </button>

          <button
            onClick={shareUrl}
            className="inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-sm bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 transition-all duration-200"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>

        {/* Info Text */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>💡 Tip:</strong> This URL is automatically generated from your restaurant name. 
            Customers can access your menu and information without logging in.
          </p>
        </div>

        {/* QR Code Suggestion */}
        <div className="text-center pt-2">
          <p className="text-xs text-blue-600">
            💡 Consider creating a QR code for this URL to display in your restaurant
          </p>
        </div>
      </div>
    </div>
  );
};