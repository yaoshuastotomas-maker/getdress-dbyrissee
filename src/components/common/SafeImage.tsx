import React, { useState } from 'react';
import { Sparkles, ImageOff } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  aspectRatioClass?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Get Dress’d by Rissée Gown',
  fallbackTitle = 'Rissée Atelier',
  fallbackSubtitle = 'Couture Rental',
  aspectRatioClass,
  className = '',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no src provided or empty string, immediately fallback
  const shouldShowFallback = hasError || !src || typeof src !== 'string' || src.trim() === '';

  if (shouldShowFallback) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#f8f5f0] via-[#f0ebe1] to-[#e6ded2] dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-950 border border-stone-200/60 dark:border-stone-800 select-none ${aspectRatioClass || ''}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-full bg-white/70 dark:bg-stone-800/80 shadow-xs flex items-center justify-center mb-3 border border-[#dfc8b4]/50">
          <Sparkles className="w-5 h-5 text-[#a47e62] dark:text-[#dfc8b4]" />
        </div>
        <p className="font-serif text-sm font-medium text-stone-900 dark:text-stone-100 tracking-wide">
          {fallbackTitle}
        </p>
        <p className="text-[11px] uppercase tracking-widest text-[#a47e62] dark:text-[#dfc8b4] font-medium mt-0.5">
          {fallbackSubtitle}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full h-full ${aspectRatioClass || ''}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 animate-pulse z-0" />
      )}
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        decoding="async"
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        {...rest}
      />
    </div>
  );
};
