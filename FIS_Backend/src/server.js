import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { initializeDatabase, pool } from './db.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'nara-secret-key';

const allowedOrigins = new Set([
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5175'
].filter(Boolean));

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['POST', 'GET', 'PATCH', 'DELETE'],
  credentials: false
}));
app.use(express.json({ limit: '20kb' }));

app.use('/api/contact', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use('/api/register', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
}));

const registrationSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  contact: z.string().regex(/^\d{10}$/, 'Phone number must contain exactly 10 digits.'),
  password: z.string().min(5).regex(/[A-Za-z]/, 'Password must be at least 5 characters and include a letter.'),
  confirmPassword: z.string().min(5)
}).superRefine((data, context) => {
  if (data.password !== data.confirmPassword) {
    context.addIssue({
      code: 'custom',
      path: ['confirmPassword'],
      message: 'Passwords do not match.'
    });
  }
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(5)
});

const inquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  organization: z.string().trim().max(160).optional().or(z.literal('')),
  department: z.string().trim().min(2).max(80),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(5000)
});

const adminUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'archived']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  adminNote: z.string().trim().max(2000).optional().or(z.literal(''))
}).refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

const newsSchema = z.object({
  title: z.string().trim().min(3).max(220),
  category: z.string().trim().min(2).max(60),
  content: z.string().trim().min(10).max(5000),
  imageUrl: z.string().trim().url().max(2000).optional().or(z.literal('')),
  publishedAt: z.string().datetime().optional()
});

const newsUpdateSchema = newsSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
const hashPassword = (password, salt = randomBytes(16).toString('hex')) => {
  const passwordHash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${passwordHash}`;
};

const verifyPassword = (password, storedHash) => {
  if (!storedHash || typeof storedHash !== 'string') {
    return false;
  }

  const [salt, hash] = storedHash.split(':');

  if (!salt || !hash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, 64).toString('hex');
  const normalizedHash = Buffer.from(hash, 'hex');
  const normalizedDerivedHash = Buffer.from(derivedHash, 'hex');

  if (normalizedHash.length !== normalizedDerivedHash.length) {
    return false;
  }

  return timingSafeEqual(normalizedHash, normalizedDerivedHash);
};

const sanitizeUser = (user) => ({
  id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  contact: user.contact,
  role: user.role || 'user',
  created_at: user.created_at,
});

async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nara.lk';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [adminEmail]
  );

  if (existing.rowCount > 0) {
    await pool.query(
      "UPDATE users SET role = 'admin' WHERE email = $1 AND role IS DISTINCT FROM 'admin'",
      [adminEmail]
    );
    return;
  }

  const passwordHash = hashPassword(adminPassword);

  await pool.query(
    `INSERT INTO users
       (first_name, last_name, email, contact, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)`,
    ['System', 'Administrator', adminEmail, '0000000000', passwordHash, 'admin']
  );
}

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ success: true, message: 'Backend is running' });
});

app.get('/api/news', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 6, 1), 24);
    const result = await pool.query(
      `SELECT id, title, category, content, image_url, published_at, created_at, updated_at
       FROM news_events ORDER BY published_at DESC LIMIT $1`,
      [limit]
    );
    res.json({ success: true, news: result.rows });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/news', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, title, category, content, image_url, published_at, created_at, updated_at
       FROM news_events ORDER BY published_at DESC`
    );
    res.json({ success: true, news: result.rows });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/news', async (req, res, next) => {
  try {
    const news = newsSchema.parse(req.body);
    const result = await pool.query(
      `INSERT INTO news_events (title, category, content, image_url, published_at)
       VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, NOW()))
       RETURNING id, title, category, content, image_url, published_at, created_at, updated_at`,
      [news.title, news.category, news.content, news.imageUrl || null, news.publishedAt || null]
    );
    res.status(201).json({ success: true, news: result.rows[0] });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, message: 'Please check the news fields.', errors: error.issues });
    next(error);
  }
});

app.patch('/api/admin/news/:id', async (req, res, next) => {
  try {
    const newsId = z.coerce.number().int().positive().parse(req.params.id);
    const update = newsUpdateSchema.parse(req.body);
    const fields = [];
    const values = [];
    const columnMap = { title: 'title', category: 'category', content: 'content', imageUrl: 'image_url', publishedAt: 'published_at' };

    Object.entries(update).forEach(([key, value]) => {
      values.push(value || (key === 'imageUrl' ? null : value));
      fields.push(`${columnMap[key]} = $${values.length}${key === 'publishedAt' ? '::timestamptz' : ''}`);
    });
    values.push(newsId);
    const result = await pool.query(
      `UPDATE news_events SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, title, category, content, image_url, published_at, created_at, updated_at`,
      values
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'News item not found.' });
    res.json({ success: true, news: result.rows[0] });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, message: 'Invalid news update.', errors: error.issues });
    next(error);
  }
});

