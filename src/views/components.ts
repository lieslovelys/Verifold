import { escapeHtml, sanitizeUrl } from '../lib/sanitize';
import { Certificate } from '../db/schema';

export function renderNavbar(currentUser?: {
  username?: string | null;
  displayName?: string | null;
  email: string;
} | null): string {
  const userSection = currentUser
    ? `
      <div class="flex items-center gap-3">
        ${
          currentUser.username
            ? `<a href="/${escapeHtml(currentUser.username)}" target="_blank" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60 transition">
                <span>View Portfolio</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>`
            : ''
        }
        <a href="/dashboard" class="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">Dashboard</a>
        <a href="/dashboard/profile" class="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">Settings</a>
        <form action="/auth/logout" method="POST" class="inline m-0">
          <button type="submit" class="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition">Log out</button>
        </form>
      </div>
    `
    : `
      <div class="flex items-center gap-2">
        <a href="/login" class="px-3.5 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition">Log in</a>
        <a href="/login" class="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition">Get Started</a>
      </div>
    `;

  return `
  <header class="no-print sticky top-0 z-40 w-full backdrop-blur border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2.5 group">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
        </div>
        <span class="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">CertFolio</span>
      </a>

      <div class="flex items-center gap-4">
        <!-- Theme Switcher -->
        <button onclick="toggleDarkMode()" aria-label="Toggle dark mode" class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
        </button>

        ${userSection}
      </div>
    </div>
  </header>
  `;
}

export function renderFooter(): string {
  return `
  <footer class="no-print mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
    <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="font-semibold text-slate-800 dark:text-slate-200">CertFolio</span>
        <span>•</span>
        <span>Verified Edge Portfolios</span>
      </div>
      <div class="flex items-center gap-4">
        <span>Powered by Cloudflare Workers, D1 & R2</span>
        <span>•</span>
        <a href="/" class="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</a>
      </div>
    </div>
  </footer>
  `;
}

export function renderCertificateCard(cert: Certificate, isOwner = false): string {
  const isPdf = cert.fileType === 'application/pdf';
  const fileUrl = `/file/${encodeURIComponent(cert.fileKey)}`;
  const verifyLink = sanitizeUrl(cert.verifyUrl);

  const previewThumbnail = isPdf
    ? `<div class="w-full h-44 bg-rose-50 dark:bg-rose-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-rose-500 group-hover:scale-[1.02] transition duration-300">
         <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
         <span class="mt-2 text-xs font-bold tracking-wider uppercase">PDF Document</span>
       </div>`
    : `<div class="w-full h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-200 dark:border-slate-800">
         <img src="${fileUrl}" alt="${escapeHtml(cert.title)}" loading="lazy" class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300">
       </div>`;

  const publicBadge = isOwner
    ? cert.isPublic === 1
      ? `<span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">Public</span>`
      : `<span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">Private</span>`
    : '';

  return `
  <div data-cert-id="${cert.id}" data-category="${escapeHtml(cert.category || 'General').toLowerCase()}" data-search="${escapeHtml(cert.title + ' ' + cert.issuer).toLowerCase()}" class="cert-card group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition overflow-hidden">
    <!-- Clickable thumbnail opens preview modal -->
    <button type="button" onclick="openPreviewModal('${escapeHtml(cert.id)}', '${escapeHtml(cert.title)}', '${escapeHtml(cert.issuer)}', '${escapeHtml(cert.issuedAt)}', '${escapeHtml(cert.category || 'General')}', '${fileUrl}', ${isPdf}, '${verifyLink || ''}', '${escapeHtml(cert.description || '')}')" class="text-left w-full cursor-pointer focus:outline-none" aria-label="Preview ${escapeHtml(cert.title)}">
      ${previewThumbnail}
    </button>

    <div class="p-4 flex-1 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
            ${escapeHtml(cert.category || 'General')}
          </span>
          <div class="flex items-center gap-1.5">
            ${publicBadge}
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">${escapeHtml(cert.issuedAt)}</span>
          </div>
        </div>

        <h3 class="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
          ${escapeHtml(cert.title)}
        </h3>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
          Issued by <strong class="text-slate-700 dark:text-slate-300">${escapeHtml(cert.issuer)}</strong>
        </p>

        ${
          cert.description
            ? `<p class="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">${escapeHtml(cert.description)}</p>`
            : ''
        }
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <button type="button" onclick="openPreviewModal('${escapeHtml(cert.id)}', '${escapeHtml(cert.title)}', '${escapeHtml(cert.issuer)}', '${escapeHtml(cert.issuedAt)}', '${escapeHtml(cert.category || 'General')}', '${fileUrl}', ${isPdf}, '${verifyLink || ''}', '${escapeHtml(cert.description || '')}')" class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
          <span>View Credential</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </button>

        ${
          verifyLink
            ? `<a href="${verifyLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 transition" title="Verify authentic issuer link">
                 <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                 <span>Verify</span>
               </a>`
            : ''
        }
      </div>
    </div>
  </div>
  `;
}

