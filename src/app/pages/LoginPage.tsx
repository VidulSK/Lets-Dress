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
    'w-full pl-10 pr-3 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-base';
  const selectClass = (val: string) =>
    `w-full px-3.5 py-3.5 rounded-xl bg-muted border border-border focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none text-base ${val ? 'text-foreground' : 'text-muted-foreground'}`;
  const iconClass =
    'absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors';

  return (
    <div className="min-h-screen lg:h-screen w-full relative flex flex-col lg:flex-row items-center justify-center lg:items-stretch overflow-hidden transition-colors duration-500 bg-white dark:bg-background z-0">
      
      {/* ── Background Image Panel ── 
           Mobile: absolute covering everything.
           Desktop: relative 5/12 width order-first (left side).
      */}
      <div className="absolute inset-0 z-0 lg:relative lg:flex-shrink-0 lg:w-5/12 lg:h-full lg:order-first overflow-hidden">
        {/* Tint removed as per request */}
        <img
          src={tab === 'signup' ? 'images/signUp.jpg' : 'images/signIn.jpg'}
          alt="Fashion Background"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none lg:scale-105"
        />
        
        {/* Text Overlay (Desktop Only - positioned at bottom of image) */}
        <div className="relative z-20 hidden lg:flex flex-col justify-end p-12 xl:p-16 h-full text-white">
          <motion.div
            key={`desktop-text-${tab}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl xl:text-5xl font-black mb-4 leading-tight text-white drop-shadow-xl">
              {tab === 'signin'
                ? <>Welcome Back<br /> to Your Wardrobe</>
                : <>Curate Your<br /> Signature Look</>
              }
            </h2>
            <p className="text-base text-white/90 max-w-sm font-medium leading-relaxed drop-shadow-md">
              {tab === 'signin'
                ? 'Access your smartly curated outfits and seamlessly plan your week ahead.'
                : 'Join thousands of users organizing their wardrobes, generating outfits, and saving time every morning.'
              }
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Form & Content Container ── 
           Mobile: relative z-10, centered, padded glass card.
           Desktop: static flex-1 width 7/12, centered content normal card.
      */}
      <div className="relative z-10 w-full lg:flex-1 lg:w-7/12 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-6 min-h-screen lg:min-h-0">
        
        {/* Desktop Orbs (Hidden on mobile overlay to reduce noise) */}
        <div className="hidden lg:block orb orb-1 absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] max-w-xs pointer-events-none" />
        <div className="hidden lg:block orb orb-2 absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] max-w-xs pointer-events-none" />

        <div className="w-full max-w-md lg:max-w-lg flex flex-col items-center">
            
          {/* Mobile Text Content (Hidden on Desktop) */}
          <div className="lg:hidden w-full text-center text-white mb-6 mt-4">
            <a href="/" className="inline-flex flex-col items-center gap-2 mb-6 group">
              <img
                src="images/logo.png"
                alt="Logo"
                className="w-14 h-14 rounded-full object-contain p-1.5 bg-white/90 dark:bg-white/10 border border-violet-200 dark:border-violet-500/30 group-hover:scale-110 transition-transform shadow-md"
              />
            </a>
            <h2 className="text-3xl sm:text-4xl font-black mb-2 leading-tight drop-shadow-xl">
              {tab === 'signin'
                ? <>Welcome Back<br className="hidden sm:block" /> to Your Wardrobe</>
                : <>Curate Your<br className="hidden sm:block" /> Signature Look</>
              }
            </h2>
            <p className="text-sm sm:text-base text-white/90 max-w-sm mx-auto font-medium drop-shadow-md">
              {tab === 'signin'
                ? 'Access your smartly curated outfits and seamlessly plan your week ahead.'
                : 'Join thousands of users organizing their wardrobes, generating outfits, and saving time every morning.'
              }
            </p>
          </div>

          {/* Form Card 
              Mobile: glass styling
              Desktop: normal integrated styling 
          */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white/95 dark:bg-background/95 lg:bg-transparent lg:dark:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none border border-white/20 dark:border-white/10 lg:border-none shadow-2xl lg:shadow-none rounded-3xl lg:rounded-none p-6 sm:p-8 lg:p-0 relative lg:py-6"
          >
            {/* Desktop Logo (Hidden on mobile) */}
            <a href="/" className="hidden lg:flex flex-col items-center gap-2 mb-8 group">
              <img
                src="images/logo.png"
                alt="Logo"
                className="w-14 h-14 rounded-full object-contain p-1.5 bg-white/90 dark:bg-white/10 border border-violet-200 dark:border-violet-500/30 group-hover:scale-110 transition-transform shadow-md"
              />
              <span className="text-2xl font-bold gradient-text">Let's Dress</span>
            </a>

            {/* Tab switcher */}
            <div className="flex p-1.5 rounded-2xl bg-muted/80 backdrop-blur-md lg:backdrop-blur-none border border-border mb-8 gap-1">
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
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black mb-1.5 lg:mb-2 tracking-tight">Sign In</h1>
                  <p className="text-muted-foreground text-sm lg:text-base mb-6 lg:mb-7">Enter your credentials to access your account</p>

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

                  <p className="mt-6 lg:mt-7 text-center text-sm text-muted-foreground">
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
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black mb-1.5 lg:mb-2 tracking-tight">Create Account</h1>
                  <p className="text-muted-foreground text-sm lg:text-base mb-6 lg:mb-7">Personalize your wardrobe experience</p>

                  <form onSubmit={handleSignUp} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
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
                          className={inputClass} placeholder="Favorite Color" />
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
    </div>
  );
}
