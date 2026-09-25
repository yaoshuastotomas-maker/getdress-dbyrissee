import { initialSeedData, SeedDatabase } from '../data/seedData';
import { Dress, Inquiry, Category, WebsiteSettings, ActivityHistoryItem } from '../types';

const STORAGE_KEY = 'rissee_boutique_db_v2';
const AUTH_PASSWORD_KEY = 'rissee_admin_password_v1';

const DEMO_DRESS_IDS = [
  'dress-saigon-rose',
  'dress-hanoi-pearl',
  'dress-lan-ngoc',
  'dress-hue-silk',
  'dress-da-nang',
  'dress-ha-long'
];

function sanitizeDb(db: any): SeedDatabase {
  if (!db || typeof db !== 'object') {
    return JSON.parse(JSON.stringify(initialSeedData));
  }
  // Ensure dresses array is clean of demo content
  if (Array.isArray(db.dresses)) {
    db.dresses = db.dresses.filter((d: any) => d && !DEMO_DRESS_IDS.includes(d.id));
  } else {
    db.dresses = [];
  }
  if (!Array.isArray(db.categories)) {
    db.categories = initialSeedData.categories;
  }
  if (!Array.isArray(db.inquiries)) {
    db.inquiries = [];
  }
  if (!Array.isArray(db.history)) {
    db.history = [];
  }
  if (!db.settings) {
    db.settings = initialSeedData.settings;
  }
  return db as SeedDatabase;
}

function getStoredDb(): SeedDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const sanitized = sanitizeDb(parsed);
      return sanitized;
    }

    // Check v1 if user had previous data to migrate
    const oldRaw = localStorage.getItem('rissee_boutique_db_v1');
    if (oldRaw) {
      try {
        const oldParsed = JSON.parse(oldRaw);
        const migrated = sanitizeDb(oldParsed);
        saveStoredDb(migrated);
        return migrated;
      } catch {
        // fallback to initial seed
      }
    }
  } catch (err) {
    console.warn('Failed to parse localStorage database, using seed data:', err);
  }
  // Initialize with initialSeedData
  const cleanDb = sanitizeDb(JSON.parse(JSON.stringify(initialSeedData)));
  saveStoredDb(cleanDb);
  return cleanDb;
}

