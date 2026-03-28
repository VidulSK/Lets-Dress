import { useState } from 'react';
import { Moon, Sun, Menu, X, LogIn } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  showAuth?: boolean;
  onMenuClick?: () => void;
  menuOpen?: boolean;
}

export function Navbar({ showAuth = false, onMenuClick, menuOpen = false }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 frosted-nav">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3.5 sm:py-5">
        <div className="flex items-center justify-between gap-3">

          {/* Left: sidebar toggle (mobile) + brand */}
          <div className="flex items-center gap-3">

            {/* Hamburger — only shown when onMenuClick is provided (homepage mobile) */}
            {onMenuClick && (
              <motion.button
                onClick={onMenuClick}
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-accent border border-border transition-all duration-200 shrink-0"
                aria-label="Navigation menu"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={menuOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            )}

            {/* Brand — logo + title centered together */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-md transition-all duration-300 scale-110" />
                <img
                  src="images/logo.png"
                  alt="Let's Dress"
                  className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain p-1 bg-white/90 dark:bg-white/10 border border-violet-200 dark:border-violet-500/30 shadow-sm group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-sm sm:text-base tracking-tight text-foreground">
                  Let's Dress
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                  {isAuthenticated && user ? `Hey, ${user.username} ✨` : 'Welcome Gorgeous ✨'}
                </span>
              </div>
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {showAuth && (
              <>
                {isAuthenticated ? (
                  <Link
                    to="/wardrobe"
                    className="btn-primary text-sm px-4 py-2 sm:px-5 sm:py-2.5"
                  >
                    <span className="max-[400px]:hidden">Go to </span>Wardrobe
                  </Link>
                ) : (
                  /* Single login icon button */
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full btn-primary text-sm"
                    aria-label="Sign in or sign up"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline font-semibold">Login</span>
                  </Link>
                )}
              </>
            )}

            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.9, rotate: 15 }}
              className="p-2 sm:p-2.5 rounded-full bg-muted hover:bg-accent border border-border transition-all duration-300 flex items-center justify-center shrink-0"
              aria-label="Toggle theme"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
              >
                {theme === 'light'
                  ? <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-violet-600" />
                  : <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-400" />
                }
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}
