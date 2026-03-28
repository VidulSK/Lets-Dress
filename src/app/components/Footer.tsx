import { Heart, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative py-10 px-6 mt-8 overflow-hidden">
      {/* Subtle top border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-violet-300/40 dark:via-violet-500/20 to-transparent" />

      <div className="section-container">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">

          {/* Brand */}
          <div className="flex items-center gap-2 font-semibold text-foreground/80">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>Let's Dress</span>
          </div>

          {/* Love note */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground order-last sm:order-none">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 animate-pulse" />
            <span>for fashion lovers</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
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

        <div className="mt-6 text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Let's Dress. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
