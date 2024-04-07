import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import winston from 'winston';

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

const app = express();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configure CORS to allow requests from specified origins
const corsOptions = {
  origin(origin, callback) { // Using method shorthand and naming the function
    // List of allowed origins
    const allowedOrigins = ['https://helloblue.ai', 'http://localhost:3000'];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200, // Added trailing comma
};

// Enable CORS with the above options
app.use(cors(corsOptions));

// Enable built-in body parser for JSON
app.use(express.json());

// Define the root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Define a route to fetch company data
app.get('/api/company', async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Please provide a company name.' });
  }

  try {
    const queryText = 'SELECT * FROM companies WHERE LOWER(company_name) = LOWER($1)';
    const queryValues = [name];
    const { rows } = await pool.query(queryText, queryValues);

    if (rows.length > 0) {
      const response = {
        company_name: rows[0].company_name,
        phone_number: rows[0].phone_number,
        url: rows[0].url,
        email: rows[0].email,
      };
      res.json(response);
    } else {
      res.status(404).json({ error: 'Company not found.' });
    }
  } catch (error) {
    logger.error('Database query error:', error);
    res.status(500).json({
      error: 'Internal server error, could not fetch company data.',
      ...(process.env.NODE_ENV === 'development' ? { detail: error.message } : {}),
    });
  }
  // This return is to satisfy ESLint's consistent-return rule.
  return undefined;
});

// Start the server on the specified port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
