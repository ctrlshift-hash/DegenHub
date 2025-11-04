"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Search, Loader2 } from "lucide-react";

interface GifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
}

// Giphy Public API Key (anon key - safe for client-side)
// Get a free key from https://developers.giphy.com/ (free tier: 42 requests/hour)
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "YOUR_GIPHY_API_KEY";

export default function GifPicker({ isOpen, onClose, onSelect }: GifPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load trending GIFs on mount
  useEffect(() => {
    if (isOpen) {
      console.log("GifPicker opened, loading trending GIFs");
      loadTrending();
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  const loadTrending = async () => {
    setLoading(true);
    setTrending(true);
    try {
      // Use Giphy's public API endpoint
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=24&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error("Failed to load trending GIFs:", error);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      loadTrending();
      return;
    }

    setLoading(true);
    setTrending(false);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error("Failed to search GIFs:", error);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchGifs(searchQuery);
  };

  const handleSelect = (gif: any) => {
    // Use the original size or downsized medium for better quality
    const gifUrl = gif.images?.original?.url || gif.images?.downsized_medium?.url || gif.images?.fixed_height?.url;
    if (gifUrl) {
      onSelect(gifUrl);
      onClose();
      setSearchQuery("");
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">Choose a GIF</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) {
                    searchGifs(e.target.value);
                  } else {
                    loadTrending();
                  }
                }}
                placeholder="Search for GIFs"
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* GIF Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && gifs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : gifs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {GIPHY_API_KEY === "YOUR_GIPHY_API_KEY" ? (
                <div>
                  <p className="mb-2">Giphy API key not configured</p>
                  <p className="text-sm">Get a free key at <a href="https://developers.giphy.com/" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">developers.giphy.com</a></p>
                </div>
              ) : (
                <p>No GIFs found</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleSelect(gif)}
                  className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                >
                  <img
                    src={gif.images?.fixed_height_small?.url || gif.images?.preview_gif?.url}
                    alt={gif.title || "GIF"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

