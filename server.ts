import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// --- PERSISTENT DATABASE ENGINE ---
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

import { initialMenuItems } from './src/data/menuData.ts';
import { initialGalleryItems, initialRestaurantSettings } from './src/data/initialData.ts';

interface DatabaseSchema {
  owner: {
    email: string;
    passwordHash: string;
    salt: string;
    resetToken?: string;
    resetExpires?: number;
  };
  menu: any[];
  orders: any[];
  reservations: any[];
  settings: any;
  gallery: any[];
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading db.json, re-initializing:', err);
  }

  // Initialize fresh database with owner eepa3142@gmail.com
  const salt = crypto.randomBytes(16).toString('hex');
  // Default master owner initial password: RoyaleOwner2026!
  const passwordHash = hashPassword('RoyaleOwner2026!', salt);

  const initialDb: DatabaseSchema = {
    owner: {
      email: 'eepa3142@gmail.com',
      passwordHash,
      salt,
    },
    menu: initialMenuItems,
    orders: [
      {
        id: 'ord-seed-1',
        code: 'NR-8401',
        items: [
          {
            dishId: 'sig-wagyu-truffle',
            name: 'A5 Hyogo Wagyu Tenderloin',
            quantity: 2,
            unitPrice: 245,
            selectedAddons: [{ id: 'add-gold-leaf', name: '24K Edible Gold Leaf Draping', price: 35 }],
            itemTotal: 560,
          },
        ],
        subtotal: 560,
        deliveryFee: 25,
        taxAndService: 84,
        total: 669,
        deliveryType: 'vip_suite_delivery',
        guestName: 'H.E. Sheikh Tariq Al-Mansoor',
        phone: '+971 50 123 4567',
        address: 'Royal Penthouse 901, DIFC Gate Tower, Dubai',
        status: 'preparing',
        createdAt: new Date().toISOString(),
      },
    ],
    reservations: [
      {
        id: 'res-seed-1',
        code: 'RES-7041',
        date: new Date().toISOString().split('T')[0],
        time: '20:00',
        guests: 4,
        seatingArea: 'The Imperial Crystal Vault (VIP) — قاعة الكريستال',
        occasion: 'Anniversary Dinner & Pairing',
        guestName: 'Lord Alistair Sterling',
        phone: '+44 7911 123456',
        email: 'sterling.vip@mayfair.co.uk',
        notes: 'Strict vintage champagne preference; celebrate 15th wedding anniversary.',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
    ],
    settings: initialRestaurantSettings,
    gallery: initialGalleryItems,
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

let db = loadDatabase();

// In-Memory active sessions store (Token -> { email: string, expires: number })
const activeSessions = new Map<string, { email: string; expires: number }>();

function generateSessionToken(email: string): string {
  const token = `nr_auth_${crypto.randomBytes(32).toString('hex')}`;
  // Session valid for 24 hours
  activeSessions.set(token, {
    email,
    expires: Date.now() + 24 * 60 * 60 * 1000,
  });
  return token;
}

// Security Middleware: Protects sensitive Admin endpoints
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized: Authentication required',
      message: 'Access restricted to verified owner (eepa3142@gmail.com)' 
    });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || session.expires < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ 
      error: 'Unauthorized: Session invalid or expired',
      message: 'Please re-authenticate with your owner credentials.' 
    });
  }

  // Extend session on activity
  session.expires = Date.now() + 24 * 60 * 60 * 1000;
  next();
}

// --- API ROUTES ---

// 1. Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'NOIR ROYALE', owner: db.owner.email, timestamp: new Date().toISOString() });
});

// 2. Authentication APIs
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Strict check: Only owner email is recognized
  if (normalizedEmail !== db.owner.email.toLowerCase()) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid credentials' });
  }

  const computedHash = hashPassword(password, db.owner.salt);
  if (computedHash !== db.owner.passwordHash) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid credentials' });
  }

  const token = generateSessionToken(db.owner.email);
  return res.json({
    success: true,
    token,
    user: {
      email: db.owner.email,
      role: 'owner',
    },
  });
});

app.get('/api/auth/verify', requireAdminAuth, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      email: db.owner.email,
      role: 'owner',
    },
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Signed out securely' });
});

