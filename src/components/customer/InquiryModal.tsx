import React, { useState } from 'react';
import { X, Send, Calendar, CheckCircle2, Ruler, Sparkles, MapPin, CreditCard, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { Dress, formatPHP, CustomerMeasurements, FittingDetails, DeliveryDetails } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ChibiMascot } from '../common/ChibiMascot';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dress?: Dress | null;
  initialMode?: 'inquire' | 'measurements' | 'fitting';
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  dress,
  initialMode = 'inquire'
}) => {
  const { success, error: toastError } = useToast();

  // Wizard Tab / Step
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(initialMode === 'measurements' ? 2 : 1);

  // Customer Contact
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'SMS' | 'PHONE' | 'EMAIL' | 'VIBER'>('SMS');

  // Event Details
  const [eventType, setEventType] = useState('Birthday');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [dateNeeded, setDateNeeded] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // Measurements
  const [includeMeasurements, setIncludeMeasurements] = useState(initialMode === 'measurements');
  const [measurements, setMeasurements] = useState<CustomerMeasurements>({
    height_cm: '',
    bust_inches: '',
    waist_inches: '',
    hips_inches: '',
    shoulder_inches: '',
    sleeve_length_inches: '',
    preferred_fit: 'Fitted',
    shoe_heel_height: '',
    notes: ''
  });

  // Fitting Request
  const [requestFitting, setRequestFitting] = useState(initialMode === 'fitting');
  const [fittingDetails, setFittingDetails] = useState<FittingDetails>({
    preferred_date: '',
    preferred_time: '',
    alternative_date: '',
    alternative_time: '',
    notes: ''
  });

  // Delivery
  const [deliveryType, setDeliveryType] = useState<'PERSONAL_DELIVERY' | 'LOCAL_DELIVERY' | 'STUDIO_PICKUP'>('PERSONAL_DELIVERY');
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    type: 'PERSONAL_DELIVERY',
    recipient_name: '',
    mobile_number: '',
    address: '',
    barangay: '',
    city: 'Metro Manila',
    province: 'NCR',
    landmark: '',
    delivery_notes: '',
    delivery_fee: 350
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'GCASH' | 'BANK_TRANSFER' | 'CASH_ON_PICKUP'>('GCASH');

  // Message
  const [message, setMessage] = useState(
    dress
      ? `Hello Rissée! I would love to rent "${dress.name}" (₱${dress.rental_price}). Please let me know your availability for my event.`
      : 'Hello Rissée! I would like to inquire about reserving a Vietnamese designer gown and arranging a fitting.'
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const rentalRate = dress ? Number(dress.rental_price) : 600;
  const deliveryFee = deliveryType === 'PERSONAL_DELIVERY' ? 350 : deliveryType === 'LOCAL_DELIVERY' ? 200 : 0;
  const estimatedTotal = rentalRate + deliveryFee;

  const handleDeliveryTypeChange = (type: 'PERSONAL_DELIVERY' | 'LOCAL_DELIVERY' | 'STUDIO_PICKUP') => {
    setDeliveryType(type);
    const fee = type === 'PERSONAL_DELIVERY' ? 350 : type === 'LOCAL_DELIVERY' ? 200 : 0;
    setDeliveryDetails(prev => ({
      ...prev,
      type,
      delivery_fee: fee
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !email.trim()) {
      toastError('Please fill in your name and email.');
      return;
    }

    setSubmitting(true);
    try {
      await api.inquiries.create({
        customer_name: customerName,
        email,
        phone,
        mobile_number: phone,
        preferred_contact: preferredContact,
        event_type: eventType,
        event_date: eventDate,
        event_location: eventLocation,
        date_needed: dateNeeded || eventDate,
        return_date: returnDate,
        dress_id: dress?.id,
        dress_name: dress?.name,
        rental_price: rentalRate,
        message,
        has_measurements: includeMeasurements,
        measurements: includeMeasurements ? measurements : undefined,
        has_fitting_request: requestFitting,
        fitting: requestFitting ? {
          ...fittingDetails,
          status: 'REQUESTED'
        } : undefined,
        delivery: {
          ...deliveryDetails,
          type: deliveryType,
          recipient_name: deliveryDetails.recipient_name || customerName,
          mobile_number: deliveryDetails.mobile_number || phone,
          delivery_fee: deliveryFee
        },
        payment_method: paymentMethod
      });

      setSubmitted(true);
      success('Your rental reservation inquiry has been sent to Rissée!');
    } catch (err: any) {
      toastError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setActiveStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#faf9f6] dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <ChibiMascot variant={activeStep === 2 ? 'measuring' : activeStep === 3 ? 'fitting' : 'stylist'} size="sm" />
            <div>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-[#a47e62] dark:text-[#dfc8b4]">
                Get Dress'd by Rissée • Rental Reservation
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-medium text-stone-900 dark:text-stone-100">
                {dress ? `Rent "${dress.name}"` : 'Rental Inquiry & Fitting'}
              </h2>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        {!submitted && (
          <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-950/30 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeStep === 1
                  ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-semibold bg-white dark:bg-stone-900'
                  : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-800'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-stone-200 dark:bg-stone-800 text-[10px] inline-flex items-center justify-center">1</span>
              <span>Event & Info</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeStep === 2
                  ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-semibold bg-white dark:bg-stone-900'
                  : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-800'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-stone-200 dark:bg-stone-800 text-[10px] inline-flex items-center justify-center">2</span>
              <span>Measurements</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeStep === 3
                  ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-semibold bg-white dark:bg-stone-900'
                  : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-800'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-stone-200 dark:bg-stone-800 text-[10px] inline-flex items-center justify-center">3</span>
              <span>Fitting Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeStep === 4
                  ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-semibold bg-white dark:bg-stone-900'
                  : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-800'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-stone-200 dark:bg-stone-800 text-[10px] inline-flex items-center justify-center">4</span>
              <span>Delivery & Summary</span>
            </button>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {submitted ? (
            <div className="py-8 text-center space-y-5">
              <ChibiMascot variant="celebrate" size="lg" className="mx-auto" />
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100 font-medium">
                  Rental Inquiry Received!
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-stone-900 dark:text-stone-100">{customerName}</strong>. Rissée has received your reservation inquiry for <strong className="text-stone-900 dark:text-stone-100">{dress?.name || 'your rental gown'}</strong>.
                </p>
                <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 max-w-md mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Contact Method:</span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">{preferredContact} ({phone || email})</span>
                  </div>
                  {eventDate && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Event Date:</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">{eventDate} ({eventType})</span>
                    </div>
                  )}
                  {requestFitting && fittingDetails.preferred_date && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Fitting Requested:</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">{fittingDetails.preferred_date} @ {fittingDetails.preferred_time || 'TBD'}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-stone-200 dark:border-stone-700">
                    <span className="text-stone-500">Estimated Total:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{formatPHP(estimatedTotal)}</span>
                  </div>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  We will contact you via {preferredContact} within 24 hours to confirm dress availability and fitting arrangements.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest shadow-md hover:bg-stone-800 transition-all"
                >
                  Return to Atelier
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Selected Dress Banner */}
              {dress && (
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 shadow-sm">
                  <img
                    src={dress.primary_image_url || dress.images?.[0]?.url || ''}
                    alt={dress.name}
                    className="w-14 h-20 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[#a47e62] dark:text-[#dfc8b4]">
                      {dress.category_name}
                    </span>
                    <p className="font-serif text-base font-medium text-stone-900 dark:text-stone-100 truncate">
                      {dress.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs mt-1 text-stone-600 dark:text-stone-400">
                      <span>Rate: <strong className="text-stone-900 dark:text-stone-100 font-serif text-sm">{formatPHP(dress.rental_price)}</strong></span>
                      <span>•</span>
                      <span>Sizes: {dress.sizes?.join(', ') || 'Custom fit'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Customer Contact & Event */}
              {activeStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Maria Santos"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. maria@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Mobile / Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0917 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Preferred Contact Channel
                      </label>
                      <select
                        value={preferredContact}
                        onChange={(e) => setPreferredContact(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                      >
                        <option value="SMS">SMS / Text Message</option>
                        <option value="PHONE">Phone Call</option>
                        <option value="EMAIL">Email</option>
                        <option value="VIBER">Viber / WhatsApp</option>
                      </select>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-3 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#a47e62]" />
                      <span>Event & Rental Schedule</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                          Occasion / Event Type
                        </label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
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
                        <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                          Date Needed / Pickup
                        </label>
                        <input
                          type="date"
                          value={dateNeeded}
                          onChange={(e) => setDateNeeded(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                          Return Date
                        </label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                        Event Venue or City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bonifacio Global City, Taguig"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      Notes or Special Requests
                    </label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Customer Measurements */}
              {activeStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3">
                      <Ruler className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                          Accurate Fit Guarantee
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300">
                          Vietnamese gowns are tailored with exquisite structure. Providing your measurements helps Rissée select the exact size match.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMeasurements}
                        onChange={(e) => setIncludeMeasurements(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900 dark:peer-checked:bg-stone-100"></div>
                    </label>
                  </div>

                  {includeMeasurements ? (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                            Height (cm or ft/in)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 165 cm / 5'5&quot;"
                            value={measurements.height_cm || ''}
                            onChange={(e) => setMeasurements({ ...measurements, height_cm: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                            Bust (inches)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 34B or 33&quot;"
                            value={measurements.bust_inches || ''}
                            onChange={(e) => setMeasurements({ ...measurements, bust_inches: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                            Waist (inches)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 26&quot;"
                            value={measurements.waist_inches || ''}
                            onChange={(e) => setMeasurements({ ...measurements, waist_inches: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                            Hips (inches)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 36&quot;"
                            value={measurements.hips_inches || ''}
                            onChange={(e) => setMeasurements({ ...measurements, hips_inches: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                            Shoulder Width (in)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 15&quot;"
                            value={measurements.shoulder_inches || ''}
                            onChange={(e) => setMeasurements({ ...measurements, shoulder_inches: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                            Shoe / Heel Height
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 3 inches heels"
                            value={measurements.shoe_heel_height || ''}
                            onChange={(e) => setMeasurements({ ...measurements, shoe_heel_height: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                          Fit Preference
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['Fitted', 'Relaxed', 'Flowing', 'Standard'] as const).map(fit => (
                            <button
                              key={fit}
                              type="button"
                              onClick={() => setMeasurements({ ...measurements, preferred_fit: fit })}
                              className={`py-2 text-xs rounded-xl border transition-all ${
                                measurements.preferred_fit === fit
                                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-white font-medium'
                                  : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                              }`}
                            >
                              {fit}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                          Measurement Notes or Fit Queries
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Need room around the arms, petite torso length"
                          value={measurements.notes || ''}
                          onChange={(e) => setMeasurements({ ...measurements, notes: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-stone-500 border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl">
                      <p>You can skip submitting measurements now and arrange a studio fitting in the next step!</p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Fitting Schedule Arrangement */}
              {activeStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#a47e62]" />
                          <span>Private Atelier Fitting Appointment</span>
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                          Need to check the fit? You may arrange a schedule with us for measuring or fitting the dress. Please send your preferred date and time, and we'll coordinate with you.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={requestFitting}
                          onChange={(e) => setRequestFitting(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900 dark:peer-checked:bg-stone-100"></div>
                      </label>
                    </div>
                  </div>

                  {requestFitting && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                          Preferred Fitting Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={fittingDetails.preferred_date}
                          onChange={(e) => setFittingDetails({ ...fittingDetails, preferred_date: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                          Preferred Time Window
                        </label>
                        <select
                          value={fittingDetails.preferred_time}
                          onChange={(e) => setFittingDetails({ ...fittingDetails, preferred_time: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                        >
                          <option value="">Select Time Window</option>
                          <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
                          <option value="Early Afternoon (1:00 PM - 3:00 PM)">Early Afternoon (1:00 PM - 3:00 PM)</option>
                          <option value="Late Afternoon (3:00 PM - 5:00 PM)">Late Afternoon (3:00 PM - 5:00 PM)</option>
                          <option value="Evening (5:00 PM - 7:00 PM)">Evening (5:00 PM - 7:00 PM)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                          Alternative Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={fittingDetails.alternative_date}
                          onChange={(e) => setFittingDetails({ ...fittingDetails, alternative_date: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                          Fitting Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bringing companion, prefer weekday"
                          value={fittingDetails.notes}
                          onChange={(e) => setFittingDetails({ ...fittingDetails, notes: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Delivery, Payment & Financial Summary */}
              {activeStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Delivery Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#a47e62]" />
                      <span>Delivery Method</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleDeliveryTypeChange('PERSONAL_DELIVERY')}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          deliveryType === 'PERSONAL_DELIVERY'
                            ? 'border-stone-900 dark:border-stone-100 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <p className="text-xs font-semibold">Personal Delivery</p>
                        <p className="text-[11px] opacity-80 mt-0.5">₱350 fee</p>
                        <p className="text-[10px] opacity-70 mt-1">Direct handoff by Rissée team</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeliveryTypeChange('LOCAL_DELIVERY')}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          deliveryType === 'LOCAL_DELIVERY'
                            ? 'border-stone-900 dark:border-stone-100 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <p className="text-xs font-semibold">Local Courier</p>
                        <p className="text-[11px] opacity-80 mt-0.5">₱200 fee</p>
                        <p className="text-[10px] opacity-70 mt-1">Grab / Lalamove / J&T</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeliveryTypeChange('STUDIO_PICKUP')}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          deliveryType === 'STUDIO_PICKUP'
                            ? 'border-stone-900 dark:border-stone-100 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <p className="text-xs font-semibold">Studio Pickup</p>
                        <p className="text-[11px] opacity-80 mt-0.5">Free (₱0)</p>
                        <p className="text-[10px] opacity-70 mt-1">Atelier collection</p>
                      </button>
                    </div>
                  </div>

                  {deliveryType !== 'STUDIO_PICKUP' && (
                    <div className="space-y-3 p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                      <div>
                        <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                          Delivery Street Address
                        </label>
                        <input
                          type="text"
                          placeholder="House/Unit No., Street name, Subdivision/Building"
                          value={deliveryDetails.address}
                          onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City / Municipality"
                          value={deliveryDetails.city}
                          onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                          className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Landmark"
                          value={deliveryDetails.landmark}
                          onChange={(e) => setDeliveryDetails({ ...deliveryDetails, landmark: e.target.value })}
                          className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#a47e62]" />
                      <span>Payment Preference</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('GCASH')}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                          paymentMethod === 'GCASH'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        GCash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('BANK_TRANSFER')}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                          paymentMethod === 'BANK_TRANSFER'
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 shadow-sm'
                            : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        Bank Transfer
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH_ON_PICKUP')}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                          paymentMethod === 'CASH_ON_PICKUP'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        Cash on Fitting
                      </button>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-[#f5ede4] dark:bg-stone-800/90 border border-[#dfc8b4] dark:border-stone-700 space-y-2">
                    <div className="flex justify-between text-xs text-stone-600 dark:text-stone-300">
                      <span>Gown Rental (3-Day Period):</span>
                      <span className="font-semibold">{formatPHP(rentalRate)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-600 dark:text-stone-300">
                      <span>Delivery Fee ({deliveryType.replace('_', ' ')}):</span>
                      <span className="font-semibold">{formatPHP(deliveryFee)}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-300 dark:border-stone-700 flex justify-between items-baseline">
                      <span className="font-serif text-sm font-semibold text-stone-900 dark:text-stone-100">Estimated Total:</span>
                      <span className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">{formatPHP(estimatedTotal)}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 italic">
                      * Includes complimentary eco-friendly dry cleaning. A refundable ₱1,000 security deposit is payable upon dress dispatch/pickup.
                    </p>
                  </div>
                </div>
              )}

              {/* Wizard Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
                {activeStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((activeStep - 1) as any)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {activeStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStep === 1 && (!customerName.trim() || !email.trim())) {
                        toastError('Please enter your name and email to proceed.');
                        return;
                      }
                      setActiveStep((activeStep + 1) as any);
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-stone-800 transition-all"
                  >
                    <span>Next: {activeStep === 1 ? 'Measurements' : activeStep === 2 ? 'Fitting Schedule' : 'Delivery & Summary'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest shadow-md hover:bg-stone-800 dark:hover:bg-white transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'Submit Rental Inquiry'}</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
