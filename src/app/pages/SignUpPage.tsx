import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, User, Lock, Mail, Phone, Calendar, Palette, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

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
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === 'phone') {
      // Remove all non-digits and keep only up to 10 characters
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  return (
    <div className="min-h-screen flex bg-transparent transition-colors duration-500">
      {/* Left side - Image & Branding */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br dark:from-purple-900/60 dark:to-black/80 from-purple-300/30 to-white/50 z-10 mix-blend-multiply" />
        <img 
          src="images/signUp.jpg"
          alt="Fashion Wardrobe" 
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 flex flex-col justify-end p-16 h-full text-white">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:to-pink-200 from-gray-900 to-pink-700"
          >
            Curate Your<br />Signature Look
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg flex-relaxed dark:opacity-80 dark:text-white text-gray-900 max-w-md font-medium"
          >
            Join thousands of users organizing their wardrobes, generating outfits, and saving time every morning.
          </motion.p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full dark:bg-purple-600/20 bg-purple-300/40 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full dark:bg-pink-600/20 bg-pink-300/40 blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-xl relative z-10 flex flex-col min-h-full py-8 dark:bg-transparent bg-white/40 p-10 rounded-3xl dark:shadow-none shadow-xl border dark:border-transparent border-white/40 backdrop-blur-md"
        >
          <a href="/" className="inline-block text-2xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r dark:from-purple-400 dark:to-pink-400 from-purple-600 to-pink-600">
            Let's Dress
          </a>

          <h1 className="text-4xl font-bold mb-2 dark:text-white text-gray-900">Create Account</h1>
          <p className="dark:text-white/60 text-gray-600 font-medium mb-8">Personalize your wardrobe experience</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none dark:text-white/40 text-gray-400 dark:group-focus-within:text-purple-400 group-focus-within:text-purple-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl dark:bg-white/5 bg-white/60 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 dark:placeholder-white/40 placeholder-gray-500 dark:focus:border-purple-500 focus:border-purple-400 dark:focus:bg-white/10 focus:bg-white focus:ring-2 dark:focus:ring-purple-500/20 focus:ring-purple-500/20 focus:outline-none transition-all shadow-sm"
                  placeholder="Username *"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none dark:text-white/40 text-gray-400 dark:group-focus-within:text-purple-400 group-focus-within:text-purple-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl dark:bg-white/5 bg-white/60 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 dark:placeholder-white/40 placeholder-gray-500 dark:focus:border-purple-500 focus:border-purple-400 dark:focus:bg-white/10 focus:bg-white focus:ring-2 dark:focus:ring-purple-500/20 focus:ring-purple-500/20 focus:outline-none transition-all shadow-sm"
                  placeholder="Password *"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/80 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none dark:text-white/40 text-gray-400 dark:group-focus-within:text-purple-400 group-focus-within:text-purple-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl dark:bg-white/5 bg-white/60 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 dark:placeholder-white/40 placeholder-gray-500 dark:focus:border-purple-500 focus:border-purple-400 dark:focus:bg-white/10 focus:bg-white focus:ring-2 dark:focus:ring-purple-500/20 focus:ring-purple-500/20 focus:outline-none transition-all shadow-sm"
                  placeholder="Email *"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none dark:text-white/40 text-gray-400 dark:group-focus-within:text-purple-400 group-focus-within:text-purple-600 transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl dark:bg-white/5 bg-white/60 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 dark:placeholder-white/40 placeholder-gray-500 dark:focus:border-purple-500 focus:border-purple-400 dark:focus:bg-white/10 focus:bg-white focus:ring-2 dark:focus:ring-purple-500/20 focus:ring-purple-500/20 focus:outline-none transition-all shadow-sm"
                  placeholder="Phone Number"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none dark:text-white/40 text-gray-400 dark:group-focus-within:text-purple-400 group-focus-within:text-purple-600 transition-colors">
                  <Calendar size={18} />
                </div>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl dark:bg-white/5 bg-white/60 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 dark:placeholder-white/40 placeholder-gray-500 dark:focus:border-purple-500 focus:border-purple-400 dark:focus:bg-white/10 focus:bg-white focus:ring-2 dark:focus:ring-purple-500/20 focus:ring-purple-500/20 focus:outline-none transition-all shadow-sm"
                  placeholder="Age"
                />
              </div>
              
              <div className="relative group">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 rounded-xl dark:bg-white/5 bg-white/60 border dark:border-white/10 border-gray-200 dark:focus:border-purple-500 focus:border-purple-400 dark:focus:bg-white/10 focus:bg-white focus:ring-2 dark:focus:ring-purple-500/20 focus:ring-purple-500/20 focus:outline-none transition-all appearance-none shadow-sm ${formData.gender ? 'dark:text-white text-gray-900' : 'dark:text-white/40 text-gray-500'}`}
                >
                  <option value="" disabled className="dark:bg-[#1a1638] bg-white dark:text-white/40 text-gray-500">Select Gender</option>
                  <option value="male" className="dark:bg-[#1a1638] bg-white dark:text-white text-gray-900">Male</option>
                  <option value="female" className="dark:bg-[#1a1638] bg-white dark:text-white text-gray-900">Female</option>
                  <option value="other" className="dark:bg-[#1a1638] bg-white dark:text-white text-gray-900">Other</option>
                </select>
              </div>

              <div className="relative group">
                <select
                  name="skinUndertone"
                  value={formData.skinUndertone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 rounded-xl dark:bg-white/5 bg-white/60 border dark:border-white/10 border-gray-200 dark:focus:border-purple-500 focus:border-purple-400 dark:focus:bg-white/10 focus:bg-white focus:ring-2 dark:focus:ring-purple-500/20 focus:ring-purple-500/20 focus:outline-none transition-all appearance-none shadow-sm ${formData.skinUndertone ? 'dark:text-white text-gray-900' : 'dark:text-white/40 text-gray-500'}`}
                >
                  <option value="" disabled className="dark:bg-[#1a1638] bg-white dark:text-white/40 text-gray-500">Skin Undertone</option>
                  <option value="warm" className="dark:bg-[#1a1638] bg-white dark:text-white text-gray-900">Warm</option>
                  <option value="cool" className="dark:bg-[#1a1638] bg-white dark:text-white text-gray-900">Cool</option>
                  <option value="neutral" className="dark:bg-[#1a1638] bg-white dark:text-white text-gray-900">Neutral</option>
                  <option value="dont-know" className="dark:bg-[#1a1638] bg-white dark:text-white text-gray-900">Don't Know</option>
                </select>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none dark:text-white/40 text-gray-400 dark:group-focus-within:text-purple-400 group-focus-within:text-purple-600 transition-colors">
                  <Palette size={18} />
                </div>
                <input
                  type="text"
                  name="favoriteColor"
                  value={formData.favoriteColor}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl dark:bg-white/5 bg-white/60 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 dark:placeholder-white/40 placeholder-gray-500 dark:focus:border-purple-500 focus:border-purple-400 dark:focus:bg-white/10 focus:bg-white focus:ring-2 dark:focus:ring-purple-500/20 focus:ring-purple-500/20 focus:outline-none transition-all shadow-sm"
                  placeholder="Favorite Color (e.g., Blue)"
                />
              </div>
            </div>

            <button
              type="submit"
              className="group w-full py-4 px-6 mt-6 rounded-xl bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 dark:hover:from-purple-500 dark:hover:to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-lg"
            >
              Finish Setup
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm dark:text-white/60 text-gray-600 font-medium">
            Already have an account?{' '}
            <a href="/signin" className="dark:text-purple-400 text-purple-600 dark:hover:text-purple-300 hover:text-purple-500 font-bold ml-1 transition-colors">
              Sign In
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