// Forgot / Reset Password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email || String(email).trim().toLowerCase() !== db.owner.email.toLowerCase()) {
    // Return generic message to avoid email enumeration
    return res.json({ success: true, message: 'If the email matches the owner account, reset instructions have been issued.' });
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  db.owner.resetToken = resetCode;
  db.owner.resetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  saveDatabase(db);

  console.log(`[SECURITY NOTICE] Password reset code for ${db.owner.email}: ${resetCode}`);

  res.json({ 
    success: true, 
    message: 'Reset instructions dispatched.',
    // For local dev convenience preview
    previewCode: resetCode,
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing required reset fields' });
  }

  if (String(email).trim().toLowerCase() !== db.owner.email.toLowerCase()) {
    return res.status(400).json({ success: false, message: 'Invalid reset request' });
  }

  if (!db.owner.resetToken || db.owner.resetToken !== resetCode || (db.owner.resetExpires && db.owner.resetExpires < Date.now())) {
    return res.status(400).json({ success: false, message: 'Reset code is invalid or has expired' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  db.owner.salt = newSalt;
  db.owner.passwordHash = hashPassword(newPassword, newSalt);
  delete db.owner.resetToken;
  delete db.owner.resetExpires;
  saveDatabase(db);

  res.json({ success: true, message: 'Password has been securely updated. You may now log in.' });
});

// 3. Menu APIs
// Public: Read Menu
app.get('/api/menu', (req, res) => {
  res.json(db.menu);
});

// Protected: Create Dish
app.post('/api/menu', requireAdminAuth, (req, res) => {
  const newDish = {
    ...req.body,
    id: req.body.id || `dish-${Date.now()}`,
    isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
  };
  db.menu.unshift(newDish);
  saveDatabase(db);
  res.status(201).json(newDish);
});

// Protected: Update Dish
app.put('/api/menu/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = db.menu.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Dish not found' });
  }
  db.menu[index] = { ...db.menu[index], ...req.body };
  saveDatabase(db);
  res.json(db.menu[index]);
});

// Protected: Toggle Dish Availability
app.patch('/api/menu/:id/availability', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = db.menu.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Dish not found' });
  }
  db.menu[index].isAvailable = !db.menu[index].isAvailable;
  saveDatabase(db);
  res.json(db.menu[index]);
});

// Protected: Delete Dish
app.delete('/api/menu/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  db.menu = db.menu.filter((d) => d.id !== id);
  saveDatabase(db);
  res.json({ success: true, id });
});

// 4. Orders APIs
// Protected: List all customer orders
app.get('/api/orders', requireAdminAuth, (req, res) => {
  res.json(db.orders);
});

// Public: Guests submit new order
app.post('/api/orders', (req, res) => {
  const { items, customerName, customerPhone, deliveryType, address, notes, subtotal, total, deliveryFee, taxAndService } = req.body;
  if (!items || !items.length || !customerName || !customerPhone) {
    return res.status(400).json({ error: 'Missing mandatory order details' });
  }

  const orderCode = `NR-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    id: `ord-${Date.now()}`,
    code: orderCode,
    items,
    subtotal: subtotal || 0,
    deliveryFee: deliveryFee || 0,
    taxAndService: taxAndService || 0,
    total: total || 0,
    deliveryType: deliveryType || 'curated_pickup',
    guestName: customerName,
    phone: customerPhone,
    address,
    notes,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);
  saveDatabase(db);
  res.status(201).json(newOrder);
});

// Protected: Update Order Status
app.patch('/api/orders/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = db.orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  db.orders[index].status = status;
  saveDatabase(db);
  res.json(db.orders[index]);
});

// Protected: Delete Order
app.delete('/api/orders/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  db.orders = db.orders.filter((o) => o.id !== id);
  saveDatabase(db);
  res.json({ success: true, id });
});

// 5. Reservations APIs
// Protected: List all reservations
app.get('/api/reservations', requireAdminAuth, (req, res) => {
  res.json(db.reservations);
});

// Public: Guests create reservation
app.post('/api/reservations', (req, res) => {
  const { date, time, guests, seatingArea, guestName, phone, email, notes, occasion } = req.body;
  if (!date || !time || !guests || !guestName || !phone) {
    return res.status(400).json({ error: 'Missing mandatory reservation details' });
  }

  const code = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
  const newReservation = {
    id: `res-${Date.now()}`,
    code,
    date,
    time,
    guests: Number(guests),
    seatingArea: seatingArea || 'The Grand Hall',
    occasion,
    guestName,
    phone,
    email,
    notes,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  db.reservations.unshift(newReservation);
  saveDatabase(db);
  res.status(201).json(newReservation);
});

// Protected: Update Reservation Status
app.patch('/api/reservations/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = db.reservations.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  db.reservations[index].status = status;
  saveDatabase(db);
  res.json(db.reservations[index]);
});

// Protected: Delete Reservation
app.delete('/api/reservations/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  db.reservations = db.reservations.filter((r) => r.id !== id);
  saveDatabase(db);
  res.json({ success: true, id });
});

// 6. Settings APIs
// Public: Read Settings
app.get('/api/settings', (req, res) => {
  res.json(db.settings);
});

// Protected: Update Settings
app.put('/api/settings', requireAdminAuth, (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  res.json(db.settings);
});

// 7. Gallery APIs
app.get('/api/gallery', (req, res) => {
  res.json(db.gallery);
});

app.post('/api/gallery', requireAdminAuth, (req, res) => {
  const newItem = {
    ...req.body,
    id: req.body.id || `gal-${Date.now()}`,
  };
  db.gallery.unshift(newItem);
  saveDatabase(db);
  res.status(201).json(newItem);
});

app.delete('/api/gallery/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  db.gallery = db.gallery.filter((g) => g.id !== id);
  saveDatabase(db);
  res.json({ success: true, id });
});

// --- VITE DEV MIDDLEWARE / STATIC ASSETS MOUNTING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NOIR ROYALE server active at http://0.0.0.0:${PORT}`);
    console.log(`Owner account: ${db.owner.email}`);
  });
}

startServer();
