import { baseLayout } from '../layout';
import { renderNavbar, renderFooter } from '../components';

export function renderNotFoundPage(title = 'Page Not Found', message = "The portfolio or certificate page you are looking for doesn't exist."): string {
  const content = `
  ${renderNavbar(null)}

  <main class="flex-1 flex items-center justify-center p-4 py-20 text-center">
    <div class="max-w-md mx-auto">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-3xl font-bold mb-4">
        🔍
      </div>
      <h1 class="text-3xl font-black text-slate-900 dark:text-white">${title}</h1>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
        ${message}
      </p>
      <div class="mt-6 flex items-center justify-center gap-3">
        <a href="/" class="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition">
          Return Home
        </a>
        <a href="/login" class="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl transition">
          Sign In
        </a>
      </div>
    </div>
  </main>

  ${renderFooter()}
  `;

  return baseLayout(content, { title });
}

