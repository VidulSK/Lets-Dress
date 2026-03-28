import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, TrendingUp, Sparkles, ArrowRight, ChevronDown, Play, BookOpen, Zap } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const perks = [
  {
    title: 'Save Time Daily',
    description: 'Cut your morning routine by up to 30 minutes with instant, personalized outfit suggestions from your own collection.',
    emoji: '⏱️',
  },
  {
    title: 'Smart Organization',
    description: 'Every piece of clothing, beautifully categorized in one digital space — accessible from absolutely anywhere.',
    emoji: '📁',
  },
  {
    title: 'Maximize Your Wardrobe',
    description: 'Rediscover hidden gems and create fresh looks from clothes you already own. Beat decision fatigue for good.',
    emoji: '✨',
  },
  {
    title: 'Track Your Style',
    description: 'See what you naturally gravitate toward and build a smarter wardrobe based on real data — not guesswork.',
    emoji: '📈',
  },
  {
    title: 'Never Repeat Outfits',
    description: 'Our intelligent rotation keeps your looks creative, fresh, and completely unique every single day of the week.',
    emoji: '🔄',
  },
];

export function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ctaHref = isAuthenticated ? '/wardrobe' : '/login';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Fixed gradient orbs (viewport-locked) ─────────────── */}
      <div
        className="fixed top-[-15%] left-[-10%] w-[55vw] h-[55vw] max-w-[600px] max-h-[600px] rounded-full pointer-events-none z-0 orb orb-1"
        style={{ filter: 'blur(80px)' }}
      />
      <div
        className="fixed bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] rounded-full pointer-events-none z-0 orb orb-2"
        style={{ filter: 'blur(80px)' }}
      />

      {/* Navbar — sidebar toggle built in on mobile */}
      <Navbar
        showAuth={true}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        menuOpen={sidebarOpen}
      />

      {/* ── Sidebar overlay ───────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed left-0 top-0 h-full w-72 z-40 glass-card border-0 border-r flex flex-col pt-28 pb-8 px-4 overflow-y-auto shadow-2xl"
            style={{ borderRadius: '0 1.5rem 1.5rem 0' }}
          >
            {/* Decorative orbs inside sidebar for user friendly aesthetic */}
            <div className="absolute top-0 right-0 w-32 h-32 orb orb-1 opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 orb orb-2 opacity-10 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-1 h-full font-medium">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">
                Menu
              </p>
              {[
                { id: 'our-story', label: 'Our Story', icon: <BookOpen className="w-5 h-5 flex-shrink-0" /> },
                { id: 'trends', label: 'Trends & Styles', icon: <TrendingUp className="w-5 h-5 flex-shrink-0" /> },
                { id: 'perks', label: 'Perks', icon: <Zap className="w-5 h-5 flex-shrink-0" /> },
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className="flex items-center gap-4 text-left px-4 py-3.5 rounded-xl text-[15px] font-medium text-foreground hover:bg-violet-100 dark:hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-200 mb-2 group w-full"
                >
                  <span className="text-muted-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {icon}
                  </span>
                  <span>{label}</span>
                  <ChevronDown className="w-4 h-4 ml-auto -rotate-90 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
              
              <div className="mt-8 px-2 space-y-4 pt-6 border-t border-border">
                 <a
                   href={ctaHref}
                   className="btn-primary w-full justify-center py-3.5 text-[15px] shadow-md hover:-translate-y-0.5"
                 >
                   {isAuthenticated ? 'Wardrobe' : 'Get Started'}
                   <ArrowRight className="w-4 h-4 ml-1" />
                 </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, type: 'spring', stiffness: 60 }}
          className="relative z-10 text-center px-8 sm:px-14 md:px-20 py-16 sm:py-20 mx-4 sm:mx-8 max-w-4xl w-full glass-card"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 pill-badge text-violet-700 dark:text-violet-300 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold">{isAuthenticated ? `Welcome back, ${user?.username}!` : 'Elevate Your Style'}</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="text-6xl sm:text-7xl md:text-8xl mb-6 font-black tracking-tight leading-none gradient-text pb-2"
          >
            Your Digital<br />Wardrobe
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl mb-10 text-muted-foreground font-normal max-w-xl mx-auto leading-relaxed"
          >
            Never waste another morning deciding what to wear. Plan your outfits beautifully.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full"
          >
            <a
              href={ctaHref}
              className="btn-primary text-base px-8 py-3.5 w-full max-w-xs sm:w-auto justify-center"
            >
              {isAuthenticated ? 'Go to Wardrobe' : 'Start Dressing'}
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => scrollToSection('perks')}
              className="btn-ghost text-base px-8 py-3.5 w-full max-w-xs sm:w-auto justify-center"
            >
              Learn More
              <ChevronDown className="w-4 h-4" />
            </button>
            {/* Watch Video button */}
            <a
              href="/video"
              className="flex items-center justify-center gap-2 w-full max-w-xs sm:w-auto px-8 py-3.5 rounded-full text-base font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Video
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Our Story Section ─────────────────────────────────── */}
      <section id="our-story" className="relative py-20 sm:py-28 px-4 z-10">
        <div className="section-container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 mb-8">
              <Clock className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              <span className="gradient-text">Our Story</span>
            </h2>

            <p className="text-xl sm:text-2xl font-semibold text-foreground mb-4 leading-snug">
              Every morning, millions of people lose precious time deciding what to wear.
            </p>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-6 max-w-2xl mx-auto">
              <strong className="text-foreground font-semibold">Let's Dress</strong> gives you back those mornings -
              smart outfit suggestions, personalized planning, and a wardrobe that just <em>works</em>.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { value: '30 min', label: 'saved daily' },
                { value: '100%', label: 'your style' },
                { value: '∞', label: 'combinations' },
              ].map(stat => (
                <div key={stat.label} className="glass-card px-6 py-4 flex flex-col items-center justify-center min-w-[100px]">
                  <span className={`font-black gradient-text ${stat.value === '∞' ? 'text-5xl leading-[0.8]' : 'text-2xl'}`}>
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trends Section ────────────────────────────────────── */}
      <section id="trends" className="relative py-20 sm:py-28 px-4 z-10">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-500/15 border border-pink-200 dark:border-pink-500/25 mb-8">
              <TrendingUp className="w-7 h-7 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              Trends &amp; <span className="gradient-text">Styles</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              From timeless old money aesthetics to modern streetwear — curate a wardrobe that is unmistakably <em>you</em>.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              { src: '/images/mens-fashion.jpg', alt: "Men's Fashion", title: "Men's Style", sub: 'Classic meets contemporary' },
              { src: '/images/womens-fashion.jpg', alt: "Women's Fashion", title: "Women's Style", sub: 'Elegant and empowering' },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative group rounded-3xl overflow-hidden shadow-xl"
              >
                <div className="aspect-[3/4]">
                  <img
                    src={card.src}
                    alt={card.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-white/75 text-base sm:text-lg">{card.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Perks Section ─────────────────────────────────────── */}
      <section id="perks" className="relative py-20 sm:py-28 px-4 z-10">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 mb-8">
              <Sparkles className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              Why <span className="gradient-text">Let's Dress?</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto">
              No more thinking about what to wear — ever.
            </p>
          </motion.div>

          {/* First 3 perks in normal grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-4 sm:mb-6">
            {perks.slice(0, 3).map((perk, index) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.08, type: 'spring', damping: 22 }}
                viewport={{ once: true, margin: '-40px' }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card p-6 sm:p-7 flex flex-col gap-4 transition-shadow duration-300"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-500/15 dark:to-pink-500/15 border border-violet-200/50 dark:border-violet-500/20 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-sm">
                  {perk.emoji}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{perk.title}</h3>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{perk.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Last 2 perks — centered row */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-5xl mx-auto">
            {perks.slice(3).map((perk, index) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (index + 3) * 0.08, type: 'spring', damping: 22 }}
                viewport={{ once: true, margin: '-40px' }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card p-6 sm:p-7 flex flex-col gap-4 transition-shadow duration-300 w-full sm:max-w-sm"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-500/15 dark:to-pink-500/15 border border-violet-200/50 dark:border-violet-500/20 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-sm">
                  {perk.emoji}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{perk.title}</h3>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{perk.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-14"
          >
            <a href={ctaHref} className="btn-primary text-base px-8 py-4">
              {isAuthenticated ? 'Open My Wardrobe' : 'Get Started Free'}
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
