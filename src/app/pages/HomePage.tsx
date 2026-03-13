import { useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar showAuth={true} />

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-24 left-6 z-50 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed left-0 top-0 h-full w-72 bg-white/10 backdrop-blur-xl border-r border-white/10 z-40 pt-24 px-6"
      >
        <div className="flex flex-col gap-4">
          <button
            onClick={() => scrollToSection('our-story')}
            className="text-left px-4 py-3 rounded-lg hover:bg-white/20 transition-all"
          >
            Our Story
          </button>
          <button
            onClick={() => scrollToSection('trends')}
            className="text-left px-4 py-3 rounded-lg hover:bg-white/20 transition-all"
          >
            Trends and Styles
          </button>
          <button
            onClick={() => scrollToSection('perks')}
            className="text-left px-4 py-3 rounded-lg hover:bg-white/20 transition-all"
          >
            Perks
          </button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1771072426488-87e6bbcc0cf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwd2FyZHJvYmUlMjBiYWNrZ3JvdW5kJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzMzOTMwNDR8MA&ixlib=rb-4.1.0&q=80&w=1080)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-800/70 to-orange-700/60" />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-6 max-w-4xl"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl md:text-8xl mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
          >
            Your Digital Wardrobe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl mb-8 text-white/90"
          >
            Never waste time deciding what to wear again
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="#our-story"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-lg font-semibold"
            >
              Get Started
            </a>
            <a
              href="#perks"
              className="px-8 py-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all text-lg"
            >
              Learn More
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Our Story Section */}
      <section id="our-story" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Clock className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl mb-6">Our Story</h2>
            <p className="text-lg opacity-80 leading-relaxed">
              Every morning, millions of people waste precious time standing in front of their wardrobes, 
              struggling to decide what to wear. We created Outfit Tracker to solve this universal problem. 
              Our mission is to give you back your time by making outfit selection effortless and fun. 
              With intelligent suggestions and personalized tracking, you'll spend less time worrying 
              about your clothes and more time living your life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trends Section */}
      <section id="trends" className="py-20 px-6 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <TrendingUp className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl mb-6">Trends and Styles</h2>
            <p className="text-lg opacity-80 mb-12">
              Stay ahead with the latest fashion trends. From timeless old money aesthetics to modern streetwear, 
              we help you curate a wardrobe that reflects your unique style.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1765175096278-efbc09f254dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHlsaXNoJTIweW91bmclMjBtYW4lMjBmYXNoaW9ufGVufDF8fHx8MTc3MzM5MzA0NXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Men's Fashion"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-xl bg-white/10 backdrop-blur-md">
                <h3 className="text-2xl mb-2">Men's Style</h3>
                <p className="opacity-80">Classic meets contemporary</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1764236027288-01496bf7489a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIweW91bmclMjB3b21hbiUyMGZhc2hpb258ZW58MXx8fHwxNzczMzkzMDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Women's Fashion"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-xl bg-white/10 backdrop-blur-md">
                <h3 className="text-2xl mb-2">Women's Style</h3>
                <p className="opacity-80">Elegant and empowering</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Perks Section */}
      <section id="perks" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl mb-4">Perks</h2>
            <p className="text-2xl opacity-90 mb-12">No more thinking what to wear</p>
          </motion.div>

          <div className="grid gap-6">
            {[
              {
                title: 'Save Time Daily',
                description: 'Reduce your morning routine by up to 30 minutes with instant outfit suggestions',
              },
              {
                title: 'Smart Organization',
                description: 'Keep track of all your clothes in one digital space, easily searchable and categorized',
              },
              {
                title: 'Maximize Your Wardrobe',
                description: 'Discover new combinations from clothes you already own, reducing unnecessary purchases',
              },
              {
                title: 'Track Your Style',
                description: 'See what you wear most and plan better purchases based on your actual habits',
              },
              {
                title: 'Never Repeat Outfits',
                description: 'Our intelligent system ensures fresh combinations throughout the week',
              },
              {
                title: 'Plan Ahead',
                description: 'Schedule outfits for important events and never be caught unprepared',
              },
            ].map((perk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                <h3 className="text-xl mb-2">✨ {perk.title}</h3>
                <p className="opacity-80">{perk.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
