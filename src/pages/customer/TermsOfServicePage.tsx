import React from 'react';
import { FileCheck, Sparkles, AlertCircle, ArrowLeft, Clock, RefreshCw, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Boutique</span>
        </Link>

        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Rental Agreement & Boutique Terms</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100">
              Terms of Service & Rental Agreement
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
              Get Dress'd by Rissée • Metro Manila, Philippines • Authentic Vietnamese Designer Wear
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              1. Rental Period & Scheduling
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              All dresses from Get Dress'd by Rissée are offered on a <strong>rental-only basis</strong>. The standard rental package covers a <strong>3-day booking period</strong>:
            </p>
            <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-1.5 list-disc list-inside leading-relaxed">
              <li><strong>Day 1 (Delivery / Pickup):</strong> The dress arrives at your doorstep in Metro Manila or is collected from our atelier for your final dress rehearsal.</li>
              <li><strong>Day 2 (Event Day):</strong> Wear and celebrate in your chosen Vietnamese designer creation!</li>
              <li><strong>Day 3 (Return):</strong> Handover to our courier or drop-off at our studio by 5:00 PM.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              2. Professional Dry Cleaning Included
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              <strong>Do not wash or dry clean the dress yourself!</strong> Every piece is crafted from delicate fabrics such as liquid metallic silk charmeuse, fine tiered tulle, and gold-thread brocade. Professional eco-dry cleaning and steam sanitization are fully handled by our atelier dry cleaners upon return at no additional charge.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              3. Pricing & Security Deposit
            </h2>
            <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2 list-disc list-inside leading-relaxed">
              <li>Rental fees range from <strong>₱500 to ₱700</strong> per dress as listed in our catalog.</li>
              <li>A refundable security deposit of <strong>₱1,000</strong> is required prior to delivery or pickup.</li>
              <li>The deposit is refunded in full via GCash or bank transfer within 24 hours of return, provided the dress is returned without irreparable damage or missing parts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              4. Damage, Alterations & Loss Policy
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Normal minor wear (e.g. slight hem dust from indoor gala floors) is expected and covered. However:
            </p>
            <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Permanent alterations (cutting, pinning, stitching with needles that pierce silk) are strictly prohibited.</li>
              <li>Severe tears, cigarette burns, permanent ink/wine stains, or total loss will be assessed based on atelier replacement or restoration cost.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              5. Cancellations & Rescheduling
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              We understand celebration plans can shift! Rescheduling to another available date is free with at least 5 days notice prior to the rental date. Cancellations made more than 7 days prior receive a full reservation refund.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
