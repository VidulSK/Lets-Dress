import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shuffle, Save } from 'lucide-react';
import { AppNavbar } from '../components/AppNavbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

interface ClothingItem {
  id: string;
  image: string;
  gender: string;
  type: 'top' | 'bottom' | 'footwear';
  color: string;
  uploadedAt: number;
}

interface Outfit {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  footwear: ClothingItem | null;
}

interface WeeklyOutfit {
  day: string;
  outfit: Outfit | null;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function RandomizerPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  
  // Track history to ensure 3 unique consecutive shuffles
  const [history, setHistory] = useState<{ top: string[]; bottom: string[]; footwear: string[] }>({
    top: [],
    bottom: [],
    footwear: [],
  });

  const [currentOutfit, setCurrentOutfit] = useState<Outfit>({
    top: null,
    bottom: null,
    footwear: null,
  });
  const [weeklyOutfits, setWeeklyOutfits] = useState<WeeklyOutfit[]>(
    DAYS.map(day => ({ day, outfit: null }))
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    // Fetch wardrobe items
    fetch('/api/wardrobe')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const filteredItems = user?.gender 
            ? data.filter(item => item.gender === user?.gender)
            : data;
          setItems(filteredItems);
        }
      })
      .catch(console.error);

    // Fetch weekly outfits
    fetch('/api/outfits')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWeeklyOutfits(prev => prev.map(wo => {
            const found = data.find((d: any) => d.day === wo.day);
            return found ? { day: wo.day, outfit: found.outfit } : wo;
          }));
        }
      })
      .catch(console.error);
  }, [user]);

  // Unique Item Picker Algorithm
  const getUniqueItem = (type: keyof Outfit): ClothingItem | null => {
    const itemsOfType = items.filter(item => item.type === type);
    if (itemsOfType.length === 0) return null;

    const recentIds = history[type];
    // Filter out items that appeared in the last 2 shuffles
    const availableItems = itemsOfType.filter(item => !recentIds.includes(item.id));

    // Fallback if wardrobe is too small: just pick any item that isn't the current one
    const pool = availableItems.length > 0 
      ? availableItems 
      : itemsOfType.filter(i => i.id !== currentOutfit[type]?.id);

    return pool[Math.floor(Math.random() * pool.length)] || itemsOfType[0];
  };

  const generateOutfit = () => {
    if (items.length === 0) {
      alert('Please add some items to your wardrobe first!');
      return;
    }

    setIsSpinning(true);

    const newTop = getUniqueItem('top');
    const newBottom = getUniqueItem('bottom');
    const newFootwear = getUniqueItem('footwear');

    // Update history tracking (keeping the last 2 items)
    setHistory(prev => ({
      top: [newTop?.id, ...prev.top].filter(Boolean).slice(0, 2) as string[],
      bottom: [newBottom?.id, ...prev.bottom].filter(Boolean).slice(0, 2) as string[],
      footwear: [newFootwear?.id, ...prev.footwear].filter(Boolean).slice(0, 2) as string[],
    }));

    // Simulate slot machine spin
    setTimeout(() => {
      setCurrentOutfit({ top: newTop, bottom: newBottom, footwear: newFootwear });
      setIsSpinning(false);
    }, 1500);
  };

  const saveToDay = async (day: string) => {
    if (!currentOutfit.top && !currentOutfit.bottom && !currentOutfit.footwear) {
      alert('Please generate an outfit first!');
      return;
    }

    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, outfit: currentOutfit })
      });
      if (res.ok) {
        setWeeklyOutfits(prev => prev.map(wo => 
          wo.day === day ? { ...wo, outfit: currentOutfit } : wo
        ));
        setSelectedDay(day);
        setTimeout(() => setSelectedDay(null), 2000);
      }
    } catch (e) {
      console.error('Failed to save outfit:', e);
    }
  };

  const clearDay = async (day: string) => {
    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, outfit: null })
      });
      if (res.ok) {
        setWeeklyOutfits(prev => prev.map(wo => 
          wo.day === day ? { ...wo, outfit: null } : wo
        ));
      }
    } catch (e) {
      console.error('Failed to clear outfit:', e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      
      <div className="flex-1 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl mb-2">Outfit Randomizer</h1>
            <p className="opacity-80">Generate unique outfit combinations</p>
          </div>

          {/* Slot Machine */}
          <div className="mb-12">
            <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              {(['top', 'bottom', 'footwear'] as const).map((type) => (
                <div key={type} className="space-y-3">
                  <h3 className="text-center capitalize opacity-80">{type}</h3>
                  <motion.div
                    animate={isSpinning ? { y: [-10, 10, -10] } : {}}
                    transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.3 }}
                    className="aspect-square rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <AnimatePresence mode="wait">
                      {currentOutfit[type] ? (
                        <motion.img
                          key={currentOutfit[type]?.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          src={currentOutfit[type]?.image}
                          alt={type}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                          ?
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={generateOutfit}
                disabled={isSpinning}
                className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
                <span className="text-lg">{isSpinning ? 'Generating...' : 'Randomize Outfit'}</span>
              </button>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div>
            <h2 className="text-2xl mb-6 text-center">This Week's Outfits</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {weeklyOutfits.map((wo) => (
                <div
                  key={wo.day}
                  className={`p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all ${
                    selectedDay === wo.day ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">{wo.day}</h3>
                    {wo.outfit ? (
                      <button
                        onClick={() => clearDay(wo.day)}
                        className="text-xs opacity-60 hover:opacity-100 hover:text-red-400 transition-all"
                      >
                        Clear
                      </button>
                    ) : (
                      <button
                        onClick={() => saveToDay(wo.day)}
                        className="text-xs opacity-60 hover:opacity-100 hover:text-green-400 transition-all"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {wo.outfit ? (
                    <div className="space-y-2">
                      {wo.outfit.top && (
                        <div className="aspect-square rounded-lg overflow-hidden bg-white/5">
                          <img
                            src={wo.outfit.top.image}
                            alt="Top"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {wo.outfit.bottom && (
                        <div className="aspect-square rounded-lg overflow-hidden bg-white/5">
                          <img
                            src={wo.outfit.bottom.image}
                            alt="Bottom"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {wo.outfit.footwear && (
                        <div className="aspect-square rounded-lg overflow-hidden bg-white/5">
                          <img
                            src={wo.outfit.footwear.image}
                            alt="Footwear"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
                      <p className="text-xs opacity-40 text-center px-2">
                        No outfit<br />saved
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 mt-8 rounded-xl bg-white/5 border border-white/10"
            >
              <p className="text-xl opacity-60 mb-2">No items in wardrobe</p>
              <p className="opacity-40">Add items to your wardrobe to start generating outfits</p>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}