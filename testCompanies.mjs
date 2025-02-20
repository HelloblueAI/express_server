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

import axios from 'axios';
import dotenv from 'dotenv';
import pLimit from 'p-limit';
import pg from 'pg';
import winston from 'winston';

dotenv.config();

const {
  DATABASE_URL,
  SERVER_URL,
  CONCURRENCY_LIMIT,
} = process.env;

const { Pool } = pg;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});



async function fetchCompanyData(name) {
  try {
    const response = await axios.get(`${SERVER_URL}?name=${encodeURIComponent(name)}`, { timeout: 5000 });
    if (response.data.error === 'Company not found') {
      throw new Error('Company not found');
    }
    return { name, success: true };
  } catch (error) {
    logger.error(`Failed to fetch data for ${name}: ${error.message}`);
    return { name, success: false };
  }
}

async function testAllCompanies() {
  logger.info('Starting to test companies...');
  try {
    const client = await pool.connect();
    logger.info('Connected to database');
    const res = await client.query('SELECT company_name FROM companies');
    client.release();
    logger.info('Fetched company names from database');

    const companyNames = res.rows.map(row => row.company_name);
    logger.info(`Found ${companyNames.length} companies`);

    const limit = pLimit(Number(CONCURRENCY_LIMIT));
    let processedCount = 0;
    const promises = companyNames.map(name => limit(async () => {
      const result = await fetchCompanyData(name);
      processedCount += 1;
      if (processedCount % 100 === 0) {
        logger.info(`Processed ${processedCount}/${companyNames.length} companies`);
      }
      return result;
    }));

    const results = await Promise.all(promises);

    const failedCompanies = results.filter(result => !result.success).map(result => result.name);

    if (failedCompanies.length) {
      logger.info(`Failed to fetch data for ${failedCompanies.length} companies:`);
      logger.info(failedCompanies.join('\n'));
    } else {
      logger.info('All companies fetched successfully!');
    }
  } catch (err) {
    logger.error('Error querying the database:', err.message);
  }
}

async function getCompanyPhoneNumber(companyName) {
  logger.info(`Fetching phone number for ${companyName}`);
  try {
    const client = await pool.connect();
    const queryText = 'SELECT phone_number FROM companies WHERE LOWER(company_name) = LOWER($1)';
    const res = await client.query(queryText, [companyName]);
    client.release();

    if (res.rows.length > 0) {
      logger.info(`Phone number for ${companyName}: ${res.rows[0].phone_number}`);
    } else {
      logger.info(`Company ${companyName} not found.`);
    }
  } catch (err) {
    logger.error('Error querying the database:', err.message);
  }
}


const [, , command, companyName] = process.argv;

if (command === 'testAll') {
  testAllCompanies();
} else if (command === 'getPhone' && companyName) {
  getCompanyPhoneNumber(companyName);
} else {
  logger.error('Invalid command or missing company name. Use "testAll" to test all companies or "getPhone <companyName>" to get a phone number.');
}
