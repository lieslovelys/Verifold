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

  // Extract unique categories for filter pills
  const categories = Array.from(
    new Set(certificates.map((c) => c.category || 'General').filter(Boolean))
  );

  const ogUrl = `${appUrl}/${user.username}`;
  const ogImage = `${appUrl}/og-image/${user.username}`;
  const ogTitle = `${user.displayName || user.username} - Certificate Portfolio`;
  const ogDesc = user.bio
    ? user.bio
    : `Verified certificate portfolio of ${user.displayName || user.username} featuring ${certificates.length} credentials.`;

  // Get initials for profile badge
  const initials = (user.displayName || user.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const content = `
  ${renderNavbar(currentUser)}

  <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
    
    <!-- Profile Header Card -->
    <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden mb-10">
      
      <!-- Ambient Accent Glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style="background-color: ${accentColor};"></div>

      <div class="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        
        <!-- Avatar & Info -->
        <div class="flex items-center gap-5">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/10 shrink-0" style="background-color: ${accentColor};">
            ${initials}
          </div>

          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                ${escapeHtml(user.displayName || user.username || '')}
              </h1>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                @${escapeHtml(user.username || '')}
              </span>
            </div>

            ${
              user.bio
                ? `<p class="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">${escapeHtml(user.bio)}</p>`
                : ''
            }

            <div class="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span class="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>${certificates.length} Verified Credential${certificates.length === 1 ? '' : 's'}</span>
              </span>
              <span>•</span>
              <span>Verified Portfolio</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="no-print flex items-center gap-2 self-stretch sm:self-center">
          ${
            isOwner
              ? `<a href="/dashboard" class="px-4 py-2 text-xs font-bold rounded-xl text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 shadow-sm transition">
                   Edit in Dashboard
                 </a>`
              : ''
          }
          <button onclick="window.print()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5" title="Print or save as PDF">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>Save as PDF</span>
          </button>
          <button onclick="sharePortfolio()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5" title="Copy public link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filter & Search Controls -->
    <div class="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
      
      <!-- Category Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0" id="category-pills">
        <button
          onclick="filterCategory('all')"
          data-category="all"
          class="cat-pill px-3.5 py-1.5 rounded-full text-xs font-bold transition bg-slate-900 text-white dark:bg-white dark:text-slate-900"
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
              class="cat-pill px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
            >
              ${escapeHtml(cat)} (${count})
            </button>
            `;
          })
          .join('')}
      </div>

      <!-- Right Controls: Layout & Search -->
      <div class="flex items-center gap-2">
        <!-- Layout Switcher -->
        <div class="hidden sm:inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
          <button onclick="changeLayout('grid')" id="btn-layout-grid" class="p-1.5 rounded-lg text-xs font-bold transition ${layout === 'grid' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}" title="Grid View">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          </button>
          <button onclick="changeLayout('list')" id="btn-layout-list" class="p-1.5 rounded-lg text-xs font-bold transition ${layout === 'list' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}" title="List View">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-60">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            type="search"
            id="cert-search"
            placeholder="Search certificates..."
            oninput="handleSearch(this.value)"
            class="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
      </div>
    </div>

    <!-- Certificates Display Container -->
    <div
      id="cert-grid"
      class="${
        layout === 'list'
          ? 'flex flex-col gap-4'
          : layout === 'timeline'
          ? 'relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-8'
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      }"
    >
      ${
        certificates.length > 0
          ? certificates.map((cert) => renderCertificateCard(cert, isOwner)).join('')
          : `
          <div class="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              📜
            </div>
            <h3 class="font-bold text-lg text-slate-900 dark:text-white">No public certificates available</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ${user.displayName || user.username} has not made any certificates public yet.
            </p>
          </div>
          `
      }
    </div>

    <!-- No Search Results Box -->
    <div id="no-search-results" class="hidden py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mt-4">
      <h3 class="font-bold text-base text-slate-900 dark:text-white">No certificates match your search</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Try clearing your filters or search keywords.</p>
      <button onclick="clearFilters()" class="mt-4 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-lg">
        Reset Search & Filters
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
        container.className = 'flex flex-col gap-4';
        btnList.className = 'p-1.5 rounded-lg text-xs font-bold transition bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm';
        btnGrid.className = 'p-1.5 rounded-lg text-xs font-bold transition text-slate-500 dark:text-slate-400 hover:text-slate-900';
      } else {
        container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
        btnGrid.className = 'p-1.5 rounded-lg text-xs font-bold transition bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm';
        btnList.className = 'p-1.5 rounded-lg text-xs font-bold transition text-slate-500 dark:text-slate-400 hover:text-slate-900';
      }
    }

    function filterCategory(cat) {
      activeCat = cat;
      const pills = document.querySelectorAll('#category-pills .cat-pill');
      pills.forEach(p => {
        if (p.dataset.category === cat) {
          p.className = 'cat-pill px-3.5 py-1.5 rounded-full text-xs font-bold transition bg-slate-900 text-white dark:bg-white dark:text-slate-900';
        } else {
          p.className = 'cat-pill px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition';
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
          showToast('Portfolio URL copied to clipboard!', 'success');
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

