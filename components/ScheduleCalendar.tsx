'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
    class: 'bg-blue-500 hover:bg-blue-600',
    study: 'bg-green-500 hover:bg-green-600',
    work: 'bg-purple-500 hover:bg-purple-600',
    club: 'bg-orange-500 hover:bg-orange-600',
    fitness: 'bg-red-500 hover:bg-red-600',
    admin: 'bg-gray-400 hover:bg-gray-500',
    sleep: 'bg-indigo-300 hover:bg-indigo-400',
    exam: 'bg-yellow-500 hover:bg-yellow-600',
    project: 'bg-pink-500 hover:bg-pink-600',
  };
  return colors[type] || 'bg-gray-500 hover:bg-gray-600';
}

function getTypeBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    class: 'default',
    study: 'secondary',
    work: 'default',
    club: 'outline',
    fitness: 'destructive',
    admin: 'secondary',
    sleep: 'outline',
    exam: 'default',
    project: 'default',
  };
  return variants[type] || 'outline';
}

export default function ScheduleCalendar({ data }: ScheduleCalendarProps) {
  if (!data.weekly_schedule || data.weekly_schedule.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">No schedule data available.</p>
        </CardContent>
      </Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Workload Breakdown</CardTitle>
            <CardDescription>Weekly time allocation per course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.workload_breakdown.map((course, idx) => (
                <div key={idx} className="border-l-4 border-primary pl-4 py-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{course.course_id}</span>
                      <Badge variant="outline">{course.credits} credits</Badge>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {course.total_target_hours_per_week.toFixed(1)} hrs/week
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Base: {course.base_hours_per_week.toFixed(1)} hrs
                    {course.adjustments && course.adjustments.length > 0 && (
                      <span className="ml-2">
                        • {course.adjustments.map(a => `${a.reason}: +${a.delta_hours}hrs`).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Your complete weekly calendar view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-8 gap-2 mb-2">
                <div className="font-medium text-sm text-muted-foreground sticky left-0 bg-background z-10">
                  Time
                </div>
                {DAYS.map((day, idx) => (
                  <div key={day} className="font-medium text-sm text-center">
                    {DAY_NAMES[idx]}
                  </div>
                ))}
              </div>

              {HOURS.map(hour => {
                const hourStart = hour;
                const hourEnd = hour + 1;
                
                return (
                  <div key={hour} className="grid grid-cols-8 gap-2 border-t border-border">
                    <div className="text-xs text-muted-foreground py-1 sticky left-0 bg-background z-10 text-right pr-2">
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
                                className={`absolute left-0 right-0 rounded-md px-2 py-1 text-xs text-white ${getTypeColor(item.type)} shadow-sm cursor-help`}
                                style={{
                                  top: `${Math.max(0, topPercent)}%`,
                                  height: `${Math.min(100, heightPercent)}%`,
                                  zIndex: item.priority,
                                }}
                                title={`${item.title}\n${formatTime(item.start)} - ${formatTime(item.end)}${item.location ? `\nLocation: ${item.location}` : ''}\nType: ${item.type}`}
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
        </CardContent>
      </Card>

      {/* Notes and Additional Info */}
      {(data.notes_for_user && data.notes_for_user.length > 0) ||
       (data.assumptions && data.assumptions.length > 0) ||
       (data.tradeoffs && data.tradeoffs.length > 0) ||
       (data.conflicts && data.conflicts.length > 0) ? (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.notes_for_user && data.notes_for_user.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Notes</h3>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                  {data.notes_for_user.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.assumptions && data.assumptions.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Assumptions</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                    {data.assumptions.map((assumption, idx) => (
                      <li key={idx}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {data.tradeoffs && data.tradeoffs.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <h3 className="font-semibold">Tradeoffs</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                    {data.tradeoffs.map((tradeoff, idx) => (
                      <li key={idx}>{tradeoff}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {data.conflicts && data.conflicts.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <h3 className="font-semibold text-destructive">Conflicts</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                    {data.conflicts.map((conflict, idx) => (
                      <li key={idx}>
                        <strong className="text-foreground">{conflict.item}</strong>: {conflict.resolved_by} - {conflict.details}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
