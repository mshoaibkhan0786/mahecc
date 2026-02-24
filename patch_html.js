const fs = require('fs');
const path = require('path');

const profileDesktopStr = `
                        <!-- Profile Dropdown -->
                        <div class="relative hidden md:block" id="profile-dropdown-container">
                             <button id="profile-btn" class="flex items-center text-sm rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--nav-bg)] focus:ring-[var(--accent-color)] focus-outline">
                                <span class="sr-only">Open user menu</span>
                                <div class="h-8 w-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white font-bold" id="profile-initial">
                                    ?
                                </div>
                            </button>
                            <div id="profile-dropdown" class="profile-dropdown-menu hidden">
                                <div class="px-4 py-3">
                                    <div class="flex items-center justify-between" id="name-display-container">
                                        <p class="text-sm font-semibold text-[var(--header-text)]" id="profile-name">Guest User</p>
                                    </div>
                                    <p class="text-sm text-gray-500 truncate" id="profile-email">Not logged in</p>
                                </div>
                                <div class="py-1 border-t border-[var(--border-color)]">
                                    <button id="logout-btn-desktop" class="w-full text-left block px-4 py-2 text-sm text-[var(--accent-color)] hover:bg-[var(--bg-color)] focus-outline">Sign in</button>
                                </div>
                            </div>
                        </div>`;

const profileMobileStr = `
                <!-- Mobile Profile Section -->
                <div class="px-5 pt-4 pb-3 border-b border-[var(--border-color)]">
                     <div class="flex items-center">
                         <div class="flex-shrink-0 h-10 w-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white font-bold" id="mobile-profile-initial">?</div>
                        <div class="ml-3 flex-grow min-w-0">
                            <!-- Mobile Name Display -->
                            <div id="mobile-name-display" class="flex items-center justify-between">
                                <p class="text-base font-semibold text-[var(--header-text)] truncate" id="mobile-profile-name">Guest User</p>
                            </div>
                            <p class="text-sm text-gray-500 truncate" id="mobile-profile-email">Not logged in</p>
                        </div>
                    </div>
                </div>`;

const logoutMobileStr = `
                    <!-- Mobile Logout Button -->
                    <button id="logout-btn-mobile" class="w-full text-left block px-3 py-2 text-base text-[var(--accent-color)] rounded-md hover:bg-[var(--bg-color)] focus-outline">Sign in</button>`;

function patchFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    // Add space-x-4
    content = content.replace(
        /(<div class="flex items-center">)\s*(?=<!-- Desktop Theme Switcher -->|<button class="theme-switcher-btn)/,
        '<div class="flex items-center space-x-4">'
    );

    // Desktop
    if (!content.includes('id="profile-dropdown-container"')) {
        content = content.replace(
            /(<button class="theme-switcher-btn[^>]*>[\s\S]*?<\/button>)/,
            `$1\n${profileDesktopStr}`
        );
    }

    // Mobile Wrapper
    if (!content.includes('id="mobile-profile-initial"')) {
        content = content.replace(
            /(<div id="mobile-menu" class="md:hidden hidden">)/,
            `$1\n${profileMobileStr}`
        );
    }

    if (!content.includes('id="logout-btn-mobile"')) {
        let originalContent = content;
        content = content.replace(
            /(<div class="border-t border-\[var\(--border-color\)\]\s*px-5 py-3">)/,
            '<div class="border-t border-[var(--border-color)] px-2 py-3 space-y-2">'
        );
        content = content.replace(
            /(<div class="flex items-center justify-between">)/,
            '<div class="flex items-center justify-between px-3">'
        );

        content = content.replace(
            /(<button class="theme-switcher-btn[^>]*>[\s\S]*?<\/button>\s*<\/div>)/g,
            `$1\n${logoutMobileStr}`
        );
    }

    fs.writeFileSync(filepath, content, 'utf8');
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'login') {
                processDirectory(fullPath);
            }
        } else if (file === 'index.html') {
            if (fullPath !== 'index.html' && !fullPath.includes('login')) { // skip root and login
                console.log('Patching', fullPath);
                patchFile(fullPath);
            }
        }
    }
}

processDirectory('.');
