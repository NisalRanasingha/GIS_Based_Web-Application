import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { initializeDatabase, pool } from './db.js';
import 'dotenv/config';

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
  methods: ['POST', 'GET'],
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

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Unable to submit the inquiry.'
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