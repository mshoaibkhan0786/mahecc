const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const profileDesktopStr = `
<!-- Profile Dropdown -->
<div class="relative hidden md:block" id="profile-dropdown-container">
    <button id="profile-btn" class="flex items-center text-sm rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--nav-bg)] focus:ring-[var(--accent-color)] focus-outline">
        <span class="sr-only">Open user menu</span>
        <div class="h-8 w-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white font-bold overflow-hidden" id="profile-initial-container">
            <span id="profile-initial">?</span>
            <img id="profile-avatar" class="hidden h-full w-full object-cover" src="" alt="Profile Photo" crossorigin="anonymous" referrerpolicy="no-referrer">
        </div>
    </button>
    <div id="profile-dropdown" class="profile-dropdown-menu hidden right-0 absolute mt-2 w-72 rounded-md shadow-lg bg-[var(--card-bg)] ring-1 ring-black ring-opacity-5 divide-y divide-[var(--border-color)]">
        <div class="px-4 py-3 pb-4">
            <p class="text-base font-semibold text-[var(--header-text)] truncate" id="profile-name">Guest User</p>
            <p class="text-sm text-gray-500 truncate mt-1" id="profile-email">Not logged in</p>
            <div class="mt-2 flex gap-2">
                <span class="text-xs text-[var(--accent-color)] font-medium truncate bg-[var(--bg-color)] inline-block px-2 py-1 rounded" id="profile-reg">Reg: Not set</span>
                <span class="text-xs text-gray-500 font-medium truncate bg-[var(--bg-color)] inline-block px-2 py-1 rounded border border-[var(--border-color)]" id="profile-phone-display">Phone: Not set</span>
            </div>
        </div>
        <div class="px-4 py-3 hidden bg-[var(--bg-color)] rounded-b-md" id="edit-profile-form">
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input type="text" id="edit-name-input" class="mt-1 block w-full rounded-md border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] text-[var(--text-color)] sm:text-sm px-2 py-1 mb-2">
            
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Registration Number</label>
            <input type="text" id="edit-reg-input" class="mt-1 block w-full rounded-md border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] text-[var(--text-color)] sm:text-sm px-2 py-1 mb-2">
            
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Phone</label>
            <input type="tel" id="edit-phone-input" class="mt-1 block w-full rounded-md border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] text-[var(--text-color)] sm:text-sm px-2 py-1">
            
            <div class="mt-3 flex justify-end gap-2">
                <button id="cancel-edit-btn" class="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 focus-outline">Cancel</button>
                <button id="save-profile-btn" class="text-xs px-2 py-1 bg-[var(--accent-color)] text-white rounded hover:opacity-90 focus-outline shadow-sm">Save</button>
            </div>
        </div>
        <div class="py-1">
            <button id="edit-profile-btn" class="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-color)] hover:bg-[var(--bg-color)] focus-outline">
                <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                Edit Profile Settings
            </button>
        </div>
        <div class="py-1">
            <button id="logout-btn-desktop" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-[var(--bg-color)] focus-outline">Sign in</button>
        </div>
    </div>
</div>
`;

const profileMobileStr = `
<!-- Mobile Profile Section -->
<div class="px-5 pt-4 pb-4 border-b border-[var(--border-color)] bg-[var(--card-bg)]" id="mobile-profile-section">
    <div class="flex items-center">
        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white font-bold text-lg shadow-sm overflow-hidden" id="mobile-profile-initial-container">
            <span id="mobile-profile-initial">?</span>
            <img id="mobile-profile-avatar" class="hidden h-full w-full object-cover" src="" alt="Profile Photo" crossorigin="anonymous" referrerpolicy="no-referrer">
        </div>
        <div class="ml-3 flex-grow min-w-0">
            <div id="mobile-name-display" class="flex items-center justify-between">
                <p class="text-base font-semibold text-[var(--header-text)] truncate" id="mobile-profile-name">Guest User</p>
                <button id="edit-mobile-profile-btn" class="p-1.5 rounded-full text-gray-500 hover:bg-[var(--bg-color)] focus-outline bg-[var(--bg-color)]">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                </button>
            </div>
            <p class="text-sm text-gray-500 truncate mt-0.5" id="mobile-profile-email">Not logged in</p>
            <div class="mt-1.5 inline-block bg-[var(--bg-color)] px-2 border border-[var(--border-color)] py-0.5 rounded text-xs font-medium text-[var(--accent-color)]">
                <span id="mobile-profile-reg">Reg: Not set</span>
            </div>
            <div class="mt-1.5 inline-block bg-[var(--bg-color)] px-2 border border-[var(--border-color)] py-0.5 rounded text-xs font-medium text-gray-500 ml-1">
                <span id="mobile-profile-phone-display">Phone: Not set</span>
            </div>
        </div>
    </div>
    
    <div class="mt-4 hidden bg-[var(--bg-color)] p-3 rounded-md border border-[var(--border-color)] shadow-inner" id="mobile-edit-profile-form">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input type="text" id="mobile-edit-name-input" class="mt-1 block w-full rounded-md border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] text-[var(--text-color)] sm:text-sm px-2 py-1.5 mb-3">
        
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Registration Number</label>
        <input type="text" id="mobile-edit-reg-input" class="mt-1 block w-full rounded-md border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] text-[var(--text-color)] sm:text-sm px-2 py-1.5 mb-3">
        
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Phone</label>
        <input type="tel" id="mobile-edit-phone-input" class="mt-1 block w-full rounded-md border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] text-[var(--text-color)] sm:text-sm px-2 py-1.5 mb-3">
        
        <div class="flex justify-end gap-2">
            <button id="mobile-cancel-edit-btn" class="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700 bg-[var(--card-bg)] border border-[var(--border-color)] rounded focus-outline">Cancel</button>
            <button id="mobile-save-profile-btn" class="text-xs px-3 py-1.5 bg-[var(--accent-color)] text-white rounded hover:opacity-90 shadow-sm focus-outline">Save Changes</button>
        </div>
    </div>
</div>
`;

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'login') {
                processDirectory(fullPath);
            }
        } else if (file === 'index.html') {
            if (!fullPath.includes('login')) {
                console.log('Fixing UI in', fullPath);
                let rawContent = fs.readFileSync(fullPath, 'utf8');
                let $ = cheerio.load(rawContent, { decodeEntities: false });

                // 1. Desktop Profile Container
                if ($('#profile-dropdown-container').length) {
                    $('#profile-dropdown-container').replaceWith(profileDesktopStr);
                }

                // 2. Mobile Profile Section
                let mobileProfBlock = $('#mobile-profile-section').length ? $('#mobile-profile-section') : $('.border-b.border-\\[var\\(--border-color\\)\\]').filter(function () { return $(this).has('#mobile-profile-initial').length; });

                if (mobileProfBlock.length) {
                    mobileProfBlock.replaceWith(profileMobileStr);
                }

                // Restore DOCTYPE casing that cheerio changes
                let fixedContent = $.html().replace(/<!doctype html>/i, '<!DOCTYPE html>');

                fs.writeFileSync(fullPath, fixedContent, 'utf8');
            }
        }
    }
}

processDirectory('.');
