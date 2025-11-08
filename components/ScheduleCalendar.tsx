'use client';

interface ScheduleItem {
  title: string;
  type: string;
  course_id: string | null;
  days: string[];
  start: string;
  end: string;
  location: string | null;
  recurrence: string;
  priority: number;
  source: string;
}

interface ScheduleData {
  workload_breakdown?: Array<{
    course_id: string;
    credits: number;
    base_hours_per_week: number;
    adjustments?: Array<{ reason: string; delta_hours: number }>;
    total_target_hours_per_week: number;
  }>;
  weekly_schedule?: ScheduleItem[];
  buffers?: Array<{ before_title?: string; after_title?: string; minutes: number }>;
  conflicts?: Array<{ item: string; resolved_by: string; details: string }>;
  tradeoffs?: string[];
  assumptions?: string[];
  notes_for_user?: string[];
}

interface ScheduleCalendarProps {
  data: ScheduleData;
}

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    class: 'bg-blue-500',
    study: 'bg-green-500',
    work: 'bg-purple-500',
    club: 'bg-orange-500',
    fitness: 'bg-red-500',
    admin: 'bg-gray-400',
    sleep: 'bg-indigo-300',
    exam: 'bg-yellow-500',
    project: 'bg-pink-500',
  };
  return colors[type] || 'bg-gray-500';
}

export default function ScheduleCalendar({ data }: ScheduleCalendarProps) {
  if (!data.weekly_schedule || data.weekly_schedule.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">No schedule data available.</p>
      </div>
    );
  }

  // Group items by day
  const scheduleByDay: Record<string, ScheduleItem[]> = {};
  DAYS.forEach(day => {
    scheduleByDay[day] = data.weekly_schedule!.filter(item => item.days.includes(day));
  });

  return (
    <div className="space-y-6">
      {/* Workload Breakdown */}
      {data.workload_breakdown && data.workload_breakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Workload Breakdown</h3>
          <div className="space-y-3">
            {data.workload_breakdown.map((course, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 dark:text-white">{course.course_id}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {course.total_target_hours_per_week} hrs/week
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {course.credits} credits • Base: {course.base_hours_per_week} hrs
                  {course.adjustments && course.adjustments.length > 0 && (
                    <span className="ml-2">
                      ({course.adjustments.map(a => `${a.reason}: +${a.delta_hours}hrs`).join(', ')})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg overflow-x-auto">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Weekly Schedule</h3>
        <div className="min-w-full">
          <div className="grid grid-cols-8 gap-2">
            {/* Time column header */}
            <div className="font-medium text-gray-700 dark:text-gray-300 text-sm sticky left-0 bg-white dark:bg-gray-800 z-10">
              Time
            </div>
            {DAYS.map((day, idx) => (
              <div key={day} className="font-medium text-gray-700 dark:text-gray-300 text-sm text-center">
                {DAY_NAMES[idx]}
              </div>
            ))}
          </div>

          {/* Time slots */}
          {HOURS.map(hour => {
            const hourStart = hour;
            const hourEnd = hour + 1;
            
            return (
              <div key={hour} className="grid grid-cols-8 gap-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 py-1 sticky left-0 bg-white dark:bg-gray-800 z-10">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                {DAYS.map(day => {
                  const itemsInSlot = scheduleByDay[day]?.filter(item => {
                    const start = parseTime(item.start);
                    const end = parseTime(item.end);
                    return (start < hourEnd && end > hourStart);
                  }) || [];

                  return (
                    <div key={day} className="min-h-[60px] py-1 relative">
                      {itemsInSlot.map((item, idx) => {
                        const start = parseTime(item.start);
                        const end = parseTime(item.end);
                        const topPercent = ((start - hourStart) / (hourEnd - hourStart)) * 100;
                        const heightPercent = ((end - start) / (hourEnd - hourStart)) * 100;
                        
                        return (
                          <div
                            key={idx}
                            className={`absolute left-0 right-0 rounded px-2 py-1 text-xs text-white ${getTypeColor(item.type)}`}
                            style={{
                              top: `${Math.max(0, topPercent)}%`,
                              height: `${Math.min(100, heightPercent)}%`,
                              zIndex: item.priority,
                            }}
                            title={`${item.title} (${formatTime(item.start)} - ${formatTime(item.end)})${item.location ? ` @ ${item.location}` : ''}`}
                          >
                            <div className="font-medium truncate">{item.title}</div>
                            <div className="text-xs opacity-90">
                              {formatTime(item.start)} - {formatTime(item.end)}
                            </div>
                            {item.location && (
                              <div className="text-xs opacity-75 truncate">{item.location}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes and Additional Info */}
      {(data.notes_for_user && data.notes_for_user.length > 0) ||
       (data.assumptions && data.assumptions.length > 0) ||
       (data.tradeoffs && data.tradeoffs.length > 0) ||
       (data.conflicts && data.conflicts.length > 0) ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          {data.notes_for_user && data.notes_for_user.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Notes</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {data.notes_for_user.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
          {data.assumptions && data.assumptions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Assumptions</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {data.assumptions.map((assumption, idx) => (
                  <li key={idx}>{assumption}</li>
                ))}
              </ul>
            </div>
          )}
          {data.tradeoffs && data.tradeoffs.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Tradeoffs</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {data.tradeoffs.map((tradeoff, idx) => (
                  <li key={idx}>{tradeoff}</li>
                ))}
              </ul>
            </div>
          )}
          {data.conflicts && data.conflicts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Conflicts</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {data.conflicts.map((conflict, idx) => (
                  <li key={idx}>
                    <strong>{conflict.item}</strong>: {conflict.resolved_by} - {conflict.details}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

