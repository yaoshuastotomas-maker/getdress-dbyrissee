import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CreditCard,
  Smartphone,
  Building2,
  AlertCircle,
  Ruler,
  Clock,
  Truck,
  Heart
} from 'lucide-react';
import { Dress, formatPHP } from '../../types';
import { api } from '../../services/api';
import { DressCard } from '../../components/customer/DressCard';
import { InquiryModal } from '../../components/customer/InquiryModal';
import { ChibiDecoration } from '../../components/common/ChibiDecoration';
import { ChibiMascot } from '../../components/common/ChibiMascot';
import { SafeImage } from '../../components/common/SafeImage';

export const DressDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [dress, setDress] = useState<Dress | null>(null);
  const [relatedDresses, setRelatedDresses] = useState<Dress[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [initialModalMode, setInitialModalMode] = useState<'inquire' | 'measurements' | 'fitting'>('inquire');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setSelectedImageIndex(0);

    api.dresses
      .getBySlugOrId(slug)
      .then((data) => {
        setDress(data);
        document.title = `${data.name} | Get Dress'd by Rissée`;

        // Fetch related dresses
        if (data.category_id) {
          api.dresses.list({ category: data.category_id }).then((res) => {
            setRelatedDresses(res.data.filter((d) => d.id !== data.id).slice(0, 3));
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dress details:', err);
        setError('The requested dress could not be found or has been removed from the public rental catalog.');
        setLoading(false);
      });
  }, [slug]);

  const handleOpenModal = (mode: 'inquire' | 'measurements' | 'fitting') => {
    setInitialModalMode(mode);
    setInquiryModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-stone-200 dark:bg-stone-800 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-4 bg-stone-200 dark:bg-stone-800 w-1/4 rounded" />
            <div className="h-10 bg-stone-200 dark:bg-stone-800 w-3/4 rounded" />
            <div className="h-6 bg-stone-200 dark:bg-stone-800 w-1/3 rounded" />
            <div className="h-32 bg-stone-200 dark:bg-stone-800 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !dress) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl font-medium text-stone-900 dark:text-stone-100">Dress Not Found</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">{error || 'This gown is not currently available for rental.'}</p>
        <Link
          to="/dresses"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Rental Catalog</span>
        </Link>
      </div>
    );
  }

  // Combine primary image and gallery images into single array
  const galleryImages: string[] = [];
  if (dress.primary_image_url) {
    galleryImages.push(dress.primary_image_url);
  }
  if (dress.images && dress.images.length > 0) {
    dress.images.forEach((img) => {
      if (!galleryImages.includes(img.url)) {
        galleryImages.push(img.url);
      }
    });
  }
  if (galleryImages.length === 0) {
    galleryImages.push('');
  }

  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0] || '';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Available for Rental Booking
          </span>
        );
      case 'RESERVED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Reserved for Upcoming Event
          </span>
        );
      case 'RENTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Currently Out on Rental
          </span>
        );
      case 'UNDER_CLEANING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            At Atelier Dry Cleaning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            Unavailable
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Back to Catalog Breadcrumb */}
      <div>
        <Link
          to="/dresses"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Rental Collection</span>
        </Link>
      </div>

      {/* Main Grid: Gallery on left, Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        
        {/* Left Column: Multi-Photo Gallery (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Selected Image */}
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-800 shadow-sm group">
            <SafeImage
              src={currentImage}
              alt={`${dress.name} - View ${selectedImageIndex + 1}`}
              fallbackTitle={dress.name}
              fallbackSubtitle={dress.category_name || 'Rissée Atelier'}
              className="w-full h-full object-cover object-center cursor-zoom-in transition-transform duration-500 group-hover:scale-102"
              onClick={() => currentImage && setLightboxOpen(true)}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {dress.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-stone-900/90 text-white backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-[#dfc8b4]" />
                  Featured Vietnamese Gown
                </span>
              )}
            </div>

            {/* Zoom Button */}
            {currentImage && (
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 p-3 rounded-full bg-white/80 dark:bg-stone-900/80 text-stone-800 dark:text-stone-200 backdrop-blur-md shadow hover:bg-white dark:hover:bg-stone-900 transition-all"
                title="Open full-screen gallery"
                aria-label="Expand image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            {/* Prev / Next Image arrows if multiple */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 dark:bg-stone-900/80 text-stone-800 dark:text-stone-200 backdrop-blur-md shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 dark:bg-stone-900/80 text-stone-800 dark:text-stone-200 backdrop-blur-md shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Row */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-stone-900 dark:border-stone-100 ring-2 ring-stone-900/20 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt="" fallbackTitle="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Sizing & Measurements Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3.5">
            <Ruler className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-semibold">Tailored Measurement Assistance</p>
              <p className="text-amber-800/90 dark:text-amber-300 leading-relaxed">
                Please provide accurate measurements. Fitting and measurement arrangements may be discussed with our atelier to ensure your silhouette is perfect for your special occasion.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Rental Actions (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          <div className="space-y-6">
            
            {/* Category & Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-widest uppercase text-[#a47e62] dark:text-[#dfc8b4]">
                  {dress.category_name || 'Vietnamese Boutique Collection'}
                </span>
                {dress.occasion && (
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full">
                    {dress.occasion.split(',')[0]}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 dark:text-stone-100 leading-tight">
                {dress.name}
              </h1>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {dress.dress_code && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-xs font-mono font-medium text-stone-700 dark:text-stone-300">
                    <span>Item Code: {dress.dress_code}</span>
                  </span>
                )}
                <div>{getStatusBadge(dress.availability)}</div>
              </div>
            </div>

            {/* Rental Rate Box */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
              <div className="flex items-baseline justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                    Rental Rate ({dress.rental_duration || '3-Day Reservation'})
                  </span>
                  {dress.sale_price && dress.sale_price > 0 ? (
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                      Optional Purchase: {formatPHP(dress.sale_price)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ₱500 - ₱700 Boutique Pricing Range
                    </span>
                  )}
                </div>
                <span className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-100">
                  {formatPHP(dress.rental_price)}
                </span>
              </div>

              <div className="space-y-1.5 pt-1 text-xs text-stone-600 dark:text-stone-400">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Complimentary eco-friendly dry cleaning included</span>
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#a47e62] shrink-0" />
                  <span>Personal Atelier Delivery (₱350) or Courier (₱200)</span>
                </p>
                <p className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Refundable ₱1,000 security deposit upon dress handover</span>
                </p>
              </div>
            </div>

            {/* Private Fitting Arrangement Notice Callout */}
            <div className="p-4 rounded-2xl bg-[#faf5f0] dark:bg-stone-800/80 border border-[#e8d5c4] dark:border-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-medium text-sm">
                <Clock className="w-4 h-4 text-[#a47e62]" />
                <span>Need to check the fit?</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                “You may arrange a schedule with us for measuring or fitting the dress. Please send your preferred date and time, and we'll coordinate with you.”
              </p>
              <button
                type="button"
                onClick={() => handleOpenModal('fitting')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b654a] dark:text-[#dfc8b4] hover:underline pt-1"
              >
                <span>Request a Fitting Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Silhouette & Vietnamese Craftsmanship
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed whitespace-pre-line">
                {dress.description}
              </p>
            </div>

            {/* Occasions / Sizes / Colors */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Available Sizing
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dress.sizes && dress.sizes.length > 0 ? (
                    dress.sizes.map((sz) => (
                      <span
                        key={sz}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      >
                        {sz}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400">Custom Sizing</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Palette / Colors
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dress.colors && dress.colors.length > 0 ? (
                    dress.colors.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      >
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400">Classic</span>
                  )}
                </div>
              </div>
            </div>

            {/* Suitable Occasions */}
            {dress.occasion && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Perfect For
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dress.occasion.split(',').map((occ) => (
                    <span
                      key={occ.trim()}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f5ede4] dark:bg-stone-800 text-[#8b654a] dark:text-[#dfc8b4] border border-[#e8d5c4] dark:border-stone-700"
                    >
                      {occ.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Options Banner */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Accepted Payment Methods
                </span>
                <Link
                  to="/payment"
                  className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 underline"
                >
                  Rates & Terms Guide
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-200 font-medium">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>GCash</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-200 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>BDO / BPI Bank Transfer</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-200 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cash on Fitting</span>
                </span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 italic pt-1">
                * Payment confirmation may be required before your reservation is finalized.
              </p>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleOpenModal('inquire')}
                className="w-full py-4 rounded-2xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#dfc8b4]" />
                <span>Rent This Gown</span>
              </button>

              <button
                onClick={() => handleOpenModal('measurements')}
                className="w-full py-4 rounded-2xl bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 text-xs font-semibold uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2"
              >
                <Ruler className="w-4 h-4 text-[#a47e62]" />
                <span>Send Measurements</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
              No immediate charges. Rissée personally coordinates date availability and fitting before confirmation.
            </p>
          </div>

        </div>

      </div>

      {/* Related Dresses Section */}
      {relatedDresses.length > 0 && (
        <section className="pt-16 border-t border-stone-200 dark:border-stone-800 space-y-8">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-stone-500 dark:text-stone-400">
              From The Same Boutique Collection
            </span>
            <h2 className="font-serif text-3xl font-normal text-stone-900 dark:text-stone-100 mt-1">
              You May Also Love
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedDresses.map((item) => (
              <DressCard key={item.id} dress={item} />
            ))}
          </div>
        </section>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close fullscreen view"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] flex items-center justify-center">
            <img
              src={currentImage}
              alt={dress.name}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                  className="absolute left-[-50px] p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-[-50px] p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        dress={dress}
        initialMode={initialModalMode}
      />
    </div>
  );
};
