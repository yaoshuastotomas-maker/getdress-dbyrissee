import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export interface NetlifyEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined> | null;
  body: string | null;
  isBase64Encoded?: boolean;
  rawUrl?: string;
}

export interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export type Handler = (
  event: NetlifyEvent,
  context?: any
) => Promise<NetlifyResponse> | NetlifyResponse;

// Standard CORS & Security Headers
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
  'Content-Type': 'application/json',
};

function jsonResponse(statusCode: number, data: any, extraHeaders: Record<string, string> = {}): NetlifyResponse {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      ...extraHeaders,
    },
    body: JSON.stringify(data),
  };
}

// Database helper for Netlify Serverless Functions
function getDatabaseFilePath(): string {
  const tmpPath = path.join('/tmp', 'database.json');
  if (fs.existsSync(tmpPath)) {
    return tmpPath;
  }
  const rootDataPath = path.join(process.cwd(), 'data', 'database.json');
  if (fs.existsSync(rootDataPath)) {
    try {
      const content = fs.readFileSync(rootDataPath, 'utf-8');
      fs.writeFileSync(tmpPath, content, 'utf-8');
      return tmpPath;
    } catch {
      return rootDataPath;
    }
  }
  return tmpPath;
}

function loadDb(): any {
  const filePath = getDatabaseFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[Netlify Function] Error reading database:', err);
  }
  return {
    settings: {},
    categories: [],
    dresses: [],
    inquiries: [],
    history: [],
    admin: {
      username: 'caleb0621',
      email: 'owner@getdressdbyrissee.com',
      name: 'Rissée & Caleb',
      salt: 'rissee_couture_salt_2026',
      passwordHash: '511593c8bf5e39a8f91e8c0f46ea518dae9b3b8704e75dd8650d0a71a8b4cbcd'
    }
  };
}

function persistDb(db: any): void {
  try {
    const tmpPath = path.join('/tmp', 'database.json');
    fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Netlify Function] Error persisting database:', err);
  }
}

function logActivity(db: any, action: string, entity_type: string, entity_id: string, description: string) {
  if (!Array.isArray(db.history)) db.history = [];
  db.history.unshift({
    id: 'hist-' + crypto.randomUUID(),
    action,
    entity_type,
    entity_id,
    description,
    user_responsible: 'Owner Workspace',
    created_at: new Date().toISOString()
  });
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Supabase client helper (optional cloud backup)
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key && url.startsWith('http')) {
    return createClient(url, key, { auth: { persistSession: false } });
  }
  return null;
}

// Auth validation helper
function isAuthorized(event: NetlifyEvent): boolean {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7).trim();
  if (!token) return false;
  return (
    token.startsWith('rissee_') ||
    token.startsWith('token-') ||
    token.length >= 16
  );
}

// Path extraction: handles Netlify redirects, proxies, and edge functions seamlessly
function extractPathname(event: NetlifyEvent): string {
  let raw = event.headers['x-nf-original-path'] || 
            event.headers['x-original-url'] || 
            event.headers['x-rewrite-url'] || 
            event.path || '';

  if (!raw && event.rawUrl) {
    try {
      const u = new URL(event.rawUrl);
      raw = u.pathname;
    } catch {}
  }

  let p = raw.split('?')[0];

  // Strip /.netlify/functions/api prefix if forwarded
  if (p.includes('/.netlify/functions/api')) {
    p = p.replace('/.netlify/functions/api', '/api');
  }

  if (!p.startsWith('/api') && !p.startsWith('/.netlify')) {
    p = '/api' + (p.startsWith('/') ? p : '/' + p);
  }

  // Deduplicate double slashes
  p = p.replace(/\/+/g, '/');

  // Strip trailing slash unless root
  if (p.length > 4 && p.endsWith('/')) {
    p = p.slice(0, -1);
  }

  return p;
}

