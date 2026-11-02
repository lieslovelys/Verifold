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
    <section class="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      <div class="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.100),theme(colors.slate.50))] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.950/40),theme(colors.slate.950))]"></div>
      
      <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 mb-6 shadow-sm">
          <span class="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>Deployable on Cloudflare Edge • Fast & Free</span>
        </div>

        <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-[1.15]">
          One public link for all your <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">certificates & credentials</span>.
        </h1>

        <p class="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stop attaching messy PDFs to job applications. Showcase all your industry certifications, university degrees, and licenses in a fast, SEO-optimized portfolio designed for your resume and LinkedIn.
        </p>

        <!-- CTA Buttons -->
        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/login" class="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition duration-200">
            Create Your Page — It's Free
          </a>
          <a href="/alyssa" class="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition duration-200 flex items-center justify-center gap-2">
            <span>Explore Demo Portfolio</span>
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </a>
        </div>

        <!-- Metric highlights -->
        <div class="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 max-w-2xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-extrabold text-slate-900 dark:text-white">&lt; 30ms</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Edge response time</div>
          </div>
          <div>
            <div class="text-2xl font-extrabold text-slate-900 dark:text-white">5 MB</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Per certificate (PDF/Image)</div>
          </div>
          <div>
            <div class="text-2xl font-extrabold text-slate-900 dark:text-white">100% Free</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Free-tier Cloudflare D1/R2</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Visual Demo / Portfolio Preview Card -->
    <section class="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 mb-20">
      <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              JD
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">Jane Doe</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Senior Cloud & Security Architect • certfolio.pages.dev/janedoe</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              ✓ 6 Verified Credentials
            </span>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Card 1 -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
            <div class="h-28 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 flex items-center justify-center text-amber-600 font-bold text-sm">
              AWS Solutions Architect
            </div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-white mt-3">AWS Certified Solutions Architect</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">Amazon Web Services • 2024</p>
          </div>
          <!-- Card 2 -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
            <div class="h-28 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 flex items-center justify-center text-blue-600 font-bold text-sm">
              Google Cloud Professional
            </div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-white mt-3">Professional Cloud Architect</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">Google Cloud Platform • 2024</p>
          </div>
          <!-- Card 3 -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
            <div class="h-28 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/30 flex items-center justify-center text-indigo-600 font-bold text-sm">
              CKA Kubernetes Administrator
            </div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-white mt-3">Certified Kubernetes Admin</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">Cloud Native Computing • 2023</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-200/80 dark:border-slate-800/80">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white">Engineered for credibility, speed, and privacy</h2>
        <p class="mt-4 text-slate-600 dark:text-slate-400 text-sm">Everything you need to prove your accomplishments without clutter.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 class="font-bold text-base text-slate-900 dark:text-white">Edge-Powered Speed</h3>
          <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Runs globally across 300+ Cloudflare edge locations with server-rendered HTML. Instant load times anywhere in the world with zero cold starts.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <h3 class="font-bold text-base text-slate-900 dark:text-white">Verifiable & Trustworthy</h3>
          <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Attach official verification links (Credly, Coursera, Accredible, issuing institutions) so recruiters and clients can confirm legitimacy with one click.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <h3 class="font-bold text-base text-slate-900 dark:text-white">PDF & High-Res Images</h3>
          <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Stored in Cloudflare R2 object storage with server-validated magic-byte checking. Built-in responsive viewer modal for both PDFs and images.
          </p>
        </div>
      </div>
    </section>

    <!-- Ready to start banner -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div class="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white shadow-xl">
        <h2 class="text-3xl font-extrabold">Ready to showcase your accomplishments?</h2>
        <p class="mt-3 text-blue-100 text-sm max-w-xl mx-auto">
          Sign up in seconds, pick your unique username, and give your career credentials the presentation they deserve.
        </p>
        <div class="mt-6">
          <a href="/login" class="inline-block px-8 py-3.5 text-sm font-bold text-blue-600 bg-white hover:bg-blue-50 rounded-xl shadow-lg transition">
            Create Your Portfolio Now
          </a>
        </div>
      </div>
    </section>
  </main>

  ${renderFooter()}
  `;

  return baseLayout(content, {
    title: 'CertFolio - Verified Certificate Portfolio',
    currentUser,
  });
}

