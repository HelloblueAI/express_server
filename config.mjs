import 'dotenv/config';

const config = {
  port: process.env.PORT || 8080,
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: [
    'https://helloblue.ai',
    'http://localhost:3000',
    'https://dolphin-app-dchbn.ondigitalocean.app',
  ],
};

export default config;
