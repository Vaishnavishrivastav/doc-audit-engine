import express from 'express';
import multer from 'multer';
import cors from 'cors';
import Stripe from 'stripe';
import 'dotenv/config';
import { analyzeInvoice } from './analyzeInvoice.js';

const app = express();
const upload = multer({
  storage: multer.memoryStorage(), // keep files in memory, never touch disk
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB cap
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are accepted'));
    }
    cb(null, true);
  },
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Track which Stripe sessions have already been used (prevents replay)
const usedSessions = new Set();

app.use(cors());
app.use(express.json());

// Health check — useful for uptime checks / demo day
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'doc-audit-engine' });
});

// Create a Stripe Checkout session for a single invoice audit ($0.50)
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Invoice Audit — SmartAudit AI',
              description: 'AI-powered analysis of one invoice document',
            },
            unit_amount: 50, // $0.50 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || process.env.FRONTEND_URL}/results?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || process.env.FRONTEND_URL}/?cancelled=true`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe session creation failed:', err);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});

// Core endpoint: POST a PDF, get back a structured audit report
// Now gated behind Stripe payment verification
app.post('/api/analyze-invoice', upload.single('invoice'), async (req, res) => {
  // --- Stripe payment gate ---
  const sessionId = req.body?.stripe_session_id || req.query?.stripe_session_id;
  if (!sessionId) {
    return res.status(402).json({ error: 'Payment required. No Stripe session ID provided.' });
  }
  if (usedSessions.has(sessionId)) {
    return res.status(402).json({ error: 'This payment session has already been used.' });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed.' });
    }
  } catch (err) {
    return res.status(402).json({ error: 'Invalid payment session.' });
  }
  usedSessions.add(sessionId);
  // --- End Stripe gate ---

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Attach a PDF under field name "invoice".' });
  }

  try {
    const result = await analyzeInvoice(req.file.buffer);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Analysis failed:', err);
    res.status(500).json({ success: false, error: 'Failed to analyze document. Please try again.' });
  }
});

// Multer / generic error handler
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`doc-audit-engine API running on http://localhost:${PORT}`);
});
