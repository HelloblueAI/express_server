const config = {
  port: process.env.PORT || 4000, // Changed from 3000 to 4000
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: [
    'https://helloblue.ai',
    'http://localhost:3000',
    'https://dolphin-app-dchbn.ondigitalocean.app/',
  ],
};

export default config;
