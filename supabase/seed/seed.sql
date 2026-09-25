-- Initial Seed Data for Get Dress'd by Rissée
-- File: supabase/seed/seed.sql

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, description, archived)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Evening & Gala Gowns', 'evening-gala', 'Floor-sweeping silhouettes and opulent fabrics crafted for black-tie galas and award ceremonies.', false),
    ('c2222222-2222-2222-2222-222222222222', 'Cocktail & Party', 'cocktail-party', 'Chic midis, statement silhouettes, and refined minis for dinner parties and celebrations.', false),
    ('c3333333-3333-3333-3333-333333333333', 'Bridal & Reception', 'bridal-reception', 'Modern bridal wear, second-look reception dresses, rehearsal dinner attire, and luxury guest wear.', false),
    ('c4444444-4444-4444-4444-444444444444', 'Red Carpet & Couture', 'red-carpet-couture', 'Runway-worthy statement gowns featuring hand-beaded embroidery, satin corsetry, and dramatic trains.', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Initial Dresses
INSERT INTO public.dresses (
    id, slug, name, description, category_id, category_name, sizes, colors, 
    rental_price, sale_price, availability, featured, published, archived, notes, primary_image_url
) VALUES 
(
    'd1111111-1111-1111-1111-111111111111',
    'astoria-emerald-silk-duchess-gown',
    'The Astoria Emerald Silk Duchess Gown',
    'A breathtaking floor-length gown cut from heavyweight emerald green duchess silk. Features an architectural off-the-shoulder sculpted neckline, built-in corsetry for flawless structure, and a sweeping side slit with subtle cathedral train.',
    'c1111111-1111-1111-1111-111111111111',
    'Evening & Gala Gowns',
    ARRAY['US 2', 'US 4', 'US 6'],
    ARRAY['Emerald Green', 'Deep Forest'],
    165.00,
    890.00,
    'AVAILABLE',
    true,
    true,
    false,
    'Dry clean only. Complimentary garment bag and garment insurance included with 4-day or 8-day rental.',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80'
),
(
    'd2222222-2222-2222-2222-222222222222',
    'celeste-champagne-crystal-embellished-slip',
    'Celeste Champagne Crystal Slip Dress',
    'Luminous liquid silk charmeuse in vintage champagne hue, hand-embellished with micro-Swarovski crystals along the draped cowl neckline and low scoop back. Effortless 90s minimalism meets high glamour.',
    'c2222222-2222-2222-2222-222222222222',
    'Cocktail & Party',
    ARRAY['US 4', 'US 6'],
    ARRAY['Champagne Gold', 'Oatmeal'],
    130.00,
    640.00,
    'AVAILABLE',
    true,
    true,
    false,
    'Includes silicon nipple covers and matching silk travel pouch.',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80'
),
(
    'd3333333-3333-3333-3333-333333333333',
    'valerie-sculpted-ivory-corset-gown',
    'Valerie Sculpted Ivory Corset Gown',
    'Impeccably tailored bridal reception gown with a boned basque waistline, structured pleating across the hips, and an ethereal pearl-trimmed neckline. Perfect for the modern bride seeking runway elegance.',
    'c3333333-3333-3333-3333-333333333333',
    'Bridal & Reception',
    ARRAY['US 2', 'US 4'],
    ARRAY['Ivory', 'Soft White'],
    220.00,
    1250.00,
    'AVAILABLE',
    true,
    true,
    false,
    'Fittings available at our atelier before booking.',
    'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=80'
),
(
    'd4444444-4444-4444-4444-444444444444',
    'seraphina-noir-velvet-column-gown',
    'Seraphina Noir Velvet Column Gown',
    'Midnight black stretch velvet column dress featuring long fitted sleeves with concealed wrist zips, an alluring teardrop open back, and shoulder pads that create commanding posture.',
    'c1111111-1111-1111-1111-111111111111',
    'Evening & Gala Gowns',
    ARRAY['US 6', 'US 8', 'US 10'],
    ARRAY['Midnight Black'],
    145.00,
    720.00,
    'RESERVED',
    false,
    true,
    false,
    'Reserved for upcoming charity ball. Returns back to catalog Oct 2.',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=80'
),
(
    'd5555555-5555-5555-5555-555555555555',
    'monroe-scarlet-pleated-chiffon-cape',
    'Monroe Scarlet Pleated Chiffon Cape Gown',
    'Vibrant crimson micro-pleated gown with an integrated sweeping chiffon cape that billows with every movement. Designed with a plunging V-neckline and braided gold chain belt.',
    'c4444444-4444-4444-4444-444444444444',
    'Red Carpet & Couture',
    ARRAY['US 4', 'US 6', 'US 8'],
    ARRAY['Scarlet Red', 'Crimson'],
    195.00,
    1100.00,
    'AVAILABLE',
    true,
    true,
    false,
    'Includes matching custom garment steamer guidelines.',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80'
),
(
    'd6666666-6666-6666-6666-666666666666',
    'genevieve-lavender-tulle-ballgown',
    'Genevieve Lavender Tiered Tulle Gown',
    'A romantic confectionery of soft lavender French tulle cascades in architectural tiers down the skirt, offset by a minimalist micro-pleated corset bodice with dainty velvet ribbon straps.',
    'c4444444-4444-4444-4444-444444444444',
    'Red Carpet & Couture',
    ARRAY['US 2', 'US 4', 'US 6'],
    ARRAY['Lavender', 'Lilac Mist'],
    240.00,
    1400.00,
    'RENTED',
    false,
    true,
    false,
    'Currently rented for a film premiere.',
    'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=1000&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Dress Images
INSERT INTO public.dress_images (id, dress_id, url, sort_order, is_primary, alt_text)
VALUES
('i1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80', 0, true, 'Astoria Emerald Silk Duchess Gown front view'),
('i1111111-1111-1111-1111-111111111112', 'd1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80', 1, false, 'Astoria Silk back detail and slit'),

('i2222222-2222-2222-2222-222222222221', 'd2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80', 0, true, 'Celeste Champagne Crystal Slip Dress front'),
('i2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=1000&q=80', 1, false, 'Celeste slip movement and texture'),

('i3333333-3333-3333-3333-333333333331', 'd3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=80', 0, true, 'Valerie Sculpted Ivory Corset Gown front view'),

('i4444444-4444-4444-4444-444444444441', 'd4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=80', 0, true, 'Seraphina Noir Velvet Column Gown front view'),

('i5555555-5555-5555-5555-555555555551', 'd5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80', 0, true, 'Monroe Scarlet Pleated Chiffon Cape front view'),

('i6666666-6666-6666-6666-666666666661', 'd6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=1000&q=80', 0, true, 'Genevieve Lavender Tiered Tulle Gown full view')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Initial Activity
INSERT INTO public.activity_history (action, entity_type, entity_id, description, user_responsible)
VALUES
('SYSTEM_INITIALIZED', 'SETTINGS', 'default', 'Get Dress''d by Rissée catalog initialized with luxury collection and boutique settings.', 'Owner Rissée');
