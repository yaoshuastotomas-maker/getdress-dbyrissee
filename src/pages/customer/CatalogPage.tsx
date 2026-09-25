import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { Dress, Category, AvailabilityStatus, formatPHP } from '../../types';
import { api } from '../../services/api';
import { DressCard } from '../../components/customer/DressCard';
import { InquiryModal } from '../../components/customer/InquiryModal';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDressForInquiry, setSelectedDressForInquiry] = useState<Dress | null>(null);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [selectedOccasion, setSelectedOccasion] = useState(searchParams.get('occasion') || 'ALL');
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityStatus | 'ALL'>('ALL');
  const [selectedSize, setSelectedSize] = useState('ALL');
  const [selectedColor, setSelectedColor] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'name_asc'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch categories & dresses
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.categories.list(),
      api.dresses.list({}, false)
    ])
      .then(([cats, dressRes]) => {
        if (!isMounted) return;
        setCategories(cats.filter(c => !c.archived));
        setDresses(dressRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch catalog:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync category or occasion from URL param
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) setSelectedCategory(catParam);
    const occParam = searchParams.get('occasion');
    if (occParam) setSelectedOccasion(occParam);
  }, [searchParams]);

  // Extract all unique sizes, colors, and occasions from catalog
  const { allSizes, allColors, allOccasions } = useMemo(() => {
    const sizeSet = new Set<string>();
    const colorSet = new Set<string>();
    const occasionSet = new Set<string>([
      'Birthdays',
      'Debuts',
      'Weddings',
      'Parties',
      'Photoshoots',
      'Formal Events',
      'Special Occasions'
    ]);

    dresses.forEach((d) => {
      if (d.sizes) d.sizes.forEach((s) => sizeSet.add(s));
      if (d.colors) d.colors.forEach((c) => colorSet.add(c));
      if (d.occasion) {
        d.occasion.split(',').forEach((o) => occasionSet.add(o.trim()));
      }
    });

    return {
      allSizes: Array.from(sizeSet).sort(),
      allColors: Array.from(colorSet).sort(),
      allOccasions: Array.from(occasionSet).filter(Boolean).sort(),
    };
  }, [dresses]);

  // Client-side instant filter & sort
  const filteredDresses = useMemo(() => {
    return dresses.filter((dress) => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = dress.name.toLowerCase().includes(q);
        const matchesDesc = dress.description.toLowerCase().includes(q);
        const matchesCat = dress.category_name?.toLowerCase().includes(q);
        const matchesColor = dress.colors?.some((c) => c.toLowerCase().includes(q));
        const matchesOccasion = dress.occasion?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesColor && !matchesOccasion) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'ALL') {
        if (dress.category_id !== selectedCategory && dress.category_name !== selectedCategory) {
          return false;
        }
      }

      // Occasion
      if (selectedOccasion !== 'ALL') {
        if (!dress.occasion || !dress.occasion.toLowerCase().includes(selectedOccasion.toLowerCase())) {
          return false;
        }
      }

      // Availability
      if (selectedAvailability !== 'ALL') {
        if (dress.availability !== selectedAvailability) return false;
      }

      // Size
      if (selectedSize !== 'ALL') {
        if (!dress.sizes || !dress.sizes.includes(selectedSize)) return false;
      }

      // Color
      if (selectedColor !== 'ALL') {
        if (!dress.colors || !dress.colors.includes(selectedColor)) return false;
      }

      // Price
      if (Number(dress.rental_price) > maxPrice) {
        return false;
      }

      // Featured
      if (featuredOnly && !dress.featured) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return Number(a.rental_price) - Number(b.rental_price);
      if (sortBy === 'price_high') return Number(b.rental_price) - Number(a.rental_price);
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  }, [
    dresses,
    search,
    selectedCategory,
    selectedOccasion,
    selectedAvailability,
    selectedSize,
    selectedColor,
    maxPrice,
    featuredOnly,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('ALL');
    setSelectedOccasion('ALL');
    setSelectedAvailability('ALL');
    setSelectedSize('ALL');
    setSelectedColor('ALL');
    setMaxPrice(1000);
    setFeaturedOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a47e62] dark:text-[#dfc8b4]">
          Get Dress'd by Rissée
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-stone-900 dark:text-stone-100">
          Vietnamese Dress Rental Collection
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed">
          Explore handcrafted Vietnamese designer gowns for 3-day rental periods (₱500–₱700 rate). Tailored for birthdays, debuts, weddings, photoshoots, and black-tie galas.
        </p>
      </div>

      {/* Fitting Schedule Callout Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#faf5f0] dark:bg-stone-900 border border-[#e8d5c4] dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5 text-left">
          <Clock className="w-5 h-5 text-[#a47e62] shrink-0" />
          <div className="text-xs text-stone-700 dark:text-stone-300">
            <span className="font-semibold text-stone-900 dark:text-stone-100 block sm:inline">
              Need to check the fit?{' '}
            </span>
            <span>
              You may arrange a schedule with us for measuring or fitting the dress. Send your preferred date and time, and we'll coordinate with you.
            </span>
          </div>
        </div>
        <Link
          to="/contact"
          className="shrink-0 px-5 py-2 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors flex items-center gap-1.5"
        >
          <span>Schedule Fitting</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Search & Top Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dresses by name, occasion, color, or silhouette..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 uppercase tracking-wider hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium focus:outline-none"
            >
              <option value="newest">Newest Additions</option>
              <option value="price_low">Rental: Low to High</option>
              <option value="price_high">Rental: High to Low</option>
              <option value="name_asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Layout: Filters Sidebar (desktop) + Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Filter Controls Sidebar */}
        <aside
          className={`space-y-6 md:block ${
            mobileFilterOpen ? 'block' : 'hidden'
          } p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 h-fit shadow-sm`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-bold tracking-widest uppercase text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#a47e62]" />
              <span>Filter Catalog</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Occasion Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">
              Occasion
            </label>
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
            >
              <option value="ALL">All Occasions</option>
              {allOccasions.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">
              Category
            </label>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                All Categories ({dresses.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {cat.name} ({cat.dress_count || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Availability Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">
              Availability
            </label>
            <select
              value={selectedAvailability}
              onChange={(e: any) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available Now</option>
              <option value="RESERVED">Reserved</option>
              <option value="RENTED">Currently Rented</option>
            </select>
          </div>

          {/* Size Filter */}
          {allSizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">
                Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="ALL">All Sizes</option>
                {allSizes.map((sz) => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>
          )}

          {/* Color Filter */}
          {allColors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">
                Color
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="ALL">All Colors</option>
                {allColors.map((clr) => (
                  <option key={clr} value={clr}>{clr}</option>
                ))}
              </select>
            </div>
          )}

          {/* Max Rental Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">
                Max Rental Rate
              </span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{formatPHP(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="400"
              max="1000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-stone-900 dark:accent-stone-100"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>₱400</span>
              <span>₱700 (Standard)</span>
              <span>₱1,000</span>
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="rounded text-stone-900 focus:ring-stone-500"
              />
              <Sparkles className="w-3.5 h-3.5 text-[#a47e62]" />
              <span>Featured Couture Only</span>
            </label>
          </div>

        </aside>

        {/* Dress Cards Grid */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span>Showing {filteredDresses.length} of {dresses.length} gowns</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-stone-200 dark:bg-stone-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredDresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDresses.map((dress) => (
                <DressCard
                  key={dress.id}
                  dress={dress}
                  onQuickInquire={(d) => setSelectedDressForInquiry(d)}
                />
              ))}
            </div>
          ) : dresses.length === 0 ? (
            <div className="p-12 sm:p-16 text-center bg-gradient-to-br from-[#faf7f2] via-[#f5efe6] to-[#ece3d4] dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-950 rounded-3xl border border-[#dfc8b4]/60 dark:border-stone-800 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-stone-800/80 shadow-xs flex items-center justify-center mx-auto border border-[#dfc8b4]/50">
                <Sparkles className="w-5 h-5 text-[#a47e62] dark:text-[#dfc8b4]" />
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#a47e62] dark:text-[#dfc8b4] block">
                Atelier Collection Curation
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-medium">
                New Vietnamese Couture Arrivals Coming Soon
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
                We are currently cataloging our latest hand-selected Vietnamese designer gowns. To reserve upcoming styles or schedule a private fitting appointment, please contact our atelier directly.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white shadow transition-all"
                >
                  Book Fitting Appointment
                </Link>
                <Link
                  to="/payment"
                  className="px-6 py-3 rounded-full bg-white/70 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 text-xs font-medium uppercase tracking-wider hover:bg-white transition-all"
                >
                  Rental & Delivery Guide
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-4">
              <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100 font-medium">
                No Gowns Found
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                We couldn't find any dresses matching your current filters. Try changing your search query or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Quick Inquiry Modal */}
      <InquiryModal
        isOpen={Boolean(selectedDressForInquiry)}
        onClose={() => setSelectedDressForInquiry(null)}
        dress={selectedDressForInquiry}
      />
    </div>
  );
};
