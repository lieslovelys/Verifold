import { baseLayout } from '../layout';
import { renderNavbar, renderFooter, renderCertificateCard, renderPreviewModal } from '../components';
import { User, Certificate } from '../../db/schema';
import { escapeHtml } from '../../lib/sanitize';

export interface PortfolioProps {
  user: User;
  certificates: Certificate[];
  isOwner: boolean;
  currentUser?: {
    username?: string | null;
    displayName?: string | null;
    email: string;
  } | null;
  appUrl: string;
}

export function renderPortfolioPage(props: PortfolioProps): string {
  const { user, certificates, isOwner, currentUser, appUrl } = props;
  const accentColor = user.accentColor || '#2563eb';
  const layout = user.layout || 'grid';

  const categories = Array.from(
    new Set(certificates.map((c) => c.category || 'General').filter(Boolean))
  );

  const ogUrl = `${appUrl}/${user.username}`;
  const ogImage = `${appUrl}/og-image/${user.username}`;
  const ogTitle = `${user.displayName || user.username} — Verified Certificate Portfolio`;
  const ogDesc = user.bio
    ? user.bio
    : `Verified credential portfolio of ${user.displayName || user.username} featuring ${certificates.length} credentials.`;

  const initials = (user.displayName || user.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const content = `
  ${renderNavbar(currentUser)}

  <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
    
    <!-- Profile Header Card -->
    <header class="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-card dark:shadow-card-dark mb-10">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        
        <!-- Identity -->
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0 font-mono" style="background-color: ${accentColor};">
            ${initials}
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                ${escapeHtml(user.displayName || user.username || '')}
              </h1>
              <span class="px-2 py-0.5 rounded text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800">
                @${escapeHtml(user.username || '')}
              </span>
            </div>

            ${
              user.bio
                ? `<p class="mt-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">${escapeHtml(user.bio)}</p>`
                : ''
            }

            <div class="mt-2.5 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span class="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>${certificates.length} Verified Credential${certificates.length === 1 ? '' : 's'}</span>
              </span>
              <span class="text-zinc-300 dark:text-zinc-700">•</span>
              <span class="font-mono text-[11px] text-zinc-400">Verified by CertFolio</span>
            </div>
          </div>
        </div>

        <!-- Action Tools -->
        <div class="no-print flex items-center gap-2 self-stretch sm:self-center">
          ${
            isOwner
              ? `<a href="/dashboard" class="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 transition">
                   Edit in Dashboard
                 </a>`
              : ''
          }
          <button onclick="window.print()" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5" title="Export as PDF">
            <svg class="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>PDF</span>
          </button>
          <button onclick="sharePortfolio()" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5" title="Copy public link">
            <svg class="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
            <span>Share</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Filter & Search Toolbar -->
    <div class="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
      
      <!-- Category Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" id="category-pills">
        <button
          onclick="filterCategory('all')"
          data-category="all"
          class="cat-pill px-3 py-1 rounded-lg text-xs font-medium transition bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
        >
          All (${certificates.length})
        </button>
        ${categories
          .map((cat) => {
            const count = certificates.filter((c) => (c.category || 'General') === cat).length;
            return `
            <button
              onclick="filterCategory('${escapeHtml(cat.toLowerCase())}')"
              data-category="${escapeHtml(cat.toLowerCase())}"
              class="cat-pill px-3 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition"
            >
              ${escapeHtml(cat)} <span class="text-zinc-400 font-mono text-[10px]">(${count})</span>
            </button>
            `;
          })
          .join('')}
      </div>

      <!-- Right Controls: View Switcher & Search -->
      <div class="flex items-center gap-2">
        
        <!-- Segmented Layout Switcher -->
        <div class="hidden sm:inline-flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
          <button onclick="changeLayout('grid')" id="btn-layout-grid" class="p-1 rounded text-xs transition ${layout === 'grid' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}" title="Grid layout">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          </button>
          <button onclick="changeLayout('list')" id="btn-layout-list" class="p-1 rounded text-xs transition ${layout === 'list' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}" title="List layout">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-56">
          <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            type="search"
            id="cert-search"
            placeholder="Search credentials..."
            oninput="handleSearch(this.value)"
            class="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
          />
        </div>
      </div>
    </div>

    <!-- Certificates Grid -->
    <div
      id="cert-grid"
      class="${
        layout === 'list'
          ? 'flex flex-col gap-3'
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
      }"
    >
      ${
        certificates.length > 0
          ? certificates.map((cert) => renderCertificateCard(cert, isOwner)).join('')
          : `
          <div class="col-span-full py-16 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
            <div class="w-12 h-12 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 class="font-bold text-sm text-zinc-900 dark:text-white">No credentials listed yet</h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              ${user.displayName || user.username} has not published any public certificates.
            </p>
          </div>
          `
      }
    </div>

    <!-- No Search Results Found -->
    <div id="no-search-results" class="hidden py-14 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mt-4">
      <h3 class="font-semibold text-sm text-zinc-900 dark:text-white">No credentials match your query</h3>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Try resetting keywords or selecting "All".</p>
      <button onclick="clearFilters()" class="mt-3 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition">
        Reset filters
      </button>
    </div>
  </main>

  ${renderPreviewModal()}
  ${renderFooter()}

  <script>
    let activeCat = 'all';
    let searchQuery = '';

    function changeLayout(mode) {
      const container = document.getElementById('cert-grid');
      const btnGrid = document.getElementById('btn-layout-grid');
      const btnList = document.getElementById('btn-layout-list');
      if (!container || !btnGrid || !btnList) return;

      if (mode === 'list') {
        container.className = 'flex flex-col gap-3';
        btnList.className = 'p-1 rounded text-xs transition bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm';
        btnGrid.className = 'p-1 rounded text-xs transition text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200';
      } else {
        container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5';
        btnGrid.className = 'p-1 rounded text-xs transition bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm';
        btnList.className = 'p-1 rounded text-xs transition text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200';
      }
    }

    function filterCategory(cat) {
      activeCat = cat;
      const pills = document.querySelectorAll('#category-pills .cat-pill');
      pills.forEach(p => {
        if (p.dataset.category === cat) {
          p.className = 'cat-pill px-3 py-1 rounded-lg text-xs font-medium transition bg-zinc-900 text-white dark:bg-white dark:text-zinc-900';
        } else {
          p.className = 'cat-pill px-3 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition';
        }
      });
      applyFilters();
    }

    function handleSearch(val) {
      searchQuery = (val || '').toLowerCase().trim();
      applyFilters();
    }

    function applyFilters() {
      const cards = document.querySelectorAll('.cert-card');
      let visibleCount = 0;

      cards.forEach(c => {
        const cat = (c.dataset.category || '').toLowerCase();
        const search = (c.dataset.search || '').toLowerCase();
        
        const catMatch = activeCat === 'all' || cat === activeCat;
        const searchMatch = !searchQuery || search.includes(searchQuery);

        if (catMatch && searchMatch) {
          c.classList.remove('hidden');
          visibleCount++;
        } else {
          c.classList.add('hidden');
        }
      });

      const noResults = document.getElementById('no-search-results');
      if (visibleCount === 0 && cards.length > 0) {
        noResults.classList.remove('hidden');
      } else {
        noResults.classList.add('hidden');
      }
    }

    function clearFilters() {
      document.getElementById('cert-search').value = '';
      searchQuery = '';
      filterCategory('all');
    }

    function sharePortfolio() {
      if (navigator.share) {
        navigator.share({
          title: '${escapeHtml(ogTitle)}',
          text: '${escapeHtml(ogDesc)}',
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('Portfolio URL copied to clipboard', 'success');
        });
      }
    }
  </script>
  `;

  return baseLayout(content, {
    title: ogTitle,
    description: ogDesc,
    ogUrl,
    ogImage,
    accentColor,
    theme: user.theme || 'system',
    currentUser,
  });
}
