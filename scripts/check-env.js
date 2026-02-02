#!/usr/bin/env node

/**
 * Environment Variables Checker
 * 
 * Verifies that all required environment variables are set for local development.
 * Run with: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

// Required environment variables
const REQUIRED_VARS = {
  client: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  ],
  server: [
    'OPENAI_API_KEY',
    'COLLEGE_API_KEY',
    'RESEND_API_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
  ],
  optional: [
    'ASSEMBLYAI_API_KEY',
    'DRAFTED_API_KEY',
    'GITHUB_TOKEN',
    'LINKEDIN_CLIENT_SECRET',
    'NEXT_PUBLIC_POSTHOG_KEY',
    'NEXT_PUBLIC_EMAILJS_USER_ID',
    'NEXT_PUBLIC_LINKEDIN_CLIENT_ID',
    'NEXT_PUBLIC_GMAIL_CLIENT_ID',
  ]
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('\n❌ .env.local file not found!', 'red');
    log('   Create it by copying from .env.example or running:', 'gray');
    log('   netlify env:list --json > .env.local\n', 'blue');
    return false;
  }
  
  log('✅ .env.local file exists', 'green');
  return true;
}

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      env[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
    }
  });
  
  return env;
}

function checkVariables(env) {
  let allGood = true;
  
  // Check client-side variables
  log('\n📱 Client-Side Variables (NEXT_PUBLIC_*):', 'blue');
  REQUIRED_VARS.client.forEach(varName => {
    if (env[varName]) {
      log(`  ✅ ${varName}`, 'green');
    } else {
      log(`  ❌ ${varName} - MISSING`, 'red');
      allGood = false;
    }
  });
  
  // Check server-side variables
  log('\n🔒 Server-Side Variables (Required):', 'blue');
  REQUIRED_VARS.server.forEach(varName => {
    if (env[varName]) {
      log(`  ✅ ${varName}`, 'green');
    } else {
      log(`  ❌ ${varName} - MISSING`, 'red');
      allGood = false;
    }
  });
  
  // Check optional variables
  log('\n⚙️  Optional Variables:', 'blue');
  REQUIRED_VARS.optional.forEach(varName => {
    if (env[varName]) {
      log(`  ✅ ${varName}`, 'green');
    } else {
      log(`  ⚠️  ${varName} - not set (optional)`, 'yellow');
    }
  });
  
  return allGood;
}

function main() {
  log('\n🔍 Checking Environment Variables...', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'gray');
  
  if (!checkEnvFile()) {
    process.exit(1);
  }
  
  const env = loadEnvFile();
  const allGood = checkVariables(env);
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'gray');
  
  if (allGood) {
    log('\n✨ All required environment variables are set!', 'green');
    log('   You\'re ready to run: npm run dev\n', 'gray');
    process.exit(0);
  } else {
    log('\n❌ Some required environment variables are missing!', 'red');
    log('   Please add them to .env.local', 'gray');
    log('   See LOCAL_DEV_SETUP.md for details\n', 'gray');
    process.exit(1);
  }
}

main();
