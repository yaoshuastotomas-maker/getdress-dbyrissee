import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Calendar, Ruler, Tag } from 'lucide-react';
import { Dress, formatPHP } from '../../types';
import { SafeImage } from '../common/SafeImage';

interface DressCardProps {
  dress: Dress;
  onQuickInquire?: (dress: Dress) => void;
}

export const DressCard: React.FC<DressCardProps> = ({ dress, onQuickInquire }) => {
  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Available to Rent
          </span>
        );
      case 'RESERVED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Reserved
          </span>
        );
      case 'RENTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Currently Rented
          </span>
        );
      case 'UNDER_CLEANING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            At Atelier Cleaning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            Unavailable
          </span>
        );
    }
  };

  const primaryImage = dress.primary_image_url || dress.images?.[0]?.url || '';

  return (
    <div
      id={`dress-card-${dress.id}`}
      className="group flex flex-col bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 transition-all duration-300 hover:shadow-xl hover:border-stone-300 dark:hover:border-stone-700"
    >
      {/* Image Container */}
      <Link
        to={`/dresses/${dress.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-stone-100 dark:bg-stone-800"
      >
        <SafeImage
          src={primaryImage}
          alt={dress.name}
          fallbackTitle={dress.name}
          fallbackSubtitle={dress.category_name || 'Rissée Atelier'}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {dress.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-stone-900/90 text-[#f5efe6] backdrop-blur-sm shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-[#dfc8b4]" />
              Featured Gown
            </span>
          )}
          <div>{getAvailabilityBadge(dress.availability)}</div>
        </div>

        {/* Dress Code Tag top right */}
        {dress.dress_code && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium tracking-wider bg-stone-900/80 text-stone-200 backdrop-blur-sm border border-stone-700/50">
              <Tag className="w-2.5 h-2.5 text-[#dfc8b4]" />
              {dress.dress_code}
            </span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="w-full py-2.5 px-4 rounded-xl bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 text-xs font-medium uppercase tracking-widest text-center shadow-lg backdrop-blur-sm flex items-center justify-center gap-1.5 transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0">
            <span>View Rental Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {/* Content Info */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-1.5">
          {/* Category & Occasion */}
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase">
            <span className="text-[#a47e62] dark:text-[#dfc8b4]">
              {dress.category_name || 'Vietnamese Boutique'}
            </span>
            {dress.occasion && (
              <span className="text-stone-500 dark:text-stone-400 font-normal">
                {dress.occasion.split(',')[0]}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
            <Link to={`/dresses/${dress.slug}`}>{dress.name}</Link>
          </h3>

          {/* Sizes and Colors */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-600 dark:text-stone-400">
            {dress.sizes && dress.sizes.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Ruler className="w-3 h-3 text-stone-400" />
                <span>{dress.sizes.join(', ')}</span>
              </span>
            )}
            {dress.colors && dress.colors.length > 0 && (
              <span>• {dress.colors.slice(0, 2).join(', ')}</span>
            )}
          </div>
        </div>

        {/* Pricing & Rental Action */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100">
                {formatPHP(dress.rental_price)}
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                / rental
              </span>
              {dress.sale_price && dress.sale_price > 0 && (
                <span className="text-[10px] text-stone-400 line-through">
                  Buy: {formatPHP(dress.sale_price)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <Calendar className="w-2.5 h-2.5" /> {dress.rental_duration || '3-day reservation'}
            </span>
          </div>

          {onQuickInquire && (
            <button
              type="button"
              onClick={() => onQuickInquire(dress)}
              className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium transition-colors"
            >
              Inquire
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
