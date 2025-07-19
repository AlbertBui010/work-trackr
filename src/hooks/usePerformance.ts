import { useState, useEffect, useCallback, useMemo } from 'react';
import { WorkLog } from '../contexts/WorkLogContext';

interface UsePerformanceOptions {
  pageSize?: number;
  enableVirtualization?: boolean;
  cacheKey?: string;
}

interface PerformanceState<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
}

// Cache implementation
class DataCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }
}

const dataCache = new DataCache();

export const usePerformance = <T>(
  data: T[],
  options: UsePerformanceOptions = {}
) => {
  const { pageSize = 50, enableVirtualization = true, cacheKey } = options;
  
  const [state, setState] = useState<PerformanceState<T>>({
    data: [],
    loading: false,
    hasMore: true,
    error: null
  });
  
  const [currentPage, setCurrentPage] = useState(0);

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    if (cacheKey) {
      const cached = dataCache.get(cacheKey);
      if (cached) return cached;
    }
    
    // Process data (could include filtering, sorting, etc.)
    const processed = data.slice(); // Clone to avoid mutations
    
    if (cacheKey) {
      dataCache.set(cacheKey, processed);
    }
    
    return processed;
  }, [data, cacheKey]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = 0;
    const endIndex = (currentPage + 1) * pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize]);

  // Load more data
  const loadMore = useCallback(() => {
    if (state.loading || !state.hasMore) return;
    
    setState(prev => ({ ...prev, loading: true }));
    
    // Simulate async loading
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const hasMore = (nextPage + 1) * pageSize < processedData.length;
      
      setCurrentPage(nextPage);
      setState(prev => ({
        ...prev,
        data: paginatedData,
        loading: false,
        hasMore
      }));
    }, 100);
  }, [currentPage, pageSize, processedData.length, paginatedData, state.loading, state.hasMore]);

  // Initialize data
  useEffect(() => {
    setState({
      data: paginatedData,
      loading: false,
      hasMore: pageSize < processedData.length,
      error: null
    });
  }, [paginatedData, pageSize, processedData.length]);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(0);
  }, [data]);

  return {
    ...state,
    loadMore,
    totalCount: processedData.length,
    currentPage,
    pageSize
  };
};

// Debounce hook for search optimization
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Virtual scrolling hook
export const useVirtualScroll = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    itemCount
  );
  
  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  return {
    visibleStart,
    visibleEnd,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
    
    // Memory usage (if available)
    if ('memory' in performance) {
      const updateMemory = () => {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: (performance as any).memory.usedJSHeapSize / 1024 / 1024
        }));
      };
      
      const interval = setInterval(updateMemory, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  return metrics;
};

export { dataCache };