import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Sparkle, Calendar, Clock, Award, Ruler, Truck, Heart } from 'lucide-react';
import { Dress, Category, WebsiteSettings } from '../../types';
import { api } from '../../services/api';
import { DressCard } from '../../components/customer/DressCard';
import { InquiryModal } from '../../components/customer/InquiryModal';
import { ChibiDecoration } from '../../components/common/ChibiDecoration';
import { ChibiMascot } from '../../components/common/ChibiMascot';

export const HomePage: React.FC = () => {
  const { settings } = useOutletContext<{ settings: WebsiteSettings | null }>();
  const [featuredDresses, setFeaturedDresses] = useState<Dress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDressForInquiry, setSelectedDressForInquiry] = useState<Dress | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.dresses.list({ featuredOnly: true }),
      api.categories.list()
    ])
      .then(([dressRes, catRes]) => {
        if (!isMounted) return;
        setFeaturedDresses(dressRes.data);
        setCategories(catRes.filter(c => !c.archived));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load homepage data:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const heroTitle = settings?.hero_title || "Get Dress'd by Rissée";
  const heroSubtitle = settings?.hero_subtitle || 'Premier Vietnamese designer dress rental boutique in the Philippines. Exquisite couture tailored for birthdays, debuts, weddings, photoshoots, and unforgettable celebrations.';
  const heroImage = settings?.hero_image_url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1600&q=80';
  const aboutTitle = settings?.about_title || 'Authentic Vietnamese Couture, Rented with Grace';
  const aboutText = settings?.about_text || "Get Dress'd by Rissée brings handcrafted Vietnamese dresses directly to fashion-forward clients across the Philippines. Renowned for sculptural corsetry, cascading silks, and delicate embellishments, Vietnamese evening wear creates a breathtaking presence. Our atelier pairs luxury dress rentals with personalized fitting and measuring services at affordable ₱500–₱700 rates.";
  const aboutImage = settings?.about_image_url || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80';

  const sections = settings?.sections_config || {
    hero: true,
    announcement: true,
    featured: true,
    about: true,
    categories: true,
    services: true,
    contact: true
  };

  const occasions = [
    { title: 'Birthdays', desc: 'Showstopper looks for your personal celebration', icon: '🎂' },
    { title: 'Debuts (18th / 21st)', desc: 'Fairytale gowns designed for your grand entrance', icon: '👑' },
    { title: 'Weddings & Bridal', desc: 'Romantic silhouettes for guests, entourage, and brides', icon: '💍' },
    { title: 'Parties & Cocktails', desc: 'Chic, sculpted mini and midi dresses', icon: '🥂' },
    { title: 'Photoshoots & Editorial', desc: 'High-drama gowns made for the lens', icon: '📸' },
    { title: 'Formal Galas & Proms', desc: 'Black-tie elegance that commands attention', icon: '✨' },
    { title: 'Special Occasions', desc: 'Custom coordinated rentals with fitting guidance', icon: '🌸' },
  ];

  return (
    <div className="space-y-24 pb-20 relative overflow-hidden">
      
      {/* Subtle Chibi decoration if enabled in settings */}
      {settings?.chibi_decorations !== false && (
        <ChibiDecoration variant="rose-gown" position="top-right" />
      )}
      
      {/* 1. HERO SECTION */}
      {sections.hero && (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Dark Vignette */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt="Get Dress'd by Rissée Vietnamese gowns"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white py-24 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs uppercase tracking-[0.25em] font-medium text-[#dfc8b4]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vietnamese Dress Rental Boutique • Philippines</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[1.1]">
              {heroTitle}
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-200 font-light leading-relaxed">
              {heroSubtitle}
            </p>

            {/* Pricing Callout Pill */}
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-stone-900/80 backdrop-blur-md border border-[#dfc8b4]/30 text-xs sm:text-sm text-stone-200 font-medium">
              <span className="text-[#dfc8b4] font-semibold">Rental Rates:</span>
              <span className="font-serif text-base sm:text-lg font-bold text-white">₱500 – ₱700</span>
              <span className="text-stone-400 text-xs">• 3-Day Reservation Period</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/dresses"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#dfc8b4] text-stone-950 text-xs font-semibold uppercase tracking-widest hover:bg-[#ebd8c8] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Browse Rental Gowns</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white text-xs font-semibold uppercase tracking-widest hover:bg-white/25 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#dfc8b4]" />
                <span>Book Fitting Appointment</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. OCCASIONS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#a47e62] dark:text-[#dfc8b4]">
            Dressed For Every Milestone
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal">
            Occasions We Celebrate With You
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            From youthful debuts to elegant galas, discover gowns crafted to make your moments unforgettable.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {occasions.map((occ) => (
            <Link
              key={occ.title}
              to={`/dresses?occasion=${encodeURIComponent(occ.title)}`}
              className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-[#a47e62]/40 transition-all text-left space-y-2 group"
            >
              <span className="text-2xl block">{occ.icon}</span>
              <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-[#a47e62] transition-colors">
                {occ.title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {occ.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED RENTAL DRESSES */}
      {sections.featured && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#a47e62] dark:text-[#dfc8b4]">
                Curated by Rissée
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal mt-1">
                Featured Vietnamese Gowns
              </h2>
            </div>
            <Link
              to="/dresses"
              className="inline-flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-stone-900 dark:text-stone-100 hover:text-[#a47e62] transition-colors"
            >
              <span>View Full Rental Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-stone-200 dark:bg-stone-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : featuredDresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDresses.map((dress) => (
                <DressCard
                  key={dress.id}
                  dress={dress}
                  onQuickInquire={(d) => setSelectedDressForInquiry(d)}
                />
              ))}
            </div>
          ) : (
            <div className="p-10 sm:p-14 text-center bg-gradient-to-br from-[#faf7f2] via-[#f5efe6] to-[#ece3d4] dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-950 rounded-3xl border border-[#dfc8b4]/60 dark:border-stone-800 shadow-sm max-w-3xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-stone-800/80 shadow-xs flex items-center justify-center mx-auto border border-[#dfc8b4]/50">
                <Sparkles className="w-5 h-5 text-[#a47e62] dark:text-[#dfc8b4]" />
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#a47e62] dark:text-[#dfc8b4] block">
                Atelier Collection Curation
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-normal">
                New Vietnamese Couture Arrivals
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
                Our bespoke selection of authentic Vietnamese designer gowns is currently being curated in our atelier for upcoming reservations. Contact us to schedule an in-person fitting or reserve upcoming pieces.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white shadow transition-all"
                >
                  Schedule Atelier Fitting
                </Link>
                {settings?.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full bg-white/70 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 text-xs font-medium uppercase tracking-wider hover:bg-white transition-all"
                  >
                    Follow on Instagram
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 4. HOW IT WORKS / RENTAL & FITTING WORKFLOW */}
      {sections.services && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#f8f5f0] dark:bg-stone-900/40 py-16 rounded-3xl border border-stone-200/80 dark:border-stone-800">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#a47e62] dark:text-[#dfc8b4]">
              Seamless Rental Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal">
              How Renting with Rissée Works
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              Enjoy authentic couture without the commitment of buying.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4 sm:px-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-900 dark:text-stone-100 font-serif text-lg font-bold mx-auto sm:mx-0 shadow-sm">
                1
              </div>
              <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium">
                Choose Your Silhouette
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Browse our curated collection of Vietnamese designer gowns priced affordably at ₱500–₱700 for a 3-day reservation.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-900 dark:text-stone-100 font-serif text-lg font-bold mx-auto sm:mx-0 shadow-sm">
                2
              </div>
              <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium">
                Send Measurements
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Submit your bust, waist, and hip details so Rissée can inspect sizing and ensure the structured corsetry matches your body.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-900 dark:text-stone-100 font-serif text-lg font-bold mx-auto sm:mx-0 shadow-sm">
                3
              </div>
              <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium">
                Fitting & Delivery
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Schedule a studio fitting appointment or request Personal Atelier Delivery (₱350) or courier service (₱200).
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-900 dark:text-stone-100 font-serif text-lg font-bold mx-auto sm:mx-0 shadow-sm">
                4
              </div>
              <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium">
                Celebrate & Return
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Shine at your celebration! Simply return the gown on your scheduled return date. Complimentary dry cleaning is handled by us.
              </p>
            </div>
          </div>

          {/* Fitting Callout Banner inside services */}
          <div className="mt-12 mx-4 sm:mx-8 p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4 text-left">
              <ChibiMascot variant="fitting" size="md" />
              <div>
                <p className="font-serif text-base font-medium text-stone-900 dark:text-stone-100">
                  “Need to check the fit?”
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                  You may arrange a schedule with us for measuring or fitting the dress. Send your preferred date and time, and we'll coordinate with you.
                </p>
              </div>
            </div>
            <Link
              to="/contact"
              className="shrink-0 px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 transition-colors"
            >
              Book Fitting
            </Link>
          </div>
        </section>
      )}

      {/* 5. ABOUT THE BOUTIQUE */}
      {sections.about && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 dark:border-stone-800">
              <img
                src={aboutImage}
                alt="Rissée Atelier"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-stone-900/85 backdrop-blur-md text-stone-100 border border-white/10">
                <p className="font-serif italic text-lg leading-snug">
                  "Every dress carries a story. When you wear handcrafted Vietnamese couture, you feel radiant, graceful, and unforgettable."
                </p>
                <span className="block text-xs uppercase tracking-widest text-[#dfc8b4] font-semibold mt-2">
                  — Rissée, Founder & Head Stylist
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#a47e62] dark:text-[#dfc8b4]">
                <Award className="w-4 h-4 text-[#a47e62]" />
                <span>Vietnamese Craftsmanship & Circular Couture</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl text-stone-900 dark:text-stone-100 font-normal leading-tight">
                {aboutTitle}
              </h2>

              <p className="text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                {aboutText}
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div>
                  <h4 className="font-serif text-3xl font-normal text-stone-900 dark:text-stone-100">₱500–₱700</h4>
                  <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Accessible Rental Rates</p>
                </div>
                <div>
                  <h4 className="font-serif text-3xl font-normal text-stone-900 dark:text-stone-100">100%</h4>
                  <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Authentic Vietnamese Design</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white transition-all shadow"
                >
                  <span>Learn More About Our Boutique</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. CALL TO ACTION & APPOINTMENTS BANNER */}
      {sections.contact && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-stone-900 dark:bg-stone-900 text-white p-8 sm:p-14 md:p-16 border border-stone-800 relative overflow-hidden text-center space-y-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#dfc8b4]">
                Private Consultations & Sizing
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal">
                Ready to Find Your Dream Gown?
              </h2>
              <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed">
                Whether you need a custom fitting, garment sizing advice, or have questions about reservation dates, Rissée is here to assist you personally.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#dfc8b4] text-stone-950 text-xs font-semibold uppercase tracking-widest hover:bg-[#ebd8c8] shadow transition-all"
                >
                  Book an Atelier Fitting
                </Link>
                <Link
                  to="/dresses"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-stone-800 text-stone-100 text-xs font-semibold uppercase tracking-widest hover:bg-stone-700 transition-all"
                >
                  Explore Rental Gowns
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={Boolean(selectedDressForInquiry)}
        onClose={() => setSelectedDressForInquiry(null)}
        dress={selectedDressForInquiry}
      />
    </div>
  );
};
