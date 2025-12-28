import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useAuthHydration() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    // Check if zustand has hydrated
    if (_hasHydrated) {
      setHasHydrated(true);
    } else {
      // Fallback: check localStorage directly after a short delay
      const timer = setTimeout(() => {
        setHasHydrated(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [_hasHydrated]);

  return hasHydrated;
}


