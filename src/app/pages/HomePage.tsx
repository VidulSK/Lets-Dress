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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-[#0f0c29]">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/30 blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-pink-600/30 blur-[120px] mix-blend-screen animate-pulse delay-1000" />
        
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop)',
          }}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 50 }}
          className="relative z-10 text-center px-8 py-16 max-w-5xl rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
        >
          <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="mb-4 inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-sm tracking-wider uppercase backdrop-blur-md"
          >
            Elevate Your Style
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-6xl md:text-8xl mb-6 font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-sm"
          >
            Your Digital Wardrobe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl mb-10 text-white/80 font-light"
          >
            Never waste time deciding what to wear again. Curate, randomize, and plan your outfits with elegance.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <a
              href="/signup"
              className="group relative px-8 py-4 rounded-full bg-white text-black text-lg font-semibold overflow-hidden transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <div className="absolute inset-0 w-0 bg-gradient-to-r from-purple-200 to-pink-200 transition-all duration-[250ms] ease-out group-hover:w-full" />
              <span className="relative z-10 group-hover:text-purple-900 transition-colors">Start Curating</span>
            </a>
            <a
              href="#perks"
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all text-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
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
                  src="https://thumbs.dreamstime.com/b/two-men-fashion-models-wear-white-shirt-tie-posing-office-two-fashion-man-talkig-posing-126695382.jpg"
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
                  src="https://akns-images.eonline.com/eol_images/Entire_Site/20151017/rs_634x951-151117082440-634.9.Kendall-Jenner-Kylie-Jenner-Topshop-Christmas-Holiday.jl.111715.jpg?fit=around%7C634:951&output-quality=90&crop=634:951;center,top"
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
