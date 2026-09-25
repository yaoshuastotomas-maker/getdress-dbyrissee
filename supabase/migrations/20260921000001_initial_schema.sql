-- Get Dress'd by Rissée - Supabase PostgreSQL Initial Migration
-- Migration: 20260921000001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE availability_status AS ENUM ('AVAILABLE', 'RESERVED', 'RENTED', 'SOLD', 'UNAVAILABLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inquiry_status AS ENUM ('UNREAD', 'READ', 'CONTACTED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DRESSES TABLE
CREATE TABLE IF NOT EXISTS public.dresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT DEFAULT '',
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    rental_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(10, 2) DEFAULT NULL,
    availability availability_status NOT NULL DEFAULT 'AVAILABLE',
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT true,
    archived BOOLEAN DEFAULT false,
    notes TEXT DEFAULT '',
    primary_image_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_dresses_slug ON public.dresses(slug);
CREATE INDEX IF NOT EXISTS idx_dresses_category ON public.dresses(category_id);
CREATE INDEX IF NOT EXISTS idx_dresses_published ON public.dresses(published, archived);
CREATE INDEX IF NOT EXISTS idx_dresses_availability ON public.dresses(availability);
CREATE INDEX IF NOT EXISTS idx_dresses_featured ON public.dresses(featured);

-- 4. DRESS_IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.dress_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dress_id UUID NOT NULL REFERENCES public.dresses(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    file_path TEXT DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    alt_text TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dress_images_dress ON public.dress_images(dress_id, sort_order);

-- 5. INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    dress_id UUID REFERENCES public.dresses(id) ON DELETE SET NULL,
    dress_name TEXT DEFAULT '',
    preferred_date TEXT DEFAULT '',
    message TEXT NOT NULL,
    status inquiry_status NOT NULL DEFAULT 'UNREAD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- 6. WEBSITE_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    business_name TEXT NOT NULL DEFAULT 'Get Dress''d by Rissée',
    tagline TEXT DEFAULT 'Curated Designer Dress Rentals & Exclusive Evening Sales',
    phone TEXT DEFAULT '+1 (555) 747-7333',
    email TEXT DEFAULT 'hello@getdressdbyrissee.com',
    address TEXT DEFAULT 'Beverly Hills Atelier, Los Angeles, CA',
    instagram TEXT DEFAULT 'https://instagram.com/getdressdbyrissee',
    facebook TEXT DEFAULT 'https://facebook.com/getdressdbyrissee',
    tiktok TEXT DEFAULT 'https://tiktok.com/@getdressdbyrissee',
    business_hours JSONB DEFAULT '{"mon_fri": "10:00 AM - 7:00 PM", "sat": "10:00 AM - 6:00 PM", "sun": "By Appointment Only"}'::jsonb,
    hero_title TEXT DEFAULT 'Step into Elegance, Rent with Confidence',
    hero_subtitle TEXT DEFAULT 'Exclusive designer evening gowns, red-carpet showstoppers, and bridal couture curated by Rissée.',
    hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1600&q=80',
    announcement TEXT DEFAULT '✨ Autumn Couture Collection is now live! Reserve early for gala season.',
    announcement_enabled BOOLEAN DEFAULT true,
    about_title TEXT DEFAULT 'The Art of Dressing with Rissée',
    about_text TEXT DEFAULT 'Founded with a passion for unforgettable couture, Get Dress''d by Rissée connects fashion lovers with breathtaking designer gowns. Whether walking down the aisle, gracing a black-tie gala, or celebrating life''s milestone moments, our atelier ensures every client feels radiant, comfortable, and undeniably chic.',
    about_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80',
    services JSONB DEFAULT '[
        {"title": "Luxury Rentals", "desc": "Reserve designer gowns for 4 or 8 day periods with professional dry cleaning included."},
        {"title": "Exclusive Sales", "desc": "Selected archived gowns and brand-new boutique pieces available for permanent purchase."},
        {"title": "Private Atelier Styling", "desc": "One-on-one virtual or in-person styling consultations with personalized fit assessments."}
    ]'::jsonb,
    sections_config JSONB DEFAULT '{
        "hero": true,
        "announcement": true,
        "featured": true,
        "about": true,
        "categories": true,
        "services": true,
        "contact": true
    }'::jsonb,
    footer_text TEXT DEFAULT '© 2026 Get Dress''d by Rissée. All rights reserved. Designed for elegance and sustainable luxury fashion.',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACTIVITY_HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.activity_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT DEFAULT '',
    description TEXT NOT NULL,
    user_responsible TEXT NOT NULL DEFAULT 'Owner Rissée',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_action ON public.activity_history(action);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON public.activity_history(entity_type);

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dress_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_history ENABLE ROW LEVEL SECURITY;

-- Public READ policies:
CREATE POLICY "Allow public read published dresses" ON public.dresses
    FOR SELECT USING (published = true AND archived = false);

CREATE POLICY "Allow public read active categories" ON public.categories
    FOR SELECT USING (archived = false);

CREATE POLICY "Allow public read dress images" ON public.dress_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.dresses 
            WHERE public.dresses.id = public.dress_images.dress_id 
            AND public.dresses.published = true 
            AND public.dresses.archived = false
        )
    );

CREATE POLICY "Allow public read website settings" ON public.website_settings
    FOR SELECT USING (true);

-- Public CREATE policy for inquiries:
CREATE POLICY "Allow public insert inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (true);

-- Authenticated ADMIN policies (full CRUD for authenticated users):
CREATE POLICY "Admin full access categories" ON public.categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access dresses" ON public.dresses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access dress_images" ON public.dress_images
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access inquiries" ON public.inquiries
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access website_settings" ON public.website_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access activity_history" ON public.activity_history
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. SUPABASE STORAGE BUCKET SETUP
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dress-images', 'dress-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public view dress images" ON storage.objects
    FOR SELECT USING (bucket_id = 'dress-images');

CREATE POLICY "Allow admin upload dress images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'dress-images');

CREATE POLICY "Allow admin update dress images" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'dress-images');

CREATE POLICY "Allow admin delete dress images" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'dress-images');
