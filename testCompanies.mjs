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
import { Buffer } from 'buffer';
import cluster from 'cluster';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import LRUCache from 'lru-cache';
import os, { cpus } from 'os';
import pLimit from 'p-limit';
import path from 'path';
import { performance } from 'perf_hooks';
import pg from 'pg';
import { pipeline } from 'stream/promises';
import { setTimeout as sleep } from 'timers/promises';
import winston from 'winston';
import zlib from 'zlib';

dotenv.config();

const {
  DATABASE_URL,
  SERVER_URL,
  CONCURRENCY_LIMIT = String(Math.max(50, cpus().length * 4)),
  BATCH_SIZE = '1000',
  REQUEST_TIMEOUT = '8000',
  CACHE_ENABLED = 'true',
  CACHE_TTL = '86400000',
  MEMORY_CACHE_SIZE = '100000',
  LOG_LEVEL = 'info',
  USE_CLUSTERING = 'true',
  COMPRESSION_ENABLED = 'true',
  PERSISTENT_CONNECTIONS = 'true',
  DB_MAX_CONNECTIONS = '50',
} = process.env;

const numCPUs = cpus().length;
const optimalWorkers = Math.max(1, numCPUs - 1);

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const tmpDir = os.tmpdir();
const cacheDir = path.join(tmpDir, 'company-cache');
const useCache = CACHE_ENABLED === 'true';
if (useCache && !fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

const memoryCache = new LRUCache({
  max: parseInt(MEMORY_CACHE_SIZE, 10),
  ttl: parseInt(CACHE_TTL, 10),
  updateAgeOnGet: true,
  allowStale: true,
});

const { Pool } = pg;
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: parseInt(DB_MAX_CONNECTIONS, 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 30000,
  query_timeout: 30000,
  keepAlive: PERSISTENT_CONNECTIONS === 'true',
  keepAliveInitialDelayMillis: 10000,
});

const axiosInstance = axios.create({
  timeout: parseInt(REQUEST_TIMEOUT, 10),
  headers: {
    'Accept': 'application/json',
    'Connection': PERSISTENT_CONNECTIONS === 'true' ? 'keep-alive' : 'close',
    'Accept-Encoding': COMPRESSION_ENABLED === 'true' ? 'gzip, deflate' : '',
  },
  keepAlive: PERSISTENT_CONNECTIONS === 'true',
  maxSockets: parseInt(CONCURRENCY_LIMIT, 10) * 2,
  decompress: COMPRESSION_ENABLED === 'true',
});

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
});

function getCacheKey(name) {
  const normalizedName = name.toLowerCase().trim();
  return crypto.createHash('md5').update(normalizedName).digest('hex');
}

function getFromCache(name) {
  if (!useCache) return null;

  const cacheKey = getCacheKey(name);

  const memoryCachedData = memoryCache.get(cacheKey);
  if (memoryCachedData) {
    return memoryCachedData;
  }

  const cacheFile = path.join(cacheDir, `${cacheKey}.json`);
  if (fs.existsSync(cacheFile)) {
    try {
      const stats = fs.statSync(cacheFile);
      const fileAge = Date.now() - stats.mtimeMs;

      if (fileAge > parseInt(CACHE_TTL, 10)) {
        fs.unlink(cacheFile, () => {});
        return null;
      }

      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      memoryCache.set(cacheKey, cacheData);
      return cacheData;
    } catch (error) {
      logger.debug(`Cache read error for ${name}: ${error.message}`);
      return null;
    }
  }
  return null;
}

function saveToCache(name, data) {
  if (!useCache) return;

  const cacheKey = getCacheKey(name);
  memoryCache.set(cacheKey, data);
  const cacheFile = path.join(cacheDir, `${cacheKey}.json`);

  if (COMPRESSION_ENABLED === 'true') {
    const jsonString = JSON.stringify(data);
    const readableStream = fs.createReadStream(Buffer.from(jsonString));
    const writeStream = fs.createWriteStream(cacheFile);

    pipeline(
      readableStream,
      zlib.createGzip({ level: 1 }),
      writeStream,
    ).catch(() => {});
  } else {
    fs.writeFile(cacheFile, JSON.stringify(data), () => {});
  }
}

