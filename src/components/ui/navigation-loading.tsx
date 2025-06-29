"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PageLoading } from './loading';
import { useLoading } from '@/contexts/loading-context';

export default function NavigationLoading() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const { isLoading, showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true);
      showLoading();
    };

    // Listen for route changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      handleStart();
      originalPushState.apply(history, args);
    };

    history.replaceState = function(...args) {
      handleStart();
      originalReplaceState.apply(history, args);
    };

    window.addEventListener('popstate', handleStart);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleStart);
    };
  }, [showLoading, hideLoading]);

  // Hide loading when pathname changes (page is ready)
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
        hideLoading();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname, isNavigating, hideLoading]);

  // Show the full AnnaPurna loading screen when navigating
  if (isLoading || isNavigating) {
    return <PageLoading />;
  }

  return null;
}