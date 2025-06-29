"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// List of main pages to prefetch
const MAIN_PAGES = [
  '/dashboard',
  '/dashboard/inventory',
  '/dashboard/add-item',
  '/dashboard/shopping-list',
  '/account',
];

export default function PagePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch main pages after a short delay to avoid blocking initial load
    const prefetchTimer = setTimeout(() => {
      MAIN_PAGES.forEach(page => {
        router.prefetch(page);
      });
    }, 1000);

    return () => clearTimeout(prefetchTimer);
  }, [router]);

  // This component doesn't render anything
  return null;
}