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
    <tr data-id="${escapeHtml(cert.id)}" draggable="true" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)" ondragend="handleDragEnd(event)" class="border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/80 dark:hover:bg-zinc-850/50 transition duration-150">
      
      <!-- Reorder Grip -->
      <td class="py-3 px-3 text-center w-14">
        <div class="flex items-center gap-1 justify-center text-zinc-400">
          <span class="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-300 p-0.5" title="Drag to reorder">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/></svg>
          </span>
          <button type="button" onclick="moveCert('${escapeHtml(cert.id)}', -1)" ${index === 0 ? 'disabled class="opacity-20"' : 'class="hover:text-zinc-900 dark:hover:text-white"'} title="Move up">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
          </button>
          <button type="button" onclick="moveCert('${escapeHtml(cert.id)}', 1)" ${index === certificates.length - 1 ? 'disabled class="opacity-20"' : 'class="hover:text-zinc-900 dark:hover:text-white"'} title="Move down">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>
      </td>

      <!-- Thumbnail & Info -->
      <td class="py-3 px-3">
        <div class="flex items-center gap-3">
          <button type="button" onclick="openPreviewModal('${escapeHtml(cert.id)}', '${escapeHtml(cert.title)}', '${escapeHtml(cert.issuer)}', '${escapeHtml(cert.issuedAt)}', '${escapeHtml(cert.category || 'General')}', '${fileUrl}', ${isPdf}, '${verifyLink || ''}', '${escapeHtml(cert.description || '')}')" class="shrink-0 w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center hover:opacity-80 transition">
            ${
              isPdf
                ? `<span class="text-[9px] font-mono font-bold text-rose-500">PDF</span>`
                : `<img src="${fileUrl}" alt="${escapeHtml(cert.title)}" class="w-full h-full object-cover">`
            }
          </button>
          <div class="min-w-0">
            <div class="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">${escapeHtml(cert.title)}</div>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              ${escapeHtml(cert.issuer)} <span class="text-zinc-300 dark:text-zinc-700">•</span> <span class="font-mono text-zinc-400">${escapeHtml(cert.issuedAt)}</span>
            </div>
          </div>
        </div>
      </td>

      <!-- Category -->
      <td class="py-3 px-3 hidden sm:table-cell">
        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          ${escapeHtml(cert.category || 'General')}
        </span>
      </td>

      <!-- Status Toggle -->
      <td class="py-3 px-3 text-center">
        <button type="button" onclick="toggleVisibility('${escapeHtml(cert.id)}', this)" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium transition ${
          cert.isPublic === 1
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
        }">
          <span class="w-1.5 h-1.5 rounded-full ${cert.isPublic === 1 ? 'bg-emerald-500' : 'bg-zinc-400'}"></span>
          <span>${cert.isPublic === 1 ? 'Public' : 'Private'}</span>
        </button>
      </td>

      <!-- Actions -->
      <td class="py-3 px-3 text-right">
        <div class="flex items-center justify-end gap-1.5">
          <button type="button" onclick="openEditModal(${escapeHtml(JSON.stringify(cert))})" class="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" title="Edit">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button type="button" onclick="deleteCert('${escapeHtml(cert.id)}', '${escapeHtml(cert.title)}')" class="p-1.5 text-zinc-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition" title="Delete">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
    `;
  }).join('');

  const content = `
  ${renderNavbar(user)}

  <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
    
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Credentials Dashboard</h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Manage your credentials, verify links, and control visibility.
        </p>
      </div>

      <!-- Vanity Link Pill -->
      <div class="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 shadow-subtle">
        <span class="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 px-2">
          ${escapeHtml(user.username ? `/${user.username}` : 'No username set')}
        </span>
        ${
          user.username
            ? `
            <a href="${publicUrl}" target="_blank" class="px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition">
              Open ↗
            </a>
            <button onclick="copyPublicUrl('${publicUrl}')" class="px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition">
              Copy Link
            </button>
            <button onclick="copyResumeSnippet('${publicUrl}')" class="hidden sm:inline-block px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition" title="Copy Markdown link formatted for resume">
              Copy for Resume
            </button>
            `
            : `<a href="/onboarding" class="px-2 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded">Set Username</a>`
        }
      </div>
    </div>

    <!-- Stat Grid -->
    <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-3.5 shadow-subtle">
        <div class="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total</div>
        <div class="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
          ${certCount} <span class="text-xs font-normal text-zinc-400">/ ${maxCerts}</span>
        </div>
      </div>
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-3.5 shadow-subtle">
        <div class="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Public Live</div>
        <div class="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">${publicCount}</div>
      </div>
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-3.5 shadow-subtle">
        <div class="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Private</div>
        <div class="text-xl font-bold font-mono text-zinc-600 dark:text-zinc-400 mt-1">${certCount - publicCount}</div>
      </div>
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-3.5 shadow-subtle">
        <div class="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Profile Views</div>
        <div class="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1">${viewsCount}</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="mt-8 flex items-center justify-between gap-4">
      <div>
        <h2 class="text-sm font-bold text-zinc-900 dark:text-white">Credentials</h2>
        <span class="text-[11px] text-zinc-400">Drag or use arrow buttons to prioritize credentials</span>
      </div>

      <button
        onclick="openAddModal()"
        ${certCount >= maxCerts ? 'disabled' : ''}
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm disabled:opacity-50 transition"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        <span>Add Credential</span>
      </button>
    </div>

    <!-- Table -->
    <div class="mt-3 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl shadow-subtle overflow-hidden">
      ${
        certificates.length > 0
          ? `
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th class="py-2.5 px-3 text-center w-14">Order</th>
                  <th class="py-2.5 px-3">Title & Issuer</th>
                  <th class="py-2.5 px-3 hidden sm:table-cell">Category</th>
                  <th class="py-2.5 px-3 text-center">Visibility</th>
                  <th class="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="cert-table-body">
                ${certRows}
              </tbody>
            </table>
          </div>
          `
          : `
          <div class="py-14 px-4 text-center">
            <h3 class="font-semibold text-sm text-zinc-900 dark:text-white">No certificates uploaded yet</h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
              Upload PDF documents or images of your certifications to showcase them.
            </p>
            <button onclick="openAddModal()" class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>Add Credential</span>
            </button>
          </div>
          `
      }
    </div>
  </main>

  <!-- Native HTML5 Dialog: Add / Edit Credential -->
  <dialog id="cert-modal" class="p-0 m-auto bg-transparent focus:outline-none" aria-labelledby="modal-heading">
    <div class="w-[94vw] max-w-lg flex flex-col bg-white dark:bg-zinc-925 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      
      <div class="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/60">
        <h2 id="modal-heading" class="font-bold text-sm text-zinc-900 dark:text-white">Add Credential</h2>
        <button onclick="closeCertModal()" class="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <form id="cert-form" onsubmit="handleCertSubmit(event)" class="p-5 space-y-4 text-xs">
        <input type="hidden" id="form-cert-id" name="id" value="" />

        <!-- File Upload Box -->
        <div id="file-input-container">
          <label class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Certificate File <span class="text-rose-500">*</span>
          </label>
          <div class="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 text-center bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100/70 dark:hover:bg-zinc-850 transition cursor-pointer relative">
            <input type="file" id="form-file" name="file" accept="image/png,image/jpeg,image/webp,application/pdf" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onchange="previewSelectedFile(this)" />
            <div id="file-drop-text" class="flex flex-col items-center justify-center text-xs text-zinc-500">
              <span class="font-semibold text-zinc-800 dark:text-zinc-200">Select file or drag & drop</span>
              <span class="text-[10px] text-zinc-400 mt-0.5">PNG, JPEG, WEBP, or PDF (Max 5 MB)</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="form-title" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Title <span class="text-rose-500">*</span>
            </label>
            <input type="text" id="form-title" name="title" required placeholder="AWS Solutions Architect" class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400" />
          </div>

          <div>
            <label for="form-issuer" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Issuer <span class="text-rose-500">*</span>
            </label>
            <input type="text" id="form-issuer" name="issuer" required placeholder="Amazon Web Services" class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="form-issued-at" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Issue Date <span class="text-rose-500">*</span>
            </label>
            <input type="text" id="form-issued-at" name="issuedAt" required placeholder="YYYY-MM (e.g. 2024-05)" pattern="^\\d{4}(-\\d{2})?(-\\d{2})?$" class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400" />
          </div>

          <div>
            <label for="form-category" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Category
            </label>
            <input type="text" id="form-category" name="category" placeholder="Cloud, Security, Dev" class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400" />
          </div>
        </div>

        <div>
          <label for="form-verify-url" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Verification URL
          </label>
          <input type="url" id="form-verify-url" name="verifyUrl" placeholder="https://www.credly.com/..." class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400" />
        </div>

        <div>
          <label for="form-description" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Description
          </label>
          <textarea id="form-description" name="description" rows="2" placeholder="Skills, credential ID, score, or notes..." class="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"></textarea>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input type="checkbox" id="form-is-public" name="isPublic" value="1" checked class="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-0" />
          <label for="form-is-public" class="text-xs text-zinc-700 dark:text-zinc-300 font-medium select-none">
            Publicly visible on my portfolio
          </label>
        </div>

        <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button type="button" onclick="closeCertModal()" class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            Cancel
          </button>
          <button type="submit" id="form-submit-btn" class="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm transition">
            Save Credential
          </button>
        </div>
      </form>
    </div>
  </dialog>

  ${renderPreviewModal()}

  <script>
    function copyPublicUrl(path) {
      const full = window.location.origin + path;
      navigator.clipboard.writeText(full).then(() => {
        showToast('Portfolio link copied to clipboard', 'success');
      });
    }

    function copyResumeSnippet(path) {
      const full = window.location.origin + path;
      const snippet = '[Verified Certificate Portfolio](' + full + ')';
      navigator.clipboard.writeText(snippet).then(() => {
        showToast('Markdown link copied! Ready to paste into resume.', 'success');
      });
    }

    function previewSelectedFile(input) {
      const file = input.files[0];
      const dropText = document.getElementById('file-drop-text');
      if (file) {
        dropText.innerHTML = '<span class="font-medium text-emerald-600 dark:text-emerald-400">✓ ' + file.name + '</span><span class="text-[10px] text-zinc-400 mt-0.5">' + (file.size / 1024 / 1024).toFixed(2) + ' MB</span>';
      }
    }

    function openAddModal() {
      document.getElementById('modal-heading').textContent = 'Add Credential';
      document.getElementById('form-cert-id').value = '';
      document.getElementById('cert-form').reset();
      document.getElementById('form-is-public').checked = true;
      document.getElementById('file-input-container').classList.remove('hidden');
      document.getElementById('form-file').required = true;
      document.getElementById('file-drop-text').innerHTML = '<span class="font-semibold text-zinc-800 dark:text-zinc-200">Select file or drag & drop</span><span class="text-[10px] text-zinc-400 mt-0.5">PNG, JPEG, WEBP, or PDF (Max 5 MB)</span>';
      
      document.getElementById('cert-modal').showModal();
    }

    function openEditModal(cert) {
      document.getElementById('modal-heading').textContent = 'Edit Credential';
      document.getElementById('form-cert-id').value = cert.id;
      document.getElementById('form-title').value = cert.title || '';
      document.getElementById('form-issuer').value = cert.issuer || '';
      document.getElementById('form-issued-at').value = cert.issuedAt || '';
      document.getElementById('form-category').value = cert.category || '';
      document.getElementById('form-verify-url').value = cert.verifyUrl || '';
      document.getElementById('form-description').value = cert.description || '';
      document.getElementById('form-is-public').checked = cert.isPublic === 1;

      document.getElementById('form-file').required = false;
      document.getElementById('file-drop-text').innerHTML = '<span class="text-xs text-zinc-400">Optional: select new file to replace current</span>';
      
      document.getElementById('cert-modal').showModal();
    }

    function closeCertModal() {
      document.getElementById('cert-modal').close();
    }

    // Light-dismiss click outside dialog
    document.getElementById('cert-modal')?.addEventListener('click', (e) => {
      const dialog = document.getElementById('cert-modal');
      const rect = dialog.getBoundingClientRect();
      const inDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
        && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!inDialog) {
        closeCertModal();
      }
    });

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
          throw new Error(data.error || 'Failed to save');
        }

        showToast(certId ? 'Credential updated' : 'Credential added', 'success');
        closeCertModal();
        setTimeout(() => window.location.reload(), 300);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Credential';
      }
    }

    async function toggleVisibility(certId, btn) {
      try {
        const res = await fetch('/api/certificates/' + certId + '/toggle-visibility', {
          method: 'POST',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to toggle');

        showToast('Visibility set to ' + (data.isPublic ? 'Public' : 'Private'), 'info');
        setTimeout(() => window.location.reload(), 250);
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

        showToast('Credential removed', 'info');
        setTimeout(() => window.location.reload(), 250);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    // Drag-and-drop table row reordering
    let draggedRow = null;

    function handleDragStart(e) {
      draggedRow = e.currentTarget;
      e.dataTransfer.effectAllowed = 'move';
      e.currentTarget.classList.add('opacity-40', 'bg-zinc-100', 'dark:bg-zinc-800');
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const row = e.currentTarget.closest('tr');
      if (row && row !== draggedRow) {
        row.classList.add('border-t-2', 'border-zinc-900', 'dark:border-white');
      }
    }

    function handleDragLeave(e) {
      const row = e.currentTarget.closest('tr');
      if (row) {
        row.classList.remove('border-t-2', 'border-zinc-900', 'dark:border-white');
      }
    }

    function handleDrop(e) {
      e.preventDefault();
      const targetRow = e.currentTarget.closest('tr');
      if (!targetRow || targetRow === draggedRow) return;
      targetRow.classList.remove('border-t-2', 'border-zinc-900', 'dark:border-white');

      const tbody = document.getElementById('cert-table-body');
      const rows = Array.from(tbody.querySelectorAll('tr[data-id]'));
      const fromIdx = rows.indexOf(draggedRow);
      const toIdx = rows.indexOf(targetRow);

      if (fromIdx < toIdx) {
        targetRow.after(draggedRow);
      } else {
        targetRow.before(draggedRow);
      }

      const updatedRows = Array.from(tbody.querySelectorAll('tr[data-id]'));
      const newOrder = updatedRows.map(r => r.dataset.id);
      fetch('/api/certificates/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      }).then(res => {
        if (res.ok) showToast('Order updated', 'success');
      });
    }

    function handleDragEnd(e) {
      if (draggedRow) {
        draggedRow.classList.remove('opacity-40', 'bg-zinc-100', 'dark:bg-zinc-800');
        draggedRow = null;
      }
      document.querySelectorAll('#cert-table-body tr').forEach(r => {
        r.classList.remove('border-t-2', 'border-zinc-900', 'dark:border-white');
      });
    }

    async function moveCert(certId, direction) {
      const tbody = document.getElementById('cert-table-body');
      const rows = Array.from(tbody.querySelectorAll('tr[data-id]'));
      const idx = rows.findIndex(r => r.dataset.id === certId);
      if (idx === -1) return;

      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= rows.length) return;

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
