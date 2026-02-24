const fs = require('fs');
const path = require('path');

const filesToPatch = [
    'index.html',
    'login.html',
    'offline.html',
    'faculty/index.html',
    'calendar/index.html',
    'circute/index.html',
    'gallery/index.html',
    'restaurants/index.html',
    'studymaterial/index.html',
    'timetable/index.html',
    'login/index.html'
];

const svgLogo = `<svg class="h-8 w-8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <rect width="100" height="100" rx="20" fill="var(--accent-color)"></rect>
                                <path fill="white" d="M50 20 l25 15 v30 l-25 15 l-25 -15 v-30 z M50 38 l15 9 v18 l-15 9 l-15 -9 v-18 z"></path>
                            </svg>`;

filesToPatch.forEach(file => {
    try {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) return;

        let content = fs.readFileSync(filePath, 'utf8');

        // 1. Revert logo
        content = content.replace(/<img[^>]*src="[^"]*logo\.png"[^>]*alt="CC Logo"[^>]*>/, svgLogo);
        content = content.replace(/<img[^>]*alt="CC Logo"[^>]*src="[^"]*logo\.png"[^>]*>/, svgLogo);

        // 2. Revert favicon
        // Some might be ../logo.png depending on depth, let's just make it relative or absolute based on what it was.
        content = content.replace(/href="[^"]*logo\.png"/g, (match) => {
            return match.replace('logo.png', 'logo.svg');
        });

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Reverted logo in ${file}`);
    } catch (e) {
        console.error(`Error in ${file}: ${e.message}`);
    }
});
