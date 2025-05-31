// Get the NODE_ENV value
import dotenv from 'dotenv';
dotenv.config();
import { execSync } from 'child_process';

const nodeEnv = process.env.NODE_ENV;

console.log(nodeEnv);
if (nodeEnv !== 'development') {
  console.log('Installing Chromium for Puppeteer...');
  execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
} else {
  console.log('Skipping Puppeteer installation as NODE_ENV is set to dev');
}
