"use client";

import Link from 'next/link';
import { useLoading } from '@/contexts/loading-context';
import React from 'react';

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  onClick?: () => void;
}

export default function LoadingLink({ 
  href, 
  children, 
  className, 
  prefetch = true,
  onClick,
  ...props 
}: LoadingLinkProps) {
  const { showLoading } = useLoading();

  const handleClick = () => {
    // Call custom onClick if provided
    if (onClick) {
      onClick();
    }

    // Show loading immediately when link is clicked
    showLoading();
  };

  return (
    <Link 
      href={href} 
      className={className}
      prefetch={prefetch}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}