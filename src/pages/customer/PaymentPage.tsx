import React, { useEffect, useState } from 'react';
import { ShieldCheck, HelpCircle, ArrowRight, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WebsiteSettings } from '../../types';
import { api } from '../../services/api';
import { PaymentSection } from '../../components/customer/PaymentSection';
import { ChibiDecoration } from '../../components/common/ChibiDecoration';

export const PaymentPage: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.settings
      .get()
      .then((data) => {
        if (isMounted) {
          setSettings(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen py-16 sm:py-20 relative overflow-hidden">
      
      {/* Subtle Chibi decoration if enabled in settings */}
      {settings?.chibi_decorations !== false && (
        <ChibiDecoration variant="emerald-gown" position="top-right" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Breadcrumb & Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <nav className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-stone-500 mb-2">
            <Link to="/" className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-stone-900 dark:text-stone-100 font-semibold">Payment & Reservations</span>
          </nav>
          
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-stone-900 dark:text-stone-100">
            Payment & Reservation Guidelines
          </h1>
          <p className="text-stone-600 dark:text-stone-300 text-base font-light leading-relaxed">
            Everything you need to know about reserving Vietnamese designer couture gowns, rental security deposits, and accepted Philippine payment methods.
          </p>
        </div>

        {/* Main Payment Section Component */}
        <PaymentSection settings={settings} />

        {/* How Booking & Reservation Works */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 sm:p-12 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Simple 3-Step Process
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 dark:text-stone-100 mt-1">
              How Your Dress Reservation Is Secured
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-serif text-lg font-bold">
                1
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
                Select Dress & Send Inquiry
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                Browse our curated Vietnamese collection, pick your event dates, and submit an inquiry through the dress detail page.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-serif text-lg font-bold">
                2
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
                Confirm Availability & Pay
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                Our team confirms the dress fits your calendar and sends the exact rental total. Transfer via GCash or Philippine bank.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-serif text-lg font-bold">
                3
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
                Finalized Booking & Fitting
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                Once payment confirmation is verified, your calendar slot is locked. Pick up at our showroom or receive via insured courier.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>All couture garments undergo high-grade dry cleaning and sanitization.</span>
            </div>

            <Link
              to="/dresses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white transition-all shadow-sm self-start sm:self-auto"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
