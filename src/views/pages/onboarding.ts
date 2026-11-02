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

  <main class="flex-1 flex items-center justify-center p-4 py-16">
    <div class="w-full max-w-sm">
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-card dark:shadow-card-dark">
        
        <div class="text-center mb-6">
          <h1 class="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Choose your handle</h1>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Pick your permanent username for your public portfolio link.
          </p>
        </div>

        ${
          props.error
            ? `<div class="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                 <span>✕</span>
                 <span>${escapeHtml(props.error)}</span>
               </div>`
            : ''
        }

        <form action="/onboarding" method="POST" class="space-y-4 text-xs">
          <div>
            <label for="username" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Username
            </label>
            <div class="relative flex items-center">
              <span class="absolute left-3 text-zinc-400 font-mono select-none">/</span>
              <input
                type="text"
                id="username"
                name="username"
                required
                minlength="3"
                maxlength="30"
                pattern="^[a-z0-9]([a-z0-9-]*[a-z0-9])?$"
                placeholder="handle"
                class="w-full pl-6 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 transition"
                oninput="this.value = this.value.toLowerCase().replace(/[^a-z0-9-]/g, ''); document.getElementById('preview-url').textContent = this.value || 'handle';"
                autofocus
              />
            </div>
            <p class="mt-1 text-[10px] text-zinc-400">
              3–30 chars: lowercase letters, numbers, hyphens.
            </p>
          </div>

          <!-- Preview Pill -->
          <div class="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-[11px]">
            <span class="text-zinc-400">Preview:</span>
            <span class="font-mono text-zinc-800 dark:text-zinc-200">
              certfolio.pages.dev/<span id="preview-url" class="font-semibold text-blue-600 dark:text-blue-400">handle</span>
            </span>
          </div>

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
              value="${escapeHtml(props.defaultDisplayName || '')}"
              placeholder="e.g. Alyssa Mae"
              class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 transition"
            />
          </div>

          <button
            type="submit"
            class="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white font-semibold rounded-lg text-xs shadow-sm transition mt-2"
          >
            Claim Handle & Continue
          </button>
        </form>
      </div>
    </div>
  </main>

  ${renderFooter()}
  `;

  return baseLayout(content, {
    title: 'Claim Handle | CertFolio',
  });
}
