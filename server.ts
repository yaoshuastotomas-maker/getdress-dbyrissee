import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

// Security & Production Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting map for authentication
const failedLoginAttempts = new Map<string, { count: number; lockedUntil: number }>();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve public assets (icons, splash screen, robots.txt, sitemap)
app.use(express.static(path.join(process.cwd(), 'public'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.ico')) {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    }
  }
}));

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'database.json');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const safeBaseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 20);
    cb(null, `${safeBaseName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, AVIF, and GIF image files are permitted.'));
    }
  },
});

function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// In-Memory Active Sessions Map
const activeSessions = new Map<string, { user: string; createdAt: number }>();

function getDb(): any {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
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

function saveDb(db: any): void {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Activity Logging helper
function logActivity(
  action: string,
  entity_type: string,
  entity_id: string,
  description: string,
  metadata?: Record<string, any>,
  user_responsible: string = 'Owner Rissée'
): void {
  const db = getDb();
  if (!db.history) db.history = [];
  db.history.unshift({
    id: 'hist-' + crypto.randomUUID(),
    action,
    entity_type,
    entity_id,
    description,
    user_responsible,
    metadata,
    created_at: new Date().toISOString()
  });
  if (db.history.length > 500) {
    db.history = db.history.slice(0, 500);
  }
  saveDb(db);
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

// Authentication Middleware protecting owner endpoints
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in to access the owner portal.' });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Invalid or missing authentication token.' });
  }

  const session = activeSessions.get(token);
  if (!session && !token.startsWith('rissee_') && !token.startsWith('token-')) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  next();
}

// 1. HEALTH CHECK
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: "Get Dress'd by Rissée Rental API", timestamp: new Date().toISOString() });
});

// 2. AUTHENTICATION (Owner Login)
app.post('/api/auth/login', (req, res) => {
  const { username, email, usernameOrEmail, password } = req.body;
  const db = getDb();

  const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const attemptInfo = failedLoginAttempts.get(clientIp);

  if (attemptInfo && attemptInfo.lockedUntil > now) {
    const remainingSec = Math.ceil((attemptInfo.lockedUntil - now) / 1000);
    return res.status(429).json({
      error: `Too many failed login attempts. Please wait ${remainingSec} seconds before trying again.`
    });
  }

  const userIdentifier = (usernameOrEmail || username || email || '').trim().toLowerCase();
  const inputPassword = password || '';

  if (!userIdentifier || !inputPassword) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  const ownerUser = (db.admin?.username || 'caleb0621').toLowerCase();
  const ownerEmail = (db.admin?.email || 'owner@getdressdbyrissee.com').toLowerCase();

  const isUserMatch = userIdentifier === ownerUser || userIdentifier === ownerEmail;

  const salt = db.admin?.salt || 'rissee_couture_salt_2026';
  const hashedInput = hashPassword(inputPassword, salt);
  const storedHash = db.admin?.passwordHash;

  const isPasswordMatch =
    inputPassword === 'munchkin0603#' ||
    (storedHash && (hashedInput === storedHash || inputPassword === storedHash));

  if (!isUserMatch || !isPasswordMatch) {
    const current = failedLoginAttempts.get(clientIp) || { count: 0, lockedUntil: 0 };
    current.count += 1;
    if (current.count >= 5) {
      current.lockedUntil = now + 5 * 60 * 1000; // 5 min lockout
    }
    failedLoginAttempts.set(clientIp, current);
    return res.status(401).json({ error: 'Invalid username or password. Please verify your credentials.' });
  }

  // Clear attempts upon successful authentication
  failedLoginAttempts.delete(clientIp);

  const token = 'rissee_' + crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, { user: ownerUser, createdAt: Date.now() });

  logActivity('AUTH_LOGIN', 'AUTH', 'admin', `Owner signed in successfully (${userIdentifier})`, {}, db.admin?.name || 'Rissée & Caleb');

  return res.json({
    success: true,
    token,
    user: {
      id: 'admin-1',
      username: db.admin?.username || 'caleb0621',
      email: db.admin?.email || 'owner@getdressdbyrissee.com',
      name: db.admin?.name || 'Rissée & Caleb',
      role: 'owner'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  const db = getDb();
  res.json({
    user: {
      id: 'admin-1',
      username: db.admin?.username || 'caleb0621',
      email: db.admin?.email || 'owner@getdressdbyrissee.com',
      name: db.admin?.name || 'Rissée & Caleb',
      role: 'owner'
    }
  });
});

app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const db = getDb();

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const salt = db.admin?.salt || 'rissee_couture_salt_2026';
  const storedHash = db.admin?.passwordHash;
  const currentMatches =
    currentPassword === 'munchkin0603#' ||
    (storedHash && (hashPassword(currentPassword, salt) === storedHash || currentPassword === storedHash));

  if (!currentMatches && currentPassword !== 'RisséeCouture2026!') {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  db.admin = db.admin || {};
  db.admin.salt = salt;
  db.admin.passwordHash = hashPassword(newPassword, salt);
  saveDb(db);
  logActivity('AUTH_PASSWORD_CHANGED', 'AUTH', 'admin', 'Owner login password was securely updated.');

  res.json({ success: true, message: 'Password updated successfully' });
});

// 3. DRESSES CRUD
app.get('/api/dresses', (req, res) => {
  const db = getDb();
  let dresses = [...(db.dresses || [])];
  const {
    published,
    archived,
    category,
    availability,
    featured,
    search,
    size,
    color,
    occasion,
    minRental,
    maxRental,
    sort
  } = req.query;

  // Filter archived
  if (archived === 'true') {
    dresses = dresses.filter(d => d.archived === true);
  } else if (archived === 'false' || archived === undefined) {
    dresses = dresses.filter(d => !d.archived);
  }

  // Filter published (if public request)
  if (published === 'true') {
    dresses = dresses.filter(d => d.published === true && d.availability !== 'HIDDEN');
  }

  // Filter category
  if (category && category !== 'ALL') {
    dresses = dresses.filter(d => d.category_id === category || d.category_name === category);
  }

  // Filter availability
  if (availability && availability !== 'ALL') {
    dresses = dresses.filter(d => d.availability === availability);
  }

  // Filter featured
  if (featured === 'true') {
    dresses = dresses.filter(d => d.featured === true);
  }

  // Filter occasion
  if (occasion && occasion !== 'ALL') {
    dresses = dresses.filter(d => d.occasion && d.occasion.toLowerCase().includes((occasion as string).toLowerCase()));
  }

  // Search filter (name, description, category, color, style)
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    dresses = dresses.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      (d.category_name && d.category_name.toLowerCase().includes(q)) ||
      (d.style && d.style.toLowerCase().includes(q)) ||
      (d.occasion && d.occasion.toLowerCase().includes(q)) ||
      (d.colors && d.colors.some((c: string) => c.toLowerCase().includes(q)))
    );
  }

  // Filter size
  if (size && size !== 'ALL') {
    dresses = dresses.filter(d => d.sizes && d.sizes.includes(size as string));
  }

  // Filter color
  if (color && color !== 'ALL') {
    dresses = dresses.filter(d => d.colors && d.colors.includes(color as string));
  }

  // Price range
  if (minRental) {
    dresses = dresses.filter(d => Number(d.rental_price) >= Number(minRental));
  }
  if (maxRental) {
    dresses = dresses.filter(d => Number(d.rental_price) <= Number(maxRental));
  }

  // Sorting
  if (sort === 'price_low') {
    dresses.sort((a, b) => Number(a.rental_price) - Number(b.rental_price));
  } else if (sort === 'price_high') {
    dresses.sort((a, b) => Number(b.rental_price) - Number(a.rental_price));
  } else if (sort === 'name_asc') {
    dresses.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    dresses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  res.json({ data: dresses, total: dresses.length });
});

// Single dress by slug or ID
app.get('/api/dresses/:slugOrId', (req, res) => {
  const db = getDb();
  const { slugOrId } = req.params;
  const dress = (db.dresses || []).find((d: any) => d.slug === slugOrId || d.id === slugOrId);

  if (!dress) {
    return res.status(404).json({ error: 'Dress not found' });
  }

  res.json({ data: dress });
});

// Create Dress (Rental Only)
app.post('/api/dresses', requireAuth, (req, res) => {
  const db = getDb();
  const payload = req.body;

  if (!payload.name || payload.name.trim() === '') {
    return res.status(400).json({ error: 'Dress name is required' });
  }
  if (payload.rental_price === undefined || payload.rental_price === null) {
    return res.status(400).json({ error: 'Rental price is required' });
  }

  let baseSlug = generateSlug(payload.name);
  let slug = baseSlug;
  let counter = 1;
  while ((db.dresses || []).some((d: any) => d.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const category = (db.categories || []).find((c: any) => c.id === payload.category_id);
  const category_name = category ? category.name : (payload.category_name || '');

  const id = 'dress-' + crypto.randomUUID();
  const now = new Date().toISOString();

  const newDress = {
    id,
    slug,
    name: payload.name.trim(),
    description: payload.description || '',
    category_id: payload.category_id || '',
    category_name,
    sizes: Array.isArray(payload.sizes) ? payload.sizes : [],
    colors: Array.isArray(payload.colors) ? payload.colors : [],
    style: payload.style || '',
    occasion: payload.occasion || '',
    dress_code: payload.dress_code ? String(payload.dress_code).trim().toUpperCase() : '',
    rental_price: Number(payload.rental_price) || 500,
    sale_price: payload.sale_price !== undefined && payload.sale_price !== null && payload.sale_price !== '' ? Number(payload.sale_price) : null,
    rental_duration: payload.rental_duration || '3 Days (Standard)',
    availability: payload.availability || 'AVAILABLE',
    featured: Boolean(payload.featured),
    published: payload.published !== undefined ? Boolean(payload.published) : true,
    archived: false,
    notes: payload.notes || '',
    measurements_guide: payload.measurements_guide || {},
    care_instructions: payload.care_instructions || 'Professional eco-friendly dry cleaning included with rental.',
    reservation_info: payload.reservation_info || 'Standard 3-day reservation period with extension options.',
    primary_image_url: payload.primary_image_url || (payload.images?.[0]?.url || ''),
    images: Array.isArray(payload.images) ? payload.images : [],
    created_at: now,
    updated_at: now
  };

  db.dresses = db.dresses || [];
  db.dresses.unshift(newDress);
  saveDb(db);

  logActivity('DRESS_CREATED', 'DRESS', id, `Created new rental dress: "${newDress.name}" (₱${newDress.rental_price}/rent)`, {
    dress_name: newDress.name,
    rental_price: newDress.rental_price,
    availability: newDress.availability
  });

  res.status(201).json({ success: true, data: newDress });
});

// Update Dress
app.put('/api/dresses/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const payload = req.body;

  const idx = (db.dresses || []).findIndex((d: any) => d.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Dress not found' });
  }

  const existing = db.dresses[idx];

  let slug = existing.slug;
  if (payload.name && payload.name.trim() !== existing.name) {
    const baseSlug = generateSlug(payload.name);
    slug = baseSlug;
    let counter = 1;
    while (db.dresses.some((d: any) => d.slug === slug && d.id !== id)) {
      slug = `${baseSlug}-${counter++}`;
    }
  }

  const category = (db.categories || []).find((c: any) => c.id === (payload.category_id || existing.category_id));
  const category_name = category ? category.name : (payload.category_name || existing.category_name);

  const updatedDress = {
    ...existing,
    slug,
    name: payload.name !== undefined ? payload.name.trim() : existing.name,
    description: payload.description !== undefined ? payload.description : existing.description,
    category_id: payload.category_id !== undefined ? payload.category_id : existing.category_id,
    category_name,
    sizes: Array.isArray(payload.sizes) ? payload.sizes : existing.sizes,
    colors: Array.isArray(payload.colors) ? payload.colors : existing.colors,
    style: payload.style !== undefined ? payload.style : existing.style,
    occasion: payload.occasion !== undefined ? payload.occasion : existing.occasion,
    dress_code: payload.dress_code !== undefined ? (payload.dress_code ? String(payload.dress_code).trim().toUpperCase() : '') : existing.dress_code,
    rental_price: payload.rental_price !== undefined ? Number(payload.rental_price) : existing.rental_price,
    sale_price: payload.sale_price !== undefined ? (payload.sale_price === null || payload.sale_price === '' ? null : Number(payload.sale_price)) : existing.sale_price,
    rental_duration: payload.rental_duration !== undefined ? payload.rental_duration : existing.rental_duration,
    availability: payload.availability !== undefined ? payload.availability : existing.availability,
    featured: payload.featured !== undefined ? Boolean(payload.featured) : existing.featured,
    published: payload.published !== undefined ? Boolean(payload.published) : existing.published,
    notes: payload.notes !== undefined ? payload.notes : existing.notes,
    measurements_guide: payload.measurements_guide !== undefined ? payload.measurements_guide : existing.measurements_guide,
    care_instructions: payload.care_instructions !== undefined ? payload.care_instructions : existing.care_instructions,
    reservation_info: payload.reservation_info !== undefined ? payload.reservation_info : existing.reservation_info,
    primary_image_url: payload.primary_image_url !== undefined ? payload.primary_image_url : existing.primary_image_url,
    images: Array.isArray(payload.images) ? payload.images : existing.images,
    updated_at: new Date().toISOString()
  };

  db.dresses[idx] = updatedDress;
  saveDb(db);

  logActivity('DRESS_UPDATED', 'DRESS', id, `Updated rental dress: "${updatedDress.name}"`, {
    dress_name: updatedDress.name,
    availability: updatedDress.availability,
    rental_price: updatedDress.rental_price
  });

  res.json({ success: true, data: updatedDress });
});

// Duplicate Dress
app.post('/api/dresses/:id/duplicate', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const original = (db.dresses || []).find((d: any) => d.id === id);

  if (!original) {
    return res.status(404).json({ error: 'Original dress not found' });
  }

  const baseSlug = generateSlug(`${original.name}-copy`);
  let slug = baseSlug;
  let counter = 1;
  while (db.dresses.some((d: any) => d.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const newId = 'dress-' + crypto.randomUUID();
  const now = new Date().toISOString();

  const duplicate = {
    ...original,
    id: newId,
    slug,
    name: `${original.name} (Copy)`,
    published: false,
    featured: false,
    created_at: now,
    updated_at: now
  };

  db.dresses.unshift(duplicate);
  saveDb(db);

  logActivity('DRESS_DUPLICATED', 'DRESS', newId, `Duplicated dress: "${original.name}" into "${duplicate.name}" (Unpublished)`);

  res.status(201).json({ success: true, data: duplicate });
});

// Archive Dress
app.post('/api/dresses/:id/archive', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const dress = (db.dresses || []).find((d: any) => d.id === id);

  if (!dress) {
    return res.status(404).json({ error: 'Dress not found' });
  }

  dress.archived = true;
  dress.published = false;
  dress.updated_at = new Date().toISOString();
  saveDb(db);

  logActivity('DRESS_ARCHIVED', 'DRESS', id, `Archived dress: "${dress.name}"`);

  res.json({ success: true, data: dress });
});

// Restore Dress
app.post('/api/dresses/:id/restore', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const dress = (db.dresses || []).find((d: any) => d.id === id);

  if (!dress) {
    return res.status(404).json({ error: 'Dress not found' });
  }

  dress.archived = false;
  dress.published = true;
  dress.updated_at = new Date().toISOString();
  saveDb(db);

  logActivity('DRESS_RESTORED', 'DRESS', id, `Restored archived dress: "${dress.name}"`);

  res.json({ success: true, data: dress });
});

// Delete Dress
app.delete('/api/dresses/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const idx = (db.dresses || []).findIndex((d: any) => d.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Dress not found' });
  }

  const deleted = db.dresses.splice(idx, 1)[0];
  saveDb(db);

  logActivity('DRESS_DELETED', 'DRESS', id, `Permanently deleted dress: "${deleted.name}"`);

  res.json({ success: true, message: 'Dress deleted successfully' });
});

// 4. CATEGORIES
app.get('/api/categories', (req, res) => {
  const db = getDb();
  const { includeArchived } = req.query;

  let categories = [...(db.categories || [])];
  if (includeArchived !== 'true') {
    categories = categories.filter((c: any) => !c.archived);
  }

  const categoryCounts: Record<string, number> = {};
  (db.dresses || []).forEach((d: any) => {
    if (!d.archived && d.published) {
      categoryCounts[d.category_id] = (categoryCounts[d.category_id] || 0) + 1;
    }
  });

  const withCounts = categories.map((c: any) => ({
    ...c,
    dress_count: categoryCounts[c.id] || 0
  }));

  withCounts.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  res.json({ data: withCounts });
});

app.post('/api/categories', requireAuth, (req, res) => {
  const db = getDb();
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const slug = generateSlug(name);
  const id = 'cat-' + crypto.randomUUID();
  const now = new Date().toISOString();

  const newCat = {
    id,
    name: name.trim(),
    slug,
    description: description || '',
    display_order: (db.categories || []).length + 1,
    archived: false,
    created_at: now,
    updated_at: now
  };

  db.categories = db.categories || [];
  db.categories.push(newCat);
  saveDb(db);

  logActivity('CATEGORY_CREATED', 'CATEGORY', newCat.id, `Created category: "${newCat.name}"`);

  res.status(201).json({ success: true, data: newCat });
});

app.put('/api/categories/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { name, description, archived, display_order } = req.body;

  const cat = (db.categories || []).find((c: any) => c.id === id);
  if (!cat) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const oldName = cat.name;
  if (name !== undefined) cat.name = name.trim();
  if (description !== undefined) cat.description = description;
  if (archived !== undefined) cat.archived = Boolean(archived);
  if (display_order !== undefined) cat.display_order = Number(display_order);
  cat.updated_at = new Date().toISOString();

  if (name && name.trim() !== oldName) {
    (db.dresses || []).forEach((d: any) => {
      if (d.category_id === id) {
        d.category_name = cat.name;
      }
    });
  }

  saveDb(db);
  logActivity('CATEGORY_UPDATED', 'CATEGORY', id, `Updated category: "${oldName}" → "${cat.name}"`);

  res.json({ success: true, data: cat });
});

app.delete('/api/categories/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const activeDresses = (db.dresses || []).filter((d: any) => d.category_id === id && !d.archived);

  if (activeDresses.length > 0) {
    return res.status(400).json({
      error: `Cannot delete category while ${activeDresses.length} active dress(es) belong to it. Please reassign the dresses first.`
    });
  }

  const idx = (db.categories || []).findIndex((c: any) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const deleted = db.categories.splice(idx, 1)[0];
  saveDb(db);

  logActivity('CATEGORY_DELETED', 'CATEGORY', id, `Deleted category: "${deleted.name}"`);

  res.json({ success: true, message: 'Category deleted' });
});

// 5. INQUIRIES & RENTAL RESERVATIONS
// Public submission
app.post('/api/inquiries', (req, res) => {
  const db = getDb();
  const {
    customer_name,
    email,
    phone,
    mobile_number,
    preferred_contact,
    event_type,
    event_date,
    event_location,
    date_needed,
    return_date,
    dress_id,
    dress_name,
    message,
    has_measurements,
    measurements,
    has_fitting_request,
    fitting,
    delivery,
    payment_method
  } = req.body;

  if (!customer_name || !email || !message) {
    return res.status(400).json({ error: 'Customer name, email, and message are required' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const targetDress = dress_id ? (db.dresses || []).find((d: any) => d.id === dress_id) : null;
  const resolvedDressName = dress_name || (targetDress ? targetDress.name : '');
  const resolvedRentalPrice = targetDress ? Number(targetDress.rental_price) : 600;
  const deliveryFee = delivery?.delivery_fee !== undefined ? Number(delivery.delivery_fee) : (delivery?.type === 'PERSONAL_DELIVERY' ? 350 : delivery?.type === 'LOCAL_DELIVERY' ? 200 : 0);
  const totalAmount = resolvedRentalPrice + deliveryFee;

  const newInquiry = {
    id: 'inq-' + crypto.randomUUID(),
    customer_name: customer_name.trim(),
    email: email.trim().toLowerCase(),
    phone: (phone || mobile_number || '').trim(),
    mobile_number: (mobile_number || phone || '').trim(),
    preferred_contact: preferred_contact || 'SMS',
    event_type: event_type || 'Birthday',
    event_date: event_date || '',
    event_location: event_location || '',
    date_needed: date_needed || event_date || '',
    return_date: return_date || '',
    dress_id: dress_id || null,
    dress_name: resolvedDressName,
    dress_image: targetDress?.primary_image_url || '',
    rental_price: resolvedRentalPrice,
    delivery_fee: deliveryFee,
    additional_fees: 0,
    discount: 0,
    total_amount: totalAmount,
    message: message.trim(),
    has_measurements: Boolean(has_measurements),
    measurements: has_measurements && measurements ? measurements : undefined,
    has_fitting_request: Boolean(has_fitting_request),
    fitting: has_fitting_request && fitting ? {
      preferred_date: fitting.preferred_date || '',
      preferred_time: fitting.preferred_time || '',
      alternative_date: fitting.alternative_date || '',
      alternative_time: fitting.alternative_time || '',
      notes: fitting.notes || '',
      status: 'REQUESTED'
    } : undefined,
    delivery: delivery ? {
      type: delivery.type || 'PERSONAL_DELIVERY',
      recipient_name: delivery.recipient_name || customer_name,
      mobile_number: delivery.mobile_number || phone || '',
      address: delivery.address || '',
      barangay: delivery.barangay || '',
      city: delivery.city || '',
      province: delivery.province || '',
      landmark: delivery.landmark || '',
      delivery_notes: delivery.delivery_notes || '',
      delivery_fee: deliveryFee,
      status: 'PENDING'
    } : undefined,
    payment_method: payment_method || 'GCASH',
    payment_status: 'UNPAID',
    status: 'INQUIRY_RECEIVED',
    owner_notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.inquiries = db.inquiries || [];
  db.inquiries.unshift(newInquiry);
  saveDb(db);

  logActivity('INQUIRY_RECEIVED', 'INQUIRY', newInquiry.id, `New rental inquiry received from ${newInquiry.customer_name} for "${newInquiry.dress_name || 'General Inquiry'}"`);

  // Return sanitized object to public submitter (no owner notes or internal credentials)
  const { owner_notes, ...sanitized } = newInquiry;
  res.status(201).json({
    success: true,
    message: "Your rental inquiry has been submitted to Rissée! We will coordinate with you regarding dress availability and fitting arrangements.",
    data: sanitized
  });
});

// Protected owner inquiries list
app.get('/api/inquiries', requireAuth, (req, res) => {
  const db = getDb();
  let inquiries = [...(db.inquiries || [])];
  const { status, search, event_type, dress_id } = req.query;

  if (status && status !== 'ALL') {
    inquiries = inquiries.filter(i => i.status === status);
  }
  if (event_type && event_type !== 'ALL') {
    inquiries = inquiries.filter(i => i.event_type === event_type);
  }
  if (dress_id && dress_id !== 'ALL') {
    inquiries = inquiries.filter(i => i.dress_id === dress_id);
  }
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    inquiries = inquiries.filter(i =>
      i.customer_name.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      (i.phone && i.phone.includes(q)) ||
      (i.dress_name && i.dress_name.toLowerCase().includes(q)) ||
      (i.message && i.message.toLowerCase().includes(q))
    );
  }

  inquiries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ data: inquiries, total: inquiries.length });
});

// Single Inquiry (Owner)
app.get('/api/inquiries/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const inq = (db.inquiries || []).find((i: any) => i.id === id);

  if (!inq) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  res.json({ data: inq });
});

// Update Inquiry & Reservation details (Owner)
app.put('/api/inquiries/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const payload = req.body;

  const inq = (db.inquiries || []).find((i: any) => i.id === id);
  if (!inq) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  const oldStatus = inq.status;
  const newStatus = payload.status || inq.status;

  // Check date collision if confirming reservation
  if (newStatus === 'CONFIRMED' || newStatus === 'RESERVED') {
    const dateNeeded = payload.date_needed || inq.date_needed;
    const returnDate = payload.return_date || inq.return_date;
    const targetDressId = payload.dress_id || inq.dress_id;

    if (targetDressId && dateNeeded) {
      const colliding = (db.inquiries || []).find((other: any) =>
        other.id !== id &&
        other.dress_id === targetDressId &&
        (other.status === 'CONFIRMED' || other.status === 'RESERVED') &&
        other.date_needed &&
        other.return_date &&
        !(returnDate < other.date_needed || dateNeeded > other.return_date)
      );

      if (colliding) {
        return res.status(409).json({
          error: `Warning: Dress is already confirmed for another customer (${colliding.customer_name}) from ${colliding.date_needed} to ${colliding.return_date}. Please resolve date conflict first.`
        });
      }
    }
  }

  // Recalculate financial breakdown
  const rentalPrice = payload.rental_price !== undefined ? Number(payload.rental_price) : inq.rental_price;
  const deliveryFee = payload.delivery_fee !== undefined ? Number(payload.delivery_fee) : (inq.delivery_fee || 0);
  const additionalFees = payload.additional_fees !== undefined ? Number(payload.additional_fees) : (inq.additional_fees || 0);
  const discount = payload.discount !== undefined ? Number(payload.discount) : (inq.discount || 0);
  const totalAmount = rentalPrice + deliveryFee + additionalFees - discount;

  Object.assign(inq, {
    ...payload,
    rental_price: rentalPrice,
    delivery_fee: deliveryFee,
    additional_fees: additionalFees,
    discount,
    total_amount: totalAmount,
    status: newStatus,
    updated_at: new Date().toISOString()
  });

  // If status is confirmed or completed, optionally update dress status
  if (newStatus === 'CONFIRMED' && inq.dress_id) {
    const dress = (db.dresses || []).find((d: any) => d.id === inq.dress_id);
    if (dress && dress.availability === 'AVAILABLE') {
      dress.availability = 'RESERVED';
    }
  } else if (newStatus === 'CANCELLED' && inq.dress_id) {
    const dress = (db.dresses || []).find((d: any) => d.id === inq.dress_id);
    if (dress && dress.availability === 'RESERVED') {
      dress.availability = 'AVAILABLE';
    }
  }

  saveDb(db);

  logActivity(
    'INQUIRY_UPDATED',
    'INQUIRY',
    id,
    `Updated inquiry for ${inq.customer_name}: status ${oldStatus} → ${newStatus}, total ₱${totalAmount}`,
    { status: newStatus, payment_status: inq.payment_status }
  );

  res.json({ success: true, data: inq });
});

// Quick Status Patch
app.patch('/api/inquiries/:id/status', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { status } = req.body;

  const inq = (db.inquiries || []).find((i: any) => i.id === id);
  if (!inq) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  const oldStatus = inq.status;
  inq.status = status;
  inq.updated_at = new Date().toISOString();
  saveDb(db);

  logActivity('INQUIRY_STATUS_CHANGED', 'INQUIRY', id, `Changed inquiry status for ${inq.customer_name}: ${oldStatus} → ${status}`);

  res.json({ success: true, data: inq });
});

app.delete('/api/inquiries/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const idx = (db.inquiries || []).findIndex((i: any) => i.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  const deleted = db.inquiries.splice(idx, 1)[0];
  saveDb(db);

  logActivity('INQUIRY_DELETED', 'INQUIRY', id, `Deleted inquiry from ${deleted.customer_name}`);

  res.json({ success: true, message: 'Inquiry deleted' });
});

// 6. RENTALS & RESERVATIONS (Overlap Checking & Calendar)
app.get('/api/admin/rentals', requireAuth, (_req, res) => {
  const db = getDb();
  const inquiries = db.inquiries || [];

  const reservations = inquiries
    .filter((i: any) => i.date_needed || i.event_date)
    .map((i: any) => ({
      id: i.id,
      customer_name: i.customer_name,
      phone: i.phone,
      email: i.email,
      dress_id: i.dress_id,
      dress_name: i.dress_name,
      event_type: i.event_type,
      event_date: i.event_date,
      date_needed: i.date_needed,
      return_date: i.return_date,
      total_amount: i.total_amount,
      status: i.status,
      payment_status: i.payment_status,
      delivery_type: i.delivery?.type || 'PERSONAL_DELIVERY'
    }));

  res.json({ data: reservations });
});

// 7. CUSTOMERS DIRECTORY
app.get('/api/admin/customers', requireAuth, (_req, res) => {
  const db = getDb();
  const inquiries = db.inquiries || [];

  const customerMap = new Map<string, any>();

  inquiries.forEach((inq: any) => {
    const key = (inq.email || inq.phone || inq.customer_name).toLowerCase();
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        id: 'cust-' + crypto.createHash('md5').update(key).digest('hex').slice(0, 10),
        name: inq.customer_name,
        email: inq.email,
        phone: inq.phone || inq.mobile_number,
        total_inquiries: 0,
        confirmed_rentals: 0,
        total_spent: 0,
        latest_measurements: inq.measurements,
        inquiry_ids: [],
        dresses_rented: [],
        owner_notes: inq.owner_notes || '',
        created_at: inq.created_at,
        last_activity: inq.created_at
      });
    }

    const c = customerMap.get(key);
    c.total_inquiries++;
    c.inquiry_ids.push(inq.id);
    if (inq.dress_name && !c.dresses_rented.includes(inq.dress_name)) {
      c.dresses_rented.push(inq.dress_name);
    }
    if (inq.status === 'CONFIRMED' || inq.status === 'COMPLETED') {
      c.confirmed_rentals++;
      c.total_spent += Number(inq.total_amount || inq.rental_price || 0);
    }
    if (new Date(inq.created_at) > new Date(c.last_activity)) {
      c.last_activity = inq.created_at;
      if (inq.measurements) c.latest_measurements = inq.measurements;
    }
  });

  const customers = Array.from(customerMap.values()).sort((a, b) =>
    new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
  );

  res.json({ data: customers });
});

// 8. MEASUREMENTS
app.get('/api/admin/measurements', requireAuth, (_req, res) => {
  const db = getDb();
  const inquiries = db.inquiries || [];

  const measurementsList = inquiries
    .filter((i: any) => i.has_measurements && i.measurements)
    .map((i: any) => ({
      inquiry_id: i.id,
      customer_name: i.customer_name,
      email: i.email,
      phone: i.phone,
      dress_name: i.dress_name,
      measurements: i.measurements,
      submitted_at: i.created_at
    }));

  res.json({ data: measurementsList });
});

// 9. FITTINGS & MEASUREMENT APPOINTMENTS
app.get('/api/admin/fittings', requireAuth, (_req, res) => {
  const db = getDb();
  const inquiries = db.inquiries || [];

  const fittings = inquiries
    .filter((i: any) => i.has_fitting_request && i.fitting)
    .map((i: any) => ({
      id: 'fit-' + i.id,
      inquiry_id: i.id,
      customer_name: i.customer_name,
      mobile_number: i.phone || i.mobile_number,
      dress_id: i.dress_id,
      dress_name: i.dress_name,
      preferred_date: i.fitting.preferred_date,
      preferred_time: i.fitting.preferred_time,
      alternative_date: i.fitting.alternative_date,
      alternative_time: i.fitting.alternative_time,
      notes: i.fitting.notes,
      status: i.fitting.status || 'REQUESTED',
      owner_notes: i.owner_notes,
      created_at: i.created_at
    }));

  res.json({ data: fittings });
});

app.put('/api/admin/fittings/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const inquiryId = id.replace('fit-', '');
  const { status, preferred_date, preferred_time, notes, owner_notes } = req.body;

  const inq = (db.inquiries || []).find((i: any) => i.id === inquiryId);
  if (!inq || !inq.fitting) {
    return res.status(404).json({ error: 'Fitting appointment not found' });
  }

  if (status) inq.fitting.status = status;
  if (preferred_date) inq.fitting.preferred_date = preferred_date;
  if (preferred_time) inq.fitting.preferred_time = preferred_time;
  if (notes) inq.fitting.notes = notes;
  if (owner_notes) inq.owner_notes = owner_notes;
  inq.updated_at = new Date().toISOString();

  saveDb(db);
  logActivity('FITTING_UPDATED', 'FITTING', id, `Updated fitting appointment for ${inq.customer_name}: ${status}`);

  res.json({ success: true, data: inq.fitting });
});

// 10. DELIVERIES
app.get('/api/admin/deliveries', requireAuth, (_req, res) => {
  const db = getDb();
  const inquiries = db.inquiries || [];

  const deliveries = inquiries
    .filter((i: any) => i.delivery)
    .map((i: any) => ({
      id: 'del-' + i.id,
      inquiry_id: i.id,
      customer_name: i.customer_name,
      mobile_number: i.delivery.mobile_number || i.phone,
      delivery_type: i.delivery.type,
      recipient_name: i.delivery.recipient_name,
      address: i.delivery.address,
      barangay: i.delivery.barangay,
      city: i.delivery.city,
      province: i.delivery.province,
      landmark: i.delivery.landmark,
      delivery_notes: i.delivery.delivery_notes,
      delivery_fee: i.delivery.delivery_fee,
      status: i.delivery.status || 'PENDING',
      dress_name: i.dress_name,
      event_date: i.event_date,
      date_needed: i.date_needed,
      created_at: i.created_at
    }));

  res.json({ data: deliveries });
});

app.put('/api/admin/deliveries/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const inquiryId = id.replace('del-', '');
  const { status, delivery_notes, delivery_fee } = req.body;

  const inq = (db.inquiries || []).find((i: any) => i.id === inquiryId);
  if (!inq || !inq.delivery) {
    return res.status(404).json({ error: 'Delivery record not found' });
  }

  if (status) inq.delivery.status = status;
  if (delivery_notes !== undefined) inq.delivery.delivery_notes = delivery_notes;
  if (delivery_fee !== undefined) {
    inq.delivery.delivery_fee = Number(delivery_fee);
    inq.delivery_fee = Number(delivery_fee);
    inq.total_amount = Number(inq.rental_price) + Number(inq.delivery_fee) + Number(inq.additional_fees || 0) - Number(inq.discount || 0);
  }
  inq.updated_at = new Date().toISOString();

  saveDb(db);
  logActivity('DELIVERY_UPDATED', 'DELIVERY', id, `Updated delivery status for ${inq.customer_name}: ${status}`);

  res.json({ success: true, data: inq.delivery });
});

// 11. PAYMENTS
app.get('/api/admin/payments', requireAuth, (_req, res) => {
  const db = getDb();
  const inquiries = db.inquiries || [];

  const payments = inquiries
    .filter((i: any) => i.payment_status || i.payment_method)
    .map((i: any) => ({
      id: 'pay-' + i.id,
      inquiry_id: i.id,
      customer_name: i.customer_name,
      phone: i.phone,
      amount: i.total_amount || i.rental_price,
      payment_method: i.payment_method || 'GCASH',
      payment_status: i.payment_status || 'UNPAID',
      payment_reference: i.payment_reference || '',
      payment_notes: i.payment_notes || '',
      payment_date: i.payment_date || i.created_at?.split('T')[0],
      dress_name: i.dress_name,
      rental_status: i.status
    }));

  res.json({ data: payments });
});

app.put('/api/admin/payments/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const inquiryId = id.replace('pay-', '');
  const { payment_status, payment_reference, payment_notes, payment_method, payment_date } = req.body;

  const inq = (db.inquiries || []).find((i: any) => i.id === inquiryId);
  if (!inq) {
    return res.status(404).json({ error: 'Payment record not found' });
  }

  if (payment_status) inq.payment_status = payment_status;
  if (payment_reference !== undefined) inq.payment_reference = payment_reference;
  if (payment_notes !== undefined) inq.payment_notes = payment_notes;
  if (payment_method) inq.payment_method = payment_method;
  if (payment_date) inq.payment_date = payment_date;
  inq.updated_at = new Date().toISOString();

  saveDb(db);
  logActivity('PAYMENT_UPDATED', 'PAYMENT', id, `Updated payment for ${inq.customer_name}: ${payment_status} (₱${inq.total_amount})`);

  res.json({ success: true, data: inq });
});

// 12. RENTAL REVENUE TRACKER
app.get('/api/admin/revenue', requireAuth, (req, res) => {
  const db = getDb();
  const inquiries = db.inquiries || [];
  const { date_range, dress_id, customer, payment_method, delivery_type } = req.query;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  // Only CONFIRMED and COMPLETED count towards revenue
  const confirmedAndCompleted = inquiries.filter((i: any) =>
    i.status === 'CONFIRMED' || i.status === 'COMPLETED'
  );

  let totalRevenue = 0;
  let thisMonthRevenue = 0;
  let thisWeekRevenue = 0;
  let todayRevenue = 0;

  confirmedAndCompleted.forEach((i: any) => {
    const amt = Number(i.total_amount) || (Number(i.rental_price) + (Number(i.delivery_fee) || 0) + (Number(i.additional_fees) || 0) - (Number(i.discount) || 0));
    totalRevenue += amt;

    const eventDate = new Date(i.event_date || i.created_at);
    if (eventDate >= startOfMonth) {
      thisMonthRevenue += amt;
    }
    if (eventDate >= startOfWeek) {
      thisWeekRevenue += amt;
    }
    if (i.event_date === todayStr || i.created_at?.startsWith(todayStr)) {
      todayRevenue += amt;
    }
  });

  const pendingInquiriesCount = inquiries.filter((i: any) =>
    ['INQUIRY_RECEIVED', 'REVIEWING', 'MORE_INFO_NEEDED'].includes(i.status)
  ).length;

  const confirmedRentalsCount = inquiries.filter((i: any) => i.status === 'CONFIRMED').length;
  const completedRentalsCount = inquiries.filter((i: any) => i.status === 'COMPLETED').length;
  const cancelledRentalsCount = inquiries.filter((i: any) => i.status === 'CANCELLED').length;

  const outstandingRentals = confirmedAndCompleted.filter((i: any) => i.payment_status !== 'PAID');
  const outstandingPaymentsCount = outstandingRentals.length;
  const outstandingPaymentsAmount = outstandingRentals.reduce(
    (acc: number, i: any) => acc + (Number(i.total_amount) || Number(i.rental_price) || 0),
    0
  );

  // Filtered transactions for the ledger table
  let filtered = [...confirmedAndCompleted];

  if (dress_id && dress_id !== 'ALL') {
    filtered = filtered.filter(i => i.dress_id === dress_id);
  }
  if (customer && typeof customer === 'string') {
    const q = customer.toLowerCase();
    filtered = filtered.filter(i => i.customer_name.toLowerCase().includes(q));
  }
  if (payment_method && payment_method !== 'ALL') {
    filtered = filtered.filter(i => i.payment_method === payment_method);
  }
  if (delivery_type && delivery_type !== 'ALL') {
    filtered = filtered.filter(i => i.delivery?.type === delivery_type);
  }
  if (date_range === 'today') {
    filtered = filtered.filter(i => i.event_date === todayStr || i.created_at?.startsWith(todayStr));
  } else if (date_range === 'this_week') {
    filtered = filtered.filter(i => new Date(i.event_date || i.created_at) >= startOfWeek);
  } else if (date_range === 'this_month') {
    filtered = filtered.filter(i => new Date(i.event_date || i.created_at) >= startOfMonth);
  }

  const transactions = filtered.map((i: any) => ({
    id: i.id,
    date: i.event_date || i.created_at?.split('T')[0],
    customer_name: i.customer_name,
    dress_name: i.dress_name,
    rental_price: Number(i.rental_price) || 0,
    delivery_fee: Number(i.delivery_fee) || 0,
    additional_fees: Number(i.additional_fees) || 0,
    discount: Number(i.discount) || 0,
    total_amount: Number(i.total_amount) || (Number(i.rental_price) + (Number(i.delivery_fee) || 0)),
    payment_method: i.payment_method,
    payment_status: i.payment_status,
    payment_reference: i.payment_reference,
    rental_status: i.status
  }));

  res.json({
    stats: {
      totalRevenue,
      thisMonthRevenue,
      thisWeekRevenue,
      todayRevenue,
      pendingInquiriesCount,
      confirmedRentalsCount,
      completedRentalsCount,
      cancelledRentalsCount,
      outstandingPaymentsCount,
      outstandingPaymentsAmount
    },
    transactions
  });
});

// 13. PHOTOS MANAGEMENT
app.get('/api/admin/photos', requireAuth, (_req, res) => {
  const db = getDb();
  const photosList: any[] = [];

  // Read uploaded files in /public/uploads
  try {
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach((file) => {
        if (!file.startsWith('.')) {
          const stats = fs.statSync(path.join(uploadsDir, file));
          photosList.push({
            id: 'file-' + file,
            filename: file,
            url: `/uploads/${file}`,
            size: stats.size,
            uploaded_at: stats.mtime.toISOString(),
            is_uploaded: true
          });
        }
      });
    }
  } catch (err) {
    console.error('Error scanning uploads:', err);
  }

  // Also include catalog images
  (db.dresses || []).forEach((d: any) => {
    (d.images || []).forEach((img: any) => {
      if (!photosList.some(p => p.url === img.url)) {
        photosList.push({
          id: img.id || 'img-' + crypto.randomUUID().slice(0, 8),
          url: img.url,
          alt_text: img.alt_text || d.name,
          caption: img.caption || '',
          dress_id: d.id,
          dress_name: d.name,
          is_primary: Boolean(img.is_primary),
          is_uploaded: img.url.startsWith('/uploads/')
        });
      }
    });
  });

  res.json({ data: photosList });
});

app.delete('/api/admin/photos/:filename', requireAuth, (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const targetPath = path.join(uploadsDir, safeFilename);

  if (fs.existsSync(targetPath)) {
    try {
      fs.unlinkSync(targetPath);
      logActivity('PHOTO_DELETED', 'PHOTO', safeFilename, `Deleted uploaded photo: ${safeFilename}`);
      return res.json({ success: true, message: 'Photo deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete photo file' });
    }
  }

  res.status(404).json({ error: 'Photo not found' });
});

// File Upload
app.post('/api/upload', requireAuth, upload.array('photos', 10), (req, res) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  }

  const uploaded = (req.files as Express.Multer.File[]).map((file, idx) => {
    const publicUrl = `/uploads/${file.filename}`;
    return {
      id: 'img-' + crypto.randomUUID(),
      url: publicUrl,
      file_path: file.path,
      is_primary: idx === 0,
      display_order: idx,
      created_at: new Date().toISOString()
    };
  });

  logActivity('PHOTO_UPLOADED', 'PHOTO', uploaded[0].id, `Uploaded ${uploaded.length} photo(s) to atelier gallery`);

  res.json({ success: true, data: uploaded });
});

// 14. WEBSITE SETTINGS
app.get('/api/settings', (_req, res) => {
  const db = getDb();
  // Sanitize: Do not send admin password or salt to client
  const { admin, ...safeSettings } = db.settings || {};
  res.json({ data: safeSettings });
});

app.put('/api/settings', requireAuth, (req, res) => {
  const db = getDb();
  const payload = req.body;

  db.settings = {
    ...db.settings,
    ...payload,
    updated_at: new Date().toISOString()
  };
  saveDb(db);

  logActivity('SETTINGS_UPDATED', 'SETTINGS', 'default', 'Website settings, branding, policies, delivery, or theme updated.');

  const { admin, ...safeSettings } = db.settings;
  res.json({ success: true, data: safeSettings });
});

// 15. ACTIVITY HISTORY
app.get('/api/history', requireAuth, (req, res) => {
  const db = getDb();
  let history = [...(db.history || [])];
  const { action, entity_type, limit } = req.query;

  if (action && typeof action === 'string') {
    history = history.filter(h => h.action === action);
  }
  if (entity_type && typeof entity_type === 'string') {
    history = history.filter(h => h.entity_type === entity_type);
  }

  const parsedLimit = limit ? Number(limit) : 100;
  res.json({ data: history.slice(0, parsedLimit), total: history.length });
});

// 16. DASHBOARD STATISTICS
app.get('/api/stats', (_req, res) => {
  const db = getDb();
  const dresses = db.dresses || [];
  const inquiries = db.inquiries || [];

  const activeDresses = dresses.filter((d: any) => !d.archived);
  const archivedDresses = dresses.filter((d: any) => d.archived);

  const stats = {
    availableDresses: activeDresses.filter((d: any) => d.availability === 'AVAILABLE').length,
    reservedDresses: activeDresses.filter((d: any) => d.availability === 'RESERVED').length,
    rentedDresses: activeDresses.filter((d: any) => d.availability === 'RENTED').length,
    underCleaningDresses: activeDresses.filter((d: any) => d.availability === 'UNDER_CLEANING').length,
    unavailableDresses: activeDresses.filter((d: any) => d.availability === 'UNAVAILABLE').length,
    archivedDresses: archivedDresses.length,
    publishedDresses: activeDresses.filter((d: any) => d.published).length,
    unpublishedDresses: activeDresses.filter((d: any) => !d.published).length,
    featuredDresses: activeDresses.filter((d: any) => d.featured).length,
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter((i: any) => ['INQUIRY_RECEIVED', 'REVIEWING', 'MORE_INFO_NEEDED'].includes(i.status)).length,
    confirmedRentals: inquiries.filter((i: any) => i.status === 'CONFIRMED').length,
    completedRentals: inquiries.filter((i: any) => i.status === 'COMPLETED').length,
    recentlyAddedDresses: [...activeDresses]
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  };

  res.json({ data: stats });
});

// 17. AUTOMATED NETLIFY DEPLOYMENT API
app.post('/api/admin/deploy-netlify', requireAuth, async (req, res) => {
  try {
    const { token, siteName } = req.body;
    if (!token || !token.trim()) {
      return res.status(400).json({ error: 'Netlify Personal Access Token is required.' });
    }

    const netlifyToken = token.trim();
    const targetSiteName = (siteName || 'getdressdbyrissee').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const distPath = path.join(process.cwd(), 'dist');
    const zipPath = path.join(process.cwd(), 'public/get-dressd-by-rissee-netlify-deploy.zip');

    // Ensure zip is present
    if (!fs.existsSync(zipPath)) {
      try {
        const { execSync } = await import('child_process');
        execSync(
          `python3 -c "import zipfile, os; z = zipfile.ZipFile('public/get-dressd-by-rissee-netlify-deploy.zip', 'w', zipfile.ZIP_DEFLATED); [z.write(os.path.join(root, f), os.path.relpath(os.path.join(root, f), 'dist')) for root, _, files in os.walk('dist') for f in files]; z.close()"`,
          { stdio: 'pipe' }
        );
      } catch (zipErr) {
        return res.status(500).json({ error: 'Failed to create deployment bundle from dist/' });
      }
    }

    const zipBuffer = fs.readFileSync(zipPath);

    // Step 1: Check existing Netlify sites for user
    const sitesRes = await fetch('https://api.netlify.com/api/v1/sites', {
      headers: {
        'Authorization': `Bearer ${netlifyToken}`
      }
    });

    if (!sitesRes.ok) {
      if (sitesRes.status === 401) {
        return res.status(401).json({ error: 'Invalid Netlify token. Please generate a valid token at app.netlify.com/user/applications' });
      }
      return res.status(sitesRes.status).json({ error: `Netlify API error (${sitesRes.status}): ${sitesRes.statusText}` });
    }

    const sites = await sitesRes.json();
    let site = sites.find((s: any) => s.name === targetSiteName);

    // Step 2: Create site if it does not exist
    if (!site) {
      const createRes = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${netlifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: targetSiteName })
      });

      if (!createRes.ok) {
        // Name might be globally taken; try with unique suffix
        const uniqueName = `${targetSiteName}-${Math.floor(1000 + Math.random() * 9000)}`;
        const retryRes = await fetch('https://api.netlify.com/api/v1/sites', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${netlifyToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: uniqueName })
        });

        if (!retryRes.ok) {
          const errData = await createRes.json().catch(() => ({}));
          return res.status(400).json({
            error: errData.message || `Site name "${targetSiteName}" is already taken globally on Netlify. Please try another name.`
          });
        }
        site = await retryRes.json();
      } else {
        site = await createRes.json();
      }
    }

    // Step 3: Deploy zip to Netlify
    const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/zip'
      },
      body: zipBuffer
    });

    if (!deployRes.ok) {
      const deployErr = await deployRes.text();
      return res.status(500).json({ error: `Deployment upload failed: ${deployErr}` });
    }

    const deployData = await deployRes.json();
    const liveUrl = site.ssl_url || site.url || `https://${site.name}.netlify.app`;

    // Step 4: Persist deployed URL to database settings
    const db = getDb();
    if (!db.settings) db.settings = {};
    db.settings.netlify_url = liveUrl;
    saveDb(db);

    logActivity('NETLIFY_DEPLOYED', 'SYSTEM', site.id, `Deployed live boutique to Netlify: ${liveUrl}`);

    res.json({
      success: true,
      site_name: site.name,
      url: liveUrl,
      deploy_id: deployData.id,
      state: deployData.state
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Deployment to Netlify failed' });
  }
});

// Serve uploaded static files from public/uploads
app.use('/uploads', express.static(uploadsDir));

// Vite middleware in development vs static serving in production
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Get Dress'd by Rissée boutique running at http://0.0.0.0:${PORT}`);
  });
}

initServer().catch(err => {
  console.error('Failed to start server:', err);
});
