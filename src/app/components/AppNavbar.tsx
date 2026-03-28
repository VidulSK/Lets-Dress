import { useState } from 'react';
import { Moon, Sun, Home, ShoppingBag, Shuffle, LogOut, Menu, X, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

export function AppNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navLinks = [
    { to: '/',              icon: <Home className="w-[18px] h-[18px]" />,        label: 'Home' },
    { to: '/wardrobe',      icon: <ShoppingBag className="w-[18px] h-[18px]" />, label: 'My Wardrobe' },
    { to: '/randomizer',    icon: <Shuffle className="w-[18px] h-[18px]" />,     label: 'Randomizer' },
    { to: '/event-planner', icon: <Calendar className="w-[18px] h-[18px]" />,    label: 'Event Planner' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 frosted-nav">
        <div className="section-container py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">

            {/* Left side */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Hamburger — visible only below 860px */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="max-[860px]:flex hidden items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-accent border border-border transition-all hover:scale-105"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4 text-foreground" />
              </button>

              {/* Brand logo — always visible */}
              <Link to="/" className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-md transition-all duration-300 scale-110" />
                  <img
                    src="images/logo.png"
                    alt="Let's Dress"
                    className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain p-1 bg-white/90 dark:bg-white/10 border border-violet-200 dark:border-violet-500/30 shadow-sm group-hover:scale-110 transition-transform"
                  />
                </div>
              </Link>

              {/* Desktop nav tabs */}
              <div className="max-[860px]:hidden flex items-center gap-1">
                {navLinks.map(link => {
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 group
                        ${active
                          ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                      <span className={`transition-transform duration-200 group-hover:scale-110 ${active ? 'text-violet-600 dark:text-violet-400' : ''}`}>
                        {link.icon}
                      </span>
                      <span>{link.label}</span>
                      {active && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 rounded-full bg-violet-100 dark:bg-violet-500/20 -z-10"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <motion.button
                onClick={toggleTheme}
                whileTap={{ scale: 0.9, rotate: 15 }}
                className="p-2 sm:p-2.5 rounded-full bg-muted hover:bg-accent border border-border transition-all duration-300 flex items-center justify-center"
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

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 rounded-full text-sm font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="max-[480px]:hidden">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 left-0 h-full w-72 z-50 glass-card rounded-none border-0 border-r flex flex-col pt-6 pb-8 overflow-hidden"
            style={{ borderRadius: '0 1.5rem 1.5rem 0' }}
          >
            {/* Decorative orbs inside sidebar */}
            <div className="absolute top-0 right-0 w-40 h-40 orb orb-1 opacity-30 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 orb orb-2 opacity-20 translate-y-1/2 -translate-x-1/2" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <img
                  src="images/logo.png"
                  alt="Logo"
                  className="w-9 h-9 rounded-full object-contain p-1 bg-white/90 dark:bg-white/10 border border-violet-200 dark:border-violet-500/30"
                />
                <span className="font-bold text-lg gradient-text">Let's Dress</span>
              </div>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-full bg-muted hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500 transition-all hover:rotate-90 duration-300"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1 px-3 flex-1 relative z-10">
              {navLinks.map((link, i) => {
                const active = isActive(link.to);
                return (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.1, type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <Link
                      to={link.to}
                      onClick={closeSidebar}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${active
                          ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                      <span className={`${active ? 'text-violet-600 dark:text-violet-400' : ''} transition-colors`}>
                        {link.icon}
                      </span>
                      <span>{link.label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Sidebar logout */}
            <div className="px-3 mt-4 relative z-10">
              <button
                onClick={() => { closeSidebar(); handleLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
