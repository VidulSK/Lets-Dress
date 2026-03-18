import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shuffle, Trash2, Check } from 'lucide-react';
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
const IRREGULAR_PLURALS: Record<string, string> = {
  watch: 'watches',
  sunglass: 'sunglasses',
  sunglasses: 'sunglasses',
  chain: 'chains',
};

function pluralise(word: string, count: number): string {
  if (count === 1) return word;
  const lower = word.toLowerCase();
  if (IRREGULAR_PLURALS[lower]) return IRREGULAR_PLURALS[lower];
  if (lower.endsWith('s') || lower.endsWith('sh') || lower.endsWith('ch') || lower.endsWith('x') || lower.endsWith('z'))
    return lower + 'es';
  return lower + 's';
}

function buildAccessoryReminder(accessories: ClothingItem[]): string | null {
  if (!accessories.length) return null;
  const counts: Record<string, number> = {};
  accessories.forEach(a => {
    const t = a.accessoryType || 'accessory';
    counts[t] = (counts[t] || 0) + 1;
  });
  const parts = Object.entries(counts).map(([type, count]) =>
    `${count} ${pluralise(type, count)}`
  );
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
  const [tickedDays, setTickedDays] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<{ top: string[]; bottom: string[]; footwear: string[] }>({ top: [], bottom: [], footwear: [] });
  const [showReminder, setShowReminder] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const userGender = user?.gender || 'male';
  const isFemale = userGender === 'female';

  // Determine if the current outfit has a saree or frock top (female only)
  const isFullDress = isFemale && (currentOutfit.top?.type === 'saree' || currentOutfit.top?.type === 'frock');

  // Single load: fetch everything in parallel then build the 7-day strip once
  // This avoids the race condition where build7Days() would reset saved outfits
  useEffect(() => {
    const base = build7Days();

    Promise.all([
      fetch('/api/wardrobe').then(r => r.json()).catch(() => []),
      fetch('/api/events').then(r => r.json()).catch(() => []),
      fetch('/api/outfits').then(r => r.json()).catch(() => []),
    ]).then(([wardrobeData, eventsData, outfitsData]) => {
      if (Array.isArray(wardrobeData)) setItems(wardrobeData);

      const evList: { date: string; title: string; dressType: string }[] = Array.isArray(eventsData) ? eventsData : [];
      setEvents(evList);

      const outfitMap: Record<string, Outfit> = {};
      if (Array.isArray(outfitsData)) {
        outfitsData.forEach((d: any) => { outfitMap[d.date] = d.outfit; });
      }

      setDayEntries(base.map(d => {
        const ev = evList.find(e => e.date === d.dateStr);
        return {
          ...d,
          outfit: outfitMap[d.dateStr] ?? null,
          eventTitle: ev?.title,
          eventDressType: ev?.dressType,
        };
      }));

      // --- Restore Ticked Day and Outfit ---
      if (user?.id) {
        let defaultTicked = '';
        const savedTicked = localStorage.getItem(`tickedDay_${user.id}`);
        // Ensure the saved day is within our current 7-day strip and not past
        if (savedTicked && base.some(d => d.dateStr === savedTicked && !d.isPast)) {
          defaultTicked = savedTicked;
        } else {
          // Default to today if valid
          const today = formatDateStr(new Date());
          const todayEntry = base.find(d => d.dateStr === today);
          if (todayEntry && !todayEntry.isPast) defaultTicked = today;
        }

        if (defaultTicked) {
          setTickedDays(new Set([defaultTicked]));
          if (outfitMap[defaultTicked]) {
            setCurrentOutfit(outfitMap[defaultTicked]);
          } else {
            setCurrentOutfit({ top: null, bottom: null, footwear: null });
          }
        }
      }
    });
  }, [user]);

  // Save the currently ticked day to localStorage whenever it changes
  useEffect(() => {
    if (user?.id) {
      if (tickedDays.size > 0) {
        const arr = Array.from(tickedDays);
        localStorage.setItem(`tickedDay_${user.id}`, arr[0]);
      } else {
        localStorage.removeItem(`tickedDay_${user.id}`);
      }
    }
  }, [tickedDays, user?.id]);

  const generateOutfit = () => {
    if (tickedDays.size === 0) {
      alert('Please tick a day in the Weekly Planner before generating an outfit!');
      return;
    }
    if (items.length === 0) {
      alert('Please add some items to your wardrobe first!');
      return;
    }

    // Snapshot the ticked days NOW before any async work
    const targetDates = [...tickedDays];

    setIsSpinning(true);
    setShowReminder(false);

    // Use the first ticked day's event (if any) to guide outfit generation
    const firstTickedDate = targetDates[0];
    const eventForDay = events.find(e => e.date === firstTickedDate) || null;
    const requiredDressType = eventForDay?.dressType || null;

    // Female: include sarees & frocks as "tops"
    const topTypes = isFemale ? ['top', 'saree', 'frock'] : ['top'];

    // Filter by occasion if event has a dress type
    const filterByOccasion = (itms: ClothingItem[]) => {
      if (!requiredDressType) return itms;
      return itms.filter(i => {
        if (!i.occasions) return true;
        return i.occasions.split(',').some(o => o.trim() === requiredDressType);
      });
    };

    let tops = filterByOccasion(items.filter(i => topTypes.includes(i.type)));
    const availTops = tops.filter(i => !history.top.includes(i.id));
    const topPool = availTops.length > 0 ? availTops : tops;
    const newTop = pickRandom(topPool);

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

    const newOutfit: Outfit = { top: newTop, bottom: newBottom, footwear: newFootwear };

    // Run animation, then update boxes immediately (optimistic) and save to server
    setTimeout(() => {
      setCurrentOutfit(newOutfit);
      setIsSpinning(false);
      setShowReminder(true);
      setHasGenerated(true);

      // Optimistic update — show previews in boxes right away, don't wait for server
      setDayEntries(prev =>
        prev.map(de =>
          targetDates.includes(de.dateStr) ? { ...de, outfit: newOutfit } : de
        )
      );

      // Persist to server in the background
      targetDates.forEach(dateStr => {
        fetch('/api/outfits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateStr, outfit: newOutfit }),
        }).catch(console.error);
      });
    }, 1500);
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
        if (tickedDays.has(dateStr)) {
          setCurrentOutfit({ top: null, bottom: null, footwear: null });
        }
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

            <div className="flex flex-col items-center gap-3">
              {tickedDays.size === 0 && (
                <p className="text-sm opacity-50">Tick a day below to enable the randomizer</p>
              )}
              <button
                onClick={() => generateOutfit()}
                disabled={isSpinning || tickedDays.size === 0}
                className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
                <span className="text-lg">{isSpinning ? 'Generating...' : 'Randomize Outfit'}</span>
              </button>
            </div>

            {/* Accessories reminder */}
            {accessoryReminder && showReminder && (
              <motion.div
                key="reminder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 text-center px-6 py-3 rounded-xl bg-white/10 border border-white/20 max-w-2xl mx-auto text-sm opacity-90"
              >
                👜 {accessoryReminder}
              </motion.div>
            )}
          </div>

          {/* 7-Day Strip */}
          <div>
            <h2 className="text-2xl mb-6 text-center">Weekly Planner</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {dayEntries.map((de) => {
                const isToday = !de.isPast && de.dateStr === formatDateStr(new Date());
                const isTicked = tickedDays.has(de.dateStr);

                // Radio-button tick: selecting a day deselects any other ticked day
                const handleTick = () => {
                  if (de.isPast) return;
                  if (tickedDays.has(de.dateStr)) {
                    setTickedDays(new Set());
                    setCurrentOutfit({ top: null, bottom: null, footwear: null });
                  } else {
                    setTickedDays(new Set([de.dateStr]));
                    setCurrentOutfit(de.outfit || { top: null, bottom: null, footwear: null });
                  }
                };

                return (
                  <div
                    key={de.dateStr}
                    className={`relative p-3 rounded-xl border transition-all ${
                      de.isPast
                        ? 'bg-white/5 border-white/10 opacity-40'
                        : isTicked
                          ? 'bg-green-500/10 border-green-500/60 ring-1 ring-green-500/40'
                          : isToday
                            ? 'bg-purple-500/20 border-purple-400/40'
                            : 'bg-white/10 border-white/20'
                    }`}
                  >
                    {/* Green tick checkbox – top right */}
                    {!de.isPast && (
                      <button
                        onClick={handleTick}
                        title={isTicked ? 'Untick day' : 'Tick to auto-save outfit'}
                        className={`absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center border transition-all ${
                          isTicked
                            ? 'bg-green-500 border-green-400'
                            : 'bg-white/10 border-white/30 hover:border-green-400'
                        }`}
                      >
                        {isTicked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </button>
                    )}

                    {/* Day label + date */}
                    <div className="text-center mb-2 pr-4">
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

                    {/* Clear button – only shown when outfit is saved */}
                    {!de.isPast && de.outfit && (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => clearDay(de.dateStr)}
                          className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 hover:text-red-400 transition-all"
                          title="Clear outfit"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
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