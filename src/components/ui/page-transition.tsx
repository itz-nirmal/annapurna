"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { FastPageLoading } from "./loading";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only show loading if pathname actually changed
    if (previousPathname.current !== pathname) {
      setIsLoading(true);
      setShowContent(false);

      // Clear any existing timeout
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }

      // Fast loading - only 200ms for better UX
      loadingTimeout.current = setTimeout(() => {
        setIsLoading(false);
        setShowContent(true);
      }, 200);

      previousPathname.current = pathname;
    }

    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, [pathname]);

  return (
    <>
      {/* Fast Loading Screen */}
      {isLoading && <FastPageLoading />}

      {/* Page Content with smooth transition */}
      <div 
        className={`transition-opacity duration-200 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}

export function LoadingScreen() {
  return <FastPageLoading />;
}