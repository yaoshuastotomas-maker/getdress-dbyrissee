import { WebsiteSettings, Category, Dress, Inquiry, ActivityHistoryItem } from '../types';

export interface SeedDatabase {
  settings: WebsiteSettings;
  categories: Category[];
  dresses: Dress[];
  inquiries: Inquiry[];
  history: ActivityHistoryItem[];
  admin: {
    username: string;
    email: string;
    name: string;
  };
}

export const initialSeedData: SeedDatabase = {
  "settings": {
    "id": "default",
    "business_name": "Get Dress'd by Rissée",
    "tagline": "Curated Vietnamese Dress Rentals for Life's Unforgettable Celebrations",
    "phone": "+63 917 839 2841",
    "email": "inquire@getdressdbyrissee.com",
    "address": "Studio Atelier, Metro Manila, Philippines",
    "instagram": "https://instagram.com/getdressdbyrissee",
    "facebook": "https://facebook.com/getdressdbyrissee",
    "tiktok": "https://tiktok.com/@getdressdbyrissee",
    "business_hours": {
      "mon_fri": "10:00 AM - 7:00 PM",
      "sat": "10:00 AM - 6:00 PM",
      "sun": "By Appointment Only"
    },
    "hero_title": "Rent Exquisite Vietnamese Dresses for Unforgettable Celebrations",
    "hero_subtitle": "Beautifully selected couture for birthdays, debuts, weddings, parties, photoshoots, and special occasions across the Philippines.",
    "hero_image_url": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1600&q=80",
    "announcement": "✨ New Vietnamese occasion collection now available for reservations! Schedule a fitting appointment today.",
    "announcement_enabled": true,
    "about_title": "The Art of Dressing with Rissée",
    "about_text": "Founded with a passion for exquisite fashion, Get Dress'd by Rissée connects clients with beautifully selected Vietnamese dresses for rent. Whether celebrating your 18th debut, walking down the aisle, marking an unforgettable birthday, or stepping in front of the lens for a photoshoot, our atelier ensures you stand out with effortless elegance and radiant confidence.",
    "about_image_url": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80",
    "services": [
      {
        "title": "Vietnamese Occasion Rentals",
        "desc": "Reserve hand-selected Vietnamese designer dresses for 3 to 5-day periods with professional dry cleaning included."
      },
      {
        "title": "Custom Fitting & Styling",
        "desc": "Arrange a schedule with us for measuring or fitting your dream dress with personalized styling advice."
      },
      {
        "title": "Personal & Local Delivery",
        "desc": "Doorstep handover across Metro Manila and trusted courier delivery to surrounding provinces."
      }
    ],
    "payment": {
      "cash": {
        "enabled": true,
        "instructions": "Cash payment is accepted upon in-person studio fitting or garment pickup arrangement."
      },
      "gcash": {
        "enabled": true,
        "account_name": "Rissée R.",
        "account_number": "0917 839 2841",
        "instructions": "Send payment via GCash Express Send. Please save your reference number or screenshot to confirm your reservation.",
        "qr_code_url": ""
      },
      "banks": [
        {
          "id": "bank-bdo",
          "bank_name": "BDO Unibank",
          "account_name": "Rissée Couture Boutique",
          "account_number": "0012 3456 7890",
          "instructions": "Online bank transfer or over-the-counter deposit."
        },
        {
          "id": "bank-bpi",
          "bank_name": "Bank of the Philippine Islands (BPI)",
          "account_name": "Rissée Couture Boutique",
          "account_number": "1234 5678 90",
          "instructions": "InstaPay or PESONet transfer supported."
        },
        {
          "id": "bank-ubp",
          "bank_name": "UnionBank of the Philippines",
          "account_name": "Rissée Couture Boutique",
          "account_number": "1098 7654 3210",
          "instructions": "Instant transfer via InstaPay 24/7."
        }
      ],
      "disclaimer": "Payment confirmation may be required before your reservation is finalized."
    },
    "delivery": {
      "personal_delivery": {
        "enabled": true,
        "fee": 350,
        "areas": "Metro Manila (Makati, BGC, Ortigas, Quezon City, Pasay, San Juan)",
        "schedule": "Daily 10:00 AM - 6:00 PM",
        "notes": "Handled directly by our atelier team with protective garment bag and hanger."
      },
      "local_delivery": {
        "enabled": true,
        "fee": 200,
        "areas": "Greater Metro Manila, Rizal, Cavite, Laguna",
        "schedule": "Next-day dispatch via accredited local courier (Lalamove, Grab Express, or J&T)",
        "notes": "Tracking details sent upon handover."
      },
      "studio_pickup": {
        "enabled": true,
        "address": "Get Dress'd Atelier, Metro Manila, Philippines",
        "schedule": "By Appointment: Monday - Saturday 10:00 AM - 6:00 PM",
        "instructions": "Please bring a valid ID and booking confirmation message."
      }
    },
    "policies": {
      "rental_rules": [
        "Standard 3-day reservation period (Day 1: Delivery or Studio Pickup, Day 2: Your Event, Day 3: Scheduled Return).",
        "Professional eco-friendly dry cleaning is handled by our atelier after return. Do NOT wash, iron, or spray perfume directly on the garment.",
        "A refundable security deposit of ₱1,000 per dress is held and released within 24 hours of safe garment inspection upon return.",
        "Temporary hem tape alterations may be coordinated; permanent cutting or alterations are strictly prohibited.",
        "Late returns are subject to a fee of ₱200 per day to honor upcoming reservations for other clients."
      ],
      "terms_and_conditions": "Get Dress'd by Rissée provides dress rental services for curated Vietnamese designer dresses. All garments remain the exclusive property of Get Dress'd by Rissée at all times. Renters agree to exercise reasonable care while in possession of garments.",
      "privacy_policy": "Customer personal details, measurements, and delivery addresses are kept strictly confidential and accessible solely to authorized owners for rental fulfillment.",
      "security_deposit_info": "A refundable security deposit of ₱1,000 is required for each rented gown. It is refunded within 24 hours of garment inspection upon return.",
      "faqs": [
        {
          "q": "How does dress rental work?",
          "a": "Browse our collection, select your event date, submit an inquiry with your measurements, and we'll confirm dress availability. Once confirmed, you can arrange payment via GCash, Bank Transfer, or Cash upon fitting."
        },
        {
          "q": "Can I try on the dress before my event?",
          "a": "Yes! You may arrange a schedule with us for measuring or fitting the dress. Send your preferred date and time in the inquiry form, and we'll coordinate with you."
        },
        {
          "q": "Do I need to wash or dry-clean the dress before returning?",
          "a": "No, please do not wash or iron the dress yourself. Professional eco-friendly dry cleaning is already included with every rental."
        },
        {
          "q": "What happens if a dress doesn't fit?",
          "a": "We encourage submitting your measurements before booking. If an in-person fitting shows sizing issues, we will gladly offer available alternative styles from our collection."
        },
        {
          "q": "What delivery options do you offer?",
          "a": "We offer Personal Atelier Delivery across Metro Manila, Local Courier Delivery across Greater Manila & nearby provinces, and complimentary Studio Pickup by appointment."
        }
      ]
    },
    "chibi_decorations": true,
    "theme": {
      "mode": "system",
      "accent_color": "#dfc8b4",
      "background_tone": "stone",
      "chibi_decorations": true
    },
    "sections_config": {
      "hero": true,
      "announcement": true,
      "featured": true,
      "about": true,
      "categories": true,
      "services": true,
      "payment": true,
      "contact": true
    },
    "footer_text": "© 2026 Get Dress'd by Rissée. All rights reserved. Curated Vietnamese occasion dress rentals in the Philippines.",
    "custom_domain": "getdressdbyrissee.ph",
    "netlify_url": "https://getdressdbyrissee.netlify.app",
    "updated_at": "2026-09-23T08:46:00.000Z"
  },
  "categories": [
    {
      "id": "c-birthdays",
      "name": "Birthdays & Milestones",
      "slug": "birthdays",
      "description": "Eye-catching, celebratory Vietnamese dresses designed to make the celebrant look captivating in every photo.",
      "display_order": 1,
      "archived": false,
      "created_at": "2026-09-20T10:00:00.000Z"
    },
    {
      "id": "c-debut",
      "name": "Debut & Quinceañera",
      "slug": "debut",
      "description": "Showstopping 18th debutante gowns, grand entrance silhouettes, and cotillion dance dresses.",
      "display_order": 2,
      "archived": false,
      "created_at": "2026-09-20T10:00:00.000Z"
    },
    {
      "id": "c-weddings",
      "name": "Weddings & Receptions",
      "slug": "weddings",
      "description": "Sophisticated guest attire, modern Vietnamese áo dài silhouettes, and second-look reception dresses.",
      "display_order": 3,
      "archived": false,
      "created_at": "2026-09-20T10:00:00.000Z"
    },
    {
      "id": "c-parties",
      "name": "Parties & Celebrations",
      "slug": "parties",
      "description": "Chic midis, statement evening wear, and flattering silhouettes for dinner parties and festivities.",
      "display_order": 4,
      "archived": false,
      "created_at": "2026-09-20T10:00:00.000Z"
    },
    {
      "id": "c-photoshoots",
      "name": "Photoshoots & Editorial",
      "slug": "photoshoots",
      "description": "Camera-ready dresses with fluid fabric movement, sculptural lines, and lustrous textures.",
      "display_order": 5,
      "archived": false,
      "created_at": "2026-09-20T10:00:00.000Z"
    },
    {
      "id": "c-formal",
      "name": "Formal & Gala Occasions",
      "slug": "formal-occasions",
      "description": "Floor-length elegance, luxurious silk textures, and hand-embellished accents for galas and banquets.",
      "display_order": 6,
      "archived": false,
      "created_at": "2026-09-20T10:00:00.000Z"
    },
    {
      "id": "c-special",
      "name": "Special Events",
      "slug": "special-events",
      "description": "Versatile and timeless designer styles for award ceremonies, graduations, and milestone gatherings.",
      "display_order": 7,
      "archived": false,
      "created_at": "2026-09-20T10:00:00.000Z"
    }
  ],
  "dresses": [],
  "inquiries": [],
  "history": [],
  "admin": {
    "username": "caleb0621",
    "email": "owner@getdressdbyrissee.com",
    "name": "Rissée & Caleb"
  }
};
