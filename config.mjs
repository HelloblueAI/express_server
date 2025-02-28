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

import os from 'os';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';
const isDev = NODE_ENV === 'development';
const isTest = NODE_ENV === 'test';

const cpuCount = os.cpus().length;
const totalMemory = Math.floor(os.totalmem() / (1024 * 1024 * 1024));
const freeMemory = Math.floor(os.freemem() / (1024 * 1024 * 1024));

const DEFAULT_POOL_SIZE = Math.max(4, Math.min(cpuCount, 20));
const DEFAULT_CONCURRENCY = Math.max(10, Math.min(cpuCount * 5, 50));
const DEFAULT_CACHE_SIZE = Math.max(100, Math.min(freeMemory * 100, 10000));

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}


const config = {

  server: {
    port: parseInt(process.env.PORT, 10) || 4002,
    host: process.env.HOST || '0.0.0.0',
    timeout: parseInt(process.env.SERVER_TIMEOUT, 10) || 30000,
    keepAliveTimeout: parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10) || 65000,
    trustProxy: process.env.TRUST_PROXY === 'true',
  },

  database: {
    url: process.env.DATABASE_URL,
    poolSize: parseInt(process.env.DB_POOL_SIZE, 10) || DEFAULT_POOL_SIZE,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 10000,
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT, 10) || 30000,
    ssl: {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    },
  },

  api: {
    baseUrl: process.env.API_BASE_URL || 'https://dolphin-app-dchbn.ondigitalocean.app/api',
    timeout: parseInt(process.env.API_TIMEOUT, 10) || 5000,
    retries: parseInt(process.env.API_RETRIES, 10) || 3,
    concurrency: parseInt(process.env.API_CONCURRENCY, 10) || DEFAULT_CONCURRENCY,
    batchSize: parseInt(process.env.API_BATCH_SIZE, 10) || 100,
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60000,
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },
  },

  cors: {
    origins: process.env.CORS_ORIGINS ?
      process.env.CORS_ORIGINS.split(',') :
      [
        'https://helloblue.ai',
        'http://localhost:3001',
        'https://dolphin-app-dchbn.ondigitalocean.app',
      ],
    methods: process.env.CORS_METHODS ?
      process.env.CORS_METHODS.split(',') :
      ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS ?
      process.env.CORS_ALLOWED_HEADERS.split(',') :
      ['Content-Type', 'Authorization'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    type: process.env.CACHE_TYPE || 'memory',
    ttl: parseInt(process.env.CACHE_TTL, 10) || 3600,
    size: parseInt(process.env.CACHE_SIZE, 10) || DEFAULT_CACHE_SIZE,
    redisUrl: process.env.REDIS_URL,
  },

  logging: {
    level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
    format: process.env.LOG_FORMAT || 'json',
    directory: logDir,
    maxFiles: parseInt(process.env.LOG_MAX_FILES, 10) || 5,
    maxSize: parseInt(process.env.LOG_MAX_SIZE, 10) || 10485760,
  },


  security: {
    helmet: process.env.USE_HELMET !== 'false',
    rateLimit: process.env.USE_RATE_LIMIT !== 'false',
    corsEnabled: process.env.CORS_ENABLED !== 'false',
  },

  features: {
    caching: process.env.FEATURE_CACHING !== 'false',
    clustering: process.env.FEATURE_CLUSTERING !== 'false' && cpuCount > 1,
    compression: process.env.FEATURE_COMPRESSION !== 'false',
    metrics: process.env.FEATURE_METRICS === 'true',
  },

  env: {
    nodeEnv: NODE_ENV,
    isProd,
    isDev,
    isTest,
    systemInfo: {
      cpuCount,
      totalMemory,
      freeMemory,
      platform: os.platform(),
      release: os.release(),
    },
  },
};

config.get = function(path, defaultValue) {
  const parts = path.split('.');
  let current = config;

  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
  }

  return current !== undefined ? current : defaultValue;
};

export default config;
