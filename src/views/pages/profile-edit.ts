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
    { name: 'Classic Blue', hex: '#2563eb' },
    { name: 'Indigo', hex: '#4f46e5' },
    { name: 'Violet', hex: '#7c3aed' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Amber', hex: '#d97706' },
    { name: 'Rose', hex: '#e11d48' },
    { name: 'Neutral Zinc', hex: '#52525b' },
  ];

  const content = `
  ${renderNavbar(user)}

  <main class="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
    <div class="mb-6">
      <h1 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Profile & Preferences</h1>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
        Customize your portfolio appearance, theme, and bio.
      </p>
    </div>

    ${
      error
        ? `<div class="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
             <span>✕</span>
             <span>${escapeHtml(error)}</span>
           </div>`
        : ''
    }

    ${
      success
        ? `<div class="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
             <span>✓</span>
             <span>${escapeHtml(success)}</span>
           </div>`
        : ''
    }

    <div class="space-y-6">
      <!-- General Settings Card -->
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 shadow-subtle">
        <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Public Identity</h2>
        
        <form action="/dashboard/profile" method="POST" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="displayName" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                required
                maxlength="60"
                value="${escapeHtml(user.displayName || '')}"
                class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Public URL Handle
              </label>
              <input
                type="text"
                disabled
                value="${escapeHtml(user.username || 'unassigned')}"
                class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-xs text-zinc-400 font-mono cursor-not-allowed"
              />
              <span class="text-[10px] text-zinc-400 mt-1 block">Handles are immutable to preserve published links.</span>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="bio" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Headline Bio
              </label>
              <span id="bio-counter" class="text-[10px] font-mono text-zinc-400">0 / 300</span>
            </div>
            <textarea
              id="bio"
              name="bio"
              rows="3"
              maxlength="300"
              placeholder="e.g. Senior Cloud & Security Architect specializing in edge computing and zero trust..."
              class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 leading-relaxed"
              oninput="document.getElementById('bio-counter').textContent = this.value.length + ' / 300';"
            >${escapeHtml(user.bio || '')}</textarea>
          </div>

          <!-- Color Swatches -->
          <div>
            <label class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Accent Color
            </label>
            <div class="flex flex-wrap items-center gap-2">
              ${colorPresets
                .map(
                  (c) => `
                <button
                  type="button"
                  onclick="selectColor('${c.hex}')"
                  class="w-6 h-6 rounded-full border transition ${
                    (user.accentColor || '#2563eb') === c.hex
                      ? 'border-zinc-900 dark:border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }"
                  style="background-color: ${c.hex};"
                  title="${c.name}"
                ></button>
              `
                )
                .join('')}
              <div class="flex items-center gap-1.5 ml-2">
                <input
                  type="color"
                  id="color-picker"
                  value="${escapeHtml(user.accentColor || '#2563eb')}"
                  class="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                  onchange="selectColor(this.value)"
                />
                <input
                  type="text"
                  id="accentColor"
                  name="accentColor"
                  value="${escapeHtml(user.accentColor || '#2563eb')}"
                  pattern="^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$"
                  class="w-20 px-2 py-0.5 text-[11px] font-mono rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white uppercase"
                  oninput="selectColor(this.value)"
                />
              </div>
            </div>
          </div>

          <!-- Theme & Layout Mode -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label for="theme" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Color Scheme
              </label>
              <select
                id="theme"
                name="theme"
                class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                <option value="system" ${user.theme === 'system' ? 'selected' : ''}>System Preference</option>
                <option value="light" ${user.theme === 'light' ? 'selected' : ''}>Light Theme</option>
                <option value="dark" ${user.theme === 'dark' ? 'selected' : ''}>Dark Theme</option>
              </select>
            </div>

            <div>
              <label for="layout" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Default Layout
              </label>
              <select
                id="layout"
                name="layout"
                class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                <option value="grid" ${user.layout === 'grid' ? 'selected' : ''}>Grid Cards (Recommended)</option>
                <option value="list" ${user.layout === 'list' ? 'selected' : ''}>Detailed List</option>
              </select>
            </div>
          </div>

          <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              type="submit"
              class="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white font-semibold rounded-lg text-xs shadow-sm transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <!-- Danger Zone -->
      <div class="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6">
        <h3 class="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">Danger Zone</h3>
        <p class="text-xs text-rose-700/80 dark:text-rose-400/80 mt-1 max-w-lg leading-relaxed">
          Permanently delete your portfolio, username, and remove all certificate documents from Cloudflare R2. This action cannot be reversed.
        </p>
        
        <form action="/dashboard/account/delete" method="POST" onsubmit="return confirm('WARNING: Are you sure you want to permanently delete your entire account, handle, and files?');" class="mt-3">
          <button
            type="submit"
            class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs shadow-sm transition"
          >
            Delete Account & All Files
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

    document.addEventListener('DOMContentLoaded', () => {
      const bioEl = document.getElementById('bio');
      if (bioEl) {
        document.getElementById('bio-counter').textContent = bioEl.value.length + ' / 300';
      }
    });
  </script>
  `;

  return baseLayout(content, {
    title: 'Preferences | CertFolio',
    currentUser: user,
    accentColor: user.accentColor || '#2563eb',
    theme: user.theme || 'system',
  });
}
