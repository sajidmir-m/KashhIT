import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 20;

interface RecentlyViewedProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  viewedAt: number;
}

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentlyViewed(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  }, []);

  const addProduct = useCallback((product: { id: string; name: string; price: number; image_url?: string }) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let items: RecentlyViewedProduct[] = stored ? JSON.parse(stored) : [];

      // Remove if already exists
      items = items.filter(item => item.id !== product.id);

      // Add to beginning
      items.unshift({
        ...product,
        viewedAt: Date.now(),
      });

      // Keep only MAX_ITEMS
      items = items.slice(0, MAX_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setRecentlyViewed(items);
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentlyViewed([]);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  }, []);

  return {
    recentlyViewed,
    addProduct,
    clearRecentlyViewed,
  };
};

