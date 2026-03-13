import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(formData.username, formData.password)) {
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
            <h1 className="text-3xl mb-6 text-center">Sign In</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm opacity-80">Username</label>
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
                <label className="block mb-2 text-sm opacity-80">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all font-semibold mt-6"
              >
                Sign In
              </button>
            </form>

            <p className="text-center mt-6 text-sm opacity-80">
              Don't have an account?{' '}
              <a href="/signup" className="text-purple-400 hover:text-purple-300">
                Sign Up
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
