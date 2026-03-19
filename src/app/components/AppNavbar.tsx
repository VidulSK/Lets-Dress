import { useState } from 'react';
import { Moon, Sun, Home, ShoppingBag, Shuffle, LogOut, Menu, X, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

export function AppNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navLinks = [
    { to: '/',              icon: <Home className="w-5 h-5" />,        label: 'Home' },
    { to: '/wardrobe',      icon: <ShoppingBag className="w-5 h-5" />, label: 'My Wardrobe' },
    { to: '/randomizer',    icon: <Shuffle className="w-5 h-5" />,     label: 'Randomizer' },
    { to: '/event-planner', icon: <Calendar className="w-5 h-5" />,    label: 'Event Planner' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Left side: hamburger (mobile) + nav tabs (desktop) */}
            <div className="flex items-center gap-6">

              {/* Hamburger — visible only below 860px */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="max-[860px]:flex hidden items-center justify-center p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop nav tabs — hidden below 860px */}
              <div className="max-[860px]:hidden flex items-center gap-4">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 transition-all"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side: theme toggle + logout */}
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
                <span className="max-[500px]:hidden">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar overlay backdrop */}
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
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-72 z-50 backdrop-blur-xl bg-white/15 border-r border-white/20 shadow-2xl flex flex-col pt-6 pb-8"
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-6 mb-8">
              <span className="font-semibold text-lg">Menu</span>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar links */}
            <nav className="flex flex-col gap-1 px-4 flex-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.to}
                    onClick={closeSidebar}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      hover:bg-white/20 hover:translate-x-1
                      hover:border-l-2 hover:border-purple-400 hover:pl-[14px]
                      active:scale-95 text-base font-medium"
                  >
                    <span className="transition-transform duration-200 group-hover:scale-110">
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Sidebar footer: logout */}
            <div className="px-4 mt-4">
              <button
                onClick={() => { closeSidebar(); handleLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
