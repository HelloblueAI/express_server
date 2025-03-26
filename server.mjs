//  Copyright (c) 2025, Helloblue Inc.
//  Open-Source Community Edition

//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to use,
//  copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
//  the Software, subject to the following conditions:

//  1. The above copyright notice and this permission notice shall be included in
//     all copies or substantial portions of the Software.
//  2. Contributions to this project are welcome and must adhere to the project's
//     contribution guidelines.
//  3. The name "Helloblue Inc." and its contributors may not be used to endorse
//     or promote products derived from this software without prior written consent.

//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.

import express from 'express';
import pg from 'pg';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './logger.mjs';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Configure rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many API requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const dbTestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many database test requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global rate limiter to all requests
app.use(globalLimiter);

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to prevent breaking existing functionality
  crossOriginEmbedderPolicy: false, // Disable COEP to prevent breaking existing functionality
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
}));

app.options('*', cors());

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/test-db', dbTestLimiter, async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connection is successful', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', detail: error.message });
  }
});

app.get('/api/test-companies', apiLimiter, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies LIMIT 10');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies', detail: error.message });
  }
});

app.get('/api/company', apiLimiter, async (req, res) => {
  const { name } = req.query;
  
  // Basic input validation
  if (!name || typeof name !== 'string' || name.length > 100) {
    return res.status(400).json({ 
      error: 'Invalid company name. Please provide a valid company name (max 100 characters).' 
    });
  }

  // Sanitize input - remove any potentially dangerous characters
  const sanitizedName = name.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
  if (!sanitizedName) {
    return res.status(400).json({ 
      error: 'Invalid company name. Please provide a valid company name.' 
    });
  }

  try {
    const queryText = 'SELECT * FROM companies WHERE LOWER(company_name) = LOWER($1)';
    const { rows } = await pool.query(queryText, [sanitizedName]);

    if (rows.length > 0) {
      return res.json({
        company_name: rows[0].company_name,
        phone_number: rows[0].phone_number,
        url: rows[0].url,
        email: rows[0].email,
      });
    }
    return res.status(404).json({ error: 'Company not found.' });
  } catch (error) {
    logger.error('Database query error:', error);
    return res.status(500).json({
      error: 'Internal server error, could not fetch company data.',
      ...(process.env.NODE_ENV === 'development' ? { detail: error.message } : {}),
    });
  }
});

// Standardize error handling
app.use((err, req, res, _next) => {
  logger.error('Internal server error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { detail: err.message } : {}),
  });
});

const port = process.env.PORT || 4002;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
