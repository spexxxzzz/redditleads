import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: React.ReactNode;
}

export function ResponsiveContainer({ 
  children, 
  className, 
  breakpoint = 'md',
  fallback 
}: ResponsiveContainerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getResponsiveClasses = () => {
    switch (breakpoint) {
      case 'sm':
        return isMobile ? 'mobile-layout' : 'desktop-layout';
      case 'md':
        return isTablet ? 'tablet-layout' : isMobile ? 'mobile-layout' : 'desktop-layout';
      case 'lg':
        return isDesktop ? 'desktop-layout' : isTablet ? 'tablet-layout' : 'mobile-layout';
      case 'xl':
        return isDesktop ? 'desktop-layout' : 'mobile-layout';
      default:
        return 'desktop-layout';
    }
  };

  if (fallback && (breakpoint === 'sm' ? isMobile : breakpoint === 'md' ? isTablet || isMobile : breakpoint === 'lg' ? !isDesktop : false)) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn(getResponsiveClasses(), className)}>
      {children}
    </div>
  );
}

// Mobile-optimized grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  mobileCols?: number;
  tabletCols?: number;
  desktopCols?: number;
  gap?: string;
}

export function ResponsiveGrid({ 
  children, 
  className,
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  gap = 'gap-4'
}: ResponsiveGridProps) {
  return (
    <div className={cn(
      'grid',
      `grid-cols-${mobileCols}`,
      `sm:grid-cols-${tabletCols}`,
      `lg:grid-cols-${desktopCols}`,
      gap,
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  mobileSize?: string;
  tabletSize?: string;
  desktopSize?: string;
}

export function ResponsiveText({ 
  children, 
  className,
  mobileSize = 'text-sm',
  tabletSize = 'text-base',
  desktopSize = 'text-lg'
}: ResponsiveTextProps) {
  return (
    <div className={cn(
      mobileSize,
      `sm:${tabletSize}`,
      `lg:${desktopSize}`,
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized button component
interface ResponsiveButtonProps {
  children: React.ReactNode;
  className?: string;
  mobileSize?: string;
  tabletSize?: string;
  desktopSize?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function ResponsiveButton({ 
  children, 
  className,
  mobileSize = 'px-3 py-2 text-sm',
  tabletSize = 'px-4 py-2 text-base',
  desktopSize = 'px-6 py-3 text-lg',
  onClick,
  disabled = false,
  variant = 'primary'
}: ResponsiveButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'outline':
        return 'border border-orange-600 text-orange-600 hover:bg-orange-50';
      default:
        return 'bg-orange-600 hover:bg-orange-700 text-white';
    }
  };

  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors',
        mobileSize,
        `sm:${tabletSize}`,
        `lg:${desktopSize}`,
        getVariantClasses(),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
