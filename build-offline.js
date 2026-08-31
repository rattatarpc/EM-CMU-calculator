const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

async function download(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data)));
        }).on('error', reject);
    });
}

async function build() {
    console.log("Starting offline build...");

    // 1. Create tailwind input (Tailwind v4 syntax)
    fs.writeFileSync('input.css', '@import "tailwindcss";\n@source "EM CMU Calculator.html";\n');
    
    // 3. Run tailwind using v4 CLI
    console.log("Compiling Tailwind CSS...");
    execSync('npx @tailwindcss/cli -i input.css -o output.css --minify');
    const tailwindCss = fs.readFileSync('output.css', 'utf8');

    // 4. Download FontAwesome CSS and WOFF2
    console.log("Downloading FontAwesome...");
    const faCssBuffer = await download('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
    let faCss = faCssBuffer.toString();

    const woff2Buffer = await download('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2');
    const woff2Base64 = woff2Buffer.toString('base64');
    
    const fontFace = `
    @font-face {
      font-family: 'Font Awesome 6 Free';
      font-style: normal;
      font-weight: 900;
      font-display: block;
      src: url(data:font/woff2;charset=utf-8;base64,${woff2Base64}) format('woff2');
    }
    `;
    
    faCss = faCss.replace(/@font-face\{[^}]+\}/g, '');
    
    const finalCss = `
    /* Tailwind */
    ${tailwindCss}
    
    /* FontAwesome Custom */
    ${fontFace}
    ${faCss}
    
    /* Default Inter Font Fallback */
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    `;

    // 5. Read original HTML
    console.log("Patching HTML...");
    let html = fs.readFileSync('EM CMU Calculator.html', 'utf8');
    
    // Remove Tailwind CDN
    html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, '');
    
    // Remove FontAwesome CDN
    html = html.replace(/<link href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.5\.0\/css\/all\.min\.css" rel="stylesheet">/, '');
    
    // Remove Google Fonts
    html = html.replace(/@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^']+'\);/, '');

    // Inject our final CSS
    html = html.replace('</head>', `<style>\n${finalCss}\n</style>\n</head>`);
    
    fs.writeFileSync('EM_CMU_Calculator_Offline.html', html, 'utf8');
    console.log("Done! Created EM_CMU_Calculator_Offline.html");
}

build().catch(console.error);