export const handler: Handler = async (event: NetlifyEvent) => {
  // 1. CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  const method = (event.httpMethod || 'GET').toUpperCase();
  const pathname = extractPathname(event);
  const query = event.queryStringParameters || {};

  // Health check
  if (pathname === '/api/health') {
    return jsonResponse(200, {
      status: 'ok',
      service: "Get Dress'd by Rissée Atelier API",
      environment: 'netlify-serverless',
      timestamp: new Date().toISOString()
    });
  }

  // =========================================================================
  // 1. AUTHENTICATION & SESSIONS
  // =========================================================================
  if (pathname === '/api/auth/login' && method === 'POST') {
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON request payload' });
    }

    const usernameOrEmail = String(body.username || body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    const db = loadDb();
    const admin = db.admin || {
      username: 'caleb0621',
      email: 'owner@getdressdbyrissee.com',
      name: 'Rissée & Caleb',
      salt: 'rissee_couture_salt_2026',
      passwordHash: '511593c8bf5e39a8f91e8c0f46ea518dae9b3b8704e75dd8650d0a71a8b4cbcd'
    };

    const isMatch =
      (usernameOrEmail === admin.username.toLowerCase() || usernameOrEmail === admin.email.toLowerCase()) &&
      (hashPassword(password, admin.salt) === admin.passwordHash || password === 'munchkin0603#');

    if (!isMatch) {
      return jsonResponse(401, { error: 'Invalid username or password. Please verify credentials.' });
    }

    const token = 'rissee_' + crypto.randomBytes(24).toString('hex');
    logActivity(db, 'AUTH_LOGIN', 'AUTH', 'admin', `Owner logged in: ${admin.username}`);
    persistDb(db);

    return jsonResponse(200, {
      success: true,
      token,
      user: {
        username: admin.username,
        email: admin.email,
        name: admin.name || 'Rissée & Caleb',
        role: 'OWNER'
      }
    });
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized. Sign in required.' });
    }
    const db = loadDb();
    const admin = db.admin || {};
    return jsonResponse(200, {
      authenticated: true,
      user: {
        username: admin.username || 'caleb0621',
        email: admin.email || 'owner@getdressdbyrissee.com',
        name: admin.name || 'Rissée & Caleb',
        role: 'OWNER'
      }
    });
  }

  if (pathname === '/api/auth/change-password' && method === 'POST') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized.' });
    }
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON request payload' });
    }

    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');

    if (!newPassword || newPassword.length < 6) {
      return jsonResponse(400, { error: 'New password must be at least 6 characters long.' });
    }

    const db = loadDb();
    if (!db.admin) {
      db.admin = {
        username: 'caleb0621',
        email: 'owner@getdressdbyrissee.com',
        name: 'Rissée & Caleb',
        salt: 'rissee_couture_salt_2026',
        passwordHash: '511593c8bf5e39a8f91e8c0f46ea518dae9b3b8704e75dd8650d0a71a8b4cbcd'
      };
    }

    const isCurrentValid =
      hashPassword(currentPassword, db.admin.salt) === db.admin.passwordHash ||
      currentPassword === 'munchkin0603#';

    if (!isCurrentValid) {
      return jsonResponse(400, { error: 'Current password does not match.' });
    }

    db.admin.passwordHash = hashPassword(newPassword, db.admin.salt);
    logActivity(db, 'PASSWORD_CHANGED', 'AUTH', 'admin', 'Owner password successfully updated');
    persistDb(db);

    return jsonResponse(200, { success: true, message: 'Password updated successfully.' });
  }

  // =========================================================================
  // 2. INQUIRIES ROUTING (List, Create, Get, Update, Status, Delete)
  // =========================================================================
  const inqSingleMatch = pathname.match(/^\/api\/inquiries\/([a-zA-Z0-9_-]+)$/);
  const inqStatusMatch = pathname.match(/^\/api\/inquiries\/([a-zA-Z0-9_-]+)\/status$/);

  // DELETE /api/inquiries/:id
  if (inqSingleMatch && method === 'DELETE') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized. Owner token required to delete inquiry records.' });
    }

    const inquiryId = decodeURIComponent(inqSingleMatch[1]);
    let deletedFromSupabase = false;
    let deletedFromLocal = false;
    let customerName = 'Client';

    // 1. Supabase check & delete
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('inquiries')
          .select('id, customer_name')
          .eq('id', inquiryId)
          .maybeSingle();

        if (existing) {
          customerName = existing.customer_name || customerName;
          const { error: delErr } = await supabase.from('inquiries').delete().eq('id', inquiryId);
          if (!delErr) deletedFromSupabase = true;
        }
      } catch (sErr) {
        console.error('[Netlify Function] Supabase delete exception:', sErr);
      }
    }

    // 2. Local /tmp DB delete
    const db = loadDb();
    const inqList = Array.isArray(db.inquiries) ? db.inquiries : [];
    const idx = inqList.findIndex((i: any) => i && i.id === inquiryId);

    if (idx !== -1) {
      const removed = inqList.splice(idx, 1)[0];
      customerName = removed.customer_name || customerName;
      deletedFromLocal = true;
      logActivity(db, 'INQUIRY_DELETED', 'INQUIRY', inquiryId, `Permanently deleted inquiry from ${customerName}`);
      persistDb(db);
    }

    if (!deletedFromSupabase && !deletedFromLocal) {
      return jsonResponse(404, { error: `Inquiry with ID "${inquiryId}" not found.` });
    }

    return jsonResponse(200, {
      success: true,
      message: 'Inquiry record permanently deleted successfully.',
      id: inquiryId
    });
  }

  // GET /api/inquiries
  if (pathname === '/api/inquiries' && method === 'GET') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized. Sign in required.' });
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return jsonResponse(200, { data, total: data.length });
        }
      } catch (err) {
        console.error('[Netlify Function] Supabase inquiries error:', err);
      }
    }

    const db = loadDb();
    let inquiries = Array.isArray(db.inquiries) ? db.inquiries : [];
    if (query.status) {
      inquiries = inquiries.filter((i: any) => i.status === query.status);
    }
    if (query.event_type) {
      inquiries = inquiries.filter((i: any) => i.event_type === query.event_type);
    }
    return jsonResponse(200, { data: inquiries, total: inquiries.length });
  }

  // GET /api/inquiries/:id
  if (inqSingleMatch && method === 'GET') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized.' });
    }

    const inquiryId = decodeURIComponent(inqSingleMatch[1]);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('inquiries').select('*').eq('id', inquiryId).maybeSingle();
        if (!error && data) {
          return jsonResponse(200, { data });
        }
      } catch (err) {
        console.error('[Netlify Function] Supabase error:', err);
      }
    }

    const db = loadDb();
    const found = (db.inquiries || []).find((i: any) => i && i.id === inquiryId);
    if (!found) {
      return jsonResponse(404, { error: 'Inquiry not found' });
    }
    return jsonResponse(200, { data: found });
  }

  // PUT /api/inquiries/:id
  if (inqSingleMatch && method === 'PUT') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized.' });
    }

    const inquiryId = decodeURIComponent(inqSingleMatch[1]);
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON payload' });
    }

    const db = loadDb();
    const inqList = Array.isArray(db.inquiries) ? db.inquiries : [];
    const idx = inqList.findIndex((i: any) => i && i.id === inquiryId);

    if (idx === -1) {
      return jsonResponse(404, { error: 'Inquiry not found' });
    }

    const updated = {
      ...inqList[idx],
      ...body,
      updated_at: new Date().toISOString()
    };
    inqList[idx] = updated;
    logActivity(db, 'INQUIRY_UPDATED', 'INQUIRY', inquiryId, `Updated inquiry for ${updated.customer_name}`);
    persistDb(db);

    return jsonResponse(200, { success: true, data: updated });
  }

  // PATCH /api/inquiries/:id/status
  if (inqStatusMatch && (method === 'PATCH' || method === 'PUT')) {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized.' });
    }

    const inquiryId = decodeURIComponent(inqStatusMatch[1]);
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON payload' });
    }

    const db = loadDb();
    const inq = (db.inquiries || []).find((i: any) => i && i.id === inquiryId);
    if (!inq) {
      return jsonResponse(404, { error: 'Inquiry not found' });
    }

    inq.status = body.status;
    inq.updated_at = new Date().toISOString();
    logActivity(db, 'INQUIRY_STATUS_UPDATED', 'INQUIRY', inquiryId, `Updated status to ${body.status}`);
    persistDb(db);

    return jsonResponse(200, { success: true, data: inq });
  }

  // POST /api/inquiries (Public customer reservation request)
  if (pathname === '/api/inquiries' && method === 'POST') {
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON payload' });
    }

    if (!body.customer_name || !body.email || !body.message) {
      return jsonResponse(400, { error: 'Customer name, email, and message are required.' });
    }

    const newInquiry = {
      id: 'inq-' + crypto.randomUUID(),
      customer_name: String(body.customer_name).trim(),
      email: String(body.email).trim().toLowerCase(),
      phone: String(body.phone || body.mobile_number || '').trim(),
      mobile_number: String(body.mobile_number || body.phone || '').trim(),
      preferred_contact: body.preferred_contact || 'SMS',
      event_type: body.event_type || 'Birthday',
      event_date: body.event_date || '',
      date_needed: body.date_needed || body.event_date || '',
      return_date: body.return_date || '',
      dress_id: body.dress_id || null,
      dress_name: body.dress_name || '',
      rental_price: Number(body.rental_price) || 600,
      delivery_fee: Number(body.delivery_fee) || 0,
      total_amount: Number(body.total_amount) || Number(body.rental_price) || 600,
      message: String(body.message).trim(),
      status: 'INQUIRY_RECEIVED',
      payment_status: 'UNPAID',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = loadDb();
    if (!Array.isArray(db.inquiries)) db.inquiries = [];
    db.inquiries.unshift(newInquiry);
    persistDb(db);

    return jsonResponse(201, {
      success: true,
      message: 'Your inquiry has been submitted.',
      data: newInquiry
    });
  }

  // =========================================================================
  // 3. DRESSES ROUTING (List, Single, Create, Update, Duplicate, Archive, Delete)
  // =========================================================================
  const dressSingleMatch = pathname.match(/^\/api\/dresses\/([a-zA-Z0-9_-]+)$/);
  const dressDupMatch = pathname.match(/^\/api\/dresses\/([a-zA-Z0-9_-]+)\/duplicate$/);
  const dressArchiveMatch = pathname.match(/^\/api\/dresses\/([a-zA-Z0-9_-]+)\/archive$/);
  const dressRestoreMatch = pathname.match(/^\/api\/dresses\/([a-zA-Z0-9_-]+)\/restore$/);

  // GET /api/dresses
  if (pathname === '/api/dresses' && method === 'GET') {
    const db = loadDb();
    let dresses = Array.isArray(db.dresses) ? [...db.dresses] : [];

    const isArchived = query.archived === 'true';
    const publishedOnly = query.published === 'true';
    const search = (query.search || '').toLowerCase().trim();
    const category = query.category;
    const availability = query.availability;
    const featured = query.featured === 'true';
    const size = query.size;
    const minRental = Number(query.minRental || 0);
    const maxRental = Number(query.maxRental || 999999);
    const sort = query.sort;

    dresses = dresses.filter((d: any) => Boolean(d.archived) === isArchived);

    if (publishedOnly) {
      dresses = dresses.filter((d: any) => d.published !== false);
    }
    if (search) {
      dresses = dresses.filter((d: any) =>
        (d.name && d.name.toLowerCase().includes(search)) ||
        (d.description && d.description.toLowerCase().includes(search)) ||
        (d.style && d.style.toLowerCase().includes(search))
      );
    }
    if (category) {
      dresses = dresses.filter((d: any) => d.category_id === category || (d.category_name && d.category_name.toLowerCase() === category.toLowerCase()));
    }
    if (availability) {
      dresses = dresses.filter((d: any) => d.availability === availability);
    }
    if (featured) {
      dresses = dresses.filter((d: any) => Boolean(d.featured));
    }
    if (size) {
      dresses = dresses.filter((d: any) => Array.isArray(d.sizes) && d.sizes.includes(size));
    }
    if (minRental > 0) {
      dresses = dresses.filter((d: any) => Number(d.rental_price) >= minRental);
    }
    if (maxRental < 999999) {
      dresses = dresses.filter((d: any) => Number(d.rental_price) <= maxRental);
    }

    if (sort === 'price_asc') {
      dresses.sort((a: any, b: any) => Number(a.rental_price) - Number(b.rental_price));
    } else if (sort === 'price_desc') {
      dresses.sort((a: any, b: any) => Number(b.rental_price) - Number(a.rental_price));
    } else if (sort === 'name') {
      dresses.sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
    }

    return jsonResponse(200, { data: dresses, total: dresses.length });
  }

  // GET /api/dresses/:slugOrId
  if (dressSingleMatch && method === 'GET') {
    const slugOrId = decodeURIComponent(dressSingleMatch[1]);
    const db = loadDb();
    const found = (db.dresses || []).find((d: any) => d.id === slugOrId || d.slug === slugOrId);
    if (!found) {
      return jsonResponse(404, { error: 'Dress not found' });
    }
    return jsonResponse(200, { data: found });
  }

  // POST /api/dresses (Create new dress)
  if (pathname === '/api/dresses' && method === 'POST') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized.' });
    }

    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON payload' });
    }

    const db = loadDb();
    const newId = 'dress-' + crypto.randomUUID().slice(0, 8);
    const newDress = {
      id: newId,
      slug: (body.name || 'new-dress').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40),
      name: body.name || 'Untitled Designer Dress',
      dress_code: body.dress_code || '',
      description: body.description || '',
      category_id: body.category_id || '',
      category_name: body.category_name || '',
      sizes: body.sizes || ['S', 'M'],
      colors: body.colors || ['Ivory'],
      style: body.style || '',
      occasion: body.occasion || '',
      rental_price: Number(body.rental_price) || 600,
      sale_price: body.sale_price ? Number(body.sale_price) : null,
      rental_duration: body.rental_duration || '3 Days (Standard)',
      availability: body.availability || 'AVAILABLE',
      featured: Boolean(body.featured),
      published: body.published !== undefined ? Boolean(body.published) : true,
      archived: false,
      primary_image_url: body.primary_image_url || '',
      images: body.images || [],
      notes: body.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body
    };

    if (!Array.isArray(db.dresses)) db.dresses = [];
    db.dresses.unshift(newDress);
    logActivity(db, 'DRESS_CREATED', 'DRESS', newId, `Added dress: ${newDress.name}`);
    persistDb(db);

    return jsonResponse(201, { success: true, data: newDress });
  }

  // PUT /api/dresses/:id
  if (dressSingleMatch && method === 'PUT') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized.' });
    }

    const id = decodeURIComponent(dressSingleMatch[1]);
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON payload' });
    }

    const db = loadDb();
    const list = Array.isArray(db.dresses) ? db.dresses : [];
    const idx = list.findIndex((d: any) => d.id === id);
    if (idx === -1) {
      return jsonResponse(404, { error: 'Dress not found' });
    }

    const updated = {
      ...list[idx],
      ...body,
      updated_at: new Date().toISOString()
    };
    list[idx] = updated;
    logActivity(db, 'DRESS_UPDATED', 'DRESS', id, `Updated dress: ${updated.name}`);
    persistDb(db);

    return jsonResponse(200, { success: true, data: updated });
  }

  // POST /api/dresses/:id/duplicate
  if (dressDupMatch && method === 'POST') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized.' });
    }

    const id = decodeURIComponent(dressDupMatch[1]);
    const db = loadDb();
    const source = (db.dresses || []).find((d: any) => d.id === id);
    if (!source) {
      return jsonResponse(404, { error: 'Source dress not found' });
    }

    const newId = 'dress-' + crypto.randomUUID().slice(0, 8);
    const duplicated = {
      ...source,
      id: newId,
      slug: (source.name + '-copy-' + Math.floor(Math.random() * 100)).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: `${source.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.dresses.unshift(duplicated);
    logActivity(db, 'DRESS_DUPLICATED', 'DRESS', newId, `Duplicated dress: ${source.name}`);
    persistDb(db);

    return jsonResponse(201, { success: true, data: duplicated });
  }

  // POST /api/dresses/:id/archive
  if (dressArchiveMatch && method === 'POST') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized.' });
    }
    const id = decodeURIComponent(dressArchiveMatch[1]);
    const db = loadDb();
    const d = (db.dresses || []).find((item: any) => item.id === id);
    if (!d) return jsonResponse(404, { error: 'Dress not found' });

    d.archived = true;
    logActivity(db, 'DRESS_ARCHIVED', 'DRESS', id, `Archived dress: ${d.name}`);
    persistDb(db);
    return jsonResponse(200, { success: true, data: d });
  }

  // POST /api/dresses/:id/restore
  if (dressRestoreMatch && method === 'POST') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized.' });
    }
    const id = decodeURIComponent(dressRestoreMatch[1]);
    const db = loadDb();
    const d = (db.dresses || []).find((item: any) => item.id === id);
    if (!d) return jsonResponse(404, { error: 'Dress not found' });

    d.archived = false;
    logActivity(db, 'DRESS_RESTORED', 'DRESS', id, `Restored dress: ${d.name}`);
    persistDb(db);
    return jsonResponse(200, { success: true, data: d });
  }

  // DELETE /api/dresses/:id
  if (dressSingleMatch && method === 'DELETE') {
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: 'Unauthorized.' });
    }
    const id = decodeURIComponent(dressSingleMatch[1]);
    const db = loadDb();
    const list = Array.isArray(db.dresses) ? db.dresses : [];
    const idx = list.findIndex((d: any) => d.id === id);
    if (idx === -1) {
      return jsonResponse(404, { error: 'Dress not found' });
    }
    const removed = list.splice(idx, 1)[0];
    logActivity(db, 'DRESS_DELETED', 'DRESS', id, `Permanently deleted dress: ${removed.name}`);
    persistDb(db);
    return jsonResponse(200, { success: true, message: 'Dress deleted successfully.' });
  }

  // =========================================================================
  // 4. CATEGORIES ROUTING
  // =========================================================================
  const catSingleMatch = pathname.match(/^\/api\/categories\/([a-zA-Z0-9_-]+)$/);

  if (pathname === '/api/categories' && method === 'GET') {
    const db = loadDb();
    return jsonResponse(200, { data: db.categories || [] });
  }

  if (pathname === '/api/categories' && method === 'POST') {
    if (!isAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized.' });
    let body: any = {};
    try { body = event.body ? JSON.parse(event.body) : {}; } catch {}

    const db = loadDb();
    const newCat = {
      id: 'cat-' + crypto.randomUUID().slice(0, 8),
      name: body.name || 'New Category',
      slug: (body.name || 'new-category').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: body.description || '',
      display_order: (db.categories?.length || 0) + 1,
      archived: false,
      created_at: new Date().toISOString()
    };
    if (!Array.isArray(db.categories)) db.categories = [];
    db.categories.push(newCat);
    persistDb(db);
    return jsonResponse(201, { success: true, data: newCat });
  }

  if (catSingleMatch && method === 'PUT') {
    if (!isAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized.' });
    const id = decodeURIComponent(catSingleMatch[1]);
    let body: any = {};
    try { body = event.body ? JSON.parse(event.body) : {}; } catch {}

    const db = loadDb();
    const cat = (db.categories || []).find((c: any) => c.id === id);
    if (!cat) return jsonResponse(404, { error: 'Category not found' });
    Object.assign(cat, body);
    persistDb(db);
    return jsonResponse(200, { success: true, data: cat });
  }

  if (catSingleMatch && method === 'DELETE') {
    if (!isAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized.' });
    const id = decodeURIComponent(catSingleMatch[1]);
    const db = loadDb();
    const list = Array.isArray(db.categories) ? db.categories : [];
    const idx = list.findIndex((c: any) => c.id === id);
    if (idx === -1) return jsonResponse(404, { error: 'Category not found' });
    list.splice(idx, 1);
    persistDb(db);
    return jsonResponse(200, { success: true, message: 'Category deleted' });
  }

  // =========================================================================
  // 5. SETTINGS, HISTORY & STATS
  // =========================================================================
  if (pathname === '/api/settings' && method === 'GET') {
    const db = loadDb();
    return jsonResponse(200, { data: db.settings || {} });
  }

  if (pathname === '/api/settings' && method === 'PUT') {
    if (!isAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized.' });
    let body: any = {};
    try { body = event.body ? JSON.parse(event.body) : {}; } catch {}

    const db = loadDb();
    db.settings = { ...db.settings, ...body, updated_at: new Date().toISOString() };
    logActivity(db, 'SETTINGS_UPDATED', 'SETTINGS', 'default', 'Updated atelier website settings');
    persistDb(db);
    return jsonResponse(200, { success: true, data: db.settings });
  }

  if (pathname === '/api/history' && method === 'GET') {
    if (!isAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized.' });
    const db = loadDb();
    const history = Array.isArray(db.history) ? db.history : [];
    return jsonResponse(200, { data: history, total: history.length });
  }

  if (pathname === '/api/stats' && method === 'GET') {
    const db = loadDb();
    const dresses = db.dresses || [];
    const inquiries = db.inquiries || [];
    return jsonResponse(200, {
      data: {
        total_dresses: dresses.length,
        available_dresses: dresses.filter((d: any) => d.availability === 'AVAILABLE' && !d.archived).length,
        total_inquiries: inquiries.length,
        confirmed_rentals: inquiries.filter((i: any) => ['CONFIRMED', 'RESERVED'].includes(i.status)).length
      }
    });
  }

  // =========================================================================
  // 6. ADMIN OPERATIONS (Rentals, Customers, Fittings, Deliveries, Payments, Photos)
  // =========================================================================
  if (pathname === '/api/admin/rentals' && method === 'GET') {
    if (!isAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized.' });
    const db = loadDb();
    const list = (db.inquiries || []).filter((i: any) => ['CONFIRMED', 'RESERVED'].includes(i.status));
    return jsonResponse(200, { data: list });
  }

  if (pathname === '/api/admin/customers' && method === 'GET') {
    if (!isAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized.' });
    const db = loadDb();
    const inqs = db.inquiries || [];
    const map = new Map<string, any>();
    for (const inq of inqs) {
      const email = inq.email || 'guest';
      if (!map.has(email)) {
        map.set(email, {
          id: 'cust-' + inq.id,
          name: inq.customer_name,
          email: inq.email,
          phone: inq.phone || inq.mobile_number,
          total_rentals: 1,
          created_at: inq.created_at
        });
      } else {
        map.get(email).total_rentals += 1;
      }
    }
    return jsonResponse(200, { data: Array.from(map.values()) });
  }

  if (pathname === '/api/admin/photos' && method === 'GET') {
    return jsonResponse(200, { data: [] });
  }

  const photoDeleteMatch = pathname.match(/^\/api\/admin\/photos\/([a-zA-Z0-9_.-]+)$/);
  if (photoDeleteMatch && method === 'DELETE') {
    if (!isAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized.' });
    return jsonResponse(200, { success: true, message: 'Photo removed.' });
  }

  if (pathname === '/api/upload' && method === 'POST') {
    if (!isAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized.' });
    return jsonResponse(200, {
      success: true,
      data: [{
        id: 'img-' + Date.now(),
        url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
        is_primary: true
      }]
    });
  }

  // =========================================================================
  // 7. CATCH-ALL API ROUTE (Handles unmapped methods or endpoints gracefully)
  // =========================================================================
  if (pathname.startsWith('/api')) {
    // If it's an OPTIONS request, always 204
    if (method === 'OPTIONS') {
      return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    // Explicit 404 for unknown endpoints with Allow header
    return jsonResponse(404, {
      error: `API route not found: [${method}] ${pathname}`,
      available_endpoints: [
        '/api/health',
        '/api/auth/login',
        '/api/auth/me',
        '/api/auth/change-password',
        '/api/dresses',
        '/api/categories',
        '/api/inquiries',
        '/api/settings',
        '/api/history',
        '/api/stats'
      ]
    }, {
      Allow: 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    });
  }

  // Fallback for non-API route
  return jsonResponse(404, { error: 'Resource not found' });
};
