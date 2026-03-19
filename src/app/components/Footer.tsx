import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm opacity-80">
            <span>Made for fashion lovers </span>
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div className="flex gap-6 text-sm opacity-80">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
          </div>
          <div className="text-sm opacity-80">
            © 2026 Let's Dress. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
