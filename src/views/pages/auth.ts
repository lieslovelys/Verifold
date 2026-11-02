import { baseLayout } from '../layout';
import { renderNavbar, renderFooter } from '../components';
import { escapeHtml } from '../../lib/sanitize';

export interface AuthPageProps {
  email?: string;
  error?: string;
  successMessage?: string;
  devMagicLink?: string;
  devCode?: string;
  isVerificationStep?: boolean;
}

export function renderAuthPage(props: AuthPageProps = {}): string {
  const content = `
  ${renderNavbar(null)}

  <main class="flex-1 flex items-center justify-center p-4 py-16">
    <div class="w-full max-w-sm">
      
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-card dark:shadow-card-dark">
        <div class="text-center mb-6">
          <div class="w-10 h-10 mx-auto rounded-xl bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 shadow-sm mb-3">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <h1 class="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
            ${props.isVerificationStep ? 'Verify your identity' : 'Sign in to CertFolio'}
          </h1>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            ${
              props.isVerificationStep
                ? `Enter the 6-digit code sent to <span class="font-medium text-zinc-800 dark:text-zinc-200">${escapeHtml(props.email)}</span>`
                : 'Passwordless sign-in with edge security'
            }
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

        ${
          props.devMagicLink
            ? `<div class="mb-5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
                 <div class="font-mono text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                   ⚡ Dev Mode Quick Auth
                 </div>
                 <div class="flex items-center gap-2">
                   <a href="${props.devMagicLink}" class="inline-block px-3 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded text-xs transition">
                     Instant Sign In
                   </a>
                   <span class="text-xs font-mono font-bold bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-800 dark:text-zinc-200">${props.devCode}</span>
                 </div>
               </div>`
            : ''
        }

        ${
          !props.isVerificationStep
            ? `
            <form action="/auth/send-magic" method="POST" class="space-y-4">
              <div>
                <label for="email" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="name@company.com"
                  value="${escapeHtml(props.email || '')}"
                  class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
                  autofocus
                />
              </div>

              <button
                type="submit"
                class="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white font-semibold rounded-lg text-xs shadow-sm transition"
              >
                Send Magic Link
              </button>
            </form>
            `
            : `
            <form action="/auth/verify-code" method="POST" class="space-y-4">
              <input type="hidden" name="email" value="${escapeHtml(props.email || '')}" />
              
              <div>
                <label for="code" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  required
                  maxlength="6"
                  pattern="[0-9]{6}"
                  placeholder="123456"
                  class="w-full text-center tracking-[0.4em] font-mono text-xl font-bold px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 transition"
                  autofocus
                />
              </div>

              <button
                type="submit"
                class="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white font-semibold rounded-lg text-xs shadow-sm transition"
              >
                Confirm Code
              </button>

              <div class="text-center pt-1">
                <a href="/login" class="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition">
                  ← Change email
                </a>
              </div>
            </form>
            `
        }

        <div class="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center text-[11px] text-zinc-400">
          Encrypted sessions on Cloudflare Workers edge.
        </div>
      </div>
    </div>
  </main>

  ${renderFooter()}
  `;

  return baseLayout(content, {
    title: 'Sign In | CertFolio',
  });
}
