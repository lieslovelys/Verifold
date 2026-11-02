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
  const title = options.title ? `${escapeHtml(options.title)} | CertFolio` : 'CertFolio — Verified Professional Credentials';
  const description = escapeHtml(
    options.description || 'A single, high-performance home for all your professional certifications, diplomas, and licenses. Edge-hosted and verified.'
  );
  const accentColor = options.accentColor || '#2563eb';
  const ogUrl = options.ogUrl || 'https://certfolio.pages.dev';
  const ogImage = options.ogImage || `${ogUrl}/assets/og-default.png`;

  return `<!DOCTYPE html>
<html lang="en" class="h-full scroll-smooth">
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

  <!-- Clean Monogram Vector Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22 fill=%22none%22><rect width=%2232%22 height=%2232%22 rx=%228%22 fill=%22%2318181b%22/><path d=%22M9 16L14 21L23 11%22 stroke=%22%233b82f6%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>">

  <!-- Google Fonts: Inter & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
          },
          colors: {
            brand: {
              DEFAULT: 'var(--brand-accent, ${accentColor})',
            },
            zinc: {
              850: '#151518',
              925: '#0c0c0e',
              950: '#09090b',
            }
          },
          boxShadow: {
            'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
            'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            'card-dark': '0 1px 2px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
            'card-dark-hover': '0 12px 30px -10px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
          }
        }
      }
    }
  </script>

  <style>
    :root {
      --brand-accent: ${accentColor};
    }

    /* Native modal dialog scroll containment & backdrop styles */
    dialog:modal {
      overscroll-behavior: contain;
    }
    dialog::backdrop {
      background-color: rgba(9, 9, 11, 0.75);
      backdrop-filter: blur(8px);
      overscroll-behavior: contain;
    }

    /* Subdued custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(161, 161, 170, 0.3);
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(161, 161, 170, 0.5);
    }

    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background: white !important;
        color: black !important;
      }
      .cert-card {
        break-inside: avoid;
        box-shadow: none !important;
        border: 1px solid #e4e4e7 !important;
      }
    }
  </style>

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
<body class="h-full flex flex-col bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950 font-sans">
  
  ${content}

  <!-- Minimalist Toast Container -->
  <div id="toast-container" class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"></div>

  <script>
    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      
      const badgeColor = type === 'success' 
        ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' 
        : type === 'error' 
        ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' 
        : 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';

      toast.className = 'pointer-events-auto px-4 py-3 rounded-xl shadow-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs font-medium flex items-center gap-3 transform transition-all duration-200 translate-y-3 opacity-0';
      
      const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '•';
      toast.innerHTML = '<span class="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 ' + badgeColor + '">' + icon + '</span><span class="leading-relaxed">' + message + '</span>';
      
      container.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-3', 'opacity-0');
      });
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 250);
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
