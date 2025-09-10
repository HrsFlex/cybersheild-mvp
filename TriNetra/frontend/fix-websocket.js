#!/usr/bin/env node

/**
 * TriNetra WebSocket Connection Fix Script
 * 
 * This script helps diagnose and fix Vite WebSocket connection issues
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🔧 TriNetra WebSocket Connection Fix');
console.log('===================================\n');

// Check current directory
const packageJsonPath = './package.json';
const viteConfigPath = './vite.config.js';

if (!existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found. Run this script from the frontend directory.');
    process.exit(1);
}

console.log('📋 Diagnosing WebSocket connection issues...\n');

// Read current configuration
let packageJson, viteConfig;
try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    viteConfig = readFileSync(viteConfigPath, 'utf8');
    console.log('✅ Configuration files read successfully');
} catch (error) {
    console.error('❌ Error reading configuration files:', error.message);
    process.exit(1);
}

// Check if we're running on localhost
console.log('\n🔍 Checking environment...');
console.log('Current working directory:', process.cwd());
console.log('Package name:', packageJson.name);
console.log('Vite version:', packageJson.devDependencies?.vite || 'not found');

// Create optimized Vite configuration
const optimizedConfig = `import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'static',
  server: {
    port: 5175,
    host: 'localhost', // Use localhost instead of 0.0.0.0 for better compatibility
    strictPort: true,
    hmr: {
      port: 5175,
      host: 'localhost',
      clientPort: 5175,
      protocol: 'ws' // Explicitly use WebSocket protocol
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  define: {
    global: 'globalThis'
  }
})`;

// Backup original config
const backupPath = './vite.config.js.backup';
if (!existsSync(backupPath)) {
    writeFileSync(backupPath, viteConfig);
    console.log('✅ Backup created: vite.config.js.backup');
}

// Write optimized configuration
writeFileSync(viteConfigPath, optimizedConfig);
console.log('✅ Updated vite.config.js with optimized WebSocket settings');

// Provide solution steps
console.log('\n🚀 WebSocket Connection Fix Applied!');
console.log('===================================');
console.log('\n📋 Next Steps:');
console.log('1. Stop the current Vite dev server (Ctrl+C)');
console.log('2. Restart with: npm run dev');
console.log('\n🔄 Alternative Solutions if WebSocket issues persist:');
console.log('• Try: npm run dev:no-hmr    (Disables WebSocket HMR)');
console.log('• Try: npm run dev:host      (Uses 0.0.0.0 host)');
console.log('• Check Firefox network settings (disable strict security)');
console.log('• Try different port: vite --port 3000');

console.log('\n🌐 Browser Access:');
console.log('• Main URL: http://localhost:5175/');
console.log('• If localhost fails, try: http://127.0.0.1:5175/');

console.log('\n🔧 Manual Configuration Options:');
console.log('• Disable HMR completely: Set hmr: false in vite.config.js');
console.log('• Use polling: Set server: { watch: { usePolling: true } }');
console.log('• Change protocol: Set hmr: { protocol: "ws" }');

console.log('\n🔍 Troubleshooting Commands:');
console.log('• Check if port is in use: netstat -tulpn | grep 5175');
console.log('• Test WebSocket: wscat -c ws://localhost:5175');
console.log('• Check firewall: sudo ufw status');

console.log('\n✅ WebSocket fix script completed!');
console.log('The configuration has been optimized for better compatibility.');
console.log('Restart your dev server to apply changes.\n');