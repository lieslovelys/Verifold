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

  <main class="flex-1 flex items-center justify-center p-4 py-12 sm:py-20">
    <div class="w-full max-w-md">
      
      <!-- Card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div class="text-center mb-6">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">
            ${props.isVerificationStep ? 'Check your inbox' : 'Welcome to CertFolio'}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ${
              props.isVerificationStep
                ? `We sent a magic sign-in code to <strong class="text-slate-700 dark:text-slate-200">${escapeHtml(props.email)}</strong>`
                : 'Sign in or create an account with a passwordless magic link'
            }
          </p>
        </div>

        ${
          props.error
            ? `<div class="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                 <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                 <span>${escapeHtml(props.error)}</span>
               </div>`
            : ''
        }

        ${
          props.devMagicLink
            ? `<div class="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                 <div class="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                   <span>⚡ Local Dev Mode Helper</span>
                 </div>
                 <p class="text-[11px] leading-relaxed">
                   Since SMTP is optional in local development, you can sign in directly:
                 </p>
                 <div class="flex items-center gap-2 pt-1">
                   <a href="${props.devMagicLink}" class="inline-block px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-sm transition">
                     One-Click Sign In
                   </a>
                   <span class="text-xs font-mono font-bold bg-amber-200/70 dark:bg-amber-900 px-2.5 py-1 rounded-md">Code: ${props.devCode}</span>
                 </div>
               </div>`
            : ''
        }

        ${
          !props.isVerificationStep
            ? `
            <!-- Step 1: Request Code / Magic Link -->
            <form action="/auth/send-magic" method="POST" class="space-y-4">
              <div>
                <label for="email" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  value="${escapeHtml(props.email || '')}"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                  autofocus
                />
              </div>

              <button
                type="submit"
                class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/25 transition duration-150"
              >
                Send Magic Link & Code
              </button>
            </form>
            `
            : `
            <!-- Step 2: Enter 6-digit code -->
            <form action="/auth/verify-code" method="POST" class="space-y-4">
              <input type="hidden" name="email" value="${escapeHtml(props.email || '')}" />
              
              <div>
                <label for="code" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                  6-Digit Sign-in Code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  required
                  maxlength="6"
                  pattern="[0-9]{6}"
                  placeholder="123456"
                  class="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  autofocus
                />
              </div>

              <button
                type="submit"
                class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/25 transition duration-150"
              >
                Verify & Continue
              </button>

              <div class="text-center pt-2">
                <a href="/login" class="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition">
                  ← Back to change email
                </a>
              </div>
            </form>
            `
        }

        <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          No password required. Secure login powered by edge cryptographic sessions.
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

