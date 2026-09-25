import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Reply,
  Search,
  AlertCircle,
  Sparkles,
  MapPin,
  Scissors,
  CreditCard,
  Truck,
  ExternalLink,
  Save,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  Inquiry,
  RentalInquiryStatus,
  PaymentStatus,
  PaymentMethod,
  FittingStatus,
  DeliveryStatus,
  formatPHP
} from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

type TabFilter =
  | 'ALL'
  | 'NEW_REVIEWING'
  | 'CONFIRMED_RESERVED'
  | 'FITTING_REQUESTS'
  | 'DELIVERIES'
  | 'COMPLETED'
  | 'CANCELLED';

export const AdminInquiriesPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<TabFilter>('ALL');
  const [occasionFilter, setOccasionFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Editable fields for active inquiry
  const [activeOwnerNotes, setActiveOwnerNotes] = useState('');
  const [activePaymentStatus, setActivePaymentStatus] = useState<PaymentStatus>('UNPAID');
  const [activePaymentMethod, setActivePaymentMethod] = useState<PaymentMethod>('GCASH');
  const [activePaymentRef, setActivePaymentRef] = useState('');
  const [activeFittingStatus, setActiveFittingStatus] = useState<FittingStatus>('REQUESTED');
  const [activeDeliveryStatus, setActiveDeliveryStatus] = useState<DeliveryStatus>('PENDING');
  const [savingDetails, setSavingDetails] = useState(false);

  const loadInquiries = (keepSelectedId?: string) => {
    setLoading(true);
    api.inquiries
      .list()
      .then((data) => {
        setInquiries(data);
        if (data.length > 0) {
          const currentTarget = keepSelectedId
            ? data.find((i) => i.id === keepSelectedId) || data[0]
            : data[0];
          setSelectedInquiry(currentTarget);
          syncActiveState(currentTarget);
        } else {
          setSelectedInquiry(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        toastError('Failed to load inquiries: ' + err.message);
        setLoading(false);
      });
  };

  const syncActiveState = (inq: Inquiry) => {
    setActiveOwnerNotes(inq.owner_notes || '');
    setActivePaymentStatus(inq.payment_status || 'UNPAID');
    setActivePaymentMethod(inq.payment_method || 'GCASH');
    setActivePaymentRef(inq.payment_reference || '');
    if (inq.fitting) {
      setActiveFittingStatus(inq.fitting.status || 'REQUESTED');
    }
    if (inq.delivery) {
      setActiveDeliveryStatus(inq.delivery.status || 'PENDING');
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleSelectInquiry = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    syncActiveState(inq);
  };

  const handleUpdateRentalStatus = async (id: string, newStatus: RentalInquiryStatus) => {
    try {
      const updated = await api.inquiries.update(id, { status: newStatus });
      setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(updated);
      }
      success(`Inquiry status updated to ${newStatus.replace(/_/g, ' ')}.`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update status');
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedInquiry) return;
    setSavingDetails(true);

    try {
      const payload: Partial<Inquiry> = {
        owner_notes: activeOwnerNotes.trim(),
        payment_status: activePaymentStatus,
        payment_method: activePaymentMethod,
        payment_reference: activePaymentRef.trim(),
      };

      if (selectedInquiry.fitting) {
        payload.fitting = {
          ...selectedInquiry.fitting,
          status: activeFittingStatus,
        };
      }

      if (selectedInquiry.delivery) {
        payload.delivery = {
          ...selectedInquiry.delivery,
          status: activeDeliveryStatus,
        };
      }

      const updated = await api.inquiries.update(selectedInquiry.id, payload);
      setInquiries((prev) => prev.map((i) => (i.id === selectedInquiry.id ? updated : i)));
      setSelectedInquiry(updated);
      success('Inquiry details and atelier notes saved successfully!');
    } catch (err: any) {
      toastError(err.message || 'Failed to save changes');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inquiry record? This action cannot be undone.')) {
      return;
    }
    try {
      await api.inquiries.delete(id);
      success('Inquiry removed.');
      const remaining = inquiries.filter((i) => i.id !== id);
      setInquiries(remaining);
      if (selectedInquiry?.id === id) {
        if (remaining.length > 0) {
          setSelectedInquiry(remaining[0]);
          syncActiveState(remaining[0]);
        } else {
          setSelectedInquiry(null);
        }
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete inquiry');
    }
  };

  // Metrics calculation
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) =>
    ['INQUIRY_RECEIVED', 'REVIEWING', 'MORE_INFO_NEEDED'].includes(i.status)
  ).length;
  const confirmedCount = inquiries.filter((i) =>
    ['CONFIRMED', 'RESERVED'].includes(i.status)
  ).length;
  const fittingReqCount = inquiries.filter((i) => i.has_fitting_request).length;
  const deliveryCount = inquiries.filter((i) => Boolean(i.delivery)).length;
  const unpaidCount = inquiries.filter((i) =>
    ['CONFIRMED', 'RESERVED'].includes(i.status) && i.payment_status !== 'PAID'
  ).length;

  const filteredInquiries = inquiries.filter((inq) => {
    // Tab filter
    if (tabFilter === 'NEW_REVIEWING') {
      if (!['INQUIRY_RECEIVED', 'REVIEWING', 'MORE_INFO_NEEDED'].includes(inq.status)) return false;
    } else if (tabFilter === 'CONFIRMED_RESERVED') {
      if (!['CONFIRMED', 'RESERVED'].includes(inq.status)) return false;
    } else if (tabFilter === 'FITTING_REQUESTS') {
      if (!inq.has_fitting_request) return false;
    } else if (tabFilter === 'DELIVERIES') {
      if (!inq.delivery) return false;
    } else if (tabFilter === 'COMPLETED') {
      if (inq.status !== 'COMPLETED') return false;
    } else if (tabFilter === 'CANCELLED') {
      if (inq.status !== 'CANCELLED') return false;
    }

    // Occasion filter
    if (occasionFilter !== 'ALL') {
      if (inq.event_type !== occasionFilter) return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchesName = inq.customer_name?.toLowerCase().includes(q);
      const matchesEmail = inq.email?.toLowerCase().includes(q);
      const matchesPhone = inq.phone?.toLowerCase().includes(q) || inq.mobile_number?.toLowerCase().includes(q);
      const matchesDress = inq.dress_name?.toLowerCase().includes(q);
      const matchesCity = inq.delivery?.city?.toLowerCase().includes(q);
      if (!matchesName && !matchesEmail && !matchesPhone && !matchesDress && !matchesCity) return false;
    }

    return true;
  });

  const getStatusBadgeClass = (status: RentalInquiryStatus | string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'RESERVED':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'CANCELLED':
        return 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400 border border-stone-300 dark:border-stone-700';
      case 'INQUIRY_RECEIVED':
      case 'REVIEWING':
      default:
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header & High-level Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-stone-500 dark:text-stone-400">
            Atelier Reservations & Client Care
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 dark:text-stone-100 mt-1">
            Customer Rental Inquiries
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-2xl">
            Manage gown reservation schedules, fitting appointments, body measurements, Philippine delivery handovers, and payment confirmations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadInquiries(selectedInquiry?.id)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 shadow-xs"
          >
            Refresh List
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Total Inquiries</span>
          <div className="font-serif text-2xl font-normal text-stone-900 dark:text-stone-100 mt-1">{totalCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Pending Review</span>
          <div className="font-serif text-2xl font-normal text-rose-700 dark:text-rose-300 mt-1">{newCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Confirmed / Reserved</span>
          <div className="font-serif text-2xl font-normal text-emerald-700 dark:text-emerald-300 mt-1">{confirmedCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Fitting Requests</span>
          <div className="font-serif text-2xl font-normal text-amber-700 dark:text-amber-300 mt-1">{fittingReqCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Deliveries</span>
          <div className="font-serif text-2xl font-normal text-blue-700 dark:text-blue-300 mt-1">{deliveryCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/30 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Pending Payments</span>
          <div className="font-serif text-2xl font-normal text-purple-700 dark:text-purple-300 mt-1">{unpaidCount}</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Inquiries' },
            { id: 'NEW_REVIEWING', label: `Pending Review (${newCount})` },
            { id: 'CONFIRMED_RESERVED', label: `Confirmed (${confirmedCount})` },
            { id: 'FITTING_REQUESTS', label: `Fittings (${fittingReqCount})` },
            { id: 'DELIVERIES', label: `Deliveries (${deliveryCount})` },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabFilter(tab.id as TabFilter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                tabFilter === tab.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters & Search Inputs */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Occasion Filter */}
          <select
            value={occasionFilter}
            onChange={(e) => setOccasionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
          >
            <option value="ALL">All Occasions</option>
            <option value="Birthdays">Birthdays</option>
            <option value="Debuts">Debuts</option>
            <option value="Weddings">Weddings</option>
            <option value="Parties">Parties</option>
            <option value="Photoshoots">Photoshoots</option>
            <option value="Formal Events">Formal Events</option>
            <option value="Special Occasion">Special Occasion</option>
          </select>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, dress, city..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Two-Pane Layout: Left Inquiry List (4 cols) & Right Detail Panel (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List Column */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden shadow-sm max-h-[880px] overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center text-stone-400 text-xs animate-pulse">
              Loading customer inquiries...
            </div>
          ) : filteredInquiries.length > 0 ? (
            filteredInquiries.map((inq) => {
              const isSelected = selectedInquiry?.id === inq.id;
              return (
                <div
                  key={inq.id}
                  onClick={() => handleSelectInquiry(inq)}
                  className={`p-4 cursor-pointer transition-all border-l-4 ${
                    isSelected
                      ? 'border-[#9a734e] bg-[#f9f6f2] dark:bg-stone-800/90'
                      : 'border-transparent hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                        {inq.customer_name}
                      </h4>
                      <span className="text-[10px] text-stone-400">
                        {new Date(inq.created_at).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${getStatusBadgeClass(
                        inq.status
                      )}`}
                    >
                      {inq.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Dress & Occasion summary */}
                  <div className="flex items-center gap-2 mb-2">
                    {inq.dress_image && (
                      <img
                        src={inq.dress_image}
                        alt={inq.dress_name || 'Gown'}
                        className="w-8 h-10 object-cover rounded-md bg-stone-100 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-stone-900 dark:text-stone-100 truncate">
                        {inq.dress_name || 'General Inquiry'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400">
                        {inq.event_type && <span>{inq.event_type}</span>}
                        {inq.event_date && (
                          <>
                            <span>•</span>
                            <span>{inq.event_date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Feature Tags (Fitting, Measurements, Paid) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {inq.has_fitting_request && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                        Fitting Req
                      </span>
                    )}
                    {inq.has_measurements && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-medium">
                        Measurements
                      </span>
                    )}
                    {inq.delivery && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-medium">
                        Delivery
                      </span>
                    )}
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        inq.payment_status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                      }`}
                    >
                      {inq.payment_status === 'PAID' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-stone-400 text-xs">
              No inquiries match your current filters.
            </div>
          )}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-8 max-h-[880px] overflow-y-auto">
          {selectedInquiry ? (
            <div className="space-y-8">
              
              {/* Top Action & Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-normal">
                      {selectedInquiry.customer_name}
                    </h2>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(
                        selectedInquiry.status
                      )}`}
                    >
                      {selectedInquiry.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Submitted on {new Date(selectedInquiry.created_at).toLocaleString('en-PH')}
                  </p>
                </div>

                {/* Workflow Status Selector & Actions */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Status:</span>
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) => handleUpdateRentalStatus(selectedInquiry.id, e.target.value as RentalInquiryStatus)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
                    >
                      <option value="INQUIRY_RECEIVED">Inquiry Received</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="MORE_INFO_NEEDED">More Info Needed</option>
                      <option value="AVAILABLE">Available / Approved</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="CONFIRMED">Confirmed Rental</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleDelete(selectedInquiry.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Direct Client Contact Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Email Address</span>
                  <div className="flex items-center justify-between text-xs">
                    <a href={`mailto:${selectedInquiry.email}`} className="font-medium text-stone-900 dark:text-stone-100 hover:underline truncate">
                      {selectedInquiry.email}
                    </a>
                    <a
                      href={`mailto:${selectedInquiry.email}?subject=Regarding Your Rental Inquiry - Get Dress'd by Rissée&body=Hello ${encodeURIComponent(
                        selectedInquiry.customer_name
                      )},\n\nThank you for reaching out to Get Dress'd by Rissée regarding the ${encodeURIComponent(
                        selectedInquiry.dress_name || 'Vietnamese occasion dress'
                      )}!`}
                      className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                      title="Reply via Email"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Mobile / Viber</span>
                  <div className="text-xs font-medium text-stone-900 dark:text-stone-100">
                    {selectedInquiry.phone || selectedInquiry.mobile_number ? (
                      <a href={`tel:${selectedInquiry.phone || selectedInquiry.mobile_number}`} className="hover:underline">
                        {selectedInquiry.phone || selectedInquiry.mobile_number}
                      </a>
                    ) : (
                      <span className="text-stone-400">Not provided</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Preferred Contact</span>
                  <div className="text-xs font-medium text-stone-900 dark:text-stone-100">
                    {selectedInquiry.preferred_contact || 'SMS / Call'}
                  </div>
                </div>
              </div>

              {/* Gown & Reservation Details Card */}
              <div className="p-5 rounded-3xl bg-[#faf7f3] dark:bg-stone-800/60 border border-[#eee2d7] dark:border-stone-700 space-y-4">
                <div className="flex items-center justify-between border-b border-[#ebdccd] dark:border-stone-700 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#855e38] dark:text-[#dfc8b4]">
                    Reserved Dress & Event Schedule
                  </span>
                  {selectedInquiry.dress_id && (
                    <Link
                      to={`/dresses/${selectedInquiry.dress_id}`}
                      target="_blank"
                      className="text-[11px] font-medium text-[#855e38] dark:text-[#dfc8b4] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View in catalog</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {selectedInquiry.dress_image && (
                    <img
                      src={selectedInquiry.dress_image}
                      alt={selectedInquiry.dress_name || 'Dress'}
                      className="w-20 h-24 object-cover rounded-xl bg-stone-100 shadow-sm shrink-0"
                    />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium">
                      {selectedInquiry.dress_name || 'No specific dress requested'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-xs text-stone-600 dark:text-stone-400">
                      <div>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">Event Occasion:</span>{' '}
                        {selectedInquiry.event_type || 'Special Celebration'}
                      </div>
                      <div>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">Event Date:</span>{' '}
                        {selectedInquiry.event_date || 'TBD'}
                      </div>
                      <div>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">Rental Period:</span>{' '}
                        {selectedInquiry.date_needed || 'Start Date'} → {selectedInquiry.return_date || 'Return Date'}
                      </div>
                      <div>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">Location:</span>{' '}
                        {selectedInquiry.event_location || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Ledger & Payment Tracking */}
              <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                      Philippine Rental Ledger & Payment Tracking
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Total: {formatPHP(selectedInquiry.total_amount || selectedInquiry.rental_price)}
                  </span>
                </div>

                {/* Ledger Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Gown Rental Rate</span>
                    <strong className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {formatPHP(selectedInquiry.rental_price)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Delivery Fee</span>
                    <strong className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {formatPHP(selectedInquiry.delivery_fee || 0)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Additional Fees</span>
                    <strong className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {formatPHP(selectedInquiry.additional_fees || 0)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Discount</span>
                    <strong className="text-sm font-semibold text-emerald-600">
                      -{formatPHP(selectedInquiry.discount || 0)}
                    </strong>
                  </div>
                </div>

                {/* Payment Status Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={activePaymentStatus}
                      onChange={(e) => setActivePaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
                    >
                      <option value="UNPAID">UNPAID (Pending Deposit)</option>
                      <option value="PARTIALLY_PAID">PARTIALLY PAID (Deposit Received)</option>
                      <option value="PAID">PAID (Full Settled)</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={activePaymentMethod}
                      onChange={(e) => setActivePaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
                    >
                      <option value="GCASH">GCash Mobile Transfer</option>
                      <option value="BANK_TRANSFER">Philippine Bank Wire (BDO/BPI/UnionBank)</option>
                      <option value="CASH">Cash upon Studio Fitting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Reference / Trans ID
                    </label>
                    <input
                      type="text"
                      value={activePaymentRef}
                      onChange={(e) => setActivePaymentRef(e.target.value)}
                      placeholder="e.g. GCash Ref # 10293847"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Fitting Appointment Request (If present) */}
              {selectedInquiry.has_fitting_request && selectedInquiry.fitting && (
                <div className="p-5 rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/50 dark:border-amber-900/40 pb-3">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                        Showroom Fitting Appointment
                      </h3>
                    </div>
                    <select
                      value={activeFittingStatus}
                      onChange={(e) => setActiveFittingStatus(e.target.value as FittingStatus)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 focus:outline-none"
                    >
                      <option value="REQUESTED">REQUESTED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="RESCHEDULED">RESCHEDULED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700 dark:text-stone-300">
                    <div>
                      <span className="font-semibold text-stone-900 dark:text-stone-100 block">Preferred Schedule:</span>
                      <span>
                        {selectedInquiry.fitting.preferred_date} at {selectedInquiry.fitting.preferred_time}
                      </span>
                    </div>
                    {selectedInquiry.fitting.alternative_date && (
                      <div>
                        <span className="font-semibold text-stone-900 dark:text-stone-100 block">Alternative Schedule:</span>
                        <span>
                          {selectedInquiry.fitting.alternative_date} at {selectedInquiry.fitting.alternative_time || 'Anytime'}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedInquiry.fitting.notes && (
                    <div className="text-xs text-stone-600 dark:text-stone-400 italic">
                      Client Fitting Notes: &ldquo;{selectedInquiry.fitting.notes}&rdquo;
                    </div>
                  )}
                </div>
              )}

              {/* Body Measurements Card (If provided) */}
              {selectedInquiry.has_measurements && selectedInquiry.measurements && (
                <div className="p-5 rounded-3xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/30 space-y-4">
                  <div className="flex items-center gap-2 border-b border-purple-200/50 dark:border-purple-900/40 pb-3">
                    <Scissors className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200">
                      Client Body Measurements
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {selectedInquiry.measurements.height && (
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Height</span>
                        <strong className="text-stone-900 dark:text-stone-100">{selectedInquiry.measurements.height}</strong>
                      </div>
                    )}
                    {selectedInquiry.measurements.bust && (
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Bust</span>
                        <strong className="text-stone-900 dark:text-stone-100">{selectedInquiry.measurements.bust}</strong>
                      </div>
                    )}
                    {selectedInquiry.measurements.waist && (
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Waist</span>
                        <strong className="text-stone-900 dark:text-stone-100">{selectedInquiry.measurements.waist}</strong>
                      </div>
                    )}
                    {selectedInquiry.measurements.hips && (
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Hips</span>
                        <strong className="text-stone-900 dark:text-stone-100">{selectedInquiry.measurements.hips}</strong>
                      </div>
                    )}
                    {selectedInquiry.measurements.preferred_fit && (
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Preferred Fit</span>
                        <strong className="text-stone-900 dark:text-stone-100">{selectedInquiry.measurements.preferred_fit}</strong>
                      </div>
                    )}
                    {selectedInquiry.measurements.shoe_height && (
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Shoe / Heel Height</span>
                        <strong className="text-stone-900 dark:text-stone-100">{selectedInquiry.measurements.shoe_height}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery & Courier Handover Card (If provided) */}
              {selectedInquiry.delivery && (
                <div className="p-5 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-200/50 dark:border-blue-900/40 pb-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                        Delivery & Courier Logistics
                      </h3>
                    </div>
                    <select
                      value={activeDeliveryStatus}
                      onChange={(e) => setActiveDeliveryStatus(e.target.value as DeliveryStatus)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-stone-800 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 focus:outline-none"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PREPARING">PREPARING (Steam & Pack)</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED TO CLIENT</option>
                      <option value="RETURNED">RETURNED SAFELY</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700 dark:text-stone-300">
                    <div>
                      <span className="font-semibold text-stone-900 dark:text-stone-100 block">Method:</span>
                      <span>
                        {selectedInquiry.delivery.type === 'PERSONAL_DELIVERY'
                          ? 'Personal Doorstep Handover (Metro Manila)'
                          : selectedInquiry.delivery.type === 'LOCAL_DELIVERY'
                          ? 'Local Courier Express Delivery'
                          : 'Studio Atelier Pick-up'}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-stone-900 dark:text-stone-100 block">Recipient & Mobile:</span>
                      <span>
                        {selectedInquiry.delivery.recipient_name} ({selectedInquiry.delivery.mobile_number})
                      </span>
                    </div>

                    {selectedInquiry.delivery.address && (
                      <div className="sm:col-span-2">
                        <span className="font-semibold text-stone-900 dark:text-stone-100 block">Address:</span>
                        <span>
                          {selectedInquiry.delivery.address}
                          {selectedInquiry.delivery.barangay ? `, Brgy. ${selectedInquiry.delivery.barangay}` : ''}
                          {selectedInquiry.delivery.city ? `, ${selectedInquiry.delivery.city}` : ''}
                          {selectedInquiry.delivery.province ? `, ${selectedInquiry.delivery.province}` : ''}
                          {selectedInquiry.delivery.landmark ? ` (Landmark: ${selectedInquiry.delivery.landmark})` : ''}
                        </span>
                      </div>
                    )}

                    {selectedInquiry.delivery.delivery_notes && (
                      <div className="sm:col-span-2 text-stone-500 italic">
                        Courier Notes: {selectedInquiry.delivery.delivery_notes}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Client Message */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Client Message / Notes
                </span>
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-xs text-stone-800 dark:text-stone-200 whitespace-pre-line leading-relaxed">
                  {selectedInquiry.message || 'No additional message provided.'}
                </div>
              </div>

              {/* Private Atelier Owner Notes */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Private Owner Notes (Rissée Atelier Only)
                  </span>
                  <span className="text-[11px] text-stone-400">Never visible to customers</span>
                </div>
                <textarea
                  rows={3}
                  value={activeOwnerNotes}
                  onChange={(e) => setActiveOwnerNotes(e.target.value)}
                  placeholder="e.g. Include matching silk stole. Customer requested 2-inch temporary hem. Ready for Friday pickup."
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Regarding Your Rental - Get Dress'd by Rissée&body=Hello ${encodeURIComponent(
                    selectedInquiry.customer_name
                  )},\n\nThank you for reaching out to Get Dress'd by Rissée!`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                <button
                  onClick={handleSaveDetails}
                  disabled={savingDetails}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white shadow transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingDetails ? 'Saving Changes...' : 'Save All Changes'}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="py-32 text-center text-stone-400 text-xs">
              Select an inquiry from the left panel to inspect details and reservation schedules.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
