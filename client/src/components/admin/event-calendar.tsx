import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit
} from "lucide-react";

interface Event {
  id: number;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: string;
  customerId: number;
  eventTypeId: number;
  guestCount: number;
  estimatedCost: number;
  notes?: string;
}

interface CalendarEvent extends Event {
  customerName?: string;
  eventTypeName?: string;
}

export default function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"week" | "month">("month");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/events");
      const data = await response.json();
      return data.events || [];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'quote_requested': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getCurrentWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    // Start week on Monday (1) instead of Sunday (0)
    const dayOfWeek = currentDate.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days; otherwise go back (dayOfWeek - 1)
    startOfWeek.setDate(currentDate.getDate() - daysFromMonday);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getCurrentMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) { // 6 weeks x 7 days
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event: Event) => {
      if (!event.eventDate) return false;
      const eventDate = new Date(event.eventDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (calendarView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const formatDateHeader = () => {
    if (calendarView === 'week') {
      const weekDays = getCurrentWeekDays();
      const start = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Event Calendar</h3>
          <Tabs value={calendarView} onValueChange={(value) => setCalendarView(value as "week" | "month")}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="min-w-[200px] text-center font-medium">{formatDateHeader()}</span>
          <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {calendarView === 'week' ? (
            <WeekView 
              days={getCurrentWeekDays()} 
              getEventsForDate={getEventsForDate}
              getStatusColor={getStatusColor}
            />
          ) : (
            <MonthView 
              days={getCurrentMonthDays()} 
              currentMonth={currentDate.getMonth()}
              getEventsForDate={getEventsForDate}
              getStatusColor={getStatusColor}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WeekView({ days, getEventsForDate, getStatusColor }: {
  days: Date[];
  getEventsForDate: (date: Date) => Event[];
  getStatusColor: (status: string) => string;
}) {
  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="grid grid-cols-7 gap-4">
      {/* Updated header to start with Monday */}
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
        <div key={dayName} className="font-medium text-center text-gray-500 pb-3">
          {dayName}
        </div>
      ))}
      
      {days.map((day, index) => {
        const dayEvents = getEventsForDate(day);
        const isToday = day.toDateString() === new Date().toDateString();
        
        return (
          <div key={index} className="min-h-[400px] border rounded-lg p-3 bg-gray-50">
            <div className={`text-center font-semibold mb-3 text-lg ${isToday ? 'text-blue-600 bg-blue-50 rounded-md py-1' : ''}`}>
              {day.getDate()}
            </div>
            <div className="space-y-2">
              {dayEvents.map((event: Event) => (
                <div
                  key={event.id}
                  className={`text-xs p-2 rounded-md border-l-4 bg-white shadow-sm ${getStatusColor(event.status)} hover:shadow-md transition-shadow cursor-pointer`}
                  title={`Event #${event.id} - ${event.guestCount} guests`}
                >
                  <div className="font-medium text-gray-900">
                    Event #{event.id}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </div>
                  <div className="text-gray-500 mt-1 flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                    {event.guestCount} guests
                  </div>
                  {event.customerName && (
                    <div className="text-gray-600 mt-1 truncate">
                      {event.customerName}
                    </div>
                  )}
                  <div className="mt-1">
                    <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {dayEvents.length === 0 && (
                <div className="text-gray-400 text-center py-8 text-sm">
                  No events
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthView({ days, currentMonth, getEventsForDate, getStatusColor }: {
  days: Date[];
  currentMonth: number;
  getEventsForDate: (date: Date) => Event[];
  getStatusColor: (status: string) => string;
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Updated header to start with Monday */}
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
        <div key={dayName} className="font-medium text-center text-gray-500 p-2">
          {dayName}
        </div>
      ))}
      
      {days.map((day, index) => {
        const dayEvents = getEventsForDate(day);
        const isCurrentMonth = day.getMonth() === currentMonth;
        const isToday = day.toDateString() === new Date().toDateString();
        
        return (
          <div 
            key={index} 
            className={`min-h-[120px] border p-2 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div 
              className={`text-sm font-medium mb-1 ${
                isToday ? 'text-blue-600 bg-blue-100 rounded px-1' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {day.getDate()}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event: Event) => (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm ${getStatusColor(event.status)}`}
                  title={`Event #${event.id} - ${event.guestCount} guests - ${event.startTime}`}
                >
                  <div className="font-medium">#{event.id}</div>
                  <div className="text-gray-600">{event.guestCount}g</div>
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}