import { baseLayout } from '../layout';
import { renderNavbar, renderFooter } from '../components';
import { User } from '../../db/schema';
import { escapeHtml } from '../../lib/sanitize';

export interface ProfileEditProps {
  user: User;
  error?: string;
  success?: string;
}

export function renderProfileEditPage(props: ProfileEditProps): string {
  const { user, error, success } = props;

  const colorPresets = [
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Indigo', hex: '#4f46e5' },
    { name: 'Purple', hex: '#7c3aed' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Amber', hex: '#d97706' },
    { name: 'Rose', hex: '#e11d48' },
    { name: 'Cyan', hex: '#0891b2' },
  ];

  const content = `
  ${renderNavbar(user)}

  <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">Profile & Portfolio Settings</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        Customize your portfolio appearance, accent styling, and account settings.
      </p>
    </div>

    ${
      error
        ? `<div class="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
             <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             <span>${escapeHtml(error)}</span>
           </div>`
        : ''
    }

    ${
      success
        ? `<div class="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
             <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
             <span>${escapeHtml(success)}</span>
           </div>`
        : ''
    }

    <div class="space-y-8">
      <!-- Profile Information Card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Public Profile Information</h2>
        
        <form action="/dashboard/profile" method="POST" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label for="displayName" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                required
                maxlength="60"
                value="${escapeHtml(user.displayName || '')}"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Username (Public URL)
              </label>
              <input
                type="text"
                disabled
                value="${escapeHtml(user.username || 'unassigned')}"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-sm text-slate-500 font-mono cursor-not-allowed"
              />
              <span class="text-[10px] text-slate-400 mt-1 block">Username cannot be changed after creation for link permanence.</span>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="bio" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Bio / Headline
              </label>
              <span id="bio-counter" class="text-[11px] text-slate-400">0 / 300</span>
            </div>
            <textarea
              id="bio"
              name="bio"
              rows="3"
              maxlength="300"
              placeholder="e.g. Senior Security Engineer specializing in Cloud Architecture & Zero Trust..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              oninput="document.getElementById('bio-counter').textContent = this.value.length + ' / 300';"
            >${escapeHtml(user.bio || '')}</textarea>
          </div>

          <!-- Accent Color Picker -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Portfolio Accent Color
            </label>
            <div class="flex flex-wrap items-center gap-3">
              ${colorPresets
                .map(
                  (c) => `
                <button
                  type="button"
                  onclick="selectColor('${c.hex}')"
                  class="w-8 h-8 rounded-full border-2 transition ${
                    (user.accentColor || '#2563eb') === c.hex
                      ? 'border-slate-900 dark:border-white scale-110 shadow-md'
                      : 'border-transparent hover:scale-105'
                  }"
                  style="background-color: ${c.hex};"
                  title="${c.name}"
                ></button>
              `
                )
                .join('')}
              <div class="flex items-center gap-2 ml-2">
                <input
                  type="color"
                  id="color-picker"
                  value="${escapeHtml(user.accentColor || '#2563eb')}"
                  class="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  onchange="selectColor(this.value)"
                />
                <input
                  type="text"
                  id="accentColor"
                  name="accentColor"
                  value="${escapeHtml(user.accentColor || '#2563eb')}"
                  pattern="^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$"
                  class="w-24 px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase"
                  oninput="selectColor(this.value)"
                />
              </div>
            </div>
          </div>

          <!-- Theme & Layout Options -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label for="theme" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Color Scheme
              </label>
              <select
                id="theme"
                name="theme"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="system" ${user.theme === 'system' ? 'selected' : ''}>System Default</option>
                <option value="light" ${user.theme === 'light' ? 'selected' : ''}>Light Theme</option>
                <option value="dark" ${user.theme === 'dark' ? 'selected' : ''}>Dark Theme</option>
              </select>
            </div>

            <div>
              <label for="layout" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Portfolio Layout Style
              </label>
              <select
                id="layout"
                name="layout"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="grid" ${user.layout === 'grid' ? 'selected' : ''}>Grid Cards (Recommended)</option>
                <option value="list" ${user.layout === 'list' ? 'selected' : ''}>Detailed List</option>
                <option value="timeline" ${user.layout === 'timeline' ? 'selected' : ''}>Chronological Timeline</option>
              </select>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <!-- Danger Zone: Delete Account -->
      <div class="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 sm:p-8">
        <h3 class="text-base font-bold text-rose-800 dark:text-rose-400">Danger Zone: Delete Account</h3>
        <p class="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1 max-w-xl leading-relaxed">
          Permanently delete your profile, username, all uploaded certificates, and remove all files stored in Cloudflare R2. This action cannot be undone.
        </p>
        
        <form action="/dashboard/account/delete" method="POST" onsubmit="return confirm('WARNING: Are you absolutely sure? This will delete your entire portfolio, username, and all files from R2 forever.');" class="mt-4">
          <button
            type="submit"
            class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition"
          >
            Delete My Account & All Data
          </button>
        </form>
      </div>
    </div>
  </main>

  ${renderFooter()}

  <script>
    function selectColor(hex) {
      if (!hex.startsWith('#')) hex = '#' + hex;
      document.getElementById('accentColor').value = hex;
      document.getElementById('color-picker').value = hex;
    }

    // Init bio counter
    document.addEventListener('DOMContentLoaded', () => {
      const bioEl = document.getElementById('bio');
      if (bioEl) {
        document.getElementById('bio-counter').textContent = bioEl.value.length + ' / 300';
      }
    });
  </script>
  `;

  return baseLayout(content, {
    title: 'Profile Settings | CertFolio',
    currentUser: user,
    accentColor: user.accentColor || '#2563eb',
    theme: user.theme || 'system',
  });
}

