// Global TypeScript definitions for Get Dress'd by Rissée
// Philippine Designer Vietnamese Dress Rental Boutique

export type AvailabilityStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'RENTED'
  | 'UNDER_CLEANING'
  | 'UNAVAILABLE'
  | 'HIDDEN';

export type RentalInquiryStatus =
  | 'INQUIRY_RECEIVED'
  | 'REVIEWING'
  | 'MORE_INFO_NEEDED'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

// Backwards-compatible alias for older components
export type InquiryStatus = RentalInquiryStatus | 'UNREAD' | 'READ' | 'CONTACTED' | 'ARCHIVED';

export type PaymentMethod = 'CASH' | 'GCASH' | 'BANK_TRANSFER' | 'CASH_ON_PICKUP';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';

export type DeliveryType = 'PERSONAL_DELIVERY' | 'LOCAL_DELIVERY' | 'STUDIO_PICKUP';
export type DeliveryStatus = 'PENDING' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';

export type FittingStatus = 'REQUESTED' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface DressImage {
  id?: string;
  dress_id?: string;
  url: string;
  file_path?: string;
  sort_order?: number;
  display_order?: number;
  is_primary: boolean;
  alt_text?: string;
  caption?: string;
  created_at?: string;
}

export interface Dress {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string;
  category_name?: string;
  sizes: string[];
  colors: string[];
  style?: string;
  occasion?: string;
  dress_code?: string; // e.g. "RIS-001" or SKU
  rental_price: number; // Numeric database value (e.g. 500, 650, 700)
  sale_price?: number | null; // Optional sale price if enabled later
  rental_duration?: string; // e.g. "3 Days (Standard)"
  availability: AvailabilityStatus;
  featured: boolean;
  published: boolean;
  archived: boolean;
  notes?: string;
  measurements_guide?: {
    bust?: string;
    waist?: string;
    hips?: string;
    length?: string;
  };
  care_instructions?: string;
  reservation_info?: string;
  primary_image_url?: string;
  images?: DressImage[];
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  archived: boolean;
  dress_count?: number;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerMeasurements {
  height?: string;
  height_cm?: string;
  bust?: string;
  bust_inches?: string;
  waist?: string;
  waist_inches?: string;
  hips?: string;
  hips_inches?: string;
  shoulder?: string;
  shoulder_inches?: string;
  sleeve_length?: string;
  sleeve_length_inches?: string;
  inseam?: string;
  preferred_fit?: 'Fitted' | 'Relaxed' | 'Flowing' | 'Standard' | string;
  shoe_height?: string;
  shoe_heel_height?: string;
  notes?: string;
  other?: string;
  additional_notes?: string;
}

export interface DeliveryDetails {
  type: DeliveryType;
  recipient_name: string;
  mobile_number: string;
  address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  landmark?: string;
  delivery_notes?: string;
  delivery_fee: number;
  status?: DeliveryStatus;
}

export interface FittingDetails {
  preferred_date: string;
  preferred_time: string;
  alternative_date?: string;
  alternative_time?: string;
  notes?: string;
  status?: FittingStatus;
}

export interface FittingAppointment {
  id: string;
  inquiry_id?: string;
  customer_name: string;
  mobile_number: string;
  dress_id?: string;
  dress_name?: string;
  preferred_date: string;
  preferred_time: string;
  alternative_date?: string;
  alternative_time?: string;
  notes?: string;
  status: FittingStatus;
  owner_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Inquiry {
  id: string;
  customer_name: string;
  email: string;
  phone?: string;
  mobile_number?: string;
  preferred_contact?: 'SMS' | 'PHONE' | 'EMAIL' | 'VIBER_WHATSAPP' | 'VIBER';

  // Event information
  event_type?: 'Birthday' | 'Debut' | 'Wedding' | 'Party' | 'Photoshoot' | 'Formal Event' | 'Special Occasion' | 'Other' | string;
  event_date?: string;
  event_location?: string;
  date_needed?: string;
  return_date?: string;

  // Dress information
  dress_id?: string;
  dress_name?: string;
  dress_image?: string;
  rental_price: number;

  // Financial calculations
  delivery_fee?: number;
  additional_fees?: number;
  discount?: number;
  total_amount?: number;

  // Customer message
  message: string;

  // Optional measurements
  has_measurements?: boolean;
  measurements?: CustomerMeasurements;

  // Delivery details
  delivery?: DeliveryDetails;

  // Fitting request
  has_fitting_request?: boolean;
  fitting?: FittingDetails;

  // Payment tracking
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  payment_reference?: string;
  payment_notes?: string;
  payment_date?: string;

  // Workflow status
  status: RentalInquiryStatus;
  owner_notes?: string; // Private to owner, never sent in public responses

  created_at: string;
  updated_at?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_inquiries: number;
  confirmed_rentals: number;
  total_spent: number;
  latest_measurements?: CustomerMeasurements;
  inquiry_ids: string[];
  dresses_rented: string[];
  owner_notes?: string;
  created_at: string;
  last_activity: string;
}

export interface BusinessHours {
  mon_fri: string;
  sat: string;
  sun: string;
}

export interface BoutiqueService {
  title: string;
  desc: string;
}

export interface GCashConfig {
  enabled: boolean;
  account_name: string;
  account_number: string;
  instructions: string;
  qr_code_url?: string;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  instructions?: string;
}

export interface CashConfig {
  enabled: boolean;
  instructions: string;
}

export interface PaymentSettings {
  cash: CashConfig;
  gcash: GCashConfig;
  banks: BankAccount[];
  disclaimer: string;
}

export interface DeliveryOptionConfig {
  enabled: boolean;
  fee: number;
  areas: string;
  schedule: string;
  notes: string;
}

export interface DeliverySettings {
  personal_delivery: DeliveryOptionConfig;
  local_delivery: DeliveryOptionConfig;
  studio_pickup: {
    enabled: boolean;
    address: string;
    schedule: string;
    instructions: string;
  };
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface PolicySettings {
  rental_rules: string[];
  terms_and_conditions: string;
  privacy_policy: string;
  security_deposit_info: string;
  faqs: FAQItem[];
}

export interface SectionsConfig {
  hero: boolean;
  announcement: boolean;
  featured: boolean;
  about: boolean;
  categories: boolean;
  services: boolean;
  payment: boolean;
  contact: boolean;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  accent_color: string;
  background_tone: string;
  chibi_decorations: boolean;
}

export interface WebsiteSettings {
  id: string;
  business_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  business_hours: BusinessHours;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  announcement: string;
  announcement_enabled: boolean;
  about_title: string;
  about_text: string;
  about_image_url: string;
  services: BoutiqueService[];
  payment?: PaymentSettings;
  delivery?: DeliverySettings;
  policies?: PolicySettings;
  chibi_decorations?: boolean;
  theme?: ThemeConfig;
  sections_config: SectionsConfig;
  footer_text: string;
  custom_domain?: string;
  app_store_url?: string;
  netlify_url?: string;
  updated_at?: string;
}

/**
 * Formats a numeric price into Philippine Pesos (₱)
 * e.g., 650 -> "₱650"
 */
export const formatPHP = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || amount === '' || isNaN(Number(amount))) {
    return '₱0';
  }
  return `₱${Number(amount).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
};

export interface ActivityHistoryItem {
  id: string;
  action: string;
  entity_type: 'DRESS' | 'CATEGORY' | 'INQUIRY' | 'PHOTO' | 'SETTINGS' | 'AUTH' | 'SYSTEM' | 'RESERVATION' | 'PAYMENT' | 'DELIVERY';
  entity_id: string;
  description: string;
  user_responsible: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface RentalRevenueStats {
  totalRevenue: number;
  thisMonthRevenue: number;
  thisWeekRevenue: number;
  todayRevenue: number;
  pendingInquiriesCount: number;
  confirmedRentalsCount: number;
  completedRentalsCount: number;
  cancelledRentalsCount: number;
  outstandingPaymentsCount: number;
  outstandingPaymentsAmount: number;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'owner' | 'admin';
  name: string;
}

export interface DressFilterOptions {
  search?: string;
  category?: string;
  size?: string;
  color?: string;
  occasion?: string;
  availability?: AvailabilityStatus | 'ALL';
  minRentalPrice?: number;
  maxRentalPrice?: number;
  featuredOnly?: boolean;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'name_asc';
}

export interface DashboardStats {
  availableDresses: number;
  reservedDresses: number;
  rentedDresses: number;
  underCleaningDresses: number;
  unavailableDresses: number;
  archivedDresses: number;
  publishedDresses: number;
  unpublishedDresses: number;
  featuredDresses: number;
  totalInquiries: number;
  pendingInquiries: number;
  confirmedRentals: number;
  completedRentals: number;
  recentlyAddedDresses: Dress[];
}