async function fetchCompanyData(name, attemptNumber = 1) {
  const cachedData = getFromCache(name);
  if (cachedData) {
    return { name, success: true, cached: true, data: cachedData };
  }

  try {
    const startTime = performance.now();
    const response = await axiosInstance.get(
      `${SERVER_URL}?name=${encodeURIComponent(name)}`,
    );

    const duration = performance.now() - startTime;

    if (response.data && response.data.error === 'Company not found') {
      throw new Error('Company not found');
    }

    saveToCache(name, response.data);

    return {
      name,
      success: true,
      cached: false,
      duration,
      data: response.data,
    };
  } catch (error) {
    if (attemptNumber < 3 && (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.response?.status >= 500
    )) {
      logger.debug(`Retrying ${name} (attempt ${attemptNumber + 1}): ${error.message}`);
      const backoffTime = Math.min(100 * Math.pow(2, attemptNumber), 2000);
      await sleep(backoffTime);
      return fetchCompanyData(name, attemptNumber + 1);
    }

    logger.error(`Failed to fetch data for ${name}: ${error.message}`);
    return {
      name,
      success: false,
      error: error.message,
    };
  }
}

async function processBatches(companyNames) {
  const batchSize = parseInt(BATCH_SIZE, 10);
  const maxConcurrency = parseInt(CONCURRENCY_LIMIT, 10);
  let currentConcurrency = Math.min(maxConcurrency, 20);
  let lastBatchDuration = 0;
  const limit = pLimit(currentConcurrency);
  const totalCompanies = companyNames.length;
  let processedCount = 0;
  let successCount = 0;
  let cacheHits = 0;
  let failedCompanies = [];
  const startTime = performance.now();
  let lastProgressUpdate = startTime;

  logger.info(`Processing ${totalCompanies} companies in batches of ${batchSize} with adaptive concurrency (max: ${maxConcurrency})...`);

  for (let i = 0; i < totalCompanies; i += batchSize) {
    const batchStart = performance.now();
    const batch = companyNames.slice(i, i + batchSize);
    const percentComplete = i / totalCompanies;

    if (percentComplete > 0) {
      const elapsedTime = batchStart - startTime;
      const estimatedTotalTime = elapsedTime / percentComplete;
      const remainingTime = estimatedTotalTime - elapsedTime;
      logger.info(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalCompanies / batchSize)} (${batch.length} companies) - Est. remaining: ${(remainingTime / 60000).toFixed(1)} minutes`);
    } else {
      logger.info(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalCompanies / batchSize)} (${batch.length} companies)...`);
    }

    if (lastBatchDuration > 0 && i > 0) {
      const companiesPerSecond = batchSize / (lastBatchDuration / 1000);
      if (companiesPerSecond > 10 && currentConcurrency < maxConcurrency) {
        currentConcurrency = Math.min(currentConcurrency + 5, maxConcurrency);
        limit.concurrency = currentConcurrency;
        logger.debug(`Increased concurrency to ${currentConcurrency} (${companiesPerSecond.toFixed(1)} companies/sec)`);
      } else if (companiesPerSecond < 2 && currentConcurrency > 5) {
        currentConcurrency = Math.max(currentConcurrency - 3, 5);
        limit.concurrency = currentConcurrency;
        logger.debug(`Decreased concurrency to ${currentConcurrency} (${companiesPerSecond.toFixed(1)} companies/sec)`);
      }
    }

    const promises = batch.map(name => limit(async () => {
      const result = await fetchCompanyData(name);
      processedCount++;

      if (result.success) {
        successCount++;
        if (result.cached) {
          cacheHits++;
        }
      } else {
        failedCompanies.push(name);
      }

      const now = performance.now();
      if (now - lastProgressUpdate > 5000 || processedCount === totalCompanies) {
        lastProgressUpdate = now;
        const progress = (processedCount / totalCompanies * 100).toFixed(1);
        const elapsedSec = (now - startTime) / 1000;
        const rate = processedCount / elapsedSec;
        logger.info(`Progress: ${processedCount}/${totalCompanies} (${progress}%) - Success: ${successCount}, Cached: ${cacheHits} - ${rate.toFixed(1)} companies/sec`);
      }

      return result;
    }));

    await Promise.all(promises);
    const batchDuration = performance.now() - batchStart;
    lastBatchDuration = batchDuration;
    logger.info(`Batch completed in ${(batchDuration / 1000).toFixed(2)}s - ${(batch.length / (batchDuration / 1000)).toFixed(2)} companies/second with concurrency ${currentConcurrency}`);
  }

  return {
    total: totalCompanies,
    successful: successCount,
    cached: cacheHits,
    failed: failedCompanies.length,
    failedCompanies,
    elapsedTime: performance.now() - startTime,
  };
}

