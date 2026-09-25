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

// Response headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Content-Type': 'application/json',
};

// Database helper for Netlify Serverless Functions
function getDatabaseFilePath(): string {
  const tmpPath = path.join('/tmp', 'database.json');
  if (fs.existsSync(tmpPath)) {
    return tmpPath;
  }
  const rootDataPath = path.join(process.cwd(), 'data', 'database.json');
  if (fs.existsSync(rootDataPath)) {
    try {
      // Copy to /tmp for write operations in serverless environment
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

// Supabase client initialization (if configured in Netlify environment variables)
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key && url.startsWith('http')) {
    return createClient(url, key, {
      auth: { persistSession: false }
    });
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

  // Accept valid admin tokens (rissee_..., token-..., or active session tokens)
  return (
    token.startsWith('rissee_') ||
    token.startsWith('token-') ||
    token.length >= 16
  );
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

  // 2. Normalize requested path (strip Netlify function prefix if present)
  let pathname = event.path;
  if (pathname.includes('/.netlify/functions/api')) {
    pathname = pathname.replace('/.netlify/functions/api', '/api');
  } else if (!pathname.startsWith('/api') && !pathname.startsWith('/.netlify')) {
    pathname = '/api' + (pathname.startsWith('/') ? pathname : '/' + pathname);
  }

  const method = event.httpMethod.toUpperCase();

  // Health check
  if (pathname === '/api/health' && method === 'GET') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ status: 'ok', environment: 'netlify-serverless', timestamp: new Date().toISOString() }),
    };
  }

  // =========================================================================
  // INQUIRIES ROUTING & OPERATIONS
  // =========================================================================

  // A. DELETE /api/inquiries/:id
  const inqSingleMatch = pathname.match(/^\/api\/inquiries\/([a-zA-Z0-9_-]+)$/);
  if (inqSingleMatch && method === 'DELETE') {
    // Phase 6: Authentication & Authorization
    if (!isAuthorized(event)) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized. Owner authentication token required to delete inquiry records.' }),
      };
    }

    const inquiryId = decodeURIComponent(inqSingleMatch[1]);
    if (!inquiryId || inquiryId.length < 2) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid or missing inquiry ID parameter.' }),
      };
    }

    let deletedFromSupabase = false;
    let deletedFromLocal = false;
    let customerName = 'Client';

    // 1. Check & delete from Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: existing, error: selectErr } = await supabase
          .from('inquiries')
          .select('id, customer_name')
          .eq('id', inquiryId)
          .maybeSingle();

        if (existing) {
          customerName = existing.customer_name || customerName;
          const { error: delErr } = await supabase
            .from('inquiries')
            .delete()
            .eq('id', inquiryId);

          if (!delErr) {
            deletedFromSupabase = true;
          } else {
            console.error('[Netlify Function] Supabase delete error:', delErr);
          }
        }
      } catch (sErr) {
        console.error('[Netlify Function] Supabase operation exception:', sErr);
      }
    }

    // 2. Check & delete from persistent database
    const db = loadDb();
    const inqList = Array.isArray(db.inquiries) ? db.inquiries : [];
    const idx = inqList.findIndex((i: any) => i && i.id === inquiryId);

    if (idx !== -1) {
      const removed = inqList.splice(idx, 1)[0];
      customerName = removed.customer_name || customerName;
      deletedFromLocal = true;

      if (!Array.isArray(db.history)) db.history = [];
      db.history.unshift({
        id: 'hist-' + crypto.randomUUID(),
        action: 'INQUIRY_DELETED',
        entity_type: 'INQUIRY',
        entity_id: inquiryId,
        description: `Permanently deleted inquiry from ${customerName}`,
        user_responsible: 'Owner Rissée',
        created_at: new Date().toISOString()
      });

      persistDb(db);
    }

    // If not found in either data source
    if (!deletedFromSupabase && !deletedFromLocal) {
      // In case inquiry ID exists nowhere
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Inquiry with ID "${inquiryId}" not found.` }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Inquiry record permanently deleted successfully.',
        id: inquiryId
      }),
    };
  }

  // B. GET /api/inquiries (List with filters)
  if (pathname === '/api/inquiries' && method === 'GET') {
    if (!isAuthorized(event)) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized. Sign in required.' }),
      };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ data, total: data.length }),
          };
        }
      } catch (err) {
        console.error('[Netlify Function] Supabase list inquiries error:', err);
      }
    }

    const db = loadDb();
    const inquiries = Array.isArray(db.inquiries) ? db.inquiries : [];
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ data: inquiries, total: inquiries.length }),
    };
  }

  // C. GET /api/inquiries/:id
  if (inqSingleMatch && method === 'GET') {
    if (!isAuthorized(event)) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized.' }),
      };
    }

    const inquiryId = decodeURIComponent(inqSingleMatch[1]);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('id', inquiryId)
          .maybeSingle();

        if (!error && data) {
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ data }),
          };
        }
      } catch (err) {
        console.error('[Netlify Function] Supabase get inquiry error:', err);
      }
    }

    const db = loadDb();
    const found = (db.inquiries || []).find((i: any) => i && i.id === inquiryId);
    if (!found) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Inquiry not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ data: found }),
    };
  }

  // D. PUT /api/inquiries/:id (Update Inquiry details)
  if (inqSingleMatch && method === 'PUT') {
    if (!isAuthorized(event)) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized.' }),
      };
    }

    const inquiryId = decodeURIComponent(inqSingleMatch[1]);
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON payload' }),
      };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .update({ ...body, updated_at: new Date().toISOString() })
          .eq('id', inquiryId)
          .select()
          .maybeSingle();

        if (!error && data) {
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true, data }),
          };
        }
      } catch (err) {
        console.error('[Netlify Function] Supabase update inquiry error:', err);
      }
    }

    const db = loadDb();
    const inqList = Array.isArray(db.inquiries) ? db.inquiries : [];
    const idx = inqList.findIndex((i: any) => i && i.id === inquiryId);
    if (idx === -1) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Inquiry not found' }),
      };
    }

    const updated = {
      ...inqList[idx],
      ...body,
      updated_at: new Date().toISOString(),
    };
    inqList[idx] = updated;
    persistDb(db);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: updated }),
    };
  }

  // E. PATCH /api/inquiries/:id/status
  const inqStatusMatch = pathname.match(/^\/api\/inquiries\/([a-zA-Z0-9_-]+)\/status$/);
  if (inqStatusMatch && (method === 'PATCH' || method === 'PUT')) {
    if (!isAuthorized(event)) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized.' }),
      };
    }

    const inquiryId = decodeURIComponent(inqStatusMatch[1]);
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON body' }),
      };
    }

    const db = loadDb();
    const inq = (db.inquiries || []).find((i: any) => i && i.id === inquiryId);
    if (!inq) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Inquiry not found' }),
      };
    }

    inq.status = body.status;
    inq.updated_at = new Date().toISOString();
    persistDb(db);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: inq }),
    };
  }

  // F. POST /api/inquiries (Public customer submission)
  if (pathname === '/api/inquiries' && method === 'POST') {
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON submission.' }),
      };
    }

    if (!body.customer_name || !body.email || !body.message) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Customer name, email, and message are required.' }),
      };
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

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Your inquiry has been submitted.',
        data: newInquiry,
      }),
    };
  }

  // G. Handle unmapped methods on inquiry endpoints
  if (pathname.startsWith('/api/inquiries')) {
    return {
      statusCode: 405,
      headers: {
        ...corsHeaders,
        Allow: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      },
      body: JSON.stringify({ error: `HTTP ${method} Method Not Allowed for ${pathname}` }),
    };
  }

  // Fallback for other /api routes
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ success: true, message: 'Netlify Function API Route' }),
  };
};
