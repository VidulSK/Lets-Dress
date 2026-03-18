import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shuffle, Save, Trash2 } from 'lucide-react';
import { AppNavbar } from '../components/AppNavbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

// ── Color Compatibility Array ─────────────────────────────────────────────────
// Fill in matching color names for each base color.
export const COLOR_COMBINATIONS: Record<string, string[]> = {
  pink: ['light blue', 'dark blue', 'gray', 'white', 'black'],
  red: ['light blue', 'dark blue', 'gray', 'white', 'black'],
  orange: ['green', 'light blue', 'dark blue', 'white', 'black'],
  beige: ['dark blue', 'purple', 'brown', 'white', 'black'],
  yellow: ['green', 'dark blue', 'white', 'black'],
  green: ['orange', 'purple', 'white', 'black'],
  'light blue': ['pink', 'red', 'orange', 'white', 'black'],
  'dark blue': ['pink', 'red', 'yellow', 'gray', 'white', 'black'],
  purple: ['orange', 'gray', 'green', 'white', 'black'],
  brown: ['beige', 'white', 'black'],
  gray: ['pink', 'red', 'dark blue', 'purple'],
  white: ['pink', 'red', 'orange', 'beige', 'yellow', 'green', 'light blue', 'dark blue', 'purple', 'brown']
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ClothingItem {
  id: string;
  image: string;
  gender: string;
  type: string;
  color: string;
  colorName: string;
  occasions: string;
  accessoryType: string;
  uploadedAt: number;
}

interface Outfit {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  footwear: ClothingItem | null;
}

interface DayEntry {
  dateStr: string;   // YYYY-MM-DD
  label: string;     // e.g. "Wed · 19 Mar"
  isPast: boolean;
  outfit: Outfit | null;
  eventTitle?: string;
  eventDressType?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short' }) + ' · ' +
    d.getDate() + ' ' + d.toLocaleDateString('en-US', { month: 'short' });
}

function build7Days(): { dateStr: string; label: string; isPast: boolean }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({ dateStr: formatDateStr(d), label: formatLabel(d), isPast: i < 0 });
  }
  return days;
}

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// Accessory reminder message
function buildAccessoryReminder(accessories: ClothingItem[]): string | null {
  if (!accessories.length) return null;
  const counts: Record<string, number> = {};
  accessories.forEach(a => {
    const t = a.accessoryType || 'accessory';
    counts[t] = (counts[t] || 0) + 1;
  });
  const parts = Object.entries(counts).map(([type, count]) => {
    const label = type.toLowerCase();
    const plural = count > 1
      ? (label.endsWith('s') ? label : label + 's')
      : label;
    return `${count} ${count > 1 ? plural : label}`;
  });
  if (!parts.length) return null;
  const list = parts.length > 1
    ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1]
    : parts[0];
  return `You have ${list}. Remember to take them!`;
}

