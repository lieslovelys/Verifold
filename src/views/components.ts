import { escapeHtml, sanitizeUrl } from '../lib/sanitize';
import { Certificate } from '../db/schema';

export function renderLogo(): string {
  return `
  <div class="flex items-center gap-2.5 group">
    <div class="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 shadow-sm transition-transform duration-200 group-hover:scale-105">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    </div>
    <div class="flex items-baseline gap-1">
      <span class="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">CertFolio</span>
      <span class="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
    </div>
  </div>
  `;
}

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
            ? `<a href="/${escapeHtml(currentUser.username)}" target="_blank" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 transition">
                <span>Public Page</span>
                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>`
            : ''
        }
        <a href="/dashboard" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition">Dashboard</a>
        <a href="/dashboard/profile" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition">Settings</a>
        <form action="/auth/logout" method="POST" class="inline m-0">
          <button type="submit" class="px-2.5 py-1 text-xs font-medium text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition">Sign out</button>
        </form>
      </div>
    `
    : `
      <div class="flex items-center gap-2">
        <a href="/login" class="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition">Sign in</a>
        <a href="/login" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-lg shadow-sm transition">Get started</a>
      </div>
    `;

  return `
  <header class="no-print sticky top-0 z-40 w-full backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-850 bg-white/80 dark:bg-zinc-950/80">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <a href="/" class="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
        ${renderLogo()}
      </a>

      <div class="flex items-center gap-3">
        <!-- Theme Switcher -->
        <button onclick="toggleDarkMode()" aria-label="Toggle color theme" class="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 transition">
          <svg class="w-4 h-4 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          <svg class="w-4 h-4 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
        </button>

        ${userSection}
      </div>
    </div>
  </header>
  `;
}

export function renderFooter(): string {
  return `
  <footer class="no-print mt-auto border-t border-zinc-200/70 dark:border-zinc-850/80 bg-white dark:bg-zinc-950 py-8 text-xs text-zinc-500 dark:text-zinc-400">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="font-semibold text-zinc-900 dark:text-white">CertFolio</span>
        <span class="text-zinc-300 dark:text-zinc-700">•</span>
        <span>Verified credential portfolios</span>
      </div>
      <div class="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
        <span>Powered by Cloudflare Workers & R2</span>
        <span class="text-zinc-300 dark:text-zinc-700">•</span>
        <a href="/" class="hover:text-zinc-900 dark:hover:text-white transition">Home</a>
      </div>
    </div>
  </footer>
  `;
}

export function renderCertificateCard(cert: Certificate, isOwner = false): string {
  const isPdf = cert.fileType === 'application/pdf';
  const fileUrl = `/file/${encodeURIComponent(cert.fileKey)}`;
  const verifyLink = sanitizeUrl(cert.verifyUrl);

  const issuerInitials = (cert.issuer || 'C')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const previewFrame = isPdf
    ? `<div class="relative w-full h-44 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col items-center justify-center p-4 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-850/80 transition duration-200">
         <div class="w-12 h-14 rounded bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400">
           <svg class="w-6 h-6 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
           <span class="text-[9px] font-mono font-bold uppercase mt-1 tracking-wider text-rose-500">PDF</span>
         </div>
         <span class="mt-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Official Document</span>
       </div>`
    : `<div class="relative w-full h-44 bg-zinc-100 dark:bg-zinc-900 overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800/80">
         <img src="${fileUrl}" alt="${escapeHtml(cert.title)}" loading="lazy" class="w-full h-full object-cover object-top filter brightness-[0.98] group-hover:scale-[1.03] transition duration-300">
       </div>`;

  const publicBadge = isOwner
    ? cert.isPublic === 1
      ? `<span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/50">Public</span>`
      : `<span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">Private</span>`
    : '';

  return `
  <article data-cert-id="${cert.id}" data-category="${escapeHtml(cert.category || 'General').toLowerCase()}" data-search="${escapeHtml(cert.title + ' ' + cert.issuer).toLowerCase()}" class="cert-card group flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/90 dark:border-zinc-800 shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-dark-hover transition duration-200 overflow-hidden">
    
    <!-- Thumbnail preview trigger -->
    <button type="button" onclick="openPreviewModal('${escapeHtml(cert.id)}', '${escapeHtml(cert.title)}', '${escapeHtml(cert.issuer)}', '${escapeHtml(cert.issuedAt)}', '${escapeHtml(cert.category || 'General')}', '${fileUrl}', ${isPdf}, '${verifyLink || ''}', '${escapeHtml(cert.description || '')}')" class="text-left w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Inspect ${escapeHtml(cert.title)}">
      ${previewFrame}
    </button>

    <!-- Content -->
    <div class="p-4 flex-1 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-mono text-[9px] font-bold text-zinc-600 dark:text-zinc-300">
              ${issuerInitials}
            </span>
            <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400 line-clamp-1">${escapeHtml(cert.issuer)}</span>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            ${publicBadge}
            <span class="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">${escapeHtml(cert.issuedAt)}</span>
          </div>
        </div>

        <h3 class="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug line-clamp-2">
          ${escapeHtml(cert.title)}
        </h3>

        ${
          cert.description
            ? `<p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">${escapeHtml(cert.description)}</p>`
            : ''
        }
      </div>

      <!-- Action row -->
      <div class="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          ${escapeHtml(cert.category || 'General')}
        </span>

        <div class="flex items-center gap-2">
          ${
            verifyLink
              ? `<a href="${verifyLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline" title="Verify directly with issuer">
                   <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                   <span>Verify</span>
                 </a>`
              : ''
          }
          <button type="button" onclick="openPreviewModal('${escapeHtml(cert.id)}', '${escapeHtml(cert.title)}', '${escapeHtml(cert.issuer)}', '${escapeHtml(cert.issuedAt)}', '${escapeHtml(cert.category || 'General')}', '${fileUrl}', ${isPdf}, '${verifyLink || ''}', '${escapeHtml(cert.description || '')}')" class="px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            View
          </button>
        </div>
      </div>
    </div>
  </article>
  `;
}

export function renderPreviewModal(): string {
  return `
  <!-- Native HTML5 Dialog Document Viewer -->
  <dialog id="preview-modal" class="p-0 m-auto bg-transparent focus:outline-none" aria-labelledby="modal-title">
    <div class="w-[94vw] max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-925 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      
      <!-- Modal Header -->
      <div class="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/70 dark:bg-zinc-900/60">
        <div class="min-w-0">
          <h2 id="modal-title" class="font-bold text-sm text-zinc-900 dark:text-white truncate"></h2>
          <p id="modal-meta" class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate"></p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <a id="modal-verify-btn" href="#" target="_blank" rel="noopener noreferrer" class="hidden px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition">
            Verify Link ↗
          </a>
          <a id="modal-download-btn" href="#" download class="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition">
            Download
          </a>
          <button type="button" onclick="closePreviewModal()" aria-label="Close dialog" class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Canvas / Viewport -->
      <div id="modal-canvas" class="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-zinc-100/60 dark:bg-zinc-950/70 min-h-[380px]"></div>

      <!-- Description Footer -->
      <div id="modal-desc-container" class="hidden px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-925 text-xs text-zinc-600 dark:text-zinc-400">
        <p id="modal-desc" class="leading-relaxed"></p>
      </div>
    </div>
  </dialog>

  <script>
    function openPreviewModal(id, title, issuer, date, category, url, isPdf, verifyUrl, desc) {
      const dialog = document.getElementById('preview-modal');
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
        canvas.innerHTML = '<iframe src="' + url + '#toolbar=1" class="w-full h-[66vh] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white" title="' + title + '"></iframe>';
      } else {
        canvas.innerHTML = '<img src="' + url + '" alt="' + title + '" class="max-h-[68vh] max-w-full rounded-lg shadow-md object-contain bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">';
      }

      dialog.showModal();
    }

    function closePreviewModal() {
      const dialog = document.getElementById('preview-modal');
      dialog.close();
      document.getElementById('modal-canvas').innerHTML = '';
    }

    // Light-dismiss click outside dialog content box
    document.getElementById('preview-modal')?.addEventListener('click', (e) => {
      const dialog = document.getElementById('preview-modal');
      const rect = dialog.getBoundingClientRect();
      const inDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
        && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!inDialog) {
        closePreviewModal();
      }
    });
  </script>
  `;
}
