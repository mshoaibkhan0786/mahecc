const fs = require('fs');
const path = require('path');

const replacement = `<!-- Mobile Visible Nav -->
                            <div class="flex md:hidden items-center justify-between space-x-2">
                                <a href="/timetable/" class="nav-link p-2 rounded-md transition-colors focus-outline" aria-label="Timetable" title="Timetable">
                                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </a>
                                <a href="/faculty/" class="nav-link p-2 rounded-md transition-colors focus-outline" aria-label="Faculty" title="Faculty">
                                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </a>
                                <a href="/restaurants/" class="nav-link p-2 rounded-md transition-colors focus-outline" aria-label="Restaurants" title="Restaurants">
                                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path></svg>
                                </a>
                            </div>`;

const regex = /<!-- Mobile Visible Nav -->[\s\S]*?<\/div>/;

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        if (file === 'node_modules') return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const htmlFiles = walk(__dirname);
let count = 0;
htmlFiles.forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    const newHtml = html.replace(regex, replacement);
    if (newHtml !== html) {
        fs.writeFileSync(file, newHtml, 'utf8');
        count++;
    }
});

console.log(`Updated ${count} files.`);
