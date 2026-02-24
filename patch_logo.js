const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules') {
                processDirectory(fullPath);
            }
        } else if (file === 'index.html' || file === 'login.html') {
            console.log("Analyzing file:", fullPath);
            let rawContent = fs.readFileSync(fullPath, 'utf8');
            let $ = cheerio.load(rawContent, { decodeEntities: false });

            // Determine relative path prefix 
            const prefix = (fullPath === 'index.html' || fullPath === 'login.html' || fullPath === 'login\\index.html') ? './' : '../';

            // Replace Favicon
            const faviconTag = $('#favicon');
            if (faviconTag.length) {
                faviconTag.attr('href', prefix + 'logo.png');
            }

            // Replace Navbar Logo SVG
            const navSvg = $('nav svg[viewBox="0 0 100 100"]');
            if (navSvg.length && !navSvg.hasClass('theme-icon-sun')) {
                // Find parent container and replace the SVG with our new logo
                const imageTag = `<img src="${prefix}logo.png" alt="CC Logo" class="h-10 w-10 object-contain rounded-xl shadow-sm transition-transform duration-300 ease-in-out hover:scale-105" />`;
                navSvg.parent().html(imageTag);
            } else if ($("nav img[alt='CC Logo']").length > 0) {
                console.log("Already has image logo.");
            }

            let fixedContent = $.html().replace(/<!doctype html>/i, '<!DOCTYPE html>');
            fs.writeFileSync(fullPath, fixedContent, 'utf8');
            console.log('Patched Logo in:', fullPath);
        }
    }
}

try {
    processDirectory('.');
    console.log('Logo update complete.');
} catch (e) {
    console.error("Error during logo swap:", e);
}
