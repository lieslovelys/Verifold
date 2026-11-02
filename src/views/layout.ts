import { escapeHtml } from '../lib/sanitize';

export interface LayoutOptions {
  title?: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
  accentColor?: string;
  theme?: string; // 'light' | 'dark' | 'system'
  currentUser?: {
    username?: string | null;
    displayName?: string | null;
    email: string;
  } | null;
}

export function baseLayout(content: string, options: LayoutOptions = {}): string {
  const title = options.title ? `${escapeHtml(options.title)} | CertFolio` : 'CertFolio - Verified Certificate Portfolio';
  const description = escapeHtml(
    options.description || 'Showcase all your professional certificates, licenses, and credentials with a single, verifiable public link.'
  );
  const accentColor = options.accentColor || '#2563eb';
  const ogUrl = options.ogUrl || 'https://certfolio.pages.dev';
  const ogImage = options.ogImage || `${ogUrl}/assets/og-default.png`;

  return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">

  <!-- OpenGraph / LinkedIn Meta Tags -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${ogUrl}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:site_name" content="CertFolio">

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">

  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📜</text></svg>">

  <!-- Tailwind CSS Play CDN & Inter Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
          },
          colors: {
            brand: {
              DEFAULT: 'var(--brand-accent, ${accentColor})',
              hover: 'var(--brand-accent-hover, ${accentColor})',
            }
          }
        }
      }
    }
  </script>

  <style>
    :root {
      --brand-accent: ${accentColor};
    }
    /* Smooth theme transitions */
    * {
      transition-property: background-color, border-color;
      transition-duration: 150ms;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background: white !important;
        color: black !important;
      }
    }
  </style>

  <!-- Theme initialization script (runs before paint to prevent flash) -->
  <script>
    (function() {
      const savedTheme = localStorage.getItem('theme') || '${options.theme || 'system'}';
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (savedTheme === 'system' && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  </script>
</head>
<body class="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
  
  ${content}

  <!-- Toast Notification Script -->
  <div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"></div>

  <script>
    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      const bg = type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 dark:bg-slate-800 text-white border border-slate-700';
      toast.className = 'pointer-events-auto px-4 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-3 transform transition-all duration-300 translate-y-4 opacity-0 ' + bg;
      
      const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
      toast.innerHTML = '<span class="font-bold text-base">' + icon + '</span><span>' + message + '</span>';
      
      container.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      });
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    function toggleDarkMode() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  </script>
</body>
</html>`;
}