export function RandomizerPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [events, setEvents] = useState<{ date: string; title: string; dressType: string }[]>([]);
  const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);
  const [currentOutfit, setCurrentOutfit] = useState<Outfit>({ top: null, bottom: null, footwear: null });
  const [isSpinning, setIsSpinning] = useState(false);
  const [savedDayDate, setSavedDayDate] = useState<string | null>(null);
  const [history, setHistory] = useState<{ top: string[]; bottom: string[]; footwear: string[] }>({ top: [], bottom: [], footwear: [] });

  const userGender = user?.gender || 'male';
  const isFemale = userGender === 'female';

  // Determine if the current outfit has a saree or frock top (female only)
  const isFullDress = isFemale && (currentOutfit.top?.type === 'saree' || currentOutfit.top?.type === 'frock');

  useEffect(() => {
    fetch('/api/wardrobe')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setItems(data); })
      .catch(console.error);

    fetch('/api/events')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEvents(data); })
      .catch(console.error);

    fetch('/api/outfits')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDayEntries(prev =>
            prev.map(de => {
              const found = data.find((d: any) => d.date === de.dateStr);
              return found ? { ...de, outfit: found.outfit } : de;
            })
          );
        }
      })
      .catch(console.error);
  }, [user]);

  // Build 7-day strip, enriched with events
  useEffect(() => {
    const base = build7Days();
    setDayEntries(base.map(d => ({
      ...d,
      outfit: null,
      eventTitle: undefined,
      eventDressType: undefined,
    })));
  }, []);

  // Enrich day entries with event data whenever events load
  useEffect(() => {
    setDayEntries(prev => prev.map(de => {
      const ev = events.find(e => e.date === de.dateStr);
      return ev ? { ...de, eventTitle: ev.title, eventDressType: ev.dressType } : { ...de, eventTitle: undefined, eventDressType: undefined };
    }));
  }, [events]);

  // Re-enrich with saved outfits when both have loaded
  // (handled by fetch above updating dayEntries)

  const generateOutfit = (targetDate?: string) => {
    if (items.length === 0) {
      alert('Please add some items to your wardrobe first!');
      return;
    }
    setIsSpinning(true);

    const eventForDay = targetDate ? events.find(e => e.date === targetDate) : null;
    const requiredDressType = eventForDay?.dressType || null;

    // Female: include sarees & frocks as "tops"
    const topTypes = isFemale ? ['top', 'saree', 'frock'] : ['top'];

    // Filter by occasion if event has a dress type
    const filterByOccasion = (itms: ClothingItem[]) => {
      if (!requiredDressType) return itms;
      return itms.filter(i => {
        if (!i.occasions) return true; // no occasion tagged — allow
        return i.occasions.split(',').some(o => o.trim() === requiredDressType);
      });
    };

    let tops = filterByOccasion(items.filter(i => topTypes.includes(i.type)));
    // Avoid recent tops
    const availTops = tops.filter(i => !history.top.includes(i.id));
    const topPool = availTops.length > 0 ? availTops : tops;
    const newTop = pickRandom(topPool);

    // Bottom: match by color if combo available
    const isFullDressTop = newTop && (newTop.type === 'saree' || newTop.type === 'frock');
    let newBottom: ClothingItem | null = null;
    if (!isFullDressTop) {
      let bottoms = filterByOccasion(items.filter(i => i.type === 'bottom'));
      const topColorName = newTop?.colorName || '';
      const compatColors = COLOR_COMBINATIONS[topColorName] || [];
      if (compatColors.length > 0) {
        const colorMatched = bottoms.filter(b => compatColors.includes(b.colorName));
        if (colorMatched.length > 0) bottoms = colorMatched;
      }
      const availBottoms = bottoms.filter(i => !history.bottom.includes(i.id));
      const bottomPool = availBottoms.length > 0 ? availBottoms : bottoms;
      newBottom = pickRandom(bottomPool);
    }

    let footwears = filterByOccasion(items.filter(i => i.type === 'footwear'));
    const availFootwears = footwears.filter(i => !history.footwear.includes(i.id));
    const footwearPool = availFootwears.length > 0 ? availFootwears : footwears;
    const newFootwear = pickRandom(footwearPool);

    setHistory(prev => ({
      top: [newTop?.id, ...prev.top].filter(Boolean).slice(0, 2) as string[],
      bottom: [newBottom?.id, ...prev.bottom].filter(Boolean).slice(0, 2) as string[],
      footwear: [newFootwear?.id, ...prev.footwear].filter(Boolean).slice(0, 2) as string[],
    }));

    setTimeout(() => {
      setCurrentOutfit({ top: newTop, bottom: newBottom, footwear: newFootwear });
      setIsSpinning(false);
    }, 1500);
  };

  const saveToDay = async (dateStr: string) => {
    if (!currentOutfit.top && !currentOutfit.bottom && !currentOutfit.footwear) {
      alert('Please generate an outfit first!');
      return;
    }
    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, outfit: currentOutfit }),
      });
      if (res.ok) {
        setDayEntries(prev => prev.map(de => de.dateStr === dateStr ? { ...de, outfit: currentOutfit } : de));
        setSavedDayDate(dateStr);
        setTimeout(() => setSavedDayDate(null), 2000);
      }
    } catch (e) { console.error(e); }
  };

  const clearDay = async (dateStr: string) => {
    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, outfit: null }),
      });
      if (res.ok) {
        setDayEntries(prev => prev.map(de => de.dateStr === dateStr ? { ...de, outfit: null } : de));
      }
    } catch (e) { console.error(e); }
  };

  const accessories = items.filter(i => i.type === 'accessories');
  const accessoryReminder = buildAccessoryReminder(accessories);

  // Slot types to display
  const outfitSlots = isFullDress
    ? (['top', 'footwear'] as const)
    : (['top', 'bottom', 'footwear'] as const);

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
            <div className={`grid gap-6 max-w-4xl mx-auto mb-8 ${outfitSlots.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {outfitSlots.map((slot) => (
                <div key={slot} className="space-y-3">
                  <h3 className="text-center capitalize opacity-80">{slot}</h3>
                  <motion.div
                    animate={isSpinning ? { y: [-10, 10, -10] } : {}}
                    transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.3 }}
                    className="aspect-square rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <AnimatePresence mode="wait">
                      {currentOutfit[slot as keyof Outfit] ? (
                        <motion.img
                          key={currentOutfit[slot as keyof Outfit]?.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          src={currentOutfit[slot as keyof Outfit]?.image}
                          alt={slot}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">?</div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => generateOutfit()}
                disabled={isSpinning}
                className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
                <span className="text-lg">{isSpinning ? 'Generating...' : 'Randomize Outfit'}</span>
              </button>
            </div>

            {/* Accessories reminder */}
            {accessoryReminder && (currentOutfit.top || currentOutfit.footwear) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center px-6 py-3 rounded-xl bg-white/10 border border-white/20 max-w-2xl mx-auto text-sm opacity-90"
              >
                👜 {accessoryReminder}
              </motion.div>
            )}
          </div>

          {/* 7-Day Strip */}
          <div>
            <h2 className="text-2xl mb-6 text-center">Save to Day</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {dayEntries.map((de) => {
                const isToday = !de.isPast && de.dateStr === formatDateStr(new Date());
                return (
                  <div
                    key={de.dateStr}
                    className={`p-3 rounded-xl border transition-all ${de.isPast
                      ? 'bg-white/5 border-white/10 opacity-40'
                      : savedDayDate === de.dateStr
                        ? 'bg-white/10 border-green-500 ring-2 ring-green-500'
                        : isToday
                          ? 'bg-purple-500/20 border-purple-400/40'
                          : 'bg-white/10 border-white/20'
                      }`}
                  >
                    {/* Day label + date */}
                    <div className="text-center mb-2">
                      <div className={`text-xs font-semibold ${isToday ? 'text-purple-300' : 'opacity-70'}`}>
                        {de.label.split(' · ')[0]}
                      </div>
                      <div className="text-xs opacity-60">{de.label.split(' · ')[1]}</div>
                      {de.eventTitle && (
                        <div className="mt-1 text-xs px-1 py-0.5 rounded bg-gradient-to-r from-purple-500/40 to-pink-500/40 truncate">
                          {de.eventTitle}
                          {de.eventDressType && <span className="opacity-70"> · {de.eventDressType}</span>}
                        </div>
                      )}
                    </div>

                    {/* Outfit thumbnail or placeholder */}
                    {de.outfit ? (
                      <div className="space-y-1 mb-2">
                        {de.outfit.top && (
                          <div className="aspect-square rounded overflow-hidden bg-white/5">
                            <img src={de.outfit.top.image} alt="Top" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {de.outfit.bottom && (
                          <div className="aspect-square rounded overflow-hidden bg-white/5">
                            <img src={de.outfit.bottom.image} alt="Bottom" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {de.outfit.footwear && (
                          <div className="aspect-square rounded overflow-hidden bg-white/5">
                            <img src={de.outfit.footwear.image} alt="Footwear" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[3/4] rounded border-2 border-dashed border-white/15 flex items-center justify-center mb-2">
                        <p className="text-xs opacity-30 text-center px-1">No outfit</p>
                      </div>
                    )}

                    {/* Action buttons – disabled for past days */}
                    {!de.isPast && (
                      <div className="flex gap-1 justify-center">
                        {de.outfit ? (
                          <button
                            onClick={() => clearDay(de.dateStr)}
                            className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 hover:text-red-400 transition-all"
                            title="Clear outfit"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => saveToDay(de.dateStr)}
                            className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 hover:text-green-400 transition-all"
                            title="Save outfit to this day"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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