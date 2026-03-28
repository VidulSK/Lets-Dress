import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative py-8 px-6 mt-8 overflow-hidden">
      {/* Subtle top border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-violet-300/40 dark:via-violet-500/20 to-transparent" />

      <div className="section-container">
        {/* Three-column layout on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 sm:gap-0">

          {/* Left — Brand */}
          <div className="flex items-center gap-2 font-semibold text-foreground/80 justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>Let's Dress</span>
          </div>

          {/* Center — Copyright */}
          <div className="flex justify-center">
            <span className="text-xs text-muted-foreground/60 text-center">
              © {new Date().getFullYear()} Let's Dress. All rights reserved.
            </span>
          </div>

          {/* Right — Links */}
          <div className="flex items-center gap-5 text-sm text-muted-foreground justify-center sm:justify-end">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a
                key={l}
                href="#"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
