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
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors ${theme === 'light' ? 'bg-white/80 border-gray-200 text-black shadow-sm' : 'bg-white/10 border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Left side: hamburger (mobile) + nav tabs (desktop) */}
            <div className="flex items-center gap-6">

              {/* Hamburger — visible only below 860px */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`max-[860px]:flex hidden items-center justify-center p-2 rounded-full transition-all hover:scale-110 hover:shadow-md ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300' : 'bg-white/20 hover:bg-white/30'}`}
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5 group-hover:text-purple-500 transition-colors" />
              </button>

              {/* Desktop nav tabs — hidden below 860px */}
              <div className="max-[860px]:hidden flex items-center gap-2">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95 border border-transparent hover:border-purple-500/30"
                  >
                    <span className="group-hover:text-purple-300 group-hover:scale-110 transition-all duration-300 group-hover:-rotate-3">
                      {link.icon}
                    </span>
                    <span className="group-hover:text-white transition-colors font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side: theme toggle + logout */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm hover:scale-110 hover:rotate-12"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                <span className="max-[500px]:hidden font-medium">Logout</span>
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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -320, borderTopRightRadius: '100%', borderBottomRightRadius: '100%' }}
            animate={{ x: 0, borderTopRightRadius: '0%', borderBottomRightRadius: '0%' }}
            exit={{ x: -320, borderTopRightRadius: '100%', borderBottomRightRadius: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 left-0 h-full w-72 z-50 backdrop-blur-2xl border-r shadow-2xl flex flex-col pt-6 pb-8 transition-colors ${theme === 'light' ? 'bg-white/95 border-gray-200 text-gray-900' : 'bg-black/60 border-white/10 text-white'}`}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-6 mb-8">
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">Menu</span>
              <button
                onClick={closeSidebar}
                className={`p-2 rounded-full transition-all hover:rotate-90 hover:scale-110 ${theme === 'light' ? 'bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-600' : 'bg-white/10 hover:bg-red-500/20 hover:text-red-400'}`}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar links */}
            <nav className="flex flex-col gap-2 px-4 flex-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                >
                  <Link
                    to={link.to}
                    onClick={closeSidebar}
                    className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ease-out hover:translate-x-2 border border-transparent active:scale-95 text-base font-medium overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.05)] ${theme === 'light' ? 'hover:bg-purple-50 hover:border-purple-200 text-gray-700' : 'hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/10 hover:border-purple-500/30 text-gray-200'}`}
                  >
                    {/* Glowing left accent */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-0 bg-gradient-to-b from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 group-hover:h-3/4 transition-all duration-300 rounded-r-full" />
                    
                    <span className="transition-all duration-300 group-hover:scale-125 group-hover:text-purple-500 group-hover:-rotate-6 drop-shadow-sm">
                      {link.icon}
                    </span>
                    <span className={`transition-colors group-hover:font-semibold ${theme === 'light' ? 'group-hover:text-purple-700' : 'group-hover:text-purple-100'}`}>{link.label}</span>
                    
                    {/* Subtle hover background glow */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10 ${theme === 'light' ? 'bg-purple-100/50' : 'bg-purple-400/10'}`} />
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
