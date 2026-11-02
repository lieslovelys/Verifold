import { baseLayout } from '../layout';
import { renderNavbar, renderFooter, renderPreviewModal } from '../components';
import { User, Certificate } from '../../db/schema';
import { escapeHtml, sanitizeUrl } from '../../lib/sanitize';

export interface DashboardProps {
  user: User;
  certificates: Certificate[];
  viewsCount: number;
  message?: string;
  error?: string;
}

export function renderDashboardPage(props: DashboardProps): string {
  const { user, certificates, viewsCount } = props;
  const maxCerts = 30;
  const certCount = certificates.length;
  const publicCount = certificates.filter((c) => c.isPublic === 1).length;
  const publicUrl = `/${escapeHtml(user.username || '')}`;

  const certRows = certificates.map((cert, index) => {
    const isPdf = cert.fileType === 'application/pdf';
    const fileUrl = `/file/${encodeURIComponent(cert.fileKey)}`;
    const verifyLink = sanitizeUrl(cert.verifyUrl);

    return `
    <tr data-id="${escapeHtml(cert.id)}" draggable="true" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)" ondragend="handleDragEnd(event)" class="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
      <!-- Drag Handle & Order -->
      <td class="py-4 px-3 text-center w-16">
        <div class="flex items-center gap-1.5 justify-center text-slate-400">
          <span class="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 dark:hover:text-slate-200" title="Drag to reorder">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/></svg>
          </span>
          <button type="button" onclick="moveCert('${escapeHtml(cert.id)}', -1)" ${index === 0 ? 'disabled class="opacity-20"' : 'class="hover:text-blue-600"'} title="Move up">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
          </button>
          <button type="button" onclick="moveCert('${escapeHtml(cert.id)}', 1)" ${index === certificates.length - 1 ? 'disabled class="opacity-20"' : 'class="hover:text-blue-600"'} title="Move down">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>
      </td>

      <!-- Thumbnail & Title -->
      <td class="py-4 px-3">
        <div class="flex items-center gap-3">
          <button type="button" onclick="openPreviewModal('${escapeHtml(cert.id)}', '${escapeHtml(cert.title)}', '${escapeHtml(cert.issuer)}', '${escapeHtml(cert.issuedAt)}', '${escapeHtml(cert.category || 'General')}', '${fileUrl}', ${isPdf}, '${verifyLink || ''}', '${escapeHtml(cert.description || '')}')" class="shrink-0 w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center hover:opacity-80 transition">
            ${
              isPdf
                ? `<span class="text-xs font-bold text-rose-500">PDF</span>`
                : `<img src="${fileUrl}" alt="${escapeHtml(cert.title)}" class="w-full h-full object-cover">`
            }
          </button>
          <div>
            <div class="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">${escapeHtml(cert.title)}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              ${escapeHtml(cert.issuer)} • <span class="text-slate-400">${escapeHtml(cert.issuedAt)}</span>
            </div>
          </div>
        </div>
      </td>

      <!-- Category -->
      <td class="py-4 px-3 hidden sm:table-cell">
        <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          ${escapeHtml(cert.category || 'General')}
        </span>
      </td>

      <!-- Visibility Toggle -->
      <td class="py-4 px-3 text-center">
        <button type="button" onclick="toggleVisibility('${escapeHtml(cert.id)}', this)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
          cert.isPublic === 1
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
        }">
          <span class="w-1.5 h-1.5 rounded-full ${cert.isPublic === 1 ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
          <span>${cert.isPublic === 1 ? 'Public' : 'Private'}</span>
        </button>
      </td>

      <!-- Actions -->
      <td class="py-4 px-3 text-right">
        <div class="flex items-center justify-end gap-2">
          <button type="button" onclick="openEditModal(${escapeHtml(JSON.stringify(cert))})" class="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="Edit">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button type="button" onclick="deleteCert('${escapeHtml(cert.id)}', '${escapeHtml(cert.title)}')" class="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition" title="Delete">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
    `;
  }).join('');

  const content = `
  ${renderNavbar(user)}

  <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
    
    <!-- Top Bar: Title & Public Link Box -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">Portfolio Dashboard</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your credentials, upload new certificates, and customize your portfolio.
        </p>
      </div>

      <!-- Quick Link Pill -->
      <div class="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-sm">
        <span class="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 pl-2">
          ${escapeHtml(user.username ? `/${user.username}` : 'No username set')}
        </span>
        ${
          user.username
            ? `
            <a href="${publicUrl}" target="_blank" class="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition">
              Open ↗
            </a>
            <button onclick="copyPublicUrl('${publicUrl}')" class="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition">
              Copy Link
            </button>
            <button onclick="copyResumeSnippet('${publicUrl}')" class="hidden sm:inline-block px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition" title="Copy Markdown link formatted for resume">
              Copy for Resume
            </button>
            `
            : `<a href="/onboarding" class="px-2.5 py-1 text-xs font-bold text-amber-600 bg-amber-50 rounded-lg">Set Username</a>`
        }
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400">Certificates</div>
        <div class="text-2xl font-black text-slate-900 dark:text-white mt-1">
          ${certCount} <span class="text-xs font-normal text-slate-400">/ ${maxCerts}</span>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400">Public Live</div>
        <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${publicCount}</div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400">Private Only</div>
        <div class="text-2xl font-black text-slate-600 dark:text-slate-400 mt-1">${certCount - publicCount}</div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400">Portfolio Views</div>
        <div class="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">${viewsCount}</div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Your Credentials</h2>
        <span class="text-xs text-slate-500">Order by preference or drag/move</span>
      </div>

      <button
        onclick="openAddModal()"
        ${certCount >= maxCerts ? 'disabled' : ''}
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        <span>Add Certificate</span>
      </button>
    </div>

    <!-- Certificates Table / Empty State -->
    <div class="mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      ${
        certificates.length > 0
          ? `
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th class="py-3 px-3 text-center w-12">Order</th>
                  <th class="py-3 px-3">Certificate & Issuer</th>
                  <th class="py-3 px-3 hidden sm:table-cell">Category</th>
                  <th class="py-3 px-3 text-center">Status</th>
                  <th class="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="cert-table-body">
                ${certRows}
              </tbody>
            </table>
          </div>
          `
          : `
          <div class="py-16 px-4 text-center">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 class="font-bold text-lg text-slate-900 dark:text-white">No certificates uploaded yet</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Start building your portfolio! Upload PDF credentials, scanned certificates, or accomplishment badges.
            </p>
            <button onclick="openAddModal()" class="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>Add Your First Certificate</span>
            </button>
          </div>
          `
      }
    </div>
  </main>

  <!-- Add / Edit Certificate Modal -->
  <div id="cert-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
    <div class="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 id="modal-heading" class="font-extrabold text-lg text-slate-900 dark:text-white">Add Certificate</h2>
        <button onclick="closeCertModal()" class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <form id="cert-form" onsubmit="handleCertSubmit(event)" class="overflow-y-auto p-6 space-y-4">
        <input type="hidden" id="form-cert-id" name="id" value="" />

        <!-- File Upload Section (Only required when creating) -->
        <div id="file-input-container">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Certificate File <span class="text-rose-500">*</span>
          </label>
          <div class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-5 text-center bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition cursor-pointer relative">
            <input type="file" id="form-file" name="file" accept="image/png,image/jpeg,image/webp,application/pdf" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onchange="previewSelectedFile(this)" />
            <div id="file-drop-text" class="flex flex-col items-center justify-center text-xs text-slate-500">
              <svg class="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
              <span class="font-bold text-slate-700 dark:text-slate-200">Click to upload or drag & drop</span>
              <span class="mt-1 text-[11px] text-slate-400">PNG, JPEG, WEBP, or PDF (Max 5 MB)</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="form-title" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Title <span class="text-rose-500">*</span>
            </label>
            <input type="text" id="form-title" name="title" required placeholder="e.g. AWS Solutions Architect" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label for="form-issuer" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Issuer / Institution <span class="text-rose-500">*</span>
            </label>
            <input type="text" id="form-issuer" name="issuer" required placeholder="e.g. Amazon Web Services" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="form-issued-at" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Issue Date <span class="text-rose-500">*</span>
            </label>
            <input type="text" id="form-issued-at" name="issuedAt" required placeholder="YYYY-MM (e.g. 2024-05)" pattern="^\\d{4}(-\\d{2})?(-\\d{2})?$" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label for="form-category" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <input type="text" id="form-category" name="category" placeholder="Cloud, Security, Dev, etc." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label for="form-verify-url" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Verification URL (Optional)
          </label>
          <input type="url" id="form-verify-url" name="verifyUrl" placeholder="https://www.credly.com/badges/..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label for="form-description" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Description / Skills (Optional)
          </label>
          <textarea id="form-description" name="description" rows="2" placeholder="Key skills demonstrated, credential ID, score, or notes..." class="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <input type="checkbox" id="form-is-public" name="isPublic" value="1" checked class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
          <label for="form-is-public" class="text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
            Visible on my public portfolio
          </label>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button type="button" onclick="closeCertModal()" class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" id="form-submit-btn" class="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition">
            Save Certificate
          </button>
        </div>
      </form>
    </div>
  </div>

  ${renderPreviewModal()}

  <script>
    function copyPublicUrl(path) {
      const full = window.location.origin + path;
      navigator.clipboard.writeText(full).then(() => {
        showToast('Portfolio link copied to clipboard!', 'success');
      });
    }

    function copyResumeSnippet(path) {
      const full = window.location.origin + path;
      const snippet = '[Verified Certificate Portfolio](' + full + ')';
      navigator.clipboard.writeText(snippet).then(() => {
        showToast('Markdown link copied! Ready to paste into your resume.', 'success');
      });
    }

    function previewSelectedFile(input) {
      const file = input.files[0];
      const dropText = document.getElementById('file-drop-text');
      if (file) {
        dropText.innerHTML = '<span class="font-bold text-emerald-600 dark:text-emerald-400">✓ Selected: ' + file.name + '</span><span class="text-[11px] text-slate-400 mt-1">' + (file.size / 1024 / 1024).toFixed(2) + ' MB</span>';
      }
    }

    function openAddModal() {
      document.getElementById('modal-heading').textContent = 'Add Certificate';
      document.getElementById('form-cert-id').value = '';
      document.getElementById('cert-form').reset();
      document.getElementById('form-is-public').checked = true;
      document.getElementById('file-input-container').classList.remove('hidden');
      document.getElementById('form-file').required = true;
      document.getElementById('file-drop-text').innerHTML = '<svg class="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg><span class="font-bold text-slate-700 dark:text-slate-200">Click to upload or drag & drop</span><span class="mt-1 text-[11px] text-slate-400">PNG, JPEG, WEBP, or PDF (Max 5 MB)</span>';
      
      document.getElementById('cert-modal').classList.remove('hidden');
    }

    function openEditModal(cert) {
      document.getElementById('modal-heading').textContent = 'Edit Certificate';
      document.getElementById('form-cert-id').value = cert.id;
      document.getElementById('form-title').value = cert.title || '';
      document.getElementById('form-issuer').value = cert.issuer || '';
      document.getElementById('form-issued-at').value = cert.issuedAt || '';
      document.getElementById('form-category').value = cert.category || '';
      document.getElementById('form-verify-url').value = cert.verifyUrl || '';
      document.getElementById('form-description').value = cert.description || '';
      document.getElementById('form-is-public').checked = cert.isPublic === 1;

      // File input is optional on edit
      document.getElementById('form-file').required = false;
      document.getElementById('file-drop-text').innerHTML = '<span class="text-xs text-slate-400">Optional: Choose a new file to replace the existing one</span>';
      
      document.getElementById('cert-modal').classList.remove('hidden');
    }

    function closeCertModal() {
      document.getElementById('cert-modal').classList.add('hidden');
    }

    async function handleCertSubmit(e) {
      e.preventDefault();
      const form = document.getElementById('cert-form');
      const submitBtn = document.getElementById('form-submit-btn');
      const certId = document.getElementById('form-cert-id').value;
      const formData = new FormData(form);

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      try {
        const url = certId ? '/api/certificates/' + certId : '/api/certificates';
        const res = await fetch(url, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to save certificate');
        }

        showToast(certId ? 'Certificate updated!' : 'Certificate uploaded!', 'success');
        closeCertModal();
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Certificate';
      }
    }

    async function toggleVisibility(certId, btn) {
      try {
        const res = await fetch('/api/certificates/' + certId + '/toggle-visibility', {
          method: 'POST',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to toggle');

        showToast('Visibility updated to ' + (data.isPublic ? 'Public' : 'Private'), 'info');
        setTimeout(() => window.location.reload(), 300);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    async function deleteCert(certId, title) {
      if (!confirm('Are you sure you want to delete "' + title + '"? This will remove the certificate and its file permanently.')) {
        return;
      }

      try {
        const res = await fetch('/api/certificates/' + certId, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete');

        showToast('Certificate deleted', 'info');
        setTimeout(() => window.location.reload(), 300);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    let draggedRow = null;

    function handleDragStart(e) {
      draggedRow = e.currentTarget;
      e.dataTransfer.effectAllowed = 'move';
      e.currentTarget.classList.add('opacity-40', 'bg-blue-50', 'dark:bg-blue-950/40');
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const row = e.currentTarget.closest('tr');
      if (row && row !== draggedRow) {
        row.classList.add('border-t-2', 'border-blue-500');
      }
    }

    function handleDragLeave(e) {
      const row = e.currentTarget.closest('tr');
      if (row) {
        row.classList.remove('border-t-2', 'border-blue-500');
      }
    }

    function handleDrop(e) {
      e.preventDefault();
      const targetRow = e.currentTarget.closest('tr');
      if (!targetRow || targetRow === draggedRow) return;
      targetRow.classList.remove('border-t-2', 'border-blue-500');

      const tbody = document.getElementById('cert-table-body');
      const rows = Array.from(tbody.querySelectorAll('tr[data-id]'));
      const fromIdx = rows.indexOf(draggedRow);
      const toIdx = rows.indexOf(targetRow);

      if (fromIdx < toIdx) {
        targetRow.after(draggedRow);
      } else {
        targetRow.before(draggedRow);
      }

      // Save new order asynchronously
      const updatedRows = Array.from(tbody.querySelectorAll('tr[data-id]'));
      const newOrder = updatedRows.map(r => r.dataset.id);
      fetch('/api/certificates/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      }).then(res => {
        if (res.ok) showToast('Order updated!', 'success');
      });
    }

    function handleDragEnd(e) {
      if (draggedRow) {
        draggedRow.classList.remove('opacity-40', 'bg-blue-50', 'dark:bg-blue-950/40');
        draggedRow = null;
      }
      document.querySelectorAll('#cert-table-body tr').forEach(r => {
        r.classList.remove('border-t-2', 'border-blue-500');
      });
    }

    async function moveCert(certId, direction) {
      const tbody = document.getElementById('cert-table-body');
      const rows = Array.from(tbody.querySelectorAll('tr[data-id]'));
      const idx = rows.findIndex(r => r.dataset.id === certId);
      if (idx === -1) return;

      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= rows.length) return;

      // Swap IDs
      const newOrder = rows.map(r => r.dataset.id);
      const temp = newOrder[idx];
      newOrder[idx] = newOrder[targetIdx];
      newOrder[targetIdx] = temp;

      try {
        const res = await fetch('/api/certificates/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: newOrder }),
        });
        if (!res.ok) throw new Error('Failed to save order');
        window.location.reload();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  </script>
  `;

  return baseLayout(content, {
    title: 'Dashboard | CertFolio',
    currentUser: user,
  });
}

