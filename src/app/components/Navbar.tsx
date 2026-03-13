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
                src="https://images.unsplash.com/photo-1773024245335-2463a95dc54e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBmYXNoaW9uJTIwbG9nbyUyMGRlc2lnbnxlbnwxfHx8fDE3NzMzOTMwNDV8MA&ixlib=rb-4.1.0&q=80&w=200"
                alt="Logo"
                className="w-12 h-12 rounded-full object-cover"
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
