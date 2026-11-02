import { baseLayout } from '../layout';
import { renderNavbar, renderFooter } from '../components';
import { escapeHtml } from '../../lib/sanitize';

export interface OnboardingProps {
  email: string;
  defaultDisplayName?: string;
  error?: string;
}

export function renderOnboardingPage(props: OnboardingProps): string {
  const content = `
  ${renderNavbar(null)}

  <main class="flex-1 flex items-center justify-center p-4 py-12">
    <div class="w-full max-w-lg">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl">
        
        <div class="text-center mb-8">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Claim Your Portfolio URL</h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Pick your unique username. This is the link you will put on your resume and LinkedIn.
          </p>
        </div>

        ${
          props.error
            ? `<div class="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                 <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                 <span>${escapeHtml(props.error)}</span>
               </div>`
            : ''
        }

        <form action="/onboarding" method="POST" class="space-y-6">
          <div>
            <label for="username" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Unique Username
            </label>
            <div class="relative flex items-center">
              <span class="absolute left-3.5 text-slate-400 font-medium text-sm select-none">/</span>
              <input
                type="text"
                id="username"
                name="username"
                required
                minlength="3"
                maxlength="30"
                pattern="^[a-z0-9]([a-z0-9-]*[a-z0-9])?$"
                placeholder="yourname"
                class="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                oninput="this.value = this.value.toLowerCase().replace(/[^a-z0-9-]/g, ''); document.getElementById('preview-url').textContent = this.value || 'yourname';"
                autofocus
              />
            </div>
            <p class="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              3-30 chars: lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.
            </p>
          </div>

          <!-- Live Preview Box -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Your public link:</span>
            <span class="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              certfolio.pages.dev/<span id="preview-url">yourname</span>
            </span>
          </div>

          <div>
            <label for="displayName" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Full Display Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              required
              maxlength="60"
              value="${escapeHtml(props.defaultDisplayName || '')}"
              placeholder="e.g. Jane Doe"
              class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            class="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/25 transition duration-150"
          >
            Confirm & Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  </main>

  ${renderFooter()}
  `;

  return baseLayout(content, {
    title: 'Claim Username | CertFolio',
  });
}

