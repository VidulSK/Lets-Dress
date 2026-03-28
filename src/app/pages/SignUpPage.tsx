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
    <div className="min-h-screen flex bg-transparent transition-colors duration-500">
      {/* Left side - Image & Branding */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br dark:from-violet-900/60 dark:to-black/80 from-violet-300/30 to-white/60 z-10" />
        <img 
          src="images/signUp.jpg"
          alt="Fashion Wardrobe" 
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 flex flex-col justify-end p-12 xl:p-16 h-full text-white">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl xl:text-5xl font-black mb-4 leading-tight text-white drop-shadow-lg"
          >
            Curate Your<br />Signature Look
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base text-white/85 max-w-sm font-medium leading-relaxed"
          >
            Join thousands of users organizing their wardrobes, generating outfits, and saving time every morning.
          </motion.p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden">
        <div className="orb orb-1 absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] max-w-xs" />
        <div className="orb orb-2 absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] max-w-xs" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-xl relative z-10 py-4"
        >
          <div className="glass-card p-7 sm:p-10">
            <a href="/" className="inline-flex items-center gap-2 mb-8">
              <img src="images/logo.png" alt="Logo" className="w-8 h-8 rounded-full object-contain p-1 bg-white/90 dark:bg-white/10 border border-violet-200 dark:border-violet-500/30" />
              <span className="text-xl font-bold gradient-text">Let's Dress</span>
            </a>

            <h1 className="text-3xl sm:text-4xl font-black mb-1.5 tracking-tight">Create Account</h1>
            <p className="text-muted-foreground text-sm sm:text-base font-medium mb-6">Personalize your wardrobe experience</p>

          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Username */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                    <User size={16} />
                  </div>
                  <input type="text" name="username" value={formData.username} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                    placeholder="Username *" required />
                </div>

                {/* Password */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                    <Lock size={16} />
                  </div>
                  <input type="password" name="password" value={formData.password} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                    placeholder="Password *" required />
                </div>

                {/* Email */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                    <Mail size={16} />
                  </div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                    placeholder="Email *" required />
                </div>

                {/* Phone */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                    <Phone size={16} />
                  </div>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                    placeholder="Phone Number" />
                </div>

                {/* Age */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                    <Calendar size={16} />
                  </div>
                  <input type="number" name="age" value={formData.age} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                    placeholder="Age" />
                </div>

                {/* Gender */}
                <div className="relative">
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    className={`w-full px-3.5 py-3 rounded-xl bg-muted border border-border focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none text-sm ${formData.gender ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Skin Undertone */}
                <div className="relative">
                  <select name="skinUndertone" value={formData.skinUndertone} onChange={handleChange}
                    className={`w-full px-3.5 py-3 rounded-xl bg-muted border border-border focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none text-sm ${formData.skinUndertone ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    <option value="" disabled>Skin Undertone</option>
                    <option value="warm">Warm</option>
                    <option value="cool">Cool</option>
                    <option value="neutral">Neutral</option>
                    <option value="dont-know">Don't Know</option>
                  </select>
                </div>

                {/* Favorite Color */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                    <Palette size={16} />
                  </div>
                  <input type="text" name="favoriteColor" value={formData.favoriteColor} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                    placeholder="Favorite Color (e.g., Blue)" />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-3.5 mt-4">
                Finish Setup
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground font-medium">
              Already have an account?{' '}
              <a href="/signin" className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-bold ml-1 transition-colors">
                Sign In
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
