import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowRight, Lock, User, Mail, Phone, Calendar, Palette, LogIn, UserPlus
} from 'lucide-react';

type Tab = 'signin' | 'signup';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup } = useAuth();

  // Determine initial tab from ?tab= query param, default to signin
  const initialTab: Tab = (searchParams.get('tab') === 'signup') ? 'signup' : 'signin';
  const [tab, setTab] = useState<Tab>(initialTab);

  const [signInData, setSignInData] = useState({ username: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    username: '', password: '', age: '', email: '',
    phone: '', gender: '', skinUndertone: '', favoriteColor: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(signInData.username, signInData.password);
    setLoading(false);
    if (ok) navigate('/wardrobe');
    else alert('Invalid username or password');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpData.username || !signUpData.password || !signUpData.email) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await signup(signUpData);
      navigate('/wardrobe');
    } catch (err: any) {
      alert(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-3 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-sm';
  const selectClass = (val: string) =>
    `w-full px-3.5 py-3 rounded-xl bg-muted border border-border focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none text-sm ${val ? 'text-foreground' : 'text-muted-foreground'}`;
  const iconClass =
    'absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors';

  return (
    <div className="min-h-screen flex bg-transparent transition-colors duration-500">

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br dark:from-violet-900/60 dark:to-black/80 from-violet-200/50 to-white/60 z-10" />
        <img
          src={tab === 'signup' ? 'images/signUp.jpg' : 'images/signIn.jpg'}
          alt="Fashion"
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-700"
        />
        <div className="relative z-20 flex flex-col justify-end p-12 xl:p-16 h-full text-white">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl xl:text-5xl font-black mb-4 leading-tight text-white drop-shadow-lg">
              {tab === 'signin'
                ? <>Welcome Back<br />to Your Wardrobe</>
                : <>Curate Your<br />Signature Look</>
              }
            </h2>
            <p className="text-base text-white/80 max-w-sm font-medium leading-relaxed">
              {tab === 'signin'
                ? 'Access your smartly curated outfits and seamlessly plan your week ahead.'
                : 'Join thousands of users organizing their wardrobes, generating outfits, and saving time every morning.'
              }
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="w-full lg:w-7/12 flex items-start justify-center p-6 sm:p-8 relative overflow-hidden overflow-y-auto">
        {/* Orbs */}
        <div className="orb orb-1 absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] max-w-xs pointer-events-none" />
        <div className="orb orb-2 absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] max-w-xs pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg relative z-10 py-10 sm:py-14"
        >
          {/* Logo */}
          <a href="/" className="inline-flex items-center gap-2.5 mb-10 group">
            <img
              src="images/logo.png"
              alt="Logo"
              className="w-9 h-9 rounded-full object-contain p-1 bg-white/90 dark:bg-white/10 border border-violet-200 dark:border-violet-500/30 group-hover:scale-110 transition-transform"
            />
            <span className="text-xl font-bold gradient-text">Let's Dress</span>
          </a>

          {/* Tab switcher */}
          <div className="flex p-1.5 rounded-2xl bg-muted border border-border mb-8 gap-1">
            {([
              { key: 'signin' as Tab, label: 'Sign In', icon: <LogIn className="w-3.5 h-3.5" /> },
              { key: 'signup' as Tab, label: 'Sign Up', icon: <UserPlus className="w-3.5 h-3.5" /> },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  tab === t.key
                    ? 'bg-white dark:bg-violet-500/25 text-violet-700 dark:text-violet-300 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.icon}
                {t.label}
                {tab === t.key && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-violet-500/20 -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {tab === 'signin' ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl sm:text-4xl font-black mb-1.5 tracking-tight">Sign In</h1>
                <p className="text-muted-foreground text-sm mb-7">Enter your credentials to access your account</p>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="relative group">
                    <div className={iconClass}><User size={16} /></div>
                    <input
                      type="text"
                      value={signInData.username}
                      onChange={e => setSignInData(p => ({ ...p, username: e.target.value }))}
                      className={inputClass}
                      placeholder="Username"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <div className={iconClass}><Lock size={16} /></div>
                    <input
                      type="password"
                      value={signInData.password}
                      onChange={e => setSignInData(p => ({ ...p, password: e.target.value }))}
                      className={inputClass}
                      placeholder="Password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none"
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                    <ArrowRight size={17} />
                  </button>
                </form>

                <p className="mt-7 text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setTab('signup')}
                    className="text-violet-600 dark:text-violet-400 font-bold ml-1 hover:underline transition-colors"
                  >
                    Create one
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl sm:text-4xl font-black mb-1.5 tracking-tight">Create Account</h1>
                <p className="text-muted-foreground text-sm mb-7">Personalize your wardrobe experience</p>

                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative group">
                      <div className={iconClass}><User size={16} /></div>
                      <input type="text" value={signUpData.username}
                        onChange={e => setSignUpData(p => ({ ...p, username: e.target.value }))}
                        className={inputClass} placeholder="Username *" required />
                    </div>
                    <div className="relative group">
                      <div className={iconClass}><Lock size={16} /></div>
                      <input type="password" value={signUpData.password}
                        onChange={e => setSignUpData(p => ({ ...p, password: e.target.value }))}
                        className={inputClass} placeholder="Password *" required />
                    </div>
                    <div className="relative group">
                      <div className={iconClass}><Mail size={16} /></div>
                      <input type="email" value={signUpData.email}
                        onChange={e => setSignUpData(p => ({ ...p, email: e.target.value }))}
                        className={inputClass} placeholder="Email *" required />
                    </div>
                    <div className="relative group">
                      <div className={iconClass}><Phone size={16} /></div>
                      <input type="tel" value={signUpData.phone}
                        onChange={e => setSignUpData(p => ({ ...p, phone: e.target.value }))}
                        className={inputClass} placeholder="Phone Number" />
                    </div>
                    <div className="relative group">
                      <div className={iconClass}><Calendar size={16} /></div>
                      <input type="number" value={signUpData.age}
                        onChange={e => setSignUpData(p => ({ ...p, age: e.target.value }))}
                        className={inputClass} placeholder="Age" />
                    </div>
                    <select value={signUpData.gender}
                      onChange={e => setSignUpData(p => ({ ...p, gender: e.target.value }))}
                      className={selectClass(signUpData.gender)}>
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <select value={signUpData.skinUndertone}
                      onChange={e => setSignUpData(p => ({ ...p, skinUndertone: e.target.value }))}
                      className={selectClass(signUpData.skinUndertone)}>
                      <option value="" disabled>Skin Undertone</option>
                      <option value="warm">Warm</option>
                      <option value="cool">Cool</option>
                      <option value="neutral">Neutral</option>
                      <option value="dont-know">Don't Know</option>
                    </select>
                    <div className="relative group">
                      <div className={iconClass}><Palette size={16} /></div>
                      <input type="text" value={signUpData.favoriteColor}
                        onChange={e => setSignUpData(p => ({ ...p, favoriteColor: e.target.value }))}
                        className={inputClass} placeholder="Favorite Color (e.g., Blue)" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none"
                  >
                    {loading ? 'Creating account…' : 'Finish Setup'}
                    <ArrowRight size={17} />
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    onClick={() => setTab('signin')}
                    className="text-violet-600 dark:text-violet-400 font-bold ml-1 hover:underline transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
