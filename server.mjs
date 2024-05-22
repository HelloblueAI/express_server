import express from 'express';
import pg from 'pg';
import cors from 'cors';
import helmet from 'helmet';
import config from './config.mjs';
import logger from './logger.mjs';

// Initialize Express and PostgreSQL pool
const app = express();
const pool = new pg.Pool({ connectionString: config.databaseUrl });

// Middleware
app.use(helmet()); // Adds security-related headers
app.use(cors({ origin: config.corsOrigins, optionsSuccessStatus: 200 }));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Company API route
app.get('/api/company', async (req, res) => { // Removed `next`
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
app.use((err, req, res) => { // Removed `next`
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