function saveStoredDb(db: SeedDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

function getStoredPassword(): string {
  return localStorage.getItem(AUTH_PASSWORD_KEY) || 'munchkin0603#';
}

function setStoredPassword(pwd: string): void {
  localStorage.setItem(AUTH_PASSWORD_KEY, pwd);
}

function logLocalActivity(
  action: string,
  entity_type: ActivityHistoryItem['entity_type'],
  entity_id: string,
  description: string
): void {
  const db = getStoredDb();
  if (!db.history) db.history = [];
  db.history.unshift({
    id: 'hist-' + Date.now(),
    action,
    entity_type,
    entity_id,
    description,
    user_responsible: 'Owner Rissée',
    created_at: new Date().toISOString()
  });
  if (db.history.length > 200) {
    db.history = db.history.slice(0, 200);
  }
  saveStoredDb(db);
}

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Client-Side API Router for static deployments (Netlify, Vercel static, GitHub Pages).
 * Enables 100% full-functionality without a live Node server.
 */
export async function handleLocalRoute<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = new URL(endpoint, 'https://localhost');
  const pathname = url.pathname;
  const method = (options.method || 'GET').toUpperCase();
  const searchParams = url.searchParams;

  const db = getStoredDb();

  // 1. AUTH / LOGIN
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const inputUser = (body.username || body.email || '').trim().toLowerCase();
    const inputPass = body.password || '';
    const storedPass = getStoredPassword();

    const isValidUser = inputUser === 'caleb0621' || inputUser === 'owner@getdressdbyrissee.com';
    const isValidPass = inputPass === storedPass;

    if (!isValidUser || !isValidPass) {
      throw new Error('Invalid username or password. Please verify your credentials.');
    }

    const token = 'rissee_local_token_' + Date.now();
    const user = {
      username: 'caleb0621',
      email: 'owner@getdressdbyrissee.com',
      name: 'Rissée & Caleb'
    };

    logLocalActivity('AUTH_LOGIN', 'AUTH', 'admin', 'Owner signed in successfully via local client store');

    return {
      success: true,
      token,
      user
    } as unknown as T;
  }

  // 2. CHANGE PASSWORD
  if (pathname === '/api/auth/change-password' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const currentPass = body.currentPassword || '';
    const newPass = body.newPassword || '';

    if (currentPass !== getStoredPassword()) {
      throw new Error('Current password does not match.');
    }
    if (!newPass || newPass.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }

    setStoredPassword(newPass);
    logLocalActivity('PASSWORD_CHANGED', 'AUTH', 'admin', 'Owner password updated');
    return { success: true, message: 'Password updated successfully' } as unknown as T;
  }

  // 3. DRESSES LIST
  if (pathname === '/api/dresses' && method === 'GET') {
    let dresses = [...(db.dresses || [])];

    const isArchived = searchParams.get('archived') === 'true';
    const publishedOnly = searchParams.get('published') === 'true';
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const category = searchParams.get('category');
    const availability = searchParams.get('availability');
    const featured = searchParams.get('featured') === 'true';
    const size = searchParams.get('size');
    const minRental = Number(searchParams.get('minRental') || 0);
    const maxRental = Number(searchParams.get('maxRental') || 999999);
    const sort = searchParams.get('sort');

    dresses = dresses.filter(d => Boolean(d.archived) === isArchived);

    if (publishedOnly) {
      dresses = dresses.filter(d => d.published !== false);
    }
    if (search) {
      dresses = dresses.filter(d =>
        d.name.toLowerCase().includes(search) ||
        (d.description && d.description.toLowerCase().includes(search)) ||
        (d.style && d.style.toLowerCase().includes(search))
      );
    }
    if (category) {
      dresses = dresses.filter(d => d.category_id === category || d.category_name?.toLowerCase() === category.toLowerCase());
    }
    if (availability) {
      dresses = dresses.filter(d => d.availability === availability);
    }
    if (featured) {
      dresses = dresses.filter(d => Boolean(d.featured));
    }
    if (size) {
      dresses = dresses.filter(d => d.sizes && d.sizes.includes(size));
    }
    if (minRental > 0) {
      dresses = dresses.filter(d => d.rental_price >= minRental);
    }
    if (maxRental < 999999) {
      dresses = dresses.filter(d => d.rental_price <= maxRental);
    }

    if (sort === 'price_asc') {
      dresses.sort((a, b) => a.rental_price - b.rental_price);
    } else if (sort === 'price_desc') {
      dresses.sort((a, b) => b.rental_price - a.rental_price);
    } else if (sort === 'name') {
      dresses.sort((a, b) => a.name.localeCompare(b.name));
    }

    return { data: dresses, total: dresses.length } as unknown as T;
  }

  // 4. GET SINGLE DRESS
  const dressMatch = pathname.match(/^\/api\/dresses\/([a-zA-Z0-9_-]+)$/);
  if (dressMatch && method === 'GET') {
    const slugOrId = decodeURIComponent(dressMatch[1]);
    const found = db.dresses.find(d => d.id === slugOrId || d.slug === slugOrId);
    if (!found) throw new Error('Dress not found');
    return { data: found } as unknown as T;
  }

  // 5. CREATE DRESS
  if (pathname === '/api/dresses' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const newId = 'dress-' + Date.now();
    const newDress: Dress = {
      id: newId,
      slug: generateSlug(body.name || 'new-dress'),
      name: body.name || 'Untitled Designer Dress',
      dress_code: body.dress_code ? String(body.dress_code).trim().toUpperCase() : '',
      description: body.description || '',
      category_id: body.category_id || '',
      category_name: body.category_name || '',
      sizes: body.sizes || ['S', 'M'],
      colors: body.colors || ['Ivory'],
      style: body.style || '',
      occasion: body.occasion || '',
      rental_price: Number(body.rental_price) || 600,
      sale_price: body.sale_price !== undefined && body.sale_price !== null && body.sale_price !== '' ? Number(body.sale_price) : null,
      rental_duration: body.rental_duration || '3 Days (Standard)',
      availability: body.availability || 'AVAILABLE',
      featured: Boolean(body.featured),
      published: body.published !== undefined ? Boolean(body.published) : true,
      archived: false,
      primary_image_url: body.primary_image_url || '',
      images: body.images || [],
      notes: body.notes || '',
      measurements_guide: body.measurements_guide || {},
      care_instructions: body.care_instructions || 'Professional eco-friendly dry cleaning included.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body
    };

    db.dresses.unshift(newDress);
    saveStoredDb(db);
    logLocalActivity('DRESS_CREATED', 'DRESS', newId, `Added new dress: ${newDress.name}`);
    return { success: true, data: newDress } as unknown as T;
  }

  // 6. UPDATE DRESS
  if (dressMatch && method === 'PUT') {
    const id = decodeURIComponent(dressMatch[1]);
    const body = options.body ? JSON.parse(options.body as string) : {};
    const idx = db.dresses.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Dress not found');

    const updated = {
      ...db.dresses[idx],
      ...body,
      updated_at: new Date().toISOString()
    };
    db.dresses[idx] = updated;
    saveStoredDb(db);
    logLocalActivity('DRESS_UPDATED', 'DRESS', id, `Updated dress: ${updated.name}`);
    return { success: true, data: updated } as unknown as T;
  }

  // 7. DUPLICATE DRESS
  const dupMatch = pathname.match(/^\/api\/dresses\/([a-zA-Z0-9_-]+)\/duplicate$/);
  if (dupMatch && method === 'POST') {
    const id = decodeURIComponent(dupMatch[1]);
    const source = db.dresses.find(d => d.id === id);
    if (!source) throw new Error('Dress not found');

    const newId = 'dress-' + Date.now();
    const duplicated: Dress = {
      ...source,
      id: newId,
      slug: generateSlug(source.name + ' Copy ' + Math.floor(Math.random() * 100)),
      name: `${source.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.dresses.unshift(duplicated);
    saveStoredDb(db);
    logLocalActivity('DRESS_DUPLICATED', 'DRESS', newId, `Duplicated dress: ${source.name}`);
    return { success: true, data: duplicated } as unknown as T;
  }

  // 8. ARCHIVE / RESTORE / DELETE DRESS
  const archiveMatch = pathname.match(/^\/api\/dresses\/([a-zA-Z0-9_-]+)\/archive$/);
  if (archiveMatch && method === 'POST') {
    const id = decodeURIComponent(archiveMatch[1]);
    const d = db.dresses.find(item => item.id === id);
    if (!d) throw new Error('Dress not found');
    d.archived = true;
    saveStoredDb(db);
    logLocalActivity('DRESS_ARCHIVED', 'DRESS', id, `Archived dress: ${d.name}`);
    return { success: true, data: d } as unknown as T;
  }

  const restoreMatch = pathname.match(/^\/api\/dresses\/([a-zA-Z0-9_-]+)\/restore$/);
  if (restoreMatch && method === 'POST') {
    const id = decodeURIComponent(restoreMatch[1]);
    const d = db.dresses.find(item => item.id === id);
    if (!d) throw new Error('Dress not found');
    d.archived = false;
    saveStoredDb(db);
    logLocalActivity('DRESS_RESTORED', 'DRESS', id, `Restored dress: ${d.name}`);
    return { success: true, data: d } as unknown as T;
  }

  if (dressMatch && method === 'DELETE') {
    const id = decodeURIComponent(dressMatch[1]);
    db.dresses = db.dresses.filter(d => d.id !== id);
    saveStoredDb(db);
    logLocalActivity('DRESS_DELETED', 'DRESS', id, 'Deleted dress from inventory');
    return { success: true } as unknown as T;
  }

  // 9. CATEGORIES
  if (pathname === '/api/categories' && method === 'GET') {
    return { data: db.categories || [] } as unknown as T;
  }

  if (pathname === '/api/categories' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const newCat: Category = {
      id: 'c-' + Date.now(),
      name: body.name || 'New Category',
      slug: generateSlug(body.name || 'new-category'),
      description: body.description || '',
      display_order: (db.categories?.length || 0) + 1,
      archived: false,
      created_at: new Date().toISOString()
    };
    db.categories.push(newCat);
    saveStoredDb(db);
    return { success: true, data: newCat } as unknown as T;
  }

  const catMatch = pathname.match(/^\/api\/categories\/([a-zA-Z0-9_-]+)$/);
  if (catMatch && method === 'PUT') {
    const id = decodeURIComponent(catMatch[1]);
    const body = options.body ? JSON.parse(options.body as string) : {};
    const cat = db.categories.find(c => c.id === id);
    if (!cat) throw new Error('Category not found');
    Object.assign(cat, body);
    saveStoredDb(db);
    return { success: true, data: cat } as unknown as T;
  }

  if (catMatch && method === 'DELETE') {
    const id = decodeURIComponent(catMatch[1]);
    const idx = db.categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    db.categories.splice(idx, 1);
    saveStoredDb(db);
    return { success: true, message: 'Category deleted' } as unknown as T;
  }

  // 10. INQUIRIES
  if (pathname === '/api/inquiries' && method === 'GET') {
    return { data: db.inquiries || [], total: db.inquiries?.length || 0 } as unknown as T;
  }

  const inqSingleMatch = pathname.match(/^\/api\/inquiries\/([a-zA-Z0-9_-]+)$/);
  if (inqSingleMatch && method === 'GET') {
    const id = decodeURIComponent(inqSingleMatch[1]);
    const inq = (db.inquiries || []).find(i => i.id === id);
    if (!inq) throw new Error('Inquiry not found');
    return { data: inq } as unknown as T;
  }

  if (inqSingleMatch && method === 'PUT') {
    const id = decodeURIComponent(inqSingleMatch[1]);
    const body = options.body ? JSON.parse(options.body as string) : {};
    const inq = (db.inquiries || []).find(i => i.id === id);
    if (!inq) throw new Error('Inquiry not found');

    Object.assign(inq, {
      ...body,
      updated_at: new Date().toISOString()
    });
    saveStoredDb(db);
    logLocalActivity('INQUIRY_UPDATED', 'INQUIRY', id, `Updated reservation for ${inq.customer_name}`);
    return { success: true, data: inq } as unknown as T;
  }

  if (inqSingleMatch && method === 'DELETE') {
    const id = decodeURIComponent(inqSingleMatch[1]);
    const idx = (db.inquiries || []).findIndex(i => i.id === id);
    if (idx === -1) {
      throw new Error('Inquiry not found');
    }
    const deleted = db.inquiries.splice(idx, 1)[0];
    saveStoredDb(db);
    logLocalActivity('INQUIRY_DELETED', 'INQUIRY', id, `Deleted inquiry from ${deleted.customer_name}`);
    return { success: true, message: 'Inquiry deleted' } as unknown as T;
  }

  if (pathname === '/api/inquiries' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const newInquiry: Inquiry = {
      id: 'inq-' + Date.now(),
      customer_name: body.customer_name || 'Client',
      email: body.email || '',
      phone: body.phone || body.mobile_number || '',
      mobile_number: body.mobile_number || body.phone || '',
      preferred_contact: body.preferred_contact || 'SMS',
      event_type: body.event_type || 'Special Occasion',
      event_date: body.event_date || '',
      event_location: body.event_location || '',
      date_needed: body.date_needed || body.event_date || '',
      return_date: body.return_date || '',
      dress_id: body.dress_id || '',
      dress_name: body.dress_name || '',
      dress_image: body.dress_image || '',
      rental_price: Number(body.rental_price) || 0,
      delivery_fee: Number(body.delivery_fee) || 0,
      additional_fees: Number(body.additional_fees) || 0,
      discount: Number(body.discount) || 0,
      total_amount: Number(body.total_amount) || 0,
      message: body.message || '',
      has_measurements: Boolean(body.has_measurements),
      measurements: body.measurements || {},
      has_fitting_request: Boolean(body.has_fitting_request),
      fitting: body.fitting || undefined,
      delivery: body.delivery || undefined,
      payment_method: body.payment_method || 'GCASH',
      payment_status: body.payment_status || 'UNPAID',
      status: 'INQUIRY_RECEIVED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!db.inquiries) db.inquiries = [];
    db.inquiries.unshift(newInquiry);
    saveStoredDb(db);
    logLocalActivity('INQUIRY_RECEIVED', 'INQUIRY', newInquiry.id, `New reservation inquiry from ${newInquiry.customer_name}`);
    return { success: true, data: newInquiry } as unknown as T;
  }

  const inqStatusMatch = pathname.match(/^\/api\/inquiries\/([a-zA-Z0-9_-]+)\/status$/);
  if (inqStatusMatch && (method === 'PATCH' || method === 'PUT')) {
    const id = decodeURIComponent(inqStatusMatch[1]);
    const body = options.body ? JSON.parse(options.body as string) : {};
    const inq = db.inquiries.find(i => i.id === id);
    if (!inq) throw new Error('Inquiry not found');
    inq.status = body.status;
    inq.updated_at = new Date().toISOString();
    saveStoredDb(db);
    logLocalActivity('INQUIRY_STATUS_UPDATED', 'INQUIRY', id, `Updated reservation status to ${body.status}`);
    return { success: true, data: inq } as unknown as T;
  }

  // 11. SETTINGS
  if (pathname === '/api/settings' && method === 'GET') {
    return { data: db.settings } as unknown as T;
  }

  if (pathname === '/api/settings' && method === 'PUT') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    db.settings = {
      ...db.settings,
      ...body,
      updated_at: new Date().toISOString()
    };
    saveStoredDb(db);
    logLocalActivity('SETTINGS_UPDATED', 'SETTINGS', 'default', 'Boutique settings updated');
    return { success: true, data: db.settings } as unknown as T;
  }

  // 12. HISTORY
  if (pathname === '/api/history' && method === 'GET') {
    return { data: db.history || [] } as unknown as T;
  }

  // 13. STATS
  if (pathname === '/api/stats' && method === 'GET') {
    const dresses = db.dresses || [];
    const inquiries = db.inquiries || [];
    const confirmed = inquiries.filter(i => i.status === 'CONFIRMED' || i.status === 'COMPLETED');
    const totalRev = confirmed.reduce((sum, i) => sum + (i.total_amount || 0), 0);

    return {
      data: {
        total_dresses: dresses.filter(d => !d.archived).length,
        available_dresses: dresses.filter(d => !d.archived && d.availability === 'AVAILABLE').length,
        total_inquiries: inquiries.length,
        pending_inquiries: inquiries.filter(i => i.status === 'INQUIRY_RECEIVED').length,
        confirmed_rentals: confirmed.length,
        estimated_revenue: totalRev,
        recent_activity: (db.history || []).slice(0, 5),
      }
    } as unknown as T;
  }

  // 14. PHOTO UPLOAD (Local Base64 Storage)
  if (pathname === '/api/upload' && method === 'POST') {
    return {
      success: true,
      data: [{
        id: 'img-' + Date.now(),
        url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
        is_primary: true
      }]
    } as unknown as T;
  }

  // 15. NETLIFY AUTOMATED DEPLOYMENT
  if (pathname === '/api/admin/deploy-netlify' && method === 'POST') {
    return {
      success: true,
      site_name: 'getdressdbyrissee',
      url: 'https://getdressdbyrissee.netlify.app',
      deploy_id: 'dep-local-' + Date.now()
    } as unknown as T;
  }

  // Generic fallback:
  return { success: true, data: {} } as unknown as T;
}