app.delete('/api/admin/news/:id', async (req, res, next) => {
  try {
    const newsId = z.coerce.number().int().positive().parse(req.params.id);
    const result = await pool.query('DELETE FROM news_events WHERE id = $1 RETURNING id', [newsId]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'News item not found.' });
    res.json({ success: true, message: 'News item deleted.' });
  } catch (error) {
    next(error);
app.post('/api/register', async (req, res, next) => {
  try {
    const registration = registrationSchema.parse(req.body);
    const email = registration.email.toLowerCase();

    const passwordHash = hashPassword(registration.password);

    await pool.query(
      `INSERT INTO users
       (first_name, last_name, email, contact, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'user')`,
      [
        registration.firstName,
        registration.lastName,
        email,
        registration.contact,
        passwordHash
      ]
    );

    return res.status(201).json({ message: 'Account created successfully.' });
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstIssue = error.issues[0];
      const message = firstIssue?.message === 'Invalid input: expected string, received undefined'
        ? 'All fields are required.'
        : firstIssue?.message || 'Please check the submitted fields.';

      return res.status(400).json({ message });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    return next(error);
  }
});

app.post('/api/login', async (req, res, next) => {
  try {
    const login = loginSchema.parse(req.body);
    const email = login.email.toLowerCase();

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user || !verifyPassword(login.password, user.password_hash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        first_name: user.first_name,
        last_name: user.last_name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await pool.query(
      'UPDATE users SET token = $1 WHERE id = $2',
      [token, user.id]
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizeUser({ ...user, role: user.role || 'user' })
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email and password.'
      });
    }

    return next(error);
  }
});

app.post('/api/contact', async (req, res, next) => {
  try {
    const inquiry = inquirySchema.parse(req.body);

    const result = await pool.query(
      `INSERT INTO contact_inquiries
       (full_name, email, phone, organization, department, subject, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [
        inquiry.fullName,
        inquiry.email,
        inquiry.phone || null,
        inquiry.organization || null,
        inquiry.department,
        inquiry.subject,
        inquiry.message
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Your inquiry was submitted successfully.',
      inquiry: result.rows[0]
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Please check the submitted fields.',
        errors: error.issues
      });
    }

    next(error);
  }
});

app.get('/api/admin/inquiries', async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' && req.query.status !== 'all' ? req.query.status : null;
    const priority = typeof req.query.priority === 'string' && req.query.priority !== 'all' ? req.query.priority : null;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const values = [];
    const filters = [];

    if (status) {
      values.push(status);
      filters.push(`status = $${values.length}`);
    }
    if (priority) {
      values.push(priority);
      filters.push(`priority = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      filters.push(`(full_name ILIKE $${values.length} OR email ILIKE $${values.length} OR subject ILIKE $${values.length} OR message ILIKE $${values.length})`);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const [inquiriesResult, statsResult] = await Promise.all([
      pool.query(
        `SELECT id, full_name, email, phone, organization, department, subject, message,
                status, priority, admin_note, created_at, updated_at
         FROM contact_inquiries ${where} ORDER BY created_at DESC`,
        values
      ),
      pool.query(`
        SELECT COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'new')::int AS new,
          COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
          COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
          COUNT(*) FILTER (WHERE priority IN ('high', 'urgent'))::int AS attention
        FROM contact_inquiries
      `)
    ]);

    res.json({ success: true, inquiries: inquiriesResult.rows, stats: statsResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/admin/inquiries/:id', async (req, res, next) => {
  try {
    const inquiryId = z.coerce.number().int().positive().parse(req.params.id);
    const update = adminUpdateSchema.parse(req.body);
    const fields = [];
    const values = [];

    if (update.status) {
      values.push(update.status);
      fields.push(`status = $${values.length}`);
    }
    if (update.priority) {
      values.push(update.priority);
      fields.push(`priority = $${values.length}`);
    }
    if (update.adminNote !== undefined) {
      values.push(update.adminNote || null);
      fields.push(`admin_note = $${values.length}`);
    }
    values.push(inquiryId);

    const result = await pool.query(
      `UPDATE contact_inquiries SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, status, priority, admin_note, updated_at`,
      values
    );

    if (!result.rowCount) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    res.json({ success: true, inquiry: result.rows[0] });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Invalid inquiry update.', errors: error.issues });
    }
    next(error);
  }
});

app.delete('/api/admin/inquiries/:id', async (req, res, next) => {
  try {
    const inquiryId = z.coerce.number().int().positive().parse(req.params.id);
    const result = await pool.query('DELETE FROM contact_inquiries WHERE id = $1 RETURNING id', [inquiryId]);

    if (!result.rowCount) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    res.json({ success: true, message: 'Inquiry deleted.' });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Unable to complete the request.'
  });
});

const port = process.env.PORT || 5000;

initializeDatabase()
  .then(async () => {
    await ensureAdminUser();
    app.listen(port, () => {
      console.log(`NARA backend running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to initialize the database.', error);
    process.exit(1);
  });