import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, FolderKanban, CheckSquare } from 'lucide-react';
import client from '../api/client';
import toast from 'react-hot-toast';

const priorityColor = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
};

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await client.get('/calendar/events');
                setEvents(response.data.events || []);
            } catch (error) {
                toast.error('Failed to load calendar events');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const eventsByDate = useMemo(() => {
        const map = {};
        events.forEach(ev => {
            if (!ev.start) return;
            const dateKey = ev.start.split('T')[0].split(' ')[0]; // handle both date and datetime formats
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(ev);
        });
        return map;
    }, [events]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const goToPrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDay(null);
    };
    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDay(null);
    };

    const formatDateKey = (day) => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    const todayKey = new Date().toISOString().split('T')[0];

    const calendarCells = [];
    for (let i = 0; i < startWeekday; i++) {
        calendarCells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarCells.push(day);
    }

    const selectedEvents = selectedDay ? (eventsByDate[formatDateKey(selectedDay)] || []) : [];

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <CalendarDays className="w-6 h-6 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Calendar</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">{monthLabel}</h3>
                        <div className="flex space-x-1">
                            <button onClick={goToPrevMonth} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={goToNextMonth} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarCells.map((day, idx) => {
                            if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;
                            const dateKey = formatDateKey(day);
                            const dayEvents = eventsByDate[dateKey] || [];
                            const isToday = dateKey === todayKey;
                            const isSelected = selectedDay === day;

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`aspect-square p-1 rounded-lg border flex flex-col items-center justify-start pt-2 transition-colors
                                        ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:bg-slate-50'}
                                        ${isToday ? 'ring-2 ring-indigo-300' : ''}
                                    `}
                                >
                                    <span className={`text-sm ${isToday ? 'font-bold text-indigo-600' : 'text-slate-700'}`}>{day}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="flex space-x-0.5 mt-1">
                                            {dayEvents.slice(0, 3).map((ev, i) => (
                                                <span key={i} className={`w-1.5 h-1.5 rounded-full ${priorityColor[ev.priority] || 'bg-indigo-400'}`}></span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Day Details */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        {selectedDay ? `${monthLabel.split(' ')[0]} ${selectedDay}` : 'Select a day'}
                    </h3>

                    {!selectedDay && (
                        <p className="text-sm text-slate-400">Click a date to see what's due.</p>
                    )}

                    {selectedDay && selectedEvents.length === 0 && (
                        <p className="text-sm text-slate-400">Nothing scheduled on this day.</p>
                    )}

                    <div className="space-y-3">
                        {selectedEvents.map((ev) => (
                            <div key={ev.id} className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100">
                                <div className={`p-2 rounded-lg ${ev.type === 'project' ? 'bg-indigo-50' : 'bg-emerald-50'}`}>
                                    {ev.type === 'project' ? (
                                        <FolderKanban className="w-4 h-4 text-indigo-600" />
                                    ) : (
                                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{ev.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{ev.type} • {ev.status?.replace('_', ' ')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;