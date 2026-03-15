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
      <div className="absolute inset-0 bg-gradient-to-br dark:from-purple-900/60 dark:to-black/80 from-purple-300/30 to-white/50 z-10 mix-blend-multiply" />
      <img 
        src="images/signIn.jpg" 
        alt="Fashion" 
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />
      {/* CHANGE: Changed justify-end to justify-start and added pt-32 to push it slightly down from the very top */}
      <div className="relative z-20 flex flex-col justify-start p-16 pt-32 h-full text-white">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:to-purple-200 from-gray-900 to-purple-800 -mt-28"
        >
          Welcome Back<br />to Your Wardrobe
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg/relaxed dark:opacity-80 dark:text-white text-gray-900 max-w-md font-medium"
        >
          Access your smartly curated outfits and seamlessly plan your week ahead.
        </motion.p>
      </div>
    </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background elements for mobile/right side */}
        <div className="absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full dark:bg-purple-600/20 bg-purple-300/40 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full dark:bg-pink-600/20 bg-pink-300/40 blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative z-10 flex flex-col min-h-full"
        >
          <div className="flex-1 flex flex-col justify-center dark:bg-transparent bg-white/40 p-10 rounded-3xl dark:shadow-none shadow-xl border dark:border-transparent border-white/40 backdrop-blur-md">
            <a href="/" className="inline-block text-2xl font-bold mb-12 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r dark:from-purple-400 dark:to-pink-400 from-purple-600 to-pink-600">
              Let's Dress
            </a>

            <h1 className="text-4xl font-bold mb-2 dark:text-white text-gray-900">Sign In</h1>
            <p className="dark:text-white/60 text-gray-600 font-medium mb-8">Enter your credentials to access your account</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none dark:text-white/40 text-gray-400 dark:group-focus-within:text-purple-400 group-focus-within:text-purple-600 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl dark:bg-white/5 bg-white/60 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 dark:placeholder-white/40 placeholder-gray-500 dark:focus:border-purple-500 focus:border-purple-400 dark:focus:bg-white/10 focus:bg-white focus:ring-2 dark:focus:ring-purple-500/20 focus:ring-purple-500/20 focus:outline-none transition-all shadow-sm"
                  placeholder="Username"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none dark:text-white/40 text-gray-400 dark:group-focus-within:text-purple-400 group-focus-within:text-purple-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl dark:bg-white/5 bg-white/60 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 dark:placeholder-white/40 placeholder-gray-500 dark:focus:border-purple-500 focus:border-purple-400 dark:focus:bg-white/10 focus:bg-white focus:ring-2 dark:focus:ring-purple-500/20 focus:ring-purple-500/20 focus:outline-none transition-all shadow-sm"
                  placeholder="Password"
                  required
                />
              </div>

              <button
                type="submit"
                className="group w-full py-4 px-6 mt-4 rounded-xl bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 dark:hover:from-purple-500 dark:hover:to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-lg"
              >
                Sign In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-8 text-center text-sm dark:text-white/60 text-gray-600 font-medium">
              Don't have an account?{' '}
              <a href="/signup" className="dark:text-purple-400 text-purple-600 dark:hover:text-purple-300 hover:text-purple-500 font-bold ml-1 transition-colors">
                Create an account
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
