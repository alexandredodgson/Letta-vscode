import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test('Webview UI build exists and has correct entry point', async ({}) => {
  const indexHtmlPath = path.join(__dirname, '../out/webview-ui/index.html');
  expect(fs.existsSync(indexHtmlPath)).toBe(true);

  const content = fs.readFileSync(indexHtmlPath, 'utf-8');
  expect(content).toContain('id="root"');
  expect(content).toContain('script');
  expect(content).toContain('link');
});

test('Webview assets are generated', async ({}) => {
  const assetsPath = path.join(__dirname, '../out/webview-ui/assets');
  const files = fs.readdirSync(assetsPath);
  expect(files.some(f => f.endsWith('.js'))).toBe(true);
  expect(files.some(f => f.endsWith('.css'))).toBe(true);
});
