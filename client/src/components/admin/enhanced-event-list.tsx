import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Users, Calendar, DollarSign, Mail, UserGroup } from "lucide-react";

interface PublicEvent {
  id: number;
  name: string;
  eventDate: string;
  location?: string;
  maxTickets?: number;
  availableTickets?: number;
  price: number;
  category?: string;
  hasMultipleSessions: boolean;
  ticketsSold?: number;
  sessions?: ProductSession[];
}

interface ProductSession {
  id: number;
  sessionName: string;
  sessionDate: string;
  sessionTime: string;
  maxTickets: number;
  availableTickets: number;
  ticketsSold?: number;
}

interface PrivateEvent {
  id: number;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: string;
  guestCount: number;
  estimatedCost?: number;
  customerName?: string;
  eventTypeName?: string;
  eventType?: string;
  notes?: string;
}

interface EventAttendee {
  id: number;
  customerName: string;
  customerEmail: string;
  quantity: number;
  sessionInfo?: string;
}

export default function EnhancedEventList() {
  const [statusFilter, setStatusFilter] = useState("confirmed");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<"public" | "private">("public");

  // Fetch public events (products)
  const { data: publicEvents = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/products");
      return response.json();
    },
  });

  // Fetch private events
  const { data: privateEventsData = { events: [] } } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/events");
      return response.json();
    },
  });

  // Fetch order data for public events attendee counts
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/orders");
      const data = await response.json();
      return data.orders || [];
    },
  });

  const privateEvents = privateEventsData.events || [];

  // Calculate attendee counts for public events
  const getEventAttendeeCount = (productId: number, sessionId?: number) => {
    const completedOrders = orders.filter((order: any) => order.status === "completed");
    let totalAttendees = 0;
    
    completedOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (item.productId === productId) {
          if (sessionId && item.productSessionId === sessionId) {
            totalAttendees += item.quantity;
          } else if (!sessionId && !item.productSessionId) {
            totalAttendees += item.quantity;
          }
        }
      });
    });
    
    return totalAttendees;
  };

  // Filter events based on status and type
  const filteredPrivateEvents = privateEvents.filter((event: PrivateEvent) => {
    if (statusFilter !== "all" && event.status !== statusFilter) return false;
    if (eventTypeFilter !== "all" && eventTypeFilter !== "private") return false;
    return true;
  });

  const filteredPublicEvents = publicEvents.filter((event: PublicEvent) => {
    if (eventTypeFilter !== "all" && eventTypeFilter !== "public") return false;
    // For public events, we only show confirmed/active ones by default
    if (statusFilter === "confirmed") return event.isActive !== false;
    return true;
  });

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDateTime = (dateStr: string, timeStr?: string) => {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    
    if (timeStr) {
      return `${dateFormatted} at ${formatTime(timeStr)}`;
    }
    return dateFormatted;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "theme_party": return "bg-purple-100 text-purple-800";
      case "studio_rental": return "bg-blue-100 text-blue-800";
      case "trucker_hat": return "bg-orange-100 text-orange-800";
      case "permanent_jewelry": return "bg-pink-100 text-pink-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const calculateRevenue = (event: any, isPublic: boolean) => {
    if (isPublic) {
      const attendeeCount = getEventAttendeeCount(event.id);
      return attendeeCount * (event.price / 100);
    } else {
      return (event.estimatedCost || 0) / 100;
    }
  };

  const handleViewEvent = (event: any, isPublic: boolean) => {
    setSelectedEvent(event);
    setSelectedEventType(isPublic ? "public" : "private");
    setShowEventModal(true);
  };

  const handleSendEventEmail = async (event: any) => {
    // TODO: Implement send email to all attendees
    console.log("Sending email to attendees for event:", event.id);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="all">All Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Event Type:</label>
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="public">Host Hampton Events</SelectItem>
              <SelectItem value="private">Private Events</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Public Events */}
                {filteredPublicEvents.map((event: PublicEvent) => {
                  const attendeeCount = getEventAttendeeCount(event.id);
                  const revenue = calculateRevenue(event, true);
                  
                  return (
                    <tr key={`public-${event.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {attendeeCount} signed up
                            {event.maxTickets && ` / ${event.maxTickets} max`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.eventDate ? formatDateTime(event.eventDate) : 'Multiple Sessions'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-green-100 text-green-800">
                          Host Hampton Event
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewEvent(event, true)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {/* Private Events */}
                {filteredPrivateEvents.map((event: PrivateEvent) => {
                  const revenue = calculateRevenue(event, false);
                  
                  return (
                    <tr key={`private-${event.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {event.customerName || `Event #${event.id}`}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.guestCount} guests
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(event.eventDate, event.startTime)}
                        {event.endTime && (
                          <div className="text-gray-500">
                            - {formatTime(event.endTime)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getEventTypeColor(event.eventType || "private")}>
                          {event.eventTypeName || event.eventType || "Private Event"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewEvent(event, false)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {(filteredPublicEvents.length === 0 && filteredPrivateEvents.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No events found with current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEventType === "public" ? "Host Hampton Event Details" : "Private Event Details"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && selectedEventType === "public" && (
            <PublicEventDetails 
              event={selectedEvent} 
              attendeeCount={getEventAttendeeCount(selectedEvent.id)}
              onSendEmail={() => handleSendEventEmail(selectedEvent)}
            />
          )}
          
          {selectedEvent && selectedEventType === "private" && (
            <PrivateEventDetails 
              event={selectedEvent}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component for Public Event Details
function PublicEventDetails({ event, attendeeCount, onSendEmail }: { 
  event: PublicEvent; 
  attendeeCount: number; 
  onSendEmail: () => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-lg mb-3">Event Information</h3>
          <div className="space-y-2">
            <p><strong>Name:</strong> {event.name}</p>
            <p><strong>Date:</strong> {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "Multiple Sessions"}</p>
            <p><strong>Location:</strong> {event.location || "Host Hampton"}</p>
            <p><strong>Price:</strong> ${(event.price / 100).toFixed(2)}</p>
            <p><strong>Category:</strong> {event.category || "Workshop"}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-3">Attendance</h3>
          <div className="space-y-2">
            <p><strong>Signed Up:</strong> {attendeeCount}</p>
            <p><strong>Available:</strong> {event.availableTickets || "Unlimited"}</p>
            <p><strong>Max Capacity:</strong> {event.maxTickets || "Unlimited"}</p>
            <p><strong>Revenue:</strong> ${(attendeeCount * (event.price / 100)).toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-3">Attendee List</h3>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-600 mb-2">Print attendee list for check-in:</p>
          <Button variant="outline" size="sm">
            Print Attendee List
          </Button>
        </div>
      </div>
      
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={onSendEmail} className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Send Update Email
        </Button>
        <Button variant="outline" onClick={onSendEmail} className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Send Reminder Email
        </Button>
      </div>
    </div>
  );
}

// Component for Private Event Details
function PrivateEventDetails({ event }: { event: PrivateEvent }) {
  const handleOpenQuote = () => {
    // Open quote in new tab
    window.open(`/admin-dashboard?tab=quotes&event=${event.id}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-lg mb-3">Event Information</h3>
          <div className="space-y-2">
            <p><strong>Customer:</strong> {event.customerName || "Unknown"}</p>
            <p><strong>Event Type:</strong> {event.eventTypeName || event.eventType || "Private Event"}</p>
            <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
            <p><strong>Guest Count:</strong> {event.guestCount}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-3">Financial Details</h3>
          <div className="space-y-2">
            <p><strong>Status:</strong> 
              <Badge className={`ml-2 ${event.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {event.status}
              </Badge>
            </p>
            <p><strong>Estimated Cost:</strong> ${((event.estimatedCost || 0) / 100).toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      {event.notes && (
        <div>
          <h3 className="font-semibold text-lg mb-3">Notes</h3>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{event.notes}</p>
        </div>
      )}
      
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={handleOpenQuote} className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Edit Quote
        </Button>
      </div>
    </div>
  );
}