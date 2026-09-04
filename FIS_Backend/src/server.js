import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { initializeDatabase, pool } from './db.js';
import 'dotenv/config';

const app = express();

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

const inquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  organization: z.string().trim().max(160).optional().or(z.literal('')),
  department: z.string().trim().min(2).max(80),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(5000)
});

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ success: true, message: 'Backend is running' });
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
  .then(() => {
    app.listen(port, () => {
      console.log(`NARA backend running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to initialize the database.', error);
    process.exit(1);
  });