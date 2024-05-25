import express from 'express';
import pg from 'pg';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import config from './config.mjs';
import logger from './logger.mjs';

// Load environment variables
dotenv.config();

// Initialize Express and PostgreSQL pool
const app = express();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Middleware
app.use(helmet()); // Adds security-related headers
app.use(cors({ origin: config.corsOrigins, optionsSuccessStatus: 200 }));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Test Database Connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connection is successful', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', detail: error.message });
  }
});

// Test Fetch Companies
app.get('/api/test-companies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies LIMIT 10');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies', detail: error.message });
  }
});

// Company API route
app.get('/api/company', async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Please provide a company name.' });
  }

  try {
    const queryText = 'SELECT * FROM companies WHERE LOWER(company_name) = LOWER($1)';
    const { rows } = await pool.query(queryText, [name]);

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

// Global error handler
app.use((err, req, res, _next) => {
  logger.error('Internal server error:', err);
  res.status(500).json({
    error: 'Internal server error, could not fetch company data.',
    ...(process.env.NODE_ENV === 'development' ? { detail: err.message } : {}),
  });
});

// Start the server
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
