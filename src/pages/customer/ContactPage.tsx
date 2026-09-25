import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ChevronDown, Ruler, Calendar } from 'lucide-react';
import { WebsiteSettings } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PaymentSection } from '../../components/customer/PaymentSection';
import { ChibiDecoration } from '../../components/common/ChibiDecoration';
import { ChibiMascot } from '../../components/common/ChibiMascot';

export const ContactPage: React.FC = () => {
  const { settings } = useOutletContext<{ settings: WebsiteSettings | null }>();
  const { success, error: toastError } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'SMS' | 'PHONE' | 'EMAIL' | 'VIBER'>('SMS');
  const [eventType, setEventType] = useState('Birthday');
  const [preferredDate, setPreferredDate] = useState('');
  const [isFittingRequest, setIsFittingRequest] = useState(false);
  const [fittingTime, setFittingTime] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const businessName = settings?.business_name || "Get Dress'd by Rissée";
  const phoneVal = settings?.phone || '+63 917 839 2841';
  const emailVal = settings?.email || 'hello@getdressdbyrissee.ph';
  const address = settings?.address || 'Metro Manila Atelier, Philippines';
  const hours = settings?.business_hours || {
    mon_fri: '10:00 AM - 7:00 PM',
    sat: '10:00 AM - 6:00 PM',
    sun: 'By Appointment Only'
  };

  const faqs = [
    {
      q: 'How does the dress rental process work?',
      a: 'We specialize in authentic Vietnamese designer dress rentals for 3-day reservation periods (rates range between ₱500 and ₱700). Browse our collection, submit your event dates and measurements, arrange a fitting if desired, and receive your dress freshly dry-cleaned and ready for your occasion.'
    },
    {
      q: 'Can I book an atelier fitting to test the size before finalizing?',
      a: 'Absolutely! Need to check the fit? You may arrange a schedule with us for measuring or fitting the dress. Please send your preferred date and time, and we’ll coordinate with you.'
    },
    {
      q: 'Do I need to wash or dry clean the gown before returning?',
      a: 'Never! Eco-friendly professional dry cleaning is handled directly by Rissée and is fully included in your rental price. Simply place the gown into the provided garment bag and return it on your scheduled return date.'
    },
    {
      q: 'What occasions do you provide dresses for?',
      a: 'We cater to all milestone occasions: 18th/21st Debuts, Birthdays, Weddings (bridal and guest couture), Cocktail & Evening Parties, Editorial Photoshoots, and Formal Galas.'
    },
    {
      q: 'Are dresses available for permanent purchase?',
      a: 'No. Get Dress’d by Rissée is strictly a rental boutique committed to accessible, circular designer fashion. All dresses are rental-only to preserve exceptional luxury at friendly ₱500–₱700 rates.'
    },
    {
      q: 'What are the delivery and security deposit policies?',
      a: 'We offer Personal Atelier Delivery (₱350 fee), Local Courier like Grab/Lalamove (₱200 fee), or Studio Pickup (Free). A refundable security deposit of ₱1,000 is settled upon garment handover and refunded upon safe return.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !email.trim() || !message.trim()) {
      toastError('Please provide your name, email, and message.');
      return;
    }

    setSubmitting(true);
    try {
      await api.inquiries.create({
        customer_name: customerName,
        email,
        phone,
        preferred_contact: preferredContact,
        event_type: eventType,
        date_needed: preferredDate,
        has_fitting_request: isFittingRequest,
        fitting: isFittingRequest ? {
          preferred_date: preferredDate,
          preferred_time: fittingTime,
          status: 'REQUESTED',
          notes: 'Submitted via General Contact Form'
        } : undefined,
        message: `${isFittingRequest ? '[Fitting Appointment Requested] ' : ''}${message}`,
      });

      setSubmitted(true);
      success('Your inquiry and fitting request have been sent directly to Rissée!');
    } catch (err: any) {
      toastError(err.message || 'Failed to submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a47e62] dark:text-[#dfc8b4]">
          Concierge & Private Fitting Atelier
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-stone-900 dark:text-stone-100">
          Contact The Atelier
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed">
          Book a private measuring or fitting session, verify gown calendar availability, or get personalized styling guidance for your milestone event.
        </p>
      </div>

      {/* Grid: Form on left, Info on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <ChibiMascot variant="celebrate" size="lg" className="mx-auto" />
              <h3 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100">
                Inquiry Received!
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out, <strong className="text-stone-900 dark:text-stone-100">{customerName}</strong>. Rissée has received your inquiry and will coordinate directly with you via <strong className="text-stone-900 dark:text-stone-100">{preferredContact} ({phone || email})</strong>.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setCustomerName('');
                  setEmail('');
                  setPhone('');
                  setPreferredDate('');
                  setMessage('');
                  setIsFittingRequest(false);
                }}
                className="mt-4 px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 transition-colors"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-stone-100 dark:border-stone-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100 font-normal">
                    Send a Note to Rissée
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Fields marked with <span className="text-rose-500">*</span> are required.
                  </p>
                </div>
                <ChibiMascot variant="stylist" size="sm" />
              </div>

              {/* Fitting Callout Banner */}
              <div className="p-4 rounded-2xl bg-[#faf5f0] dark:bg-stone-800/80 border border-[#e8d5c4] dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#a47e62]" />
                    <span className="font-serif font-medium text-xs text-stone-900 dark:text-stone-100">
                      Need to check the fit?
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFittingRequest}
                      onChange={(e) => setIsFittingRequest(e.target.checked)}
                      className="rounded text-stone-900 focus:ring-stone-500"
                    />
                    <span>Request Atelier Fitting</span>
                  </label>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  “You may arrange a schedule with us for measuring or fitting the dress. Please send your preferred date and time, and we'll coordinate with you.”
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maria@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Mobile Number (Philippines) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0917 123 4567"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Preferred Contact Channel
                  </label>
                  <select
                    value={preferredContact}
                    onChange={(e) => setPreferredContact(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  >
                    <option value="SMS">SMS / Text Message</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="VIBER">Viber / WhatsApp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Occasion Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  >
                    <option value="Birthday">Birthday</option>
                    <option value="Debut">Debut (18th / 21st)</option>
                    <option value="Wedding">Wedding / Bridal Guest</option>
                    <option value="Party">Cocktail / Evening Party</option>
                    <option value="Photoshoot">Photoshoot / Editorial</option>
                    <option value="Formal Event">Gala / Awards Night</option>
                    <option value="Special Occasion">Special Occasion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Anticipated Event / Fitting Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>
              </div>

              {isFittingRequest && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Preferred Fitting Time Window
                  </label>
                  <select
                    value={fittingTime}
                    onChange={(e) => setFittingTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  >
                    <option value="">Select Time Window</option>
                    <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
                    <option value="Early Afternoon (1:00 PM - 3:00 PM)">Early Afternoon (1:00 PM - 3:00 PM)</option>
                    <option value="Late Afternoon (3:00 PM - 5:00 PM)">Late Afternoon (3:00 PM - 5:00 PM)</option>
                    <option value="Evening (5:00 PM - 7:00 PM)">Evening (5:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Message or Inquiries <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details about your event, gown styles of interest, body measurements (bust, waist, hips), or fitting queries..."
                  className="w-full px-4 py-3 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Sending Inquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry to Atelier</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Contact Info & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
            <h3 className="font-serif text-2xl font-normal text-stone-900 dark:text-stone-100">
              Atelier Information
            </h3>

            <div className="space-y-4 text-sm text-stone-600 dark:text-stone-300 font-light">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#a47e62] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-medium text-stone-900 dark:text-stone-100">Showroom Atelier</strong>
                  <span>{address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-[#a47e62] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-medium text-stone-900 dark:text-stone-100">Mobile / Viber / Text Concierge</strong>
                  <a href={`tel:${phoneVal}`} className="hover:underline font-mono">{phoneVal}</a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-[#a47e62] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-medium text-stone-900 dark:text-stone-100">Direct Email</strong>
                  <a href={`mailto:${emailVal}`} className="hover:underline">{emailVal}</a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                <Clock className="w-5 h-5 text-[#a47e62] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-medium text-stone-900 dark:text-stone-100">Fitting & Measuring Hours</strong>
                  <p>Mon – Fri: {hours.mon_fri}</p>
                  <p>Saturday: {hours.sat}</p>
                  <p>Sunday: {hours.sun}</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-normal text-stone-900 dark:text-stone-100">
              Frequently Asked Questions
            </h3>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-3">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-left text-xs font-semibold text-stone-900 dark:text-stone-100 hover:text-[#a47e62]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 transition-transform ${
                        expandedFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq === idx && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-light mt-2 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Accepted Payment Methods & Reservation Confirmation */}
      <div className="pt-10 border-t border-stone-200/60 dark:border-stone-800">
        <PaymentSection settings={settings} />
      </div>

      {/* Subtle Chibi decoration if enabled */}
      {settings?.chibi_decorations !== false && (
        <ChibiDecoration variant="rose-gown" position="bottom-right" />
      )}

    </div>
  );
};
