import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { AppNavbar } from '../components/AppNavbar';
import { Footer } from '../components/Footer';

interface Event {
  date: string;
  title: string;
  dressType: string;
}

const DRESS_TYPES = ['Casual', 'Smart Casual', 'Office wear', 'Semi-Formal (Party wear)', 'Sports wear'];

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function EventPlannerPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDressType, setEventDressType] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);

  const todayStr = formatDateStr(new Date());

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setEvents(data); })
      .catch(console.error);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const formatDate = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);

  const handlePrevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const handleDateClick = (dateStr: string) => {
    if (dateStr < todayStr) return; // don't open for past dates
    setSelectedDate(dateStr);
    setShowEventModal(true);
    setEventTitle('');
    setEventDressType('');
  };

  const handleSaveEvent = async () => {
    if (selectedDate && eventTitle.trim()) {
      try {
        const title = eventTitle.trim();
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: selectedDate, title, dressType: eventDressType }),
        });
        if (res.ok) {
          setEvents(prev => [...prev, { date: selectedDate, title, dressType: eventDressType }]);
          setShowEventModal(false);
          setEventTitle('');
          setEventDressType('');
        }
      } catch (e) { console.error('Failed to save event:', e); }
    }
  };

  const handleDeleteEvent = async (date: string, title: string) => {
    try {
      const res = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, title }),
      });
      if (res.ok) setEvents(prev => prev.filter(e => !(e.date === date && e.title === title)));
    } catch (e) { console.error('Failed to delete event:', e); }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />

      <div className="flex-1 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl mb-2">Event Planner</h1>
            <p className="opacity-80">Schedule your outfits for special occasions</p>
          </div>

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white/20 transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl">{monthName}</h2>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white/20 transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-white/10">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold opacity-80">{day}</div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dateStr = day ? formatDate(year, month, day) : '';
                const dayEvents = day ? getEventsForDate(dateStr) : [];
                const isToday = day && dateStr === todayStr;
                const isPast = day && dateStr < todayStr;

                return (
                  <motion.div
                    key={index}
                    whileHover={day && !isPast ? { scale: 0.98 } : {}}
                    className={`min-h-24 p-2 border-r border-b border-white/10 transition-all ${
                      !day ? 'bg-white/5' : ''
                    } ${isToday ? 'bg-purple-500/20' : ''} ${
                      isPast ? 'opacity-30 cursor-not-allowed' : day ? 'cursor-pointer hover:bg-white/10' : ''
                    }`}
                    onClick={() => day && !isPast && handleDateClick(dateStr)}
                  >
                    {day && (
                      <>
                        <div className={`text-sm mb-1 ${isToday ? 'font-bold text-purple-300' : isPast ? 'text-gray-500' : ''}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event, i) => (
                            <div key={i} className="text-xs px-2 py-1 rounded bg-gradient-to-r from-purple-500/40 to-pink-500/40 truncate">
                              {event.title}
                              {event.dressType && <span className="ml-1 opacity-70">· {event.dressType}</span>}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs opacity-60 px-2">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedDate && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowEventModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button onClick={() => setShowEventModal(false)} className="p-2 rounded-full hover:bg-white/20 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Events */}
            {getEventsForDate(selectedDate).length > 0 && (
              <div className="mb-6 space-y-2 max-h-48 overflow-y-auto">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-white/10">
                    <div>
                      <span>{event.title}</span>
                      {event.dressType && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-500/30 opacity-80">
                          {event.dressType}
                        </span>
                      )}
                    </div>
                    <button onClick={() => handleDeleteEvent(event.date, event.title)} className="p-1 rounded hover:bg-red-500/20 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Event */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm opacity-80">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEvent()}
                  placeholder="Enter event name..."
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block mb-2 text-sm opacity-80">Required Dress Type</label>
                <select
                  value={eventDressType}
                  onChange={(e) => setEventDressType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none"
                >
                  <option value="" className="bg-[#2a1a3e] text-gray-400">Select dress type</option>
                  {DRESS_TYPES.map(dt => (
                    <option key={dt} value={dt} className="bg-[#2a1a3e] text-white">{dt}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSaveEvent}
                disabled={!eventTitle.trim()}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Event
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
}