export function renderPreviewModal(): string {
  return `
  <!-- Fullscreen Certificate Preview Modal -->
  <div id="preview-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 id="modal-title" class="font-bold text-lg text-slate-900 dark:text-white leading-tight"></h2>
          <p id="modal-meta" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5"></p>
        </div>
        <div class="flex items-center gap-2">
          <a id="modal-verify-btn" href="#" target="_blank" rel="noopener noreferrer" class="hidden px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">
            Verify Link
          </a>
          <a id="modal-download-btn" href="#" download class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition">
            Download
          </a>
          <button onclick="closePreviewModal()" aria-label="Close modal" class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Modal Body (Preview Canvas) -->
      <div id="modal-canvas" class="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100/60 dark:bg-slate-950/60 min-h-[350px]">
        <!-- Dynamic content injected here -->
      </div>

      <!-- Modal Footer (Description) -->
      <div id="modal-desc-container" class="hidden px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400">
        <p id="modal-desc"></p>
      </div>
    </div>
  </div>

  <script>
    function openPreviewModal(id, title, issuer, date, category, url, isPdf, verifyUrl, desc) {
      const modal = document.getElementById('preview-modal');
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-meta').textContent = issuer + ' • Issued ' + date + ' • ' + category;
      
      const verifyBtn = document.getElementById('modal-verify-btn');
      if (verifyUrl) {
        verifyBtn.href = verifyUrl;
        verifyBtn.classList.remove('hidden');
      } else {
        verifyBtn.classList.add('hidden');
      }

      const downloadBtn = document.getElementById('modal-download-btn');
      downloadBtn.href = url;

      const descBox = document.getElementById('modal-desc');
      const descContainer = document.getElementById('modal-desc-container');
      if (desc && desc.trim().length > 0) {
        descBox.textContent = desc;
        descContainer.classList.remove('hidden');
      } else {
        descContainer.classList.add('hidden');
      }

      const canvas = document.getElementById('modal-canvas');
      if (isPdf) {
        canvas.innerHTML = '<iframe src="' + url + '#toolbar=1" class="w-full h-[65vh] rounded-lg border border-slate-300 dark:border-slate-700 bg-white" title="' + title + '"></iframe>';
      } else {
        canvas.innerHTML = '<img src="' + url + '" alt="' + title + '" class="max-h-[68vh] max-w-full rounded-lg shadow-lg object-contain bg-white dark:bg-slate-900">';
      }

      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }

    function closePreviewModal() {
      const modal = document.getElementById('preview-modal');
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      document.getElementById('modal-canvas').innerHTML = '';
    }

    // Close on backdrop click or ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePreviewModal();
    });
    document.getElementById('preview-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'preview-modal') closePreviewModal();
    });
  </script>
  `;
}

