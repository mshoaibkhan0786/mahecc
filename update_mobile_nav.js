const fs = require('fs');
const path = require('path');

const replacement = `<!-- Mobile Visible Nav -->
                            <div class="flex md:hidden items-center justify-between w-full mx-2 space-x-1 sm:space-x-3">
                                <a href="/timetable/" class="nav-link p-2 sm:p-3 rounded-md transition-colors focus-outline flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100" aria-label="Timetable" title="Timetable">
                                    <svg class="h-5 w-5 sm:h-6 sm:w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    <span class="text-[10px] sm:text-xs font-semibold leading-none">Time</span>
                                </a>
                                <a href="/studymaterial/" class="nav-link p-2 sm:p-3 rounded-md transition-colors focus-outline flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100" aria-label="Study Material" title="Study Material">
                                    <svg class="h-5 w-5 sm:h-6 sm:w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                    <span class="text-[10px] sm:text-xs font-semibold leading-none">Notes</span>
                                </a>
                                <a href="/circute/" class="nav-link p-2 sm:p-3 rounded-md transition-colors focus-outline flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100" aria-label="Circute AI" title="Circute AI">
                                    <svg class="h-5 w-5 sm:h-6 sm:w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"></path></svg>
                                    <span class="text-[10px] sm:text-xs font-semibold leading-none text-[#a855f7]">Circute</span>
                                </a>
                                <a href="/faculty/" class="nav-link p-2 sm:p-3 rounded-md transition-colors focus-outline flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100" aria-label="Faculty" title="Faculty">
                                    <svg class="h-5 w-5 sm:h-6 sm:w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    <span class="text-[10px] sm:text-xs font-semibold leading-none">Staff</span>
                                </a>
                                <a href="/restaurants/" class="nav-link p-2 sm:p-3 rounded-md transition-colors focus-outline flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100" aria-label="Restaurants" title="Restaurants">
                                    <svg class="h-5 w-5 sm:h-6 sm:w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path></svg>
                                    <span class="text-[10px] sm:text-xs font-semibold leading-none">Food</span>
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
