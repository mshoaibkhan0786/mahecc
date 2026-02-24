const fs = require('fs');
const cheerio = require('cheerio');
const glob = require('glob');

const profileDesktopStr = `
<!-- Profile Dropdown -->
<div class="relative hidden md:block" id="profile-dropdown-container">
    <button id="profile-btn" class="flex items-center text-sm rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--nav-bg)] focus:ring-[var(--accent-color)] focus-outline">
        <span class="sr-only">Open user menu</span>
        <div class="h-8 w-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white font-bold" id="profile-initial">
            ?
        </div>
    </button>
    <div id="profile-dropdown" class="profile-dropdown-menu hidden right-0 absolute mt-2 w-64 rounded-md shadow-lg bg-[var(--card-bg)] ring-1 ring-black ring-opacity-5 divide-y divide-[var(--border-color)]">
        <div class="px-4 py-3">
            <p class="text-sm font-semibold text-[var(--header-text)] truncate" id="profile-name">Guest User</p>
            <p class="text-xs text-gray-500 truncate mt-1" id="profile-email">Not logged in</p>
            <p class="text-xs text-[var(--accent-color)] font-medium truncate mt-1" id="profile-reg">Reg: Not set</p>
        </div>
        <div class="px-4 py-3 hidden" id="edit-profile-form">
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input type="text" id="edit-name-input" class="mt-1 block w-full rounded-md border-[var(--border-color)] bg-[var(--bg-color)] shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] text-[var(--text-color)] sm:text-sm px-2 py-1 mb-2">
            
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Registration No</label>
            <input type="text" id="edit-reg-input" class="mt-1 block w-full rounded-md border-[var(--border-color)] bg-[var(--bg-color)] shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] text-[var(--text-color)] sm:text-sm px-2 py-1">
            
            <div class="mt-2 flex justify-end gap-2">
                <button id="cancel-edit-btn" class="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 focus-outline">Cancel</button>
                <button id="save-profile-btn" class="text-xs px-2 py-1 bg-[var(--accent-color)] text-white rounded hover:opacity-90 focus-outline">Save</button>
            </div>
        </div>
        <div class="py-1">
            <button id="edit-profile-btn" class="w-full text-left block px-4 py-2 text-sm text-[var(--text-color)] hover:bg-[var(--bg-color)] focus-outline">Edit Profile</button>
        </div>
        <div class="py-1">
            <button id="logout-btn-desktop" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-[var(--bg-color)] focus-outline">Sign in</button>
        </div>
    </div>
</div>
`;

const profileMobileStr = `
<!-- Mobile Profile Section -->
<div class="px-5 pt-4 pb-3 border-b border-[var(--border-color)]" id="mobile-profile-section">
    <div class="flex items-center">
        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white font-bold" id="mobile-profile-initial">?</div>
        <div class="ml-3 flex-grow min-w-0">
            <div id="mobile-name-display" class="flex items-center justify-between">
                <p class="text-base font-semibold text-[var(--header-text)] truncate" id="mobile-profile-name">Guest User</p>
                <button id="edit-mobile-profile-btn" class="p-1 rounded-full text-gray-500 hover:bg-[var(--bg-color)] focus-outline">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                </button>
            </div>
            <p class="text-sm text-gray-500 truncate" id="mobile-profile-email">Not logged in</p>
            <p class="text-xs text-[var(--accent-color)] font-medium truncate mt-1" id="mobile-profile-reg">Reg: Not set</p>
        </div>
    </div>
    
    <div class="mt-3 hidden" id="mobile-edit-profile-form">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input type="text" id="mobile-edit-name-input" class="mt-1 block w-full rounded-md border-[var(--border-color)] bg-[var(--bg-color)] shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] text-[var(--text-color)] sm:text-sm px-2 py-1 mb-2">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Registration No</label>
        <input type="text" id="mobile-edit-reg-input" class="mt-1 block w-full rounded-md border-[var(--border-color)] bg-[var(--bg-color)] shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] text-[var(--text-color)] sm:text-sm px-2 py-1 mb-2">
        <div class="flex justify-end gap-2">
            <button id="mobile-cancel-edit-btn" class="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 focus-outline">Cancel</button>
            <button id="mobile-save-profile-btn" class="text-xs px-2 py-1 bg-[var(--accent-color)] text-white rounded hover:opacity-90 focus-outline">Save</button>
        </div>
    </div>
</div>
`;

const logoutMobileStr = `
<!-- Mobile Logout Button -->
<button id="logout-btn-mobile" class="w-full text-left block px-3 py-2 text-base text-red-600 rounded-md hover:bg-[var(--bg-color)] focus-outline">Sign in</button>
`;

glob('**/index.html', { ignore: 'node_modules/**' }, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        if (!file.includes('login')) {
            console.log('Fixing', file);
            let rawContent = fs.readFileSync(file, 'utf8');
            let $ = cheerio.load(rawContent, { decodeEntities: false });

            // 1. Desktop Profile Container
            if ($('#profile-dropdown-container').length) {
                $('#profile-dropdown-container').replaceWith(profileDesktopStr);
            } else {
                // Should exist but just in case
            }

            // 2. Mobile Profile Section
            // Find anything that holds mobile profile:
            let mobileProf = $('#mobile-profile-initial').closest('div.border-b');
            if (mobileProf.length) {
                mobileProf.replaceWith(profileMobileStr);
            } else if ($('#mobile-profile-initial').length) {
                // Alternative
                $('#mobile-profile-initial').closest('.px-5').replaceWith(profileMobileStr);
            } else {
                // If it doesn't exist, inject it at the top of #mobile-menu
                $('#mobile-menu').prepend(profileMobileStr);
            }

            // 3. Mobile Logout
            let mobileLogout = $('#logout-btn-mobile');
            if (mobileLogout.length) {
                mobileLogout.replaceWith(logoutMobileStr);
            } else {
                // Find toggle theme area
                let themeToggleDiv = $('.border-t.border-\\[var\\(--border-color\\)\\].px-2.py-3');
                if (themeToggleDiv.length) {
                    themeToggleDiv.append(logoutMobileStr);
                } else {
                    $('.border-t.border-\\[var\\(--border-color\\)\\].px-5.py-3').replaceWith(
                        '<div class="border-t border-[var(--border-color)] px-2 py-3 space-y-2"><div class="flex items-center justify-between px-3"><span class="font-medium text-base text-[var(--text-color)]">Toggle Theme</span><button class="theme-switcher-btn bg-[var(--bg-color)] p-2 rounded-full text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--nav-bg)] focus:ring-[var(--accent-color)]"><svg class="theme-icon-sun h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg><svg class="theme-icon-moon h-6 w-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg></button></div>' + logoutMobileStr + '</div>'
                    );
                }
            }

            // Clean up any extra floating logout buttons from broken script injection
            // The broken script put mobile logout inside the desktop dropdown
            // But we already replaced the whole desktop dropdown container above, so those are gone!

            let fixedContent = $.html();
            // Restore doctype case
            fixedContent = fixedContent.replace(/<!doctype html>/i, '<!DOCTYPE html>');

            fs.writeFileSync(file, fixedContent, 'utf8');
        }
    });
});
