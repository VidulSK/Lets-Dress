import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Lock, User } from 'lucide-react';

export function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // login function will now return a promise when using the API backend
    if (await login(formData.username, formData.password)) {
      navigate('/wardrobe');
    } else {
      alert('Invalid username or password');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex bg-transparent transition-colors duration-500">
      {/* Left side - Image & Branding */}
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br dark:from-violet-900/60 dark:to-black/80 from-violet-300/30 to-white/50 z-10" />
      <img 
        src="images/signIn.jpg" 
        alt="Fashion" 
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />
      <div className="relative z-20 flex flex-col justify-start p-12 xl:p-16 pt-28 h-full text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-10 -mt-16"
        >
          <img src="images/logo.png" alt="Logo" className="w-10 h-10 rounded-full object-contain p-1.5 bg-white/90" />
          <span className="text-white font-bold text-lg">Let's Dress</span>
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl xl:text-5xl font-black mb-4 leading-tight text-white drop-shadow-lg"
        >
          Welcome Back<br />to Your Wardrobe
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-base xl:text-lg text-white/85 max-w-sm font-medium leading-relaxed"
        >
          Access your smartly curated outfits and seamlessly plan your week ahead.
        </motion.p>
      </div>
    </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-1 absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] max-w-xs" />
        <div className="orb orb-2 absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] max-w-xs" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="glass-card p-8 sm:p-10">
            <a href="/" className="inline-flex items-center gap-2 mb-10">
              <img src="images/logo.png" alt="Logo" className="w-8 h-8 rounded-full object-contain p-1 bg-white/90 dark:bg-white/10 border border-violet-200 dark:border-violet-500/30" />
              <span className="text-xl font-bold gradient-text">Let's Dress</span>
            </a>

            <h1 className="text-3xl sm:text-4xl font-black mb-1.5 tracking-tight">Sign In</h1>
            <p className="text-muted-foreground text-sm sm:text-base font-medium mb-8">Enter your credentials to access your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                  placeholder="Username"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                  placeholder="Password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center py-3.5 mt-2"
              >
                Sign In
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
              Don't have an account?{' '}
              <a href="/signup" className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-bold ml-1 transition-colors">
                Create an account
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
