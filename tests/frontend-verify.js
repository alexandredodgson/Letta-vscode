const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '../out/webview-ui/index.html');
if (!fs.existsSync(indexHtmlPath)) {
    console.error('index.html not found');
    process.exit(1);
}

const content = fs.readFileSync(indexHtmlPath, 'utf-8');
if (!content.includes('id="root"')) {
    console.error('root div not found');
    process.exit(1);
}

const assetsPath = path.join(__dirname, '../out/webview-ui/assets');
const files = fs.readdirSync(assetsPath);
if (!files.some(f => f.endsWith('.js')) || !files.some(f => f.endsWith('.css'))) {
    console.error('assets missing');
    process.exit(1);
}

console.log('Frontend build verified successfully');
