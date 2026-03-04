const crypto = require('crypto');
const { log } = require('../config/logging');
const {
  getSingleUserConfig,
  isSingleUserModeEnabled,
} = require('./singleUserMode');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function runPreflightChecks() {
  const mandatoryVars = {
    'SPARKY_FITNESS_DB_HOST': 'Required for DB connection. Use "localhost" for local development, or "sparkyfitness-db" for Docker deployments.',
    'SPARKY_FITNESS_DB_NAME': 'Required for database connection. Default is often "sparkyfitness_db".',
    'SPARKY_FITNESS_DB_USER': 'Required for database connection. This is super user with default is often "sparky".',
    'SPARKY_FITNESS_DB_PASSWORD': 'Required for database connection.',
    'SPARKY_FITNESS_APP_DB_USER': 'Required for database connection. This is regular user without any admin access and default is often "sparkyapp".',
    'SPARKY_FITNESS_APP_DB_PASSWORD': 'Required for database connection.',
    'SPARKY_FITNESS_FRONTEND_URL': 'Required for CORS security. E.g. https://sparkyfitness.domain.com  or http://localhost:8080 for development.',
    'SPARKY_FITNESS_API_ENCRYPTION_KEY': 'Must be persistent to decrypt database data. Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  };

  const missingMandatory = Object.keys(mandatoryVars).filter(varName => !process.env[varName]);

  if (missingMandatory.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'FATAL: Missing required environment variables!');
    console.error('The server cannot start without the following settings:\n');

    missingMandatory.forEach(varName => {
      console.error(`\x1b[33m${varName}\x1b[0m: ${mandatoryVars[varName]}`);
    });

    console.error('\nUpdate your .env file and restart the server.\n');
    log('error', `FATAL: Missing mandatory env vars: ${missingMandatory.join(', ')}`);
    process.exit(1);
  }

  // Handle BETTER_AUTH_SECRET as a soft requirement
  if (!process.env.BETTER_AUTH_SECRET) {
    const generatedSecret = crypto.randomBytes(32).toString('hex');
    process.env.BETTER_AUTH_SECRET = generatedSecret;

    console.warn('\x1b[33m%s\x1b[0m', 'WARNING: BETTER_AUTH_SECRET is not set!');
    console.warn('A temporary secret has been generated to allow the server to start.');
    console.warn('IMPORTANT: Please set BETTER_AUTH_SECRET in your .env file to ensure user sessions remain valid across server restarts.');
    console.warn('------------------------------------------------------------------\n');

    log('warn', 'BETTER_AUTH_SECRET was missing and auto-generated.');
  }

  if (isSingleUserModeEnabled()) {
    const singleUser = getSingleUserConfig();
    const singleUserErrors = [];
    const rawRole = process.env.SPARKY_FITNESS_SINGLE_USER_ROLE?.trim().toLowerCase();

    if (!UUID_PATTERN.test(singleUser.id)) {
      singleUserErrors.push('SPARKY_FITNESS_SINGLE_USER_ID must be a valid UUID.');
    }

    if (!EMAIL_PATTERN.test(singleUser.email)) {
      singleUserErrors.push('SPARKY_FITNESS_SINGLE_USER_EMAIL must be a valid email address.');
    }

    if (rawRole && !['admin', 'user'].includes(rawRole)) {
      singleUserErrors.push("SPARKY_FITNESS_SINGLE_USER_ROLE must be either 'admin' or 'user'.");
    }

    if (singleUserErrors.length > 0) {
      console.error('\x1b[31m%s\x1b[0m', 'FATAL: Invalid single-user mode configuration!');
      singleUserErrors.forEach((message) => console.error(`- ${message}`));
      process.exit(1);
    }

    log('info', `Single-user mode enabled for ${singleUser.email} (${singleUser.id}).`);
  }

  log('info', 'Environment variable pre-flight checks passed successfully.');
}

module.exports = {
  runPreflightChecks,
};
