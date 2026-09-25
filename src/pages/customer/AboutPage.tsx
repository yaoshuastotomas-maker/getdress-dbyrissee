import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Sparkles, Heart, Award, ArrowRight, Ruler, Clock, ShieldCheck } from 'lucide-react';
import { WebsiteSettings } from '../../types';
import { ChibiMascot } from '../../components/common/ChibiMascot';

export const AboutPage: React.FC = () => {
  const { settings } = useOutletContext<{ settings: WebsiteSettings | null }>();

  const businessName = settings?.business_name || "Get Dress'd by Rissée";
  const aboutImage = settings?.about_image_url || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      
      {/* Intro Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a47e62] dark:text-[#dfc8b4]">
          The Atelier Story
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-normal text-stone-900 dark:text-stone-100 leading-tight">
          Bringing Vietnamese Designer Couture to the Philippines
        </h1>
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-light leading-relaxed">
          {businessName} is a boutique dress rental service curating authentic Vietnamese designer evening gowns, debutant ballgowns, and romantic bridal silhouettes for life's most cherished milestones.
        </p>
      </div>

      {/* Story & Portrait Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-6 relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 dark:border-stone-800">
          <img
            src={aboutImage}
            alt="Rissée at work in the atelier"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white p-4">
            <p className="font-serif text-2xl font-light">"Wear the gown that makes you feel unforgettable."</p>
            <span className="text-xs uppercase tracking-widest text-[#dfc8b4] mt-1 block">Rissée • Founder & Stylist</span>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#a47e62] dark:text-[#dfc8b4]">
            <Award className="w-4 h-4" />
            <span>Accessible Luxury • Circular Fashion</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal">
            Why Vietnamese Designer Fashion?
          </h2>
          
          <div className="space-y-4 text-sm sm:text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed">
            <p>
              Vietnamese fashion designers have garnered worldwide admiration for their architectural draping, internal corsetry, and delicate artisanal hand-embroidery. Each dress is tailored to celebrate feminine curves with poise and grace.
            </p>
            <p>
              By offering 3-day rental reservations at approachable ₱500–₱700 rates, Get Dress'd by Rissée makes red-carpet-worthy designer gowns accessible for birthdays, 18th/21st debuts, weddings, editorial photoshoots, and black-tie galas across the Philippines.
            </p>
            <p>
              We believe in sustainable, circular glamour. You shine in an unforgettable couture piece, return it when your event concludes, and leave the eco-friendly dry cleaning and preservation entirely to our atelier.
            </p>
          </div>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a47e62] dark:text-[#dfc8b4]">Private Fittings</span>
              <p className="text-xs text-stone-500 dark:text-stone-400">Schedule in-person measuring and fitting sessions in Metro Manila before your event.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a47e62] dark:text-[#dfc8b4]">Flexible Delivery</span>
              <p className="text-xs text-stone-500 dark:text-stone-400">Personal Atelier Delivery (₱350), courier dispatch (₱200), or free studio pickup.</p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <Link
              to="/dresses"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white transition-all shadow"
            >
              <span>Explore The Gowns</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-semibold uppercase tracking-widest hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
            >
              <span>Book a Fitting</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};