async function testAllCompanies() {
  const useMultipleWorkers = USE_CLUSTERING === 'true' && optimalWorkers > 1;

  if (useMultipleWorkers && cluster.isPrimary) {
    await handlePrimaryProcess();
  } else if (useMultipleWorkers && cluster.isWorker) {
    await handleWorkerProcess();
  } else {
    await handleSingleProcess();
  }
}

async function handlePrimaryProcess() {
  logger.info(`Starting multi-core processing with ${optimalWorkers} workers...`);
  const startTime = performance.now();
  const companyNames = await getAllCompanyNames();

  if (!companyNames) return;

  const totalCompanies = companyNames.length;
  const companiesPerWorker = Math.ceil(totalCompanies / optimalWorkers);
  const workerResults = [];
  let activeWorkers = 0;

  for (let i = 0; i < optimalWorkers; i++) {
    const startIndex = i * companiesPerWorker;
    const endIndex = Math.min(startIndex + companiesPerWorker, totalCompanies);

    if (startIndex >= totalCompanies) continue;

    const worker = cluster.fork();
    activeWorkers++;
    const workerCompanies = companyNames.slice(startIndex, endIndex);

    worker.on('message', (message) => {
      if (message.type === 'result') {
        workerResults.push(message.data);
        logger.info(`Worker ${worker.id} completed ${message.data.total} companies: ${message.data.successful} successful, ${message.data.cached} cached, ${message.data.failed} failed`);
      }
    });

    worker.on('exit', () => {
      activeWorkers--;
      if (activeWorkers === 0) {
        compileResults(workerResults, startTime);
      }
    });

    worker.send({ type: 'companies', data: workerCompanies });
  }
}

async function handleWorkerProcess() {
  let companiesToProcess = [];

  process.on('message', async (message) => {
    if (message.type === 'companies') {
      companiesToProcess = message.data;
      logger.info(`Worker ${cluster.worker.id} received ${companiesToProcess.length} companies to process`);
      const results = await processBatches(companiesToProcess);

      if (process.send) {
        process.send({ type: 'result', data: results });
      }

      process.exit(0);
    }
  });
}

async function handleSingleProcess() {
  const startTime = performance.now();
  logger.info('Starting to test companies in single process mode...');

  try {
    const companyNames = await getAllCompanyNames();
    if (!companyNames) return;
    const results = await processBatches(companyNames);
    logFinalResults(results, startTime);
  } catch (err) {
    logger.error('Error during test:', err);
  } finally {
    await pool.end();
  }
}

async function getAllCompanyNames() {
  try {
    const client = await pool.connect();
    logger.info('Connected to database');
    const res = await client.query('SELECT company_name FROM companies ORDER BY company_name');
    client.release();
    logger.info(`Found ${res.rows.length} companies in database`);
    return res.rows.map(row => row.company_name);
  } catch (err) {
    logger.error('Error querying the database:', err);
    return null;
  }
}

