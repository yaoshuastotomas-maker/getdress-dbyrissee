import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicyPage: React.FC = () => {
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
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Apple App Store & Web Privacy Policy</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100">
              Privacy Policy
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
              Last updated: September 2026 • Effective for <em>Get Dress'd by Rissée</em> mobile app & web boutique
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              1. Introduction & Overview
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              At <strong>Get Dress'd by Rissée</strong> ("we," "our," or "us"), we are deeply committed to respecting and protecting the privacy of our clients across the Philippines. This Privacy Policy details the types of personal information we collect, why we collect it, how it is secured, and your rights regarding your data when using our mobile application and online rental atelier.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              2. Information We Collect
            </h2>
            <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>Contact & Identity Details:</strong> Full name, email address, mobile contact number, and preferred messaging channels (Viber, WhatsApp, SMS).</li>
              <li><strong>Fitting & Body Measurements:</strong> Optional measurements (bust, waist, hips, height, shoe heel height) provided by clients to evaluate dress silhouette fit and recommend alterations.</li>
              <li><strong>Event & Logistics Details:</strong> Event date, celebration venue, preferred Metro Manila doorstep delivery address, and studio pickup scheduling.</li>
              <li><strong>Payment Verification:</strong> Transaction reference numbers, GCash sender screenshots, and bank transfer receipts used solely to confirm rental reservations and security deposits. We do not store sensitive credit card credentials.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              3. Purpose of Processing & Data Usage
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Your personal information is utilized strictly to deliver luxury boutique rental services:
            </p>
            <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Processing and verifying rental reservation dates.</li>
              <li>Coordinating tailored fitting appointments at our atelier.</li>
              <li>Ensuring accurate courier and hand-delivery to your home or event venue in Metro Manila.</li>
              <li>Providing post-event return guidance and deposit reimbursement.</li>
              <li>Under no circumstances do we sell, rent, or trade your personal data to third parties or advertising brokers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100">
              4. Data Retention & Security
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              All communications and reservation records are stored behind encrypted connections (TLS/HTTPS). Customer body measurements are treated as confidential atelier tailoring records and may be deleted or modified upon request.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100">
              5. Contact Our Privacy Officer
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              For any questions regarding your personal information, or to request record deletion, please reach out to our team:
            </p>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800 text-xs space-y-2 text-stone-700 dark:text-stone-300">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>privacy@getdressdbyrissee.ph</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>+63 917 839 2841 (Metro Manila, Philippines)</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
