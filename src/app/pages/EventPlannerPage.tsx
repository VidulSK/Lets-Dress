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

      <div className="flex-1 px-4 sm:px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 mb-6">
              <Calendar className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Event Planner</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Schedule your outfits for special occasions</p>
          </div>

          {/* Calendar Header */}
          <div className="glass-card flex items-center justify-between mb-4 p-4 sm:p-5">
            <button onClick={handlePrevMonth} className="p-2 rounded-full bg-muted hover:bg-accent transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg sm:text-2xl font-bold">{monthName}</h2>
            <button onClick={handleNextMonth} className="p-2 rounded-full bg-muted hover:bg-accent transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="glass-card overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-muted-foreground">{day}</div>
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
                    whileHover={day && !isPast ? { scale: 0.97 } : {}}
                    className={`min-h-16 sm:min-h-24 p-1.5 sm:p-2 border-r border-b border-border transition-all ${
                      !day ? 'bg-muted/30' : ''
                    } ${isToday ? 'bg-violet-100/60 dark:bg-violet-500/15' : ''} ${
                      isPast ? 'opacity-30 cursor-not-allowed' : day ? 'cursor-pointer hover:bg-muted/60' : ''
                    }`}
                    onClick={() => day && !isPast && handleDateClick(dateStr)}
                  >
                    {day && (
                      <>
                        <div className={`text-xs sm:text-sm mb-1 font-medium ${
                          isToday ? 'font-bold text-violet-600 dark:text-violet-400' : isPast ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map((event, i) => (
                            <div key={i} className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-500/40 to-pink-500/40 truncate font-medium">
                              {event.title}
                              {event.dressType && <span className="ml-1 opacity-70 hidden sm:inline">· {event.dressType}</span>}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] sm:text-xs opacity-60 px-1.5">+{dayEvents.length - 2} more</div>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md"
          onClick={() => setShowEventModal(false)}
        >
          <motion.div
            initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-card p-6 sm:p-7"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button onClick={() => setShowEventModal(false)} className="p-2 rounded-full bg-muted hover:bg-accent transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Events */}
            {getEventsForDate(selectedDate).length > 0 && (
              <div className="mb-6 space-y-2 max-h-48 overflow-y-auto">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                    <div>
                      <span className="font-medium text-sm">{event.title}</span>
                      {event.dressType && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300">
                          {event.dressType}
                        </span>
                      )}
                    </div>
                    <button onClick={() => handleDeleteEvent(event.date, event.title)} className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Event */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-muted-foreground">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEvent()}
                  placeholder="Enter event name..."
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-muted-foreground">Required Dress Type</label>
                <select
                  value={eventDressType}
                  onChange={(e) => setEventDressType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-sm appearance-none"
                >
                  <option value="">Select dress type</option>
                  {DRESS_TYPES.map(dt => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSaveEvent}
                disabled={!eventTitle.trim()}
                className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
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
