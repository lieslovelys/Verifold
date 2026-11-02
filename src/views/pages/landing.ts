import { baseLayout } from '../layout';
import { renderNavbar, renderFooter } from '../components';

export function renderLandingPage(currentUser?: {
  username?: string | null;
  displayName?: string | null;
  email: string;
} | null): string {
  const content = `
  ${renderNavbar(currentUser)}

  <main class="flex-1">
    
    <!-- Hero Section -->
    <section class="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-zinc-200/80 dark:border-zinc-850">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        <!-- Status indicator -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 mb-8">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Open edge portfolio platform</span>
        </div>

        <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
          A single, verified link for all your professional credentials.
        </h1>

        <p class="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Replace scattered PDF attachments and broken links with an edge-hosted, verifiable portfolio designed specifically for your resume and LinkedIn.
        </p>

        <!-- CTAs -->
        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/login" class="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-lg shadow-sm transition">
            Create your portfolio
          </a>
          <a href="/alyssa" class="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg transition flex items-center justify-center gap-1.5">
            <span>Explore live demo</span>
            <span class="text-zinc-400">→</span>
          </a>
        </div>

        <!-- Metrics bar -->
        <div class="mt-14 pt-8 border-t border-zinc-200/70 dark:border-zinc-850 max-w-xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <div class="font-mono text-xl font-bold text-zinc-900 dark:text-white">&lt; 30ms</div>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Edge response time</div>
          </div>
          <div>
            <div class="font-mono text-xl font-bold text-zinc-900 dark:text-white">PDF + WebP</div>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">High-fidelity formats</div>
          </div>
          <div>
            <div class="font-mono text-xl font-bold text-zinc-900 dark:text-white">Zero-Cost</div>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Cloudflare free tier</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Showcase Card -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 mb-24">
      <div class="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
        
        <!-- Showcase Header -->
        <div class="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-white text-xs">
              AM
            </div>
            <div>
              <div class="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>Alyssa Mae</span>
                <span class="text-emerald-500 text-[10px]">✓</span>
              </div>
              <div class="font-mono text-[10px] text-zinc-400">certfolio.pages.dev/alyssa</div>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            4 Verified Credentials
          </span>
        </div>

        <!-- Sample Certificates -->
        <div class="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Item 1 -->
          <div class="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-925/60 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
                <span>AWS</span>
                <span>2024</span>
              </div>
              <h4 class="font-bold text-xs text-zinc-900 dark:text-white leading-snug">Solutions Architect Professional</h4>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Amazon Web Services</p>
            </div>
            <div class="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px]">
              <span class="text-zinc-400">Cloud Architecture</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Verified ↗</span>
            </div>
          </div>

          <!-- Item 2 -->
          <div class="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-925/60 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
                <span>GCP</span>
                <span>2024</span>
              </div>
              <h4 class="font-bold text-xs text-zinc-900 dark:text-white leading-snug">Cloud Security Engineer</h4>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Google Cloud Platform</p>
            </div>
            <div class="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px]">
              <span class="text-zinc-400">Security</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Verified ↗</span>
            </div>
          </div>

          <!-- Item 3 -->
          <div class="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-925/60 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
                <span>CNCF</span>
                <span>2023</span>
              </div>
              <h4 class="font-bold text-xs text-zinc-900 dark:text-white leading-snug">Certified Kubernetes Admin (CKA)</h4>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Linux Foundation</p>
            </div>
            <div class="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px]">
              <span class="text-zinc-400">DevOps</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Verified ↗</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Value propositions / Architecture -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-zinc-200/70 dark:border-zinc-850">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 class="font-bold text-sm text-zinc-900 dark:text-white">Edge-Rendered Speed</h3>
          <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Pre-rendered on Cloudflare Workers edge nodes across 300+ cities. Loads instantly on any recruiter's mobile device or desktop.
          </p>
        </div>

        <div>
          <h3 class="font-bold text-sm text-zinc-900 dark:text-white">Trust & Verification</h3>
          <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Attach authentic verification URLs (Credly, Coursera, Universities). Recruiters can verify credential legitimacy in a single click.
          </p>
        </div>

        <div>
          <h3 class="font-bold text-sm text-zinc-900 dark:text-white">Differential Privacy</h3>
          <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Keep proprietary diplomas or licenses private to yourself, or toggle them public whenever you're ready to share.
          </p>
        </div>
      </div>
    </section>

    <!-- Bottom prompt -->
    <section class="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">Claim your permanent portfolio link</h2>
      <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Free forever, no credit card required. Deployed on Cloudflare free tier.
      </p>
      <div class="mt-6">
        <a href="/login" class="inline-block px-6 py-2.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-lg shadow-sm transition">
          Get Started
        </a>
      </div>
    </section>
  </main>

  ${renderFooter()}
  `;

  return baseLayout(content, {
    title: 'CertFolio — Verified Professional Credential Portfolios',
    currentUser,
  });
}
