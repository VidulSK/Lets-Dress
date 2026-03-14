import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, User, Lock, Mail, Phone, Calendar, Palette } from 'lucide-react';

export function SignUpPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    age: '',
    email: '',
    phone: '',
    gender: '',
    skinUndertone: '',
    favoriteColor: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await signup(formData);
      navigate('/wardrobe');
    } catch (err: any) {
      alert(err.message || 'Failed to create account');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex bg-[#0f0c29]">
      {/* Left side - Image & Branding */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 to-black/80 z-10 mix-blend-multiply" />
        <img 
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" 
          alt="Fashion Wardrobe" 
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 flex flex-col justify-end p-16 h-full text-white">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200"
          >
            Curate Your<br />Signature Look
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg opacity-80 max-w-md"
          >
            Join thousands of users organizing their wardrobes, generating outfits, and saving time every morning.
          </motion.p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-pink-600/20 blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-xl relative z-10 flex flex-col min-h-full py-8"
        >
          <a href="/" className="inline-block text-2xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Let's Dress
          </a>

          <h1 className="text-4xl font-bold mb-2 text-white">Create Account</h1>
          <p className="text-white/60 mb-8">Personalize your wardrobe experience</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  placeholder="Username *"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  placeholder="Password *"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  placeholder="Email *"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  placeholder="Phone Number"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                  <Calendar size={18} />
                </div>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  placeholder="Age"
                />
              </div>
              
              <div className="relative group">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all appearance-none ${formData.gender ? 'text-white' : 'text-white/40'}`}
                >
                  <option value="" disabled className="bg-[#1a1638] text-white/40">Select Gender</option>
                  <option value="male" className="bg-[#1a1638] text-white">Male</option>
                  <option value="female" className="bg-[#1a1638] text-white">Female</option>
                  <option value="other" className="bg-[#1a1638] text-white">Other</option>
                </select>
              </div>

              <div className="relative group">
                <select
                  name="skinUndertone"
                  value={formData.skinUndertone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all appearance-none ${formData.skinUndertone ? 'text-white' : 'text-white/40'}`}
                >
                  <option value="" disabled className="bg-[#1a1638] text-white/40">Skin Undertone</option>
                  <option value="warm" className="bg-[#1a1638] text-white">Warm</option>
                  <option value="cool" className="bg-[#1a1638] text-white">Cool</option>
                  <option value="neutral" className="bg-[#1a1638] text-white">Neutral</option>
                  <option value="dont-know" className="bg-[#1a1638] text-white">Don't Know</option>
                </select>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                  <Palette size={18} />
                </div>
                <input
                  type="text"
                  name="favoriteColor"
                  value={formData.favoriteColor}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  placeholder="Favorite Color (e.g., Blue)"
                />
              </div>
            </div>

            <button
              type="submit"
              className="group w-full py-4 px-6 mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              Finish Setup
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/60">
            Already have an account?{' '}
            <a href="/signin" className="text-purple-400 hover:text-purple-300 font-medium ml-1 transition-colors">
              Sign In
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
