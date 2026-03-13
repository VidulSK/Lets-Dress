import { Moon, Sun, Home, ShoppingBag, Shuffle, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router';

export function AppNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 transition-all"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link 
              to="/wardrobe"
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>My Wardrobe</span>
            </Link>
            <Link 
              to="/randomizer"
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 transition-all"
            >
              <Shuffle className="w-5 h-5" />
              <span>Randomizer</span>
            </Link>
            <Link 
              to="/event-planner"
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 transition-all"
            >
              <span>Event Planner</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
