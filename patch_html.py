import os
import glob
import re

profile_dropdown_desktop = """                        <!-- Profile Dropdown -->
                        <div class="relative hidden md:block" id="profile-dropdown-container">
                             <button id="profile-btn" class="flex items-center text-sm rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--nav-bg)] focus:ring-[var(--accent-color)] focus-outline">
                                <span class="sr-only">Open user menu</span>
                                <div class="h-8 w-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white font-bold" id="profile-initial">
                                    ?
                                </div>
                            </button>
                            <div id="profile-dropdown" class="profile-dropdown-menu hidden">
                                <div class="px-4 py-3">
                                    <!-- Name Display and Edit Button -->
                                    <div class="flex items-center justify-between" id="name-display-container">
                                        <p class="text-sm font-semibold text-[var(--header-text)]" id="profile-name">Guest User</p>
                                    </div>
                                    <p class="text-sm text-gray-500 truncate" id="profile-email">Not logged in</p>
                                </div>
                                <div class="py-1 border-t border-[var(--border-color)]">
                                    <button id="logout-btn-desktop" class="w-full text-left block px-4 py-2 text-sm text-[var(--accent-color)] hover:bg-[var(--bg-color)] focus-outline">Sign in</button>
                                </div>
                            </div>
                        </div>"""

profile_dropdown_mobile = """                 <!-- Mobile Profile Section -->
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
                </div>"""

logout_btn_mobile = """                    <!-- Mobile Logout Button -->
                    <button id="logout-btn-mobile" class="w-full text-left block px-3 py-2 text-base text-[var(--accent-color)] rounded-md hover:bg-[var(--bg-color)] focus-outline">Sign in</button>"""

def patch_file(filepath):
    with open(filepath, 'r+', encoding='utf-8') as f:
        content = f.read()

        # Update flex container to have space-x-4
        content = re.sub(
            r'(<div class="flex items-center">)\s*(?=<!-- Desktop Theme Switcher -->|<button class="theme-switcher-btn)',
            r'<div class="flex items-center space-x-4">',
            content
        )

        # Update mobile menu wrapper
        content = re.sub(
            r'(<div class="border-t border-\[var\(--border-color\)\] px-5 py-3">)',
            r'<div class="border-t border-[var(--border-color)] px-2 py-3 space-y-2">',
            content
        )
        content = re.sub(
            r'(<div class="flex items-center justify-between">)',
            r'<div class="flex items-center justify-between px-3">',
            content
        )

        # Inject desktop profile dropdown
        if "id=\"profile-dropdown-container\"" not in content:
            # Inject after the theme switcher button closes
            content = re.sub(
                r'(<svg class="theme-icon-moon.*?currentColor">.*?</svg>\s*</button>)',
                r'\1\n' + profile_dropdown_desktop,
                content,
                flags=re.DOTALL
            )
        
        # Inject mobile profile section
        if "id=\"mobile-profile-initial\"" not in content:
            # Inject right inside `<div id="mobile-menu" class="md:hidden hidden">`
            content = re.sub(
                r'(<div id="mobile-menu" class="md:hidden hidden">)',
                r'\1\n' + profile_dropdown_mobile,
                content
            )

        # Inject mobile logout
        if "id=\"logout-btn-mobile\"" not in content:
            content = re.sub(
                r'(<button class="theme-switcher-btn.*?currentColor">.*?</svg>\s*</button>\s*</div>)',
                r'\1\n' + logout_btn_mobile,
                content,
                flags=re.DOTALL
            )

        # Make sure mobile menu toggle keeps proper styles
        content = re.sub(
            r'<button id="mobile-menu-button".*?>',
            r'<button id="mobile-menu-button" type="button" class="bg-[var(--card-bg)] inline-flex items-center justify-center p-2 rounded-md text-[var(--text-color)] hover:bg-[var(--bg-color)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--card-bg)] focus:ring-[var(--accent-color)] focus-outline">',
            content
        )

        f.seek(0)
        f.truncate()
        f.write(content)

html_files = glob.glob('**/index.html', recursive=True)
for file in html_files:
    if "login" not in file and file != "index.html":
        print(f"Patching {file}")
        patch_file(file)

print("Patching complete.")
