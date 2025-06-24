// Production deployment configuration for LoanSphere
// This ensures proper environment variable handling and server startup

const requiredEnvVars = [
  'VITE_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'DATABASE_URL'
];

const optionalEnvVars = [
  'NODE_ENV',
  'JWT_SECRET',
  'SESSION_SECRET'
];

// Check for required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  console.error('Please configure these variables in your deployment environment');
  process.exit(1);
}

// Set default values for optional variables
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'clerk-auth-fallback-' + Date.now();
}

if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'clerk-session-fallback-' + Date.now();
}

console.log('Production configuration loaded successfully');
console.log('Environment:', process.env.NODE_ENV);
console.log('Clerk authentication configured');
console.log('Database URL configured:', !!process.env.DATABASE_URL);

module.exports = {
  requiredEnvVars,
  optionalEnvVars
};