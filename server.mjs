import express from 'express';
import pg from 'pg';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './logger.mjs';

dotenv.config();

const app = express();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(helmet());
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

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connection is successful', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', detail: error.message });
  }
});

app.get('/api/test-companies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies LIMIT 10');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies', detail: error.message });
  }
});

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


app.use((err, req, res, _next) => {
  logger.error('Internal server error:', err);
  res.status(500).json({
    error: 'Internal server error, could not fetch company data.',
    ...(process.env.NODE_ENV === 'development' ? { detail: err.message } : {}),
  });
});

const port = process.env.PORT || 4002;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
