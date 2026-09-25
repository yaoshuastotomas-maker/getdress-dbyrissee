import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, Mail, MapPin, Clock, Heart } from 'lucide-react';
import { WebsiteSettings } from '../../types';

interface FooterProps {
  settings?: WebsiteSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const businessName = settings?.business_name || "Get Dress'd by Rissée";
  const tagline = settings?.tagline || "Curated Vietnamese Designer Dress Rentals for Life's Special Celebrations";
  const phone = settings?.phone || "+63 917 839 2841";
  const email = settings?.email || "hello@getdressdbyrissee.ph";
  const address = settings?.address || "Metro Manila Atelier, Philippines";
  const hours = settings?.business_hours || {
    mon_fri: "10:00 AM - 7:00 PM",
    sat: "10:00 AM - 6:00 PM",
    sun: "By Appointment Only"
  };
  const footerText = settings?.footer_text || "© 2026 Get Dress'd by Rissée. All rights reserved.";

  return (
    <footer className="bg-stone-900 text-stone-300 dark:bg-stone-950 dark:text-stone-400 border-t border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Atelier Brand Intro */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-serif text-2xl text-stone-100 font-normal tracking-wide">
              {businessName}
            </h3>
            <p className="text-sm leading-relaxed text-stone-400 font-light">
              {tagline}
            </p>
            <div className="flex items-center space-x-3 pt-2">
              {settings?.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-700 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-700 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-100">
              The Boutique
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-stone-100 transition-colors">Home Experience</Link>
              </li>
              <li>
                <Link to="/dresses" className="hover:text-stone-100 transition-colors">Complete Collection</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-stone-100 transition-colors">Our Atelier & Mission</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-stone-100 transition-colors">Book a Styling Fitting</Link>
              </li>
              <li>
                <Link to="/payment" className="hover:text-stone-100 transition-colors">Payment & Security Deposit</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-stone-100 transition-colors">Rental Agreement & Terms</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-stone-100 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-stone-100 transition-colors opacity-75 text-xs">Owner Portal</Link>
              </li>
            </ul>
          </div>

          {/* Atelier Hours */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-100 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#dfc8b4]" />
              <span>Atelier Hours</span>
            </h4>
            <div className="space-y-2 text-sm text-stone-400 font-light">
              <div className="flex justify-between">
                <span>Mon – Fri:</span>
                <span className="text-stone-200 font-medium">{hours.mon_fri}</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-stone-200 font-medium">{hours.sat}</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-stone-200 font-medium">{hours.sun}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-100">
              Concierge & Inquiries
            </h4>
            <div className="space-y-3 text-sm text-stone-400 font-light">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#dfc8b4] shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#dfc8b4] shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-stone-200 transition-colors">{phone}</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#dfc8b4] shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-stone-200 transition-colors">{email}</a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>{footerText}</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-stone-200 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-stone-200 transition-colors">Privacy Policy</Link>
            <span className="flex items-center gap-1.5">
              Curated with <Heart className="w-3 h-3 text-[#dfc8b4] fill-current" /> by Rissée
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
