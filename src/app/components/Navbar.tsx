import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router';

interface NavbarProps {
  showAuth?: boolean;
}

export function Navbar({ showAuth = false }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <img 
                src="logo.png"
                alt="Logo"
                className="w-12 h-12 rounded-full object-contain p-1 bg-gray-100 hover:scale-125 transition-transform"
              />
              <div>
                <div className="font-semibold text-lg">Let's Dress</div>
                <div className="text-sm opacity-70">Welcome Gorgeous ! ❤️</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showAuth && (
              <>
                <Link 
                  to="/signup"
                  className="px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
                >
                  Sign Up
                </Link>
                <Link 
                  to="/signin"
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
