#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Pages to warm up
const pages = [
  '/',
  '/dashboard',
  '/dashboard/inventory',
  '/dashboard/add-item',
  '/dashboard/shopping-list',
  '/account',
  '/login',
  '/signup'
];

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function warmUpPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      console.log(`✓ Warmed up: ${url} (${res.statusCode})`);
      resolve();
    });

    req.on('error', (err) => {
      console.log(`✗ Failed to warm up: ${url} - ${err.message}`);
      resolve(); // Don't reject, just continue
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`⏱ Timeout warming up: ${url}`);
      resolve();
    });
  });
}

async function warmUpServer() {
  console.log('🔥 Warming up development server...');
  console.log(`Base URL: ${baseUrl}`);
  
  // Wait a bit for the server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const promises = pages.map(page => warmUpPage(`${baseUrl}${page}`));
  
  await Promise.all(promises);
  
  console.log('🚀 Development server warmed up!');
}

if (require.main === module) {
  warmUpServer().catch(console.error);
}

module.exports = { warmUpServer };