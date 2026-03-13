import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username || !formData.password || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    signup(formData);
    navigate('/wardrobe');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar showAuth={true} />
      
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <h1 className="text-3xl mb-6 text-center">Create Account</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm opacity-80">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm opacity-80">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm opacity-80">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm opacity-80">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm opacity-80">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm opacity-80">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
                >
                  <option value="" className="bg-[#D2C1B6] text-gray-400">Select gender</option>
                  <option value="male" className="bg-[#D2C1B6] text-white">Male</option>
                  <option value="female" className="bg-[#D2C1B6] text-white">Female</option>
                  <option value="other" className="bg-[#D2C1B6] text-white">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm opacity-80">Skin Undertone</label>
                <select
                  name="skinUndertone"
                  value={formData.skinUndertone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
                >
                  <option value="" className="bg-[#D2C1B6] text-gray-400">Select undertone</option>
                  <option value="warm" className="bg-[#D2C1B6] text-white">Warm</option>
                  <option value="cool" className="bg-[#D2C1B6] text-white">Cool</option>
                  <option value="neutral" className="bg-[#D2C1B6] text-white">Neutral</option>
                  <option value="dont-know" className="bg-[#D2C1B6] text-white">Don't Know</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm opacity-80">Favorite Color</label>
                <input
                  type="text"
                  name="favoriteColor"
                  value={formData.favoriteColor}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
                  placeholder="e.g., Blue"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all font-semibold mt-6"
              >
                Create Account
              </button>
            </form>

            <p className="text-center mt-6 text-sm opacity-80">
              Already have an account?{' '}
              <a href="/signin" className="text-purple-400 hover:text-purple-300">
                Sign In
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
