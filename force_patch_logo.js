const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory && f !== 'node_modules') {
            walkDir(dirPath, callback);
        } else if (f.endsWith('.html')) {
            callback(dirPath);
        }
    });
}

walkDir('.', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const regexLogo = /<svg[^>]*class="[^"]*h-8 w-8[^"]*"[^>]*viewBox="0 0 100 100"[^>]*>[\s\S]*?<\/svg>/;

    const parts = filePath.split(path.sep);
    let prefix = './';
    if (parts.length > 2) {
        prefix = '../'.repeat(parts.length - 2);
    } else if (parts.length === 2 && filePath.indexOf('index.html') === -1) {
        prefix = '../';
    }

    if (filePath === 'index.html' || filePath === 'login.html' || filePath === 'offline.html') {
        prefix = './';
    } else if (parts[0] !== '.' && parts.length > 1) {
        prefix = '../';
    }

    const newLogo = `<img src="${prefix}logo.png" alt="CC Logo" class="h-10 w-10 object-contain rounded-xl shadow-sm transition-transform duration-300 ease-in-out hover:scale-105" />`;

    // 1. Swap NavBar SVG logo to the clean PNG
    if (regexLogo.test(content)) {
        content = content.replace(regexLogo, newLogo);
    }

    // 2. Swap favicon to use the PNG. Match logo.svg to logo.png
    content = content.replace(/href="([^"]*)logo\.svg"/g, `href="$1logo.png"`);

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Replaced logo in ' + filePath);
    }
});
console.log('Logo update completed via force patch.');
