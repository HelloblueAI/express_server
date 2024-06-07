const config = {
  port: process.env.PORT || 4002,
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: [
    'https://helloblue.ai',
    'http://localhost:3001',
    'https://dolphin-app-dchbn.ondigitalocean.app',
  ],
};

export default config;
