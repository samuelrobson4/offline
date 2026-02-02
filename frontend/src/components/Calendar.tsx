import { useState, useEffect } from 'react';
import { format, getDaysInMonth, startOfMonth, addMonths, subMonths } from 'date-fns';
import { useEvents } from '../hooks/useEvents';

interface CalendarProps {
  onSelectEvent?: (eventId: string) => void;
}

export default function Calendar({ onSelectEvent }: CalendarProps): JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { events, fetchEvents, loading } = useEvents();

  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    fetchEvents({ startDate: start, endDate: end });
  }, [currentMonth, fetchEvents]);

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = startOfMonth(currentMonth).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dayStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
      0,
      0,
      0,
    );
    const dayEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
      23,
      59,
      59,
    );

    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return eventDate >= dayStart && eventDate <= dayEnd;
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
          ← Previous
        </button>
        <h2 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
          Next →
        </button>
      </div>

      {loading && <p className="text-center text-gray-500">Loading events...</p>}

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-4 text-center font-medium text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty days from previous month */}
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="p-4 bg-gray-50 min-h-24" />
          ))}

          {/* Days of the month */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday =
              day === new Date().getDate() &&
              currentMonth.getMonth() === new Date().getMonth() &&
              currentMonth.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`p-3 min-h-24 border-r border-b border-gray-200 ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`font-medium mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onSelectEvent?.(event.id)}
                      className="block text-xs p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 truncate w-full text-left"
                      title={event.title}
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-xs text-gray-500">+{dayEvents.length - 2} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
