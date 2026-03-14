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
    <div className="min-h-screen flex bg-[#0f0c29]">
      {/* Left side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 to-black/80 z-10 mix-blend-multiply" />
        <img 
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop" 
          alt="Fashion" 
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 flex flex-col justify-end p-16 h-full text-white">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200"
          >
            Welcome Back<br />to Your Wardrobe
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg opacity-80 max-w-md"
          >
            Access your smartly curated outfits and seamlessly plan your week ahead.
          </motion.p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background elements for mobile/right side */}
        <div className="absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-pink-600/20 blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative z-10 flex flex-col min-h-full"
        >
          <div className="flex-1 flex flex-col justify-center">
            <a href="/" className="inline-block text-2xl font-bold mb-12 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Let's Dress
            </a>

            <h1 className="text-4xl font-bold mb-2 text-white">Sign In</h1>
            <p className="text-white/60 mb-8">Enter your credentials to access your account</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  placeholder="Username"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  placeholder="Password"
                  required
                />
              </div>

              <button
                type="submit"
                className="group w-full py-4 px-6 mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                Sign In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-white/60">
              Don't have an account?{' '}
              <a href="/signup" className="text-purple-400 hover:text-purple-300 font-medium ml-1 transition-colors">
                Create an account
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