function compileResults(workerResults, startTime) {
  const combined = {
    total: 0,
    successful: 0,
    cached: 0,
    failed: 0,
    failedCompanies: [],
  };

  for (const result of workerResults) {
    combined.total += result.total;
    combined.successful += result.successful;
    combined.cached += result.cached;
    combined.failed += result.failed;
    combined.failedCompanies = combined.failedCompanies.concat(result.failedCompanies);
  }

  const totalDuration = performance.now() - startTime;
  logger.info('==== FINAL TEST RESULTS (Multi-core) ====');
  logger.info(`Total time: ${(totalDuration / 1000).toFixed(2)} seconds`);
  logger.info(`Companies tested: ${combined.total}`);
  logger.info(`Successful: ${combined.successful} (${(combined.successful / combined.total * 100).toFixed(1)}%)`);
  logger.info(`Cached responses: ${combined.cached} (${(combined.cached / combined.total * 100).toFixed(1)}%)`);
  logger.info(`Failed: ${combined.failed} (${(combined.failed / combined.total * 100).toFixed(1)}%)`);

  if (combined.failed > 0) {
    logger.info(`Failed companies: ${combined.failedCompanies.length > 20 ?
      combined.failedCompanies.slice(0, 20).join(', ') + ` and ${combined.failedCompanies.length - 20} more...` :
      combined.failedCompanies.join(', ')}`);

    const failedFile = path.join(logDir, `failed_companies_${new Date().toISOString().replace(/:/g, '-')}.txt`);
    fs.writeFileSync(failedFile, combined.failedCompanies.join('\n'));
    logger.info(`Failed companies list written to ${failedFile}`);
  } else {
    logger.info('All companies fetched successfully!');
  }

  process.exit(0);
}

function logFinalResults(results, startTime) {
  const totalDuration = performance.now() - startTime;
  logger.info('==== TEST RESULTS ====');
  logger.info(`Total time: ${(totalDuration / 1000).toFixed(2)} seconds`);
  logger.info(`Companies tested: ${results.total}`);
  logger.info(`Successful: ${results.successful} (${(results.successful / results.total * 100).toFixed(1)}%)`);
  logger.info(`Cached responses: ${results.cached} (${(results.cached / results.total * 100).toFixed(1)}%)`);
  logger.info(`Failed: ${results.failed} (${(results.failed / results.total * 100).toFixed(1)}%)`);

  if (results.failed > 0) {
    logger.info(`Failed companies: ${results.failedCompanies.length > 20 ?
      results.failedCompanies.slice(0, 20).join(', ') + ` and ${results.failedCompanies.length - 20} more...` :
      results.failedCompanies.join(', ')}`);

    const failedFile = path.join(logDir, `failed_companies_${new Date().toISOString().replace(/:/g, '-')}.txt`);
    fs.writeFileSync(failedFile, results.failedCompanies.join('\n'));
    logger.info(`Failed companies list written to ${failedFile}`);
  } else {
    logger.info('All companies fetched successfully!');
  }
}

async function getCompanyPhoneNumber(companyName) {
  logger.info(`Fetching phone number for "${companyName}"`);

  try {
    const apiResult = await fetchCompanyData(companyName);

    if (apiResult.success && apiResult.data?.phone_number) {
      const source = apiResult.cached ? 'cache' : 'API';
      logger.info(`Phone number for "${companyName}" (from ${source}): ${apiResult.data.phone_number}`);
      return;
    }

    const client = await pool.connect();
    await client.query('PREPARE get_phone AS SELECT phone_number FROM companies WHERE LOWER(company_name) = LOWER($1)');
    const res = await client.query('EXECUTE get_phone($1)', [companyName]);
    client.release();

    if (res.rows.length > 0 && res.rows[0].phone_number) {
      logger.info(`Phone number for "${companyName}" (from database): ${res.rows[0].phone_number}`);
    } else {
      logger.info(`No phone number found for "${companyName}" in API or database.`);
    }
  } catch (err) {
    logger.error(`Error getting phone number for "${companyName}": ${err.message}`);
  } finally {
    await pool.end();
  }
}

const [, , command, ...args] = process.argv;

if (!command) {
  console.log(`
Usage:
  node testCompanies.mjs testAll                   - Test all companies in the database
  node testCompanies.mjs getPhone <companyName>    - Get phone number for a specific company
  `);
  process.exit(0);
}

if (command === 'testAll') {
  testAllCompanies();
} else if (command === 'getPhone' && args.length > 0) {
  getCompanyPhoneNumber(args.join(' '));
} else {
  logger.error('Invalid command or missing company name. Use "testAll" to test all companies or "getPhone <companyName>" to get a phone number.');
  process.exit(1);
}
