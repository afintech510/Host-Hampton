import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Users, Calendar, DollarSign, Mail, RotateCcw, Archive, ArrowUpDown } from "lucide-react";
import EventDetailsDialog from "./event-details-dialog";

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
  isActive?: boolean;
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
  duration?: string;
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc"); // desc = newest first
  const [showArchived, setShowArchived] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async ({ eventId, archived }: { eventId: number; archived: boolean }) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}/archive`, { archived });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });
  
  const handleRefreshData = async () => {
    // Invalidate all relevant queries to refresh data
    await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
  };

  // Fetch all events from events table (these are the individual session events)
  const { data: allEventsData = { events: [] } } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/events");
      const data = await response.json();
      console.log("Raw API response from /api/events:", data);
      return data;
    },
  });

  // Remove unused productSessions query since we're getting data from events and orders directly

  // Fetch order data for public events attendee counts
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/orders");
      const data = await response.json();
      console.log("Orders with items:", data.slice(0, 2));
      return data; // Server now includes order items in the response
    },
  });

  // Handle different API response structures
  const allEvents = Array.isArray(allEventsData?.events) ? allEventsData.events : 
                   Array.isArray(allEventsData) ? allEventsData : [];
  console.log("Processed allEvents:", allEvents);
  console.log("allEventsData structure:", allEventsData);
  
  // Separate public events (customerId = 1) and private events
  // Public events are product-based events created by the system (customerId = 1)
  const publicEvents = allEvents.filter((event: any) => 
    event.customerId === 1
  );
  
  const privateEvents = allEvents.filter((event: any) => 
    event.customerId !== 1
  );

  // Create precise event-to-session mapping based on our database analysis
  const eventSessionMapping: { [eventId: number]: number | null } = {
    // Kids Summer Classes sessions
    43: 1,  // Canvas Bag Painting -> session_id 1
    44: 2,  // Fake Cake Decorating -> session_id 2 
    45: 3,  // Scrap Booking -> session_id 3
    46: 4,  // Make Your Own Slime -> session_id 4
    47: 5,  // Marbled Mug -> session_id 5
    48: 6,  // Charm Necklace Making -> session_id 6
    
    // Open Soft Play sessions (all Tuesday Morning)
    49: 7,  // Aug 5 -> session_id 7
    50: 8,  // Aug 12 -> session_id 8
    51: 9,  // Aug 19 -> session_id 9
    52: 10, // Aug 26 -> session_id 10
    53: 11, // Sep 2 -> session_id 11
    
    // Advanced Beginner Mahjong sessions
    54: 12, // September Week 1 -> session_id 12
    55: 13, // September Week 2 -> session_id 13
    56: 14, // September Week 3 -> session_id 14
    57: 15, // September Week 4 -> session_id 15
    
    // Single events (no sessions)
    58: null, // Sourdough for Beginners
    59: null, // Spirit Medium Kayla
    60: null, // Not Miss Rachel
  };

  // Calculate attendee counts by matching events to their specific sessions
  const getEventAttendeeCount = (eventId: number, eventNotes: string) => {
    const completedOrders = orders.filter((order: any) => order.status === "completed");
    let totalAttendees = 0;
    
    const sessionId = eventSessionMapping[eventId];
    
    // Map event notes to product names
    let productName = "";
    if (eventNotes.includes("Kids Summer Classes")) {
      productName = "Kids Summer Classes";
    } else if (eventNotes.includes("Open Soft Play")) {
      productName = "Open Soft Play";
    } else if (eventNotes.includes("Advanced Beginner Mahjong")) {
      productName = "Advanced Beginner Mahjong Course";
    } else if (eventNotes.includes("Sourdough for Beginners")) {
      productName = "Sourdough for Beginners";
    } else if (eventNotes.includes("Spirit Medium")) {
      productName = "Spirit Medium Kayla";
    } else if (eventNotes.includes("Not Miss Rachel")) {
      productName = "Not Miss Rachel";
    }
    
    // Debug logging for attendee count issues
    if (eventId === 43) { // Debug first event
      console.log(`Debug Attendee Count for Event ${eventId}:`);
      console.log("- Event Notes:", eventNotes);
      console.log("- Mapped Product Name:", productName);
      console.log("- Session ID:", sessionId);
      console.log("- Total Orders:", orders.length);
      console.log("- Completed Orders:", completedOrders.length);
      console.log("- Orders data sample:", orders.slice(0, 2));
      
      if (completedOrders.length > 0) {
        console.log("- First completed order items:", completedOrders[0].items);
      }
    }
    
    // Count attendees from orders
    completedOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (item.productName === productName) {
          if (sessionId !== null) {
            // For session-based events, match exact session ID
            if (item.productSessionId === sessionId) {
              totalAttendees += item.quantity;
            }
          } else {
            // For non-session events, match items without session ID
            if (!item.productSessionId) {
              totalAttendees += item.quantity;
            }
          }
        }
      });
    });
    
    if (eventId === 43) { // Debug first event
      console.log("- Final Attendee Count:", totalAttendees);
    }
    
    return totalAttendees;
  };

  // Filter events based on status, type, search, and archived state
  const filteredPrivateEvents = privateEvents
    .filter((event: PrivateEvent) => {
      // Filter by status
      if (statusFilter !== "all" && event.status !== statusFilter) return false;
      
      // Filter by event type
      if (eventTypeFilter !== "all" && eventTypeFilter !== "private") return false;
      
      // Filter by archived state
      if (!showArchived && (event as any).archived) return false;
      if (showArchived && !(event as any).archived) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = (event.customerName || "").toLowerCase().includes(query);
        const matchesNotes = (event.notes || "").toLowerCase().includes(query);
        const matchesEventType = (event.eventTypeName || "").toLowerCase().includes(query);
        if (!matchesName && !matchesNotes && !matchesEventType) return false;
      }
      
      return true;
    })
    .sort((a: PrivateEvent, b: PrivateEvent) => {
      // Sort by date
      const dateA = new Date(a.eventDate).getTime();
      const dateB = new Date(b.eventDate).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

  // Filter and sort public events
  const filteredPublicEvents = publicEvents
    .filter((event: any) => {
      // Filter by status
      if (statusFilter !== "all" && event.status !== statusFilter) return false;
      
      // Filter by event type
      if (eventTypeFilter !== "all" && eventTypeFilter !== "public") return false;
      
      // Filter by archived state
      if (!showArchived && event.archived) return false;
      if (showArchived && !event.archived) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesNotes = (event.notes || "").toLowerCase().includes(query);
        if (!matchesNotes) return false;
      }
      
      return true;
    })
    .sort((a: any, b: any) => {
      // Sort by date
      const dateA = new Date(a.eventDate).getTime();
      const dateB = new Date(b.eventDate).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });
  
  // Debug logging to see what's happening with filtering
  console.log("Debug Event Filtering:");
  console.log("- All events count:", allEvents.length);
  console.log("- Public events count:", publicEvents.length);
  console.log("- Private events count:", privateEvents.length);
  console.log("- Status filter:", statusFilter);
  console.log("- Event type filter:", eventTypeFilter);
  console.log("- Sample public events:", publicEvents.slice(0, 3));
  console.log("- Events data structure check:");
  if (publicEvents.length > 0) {
    console.log("  - Event status:", publicEvents[0].status);
    console.log("  - Event notes:", publicEvents[0].notes);
    console.log("  - Event eventDate:", publicEvents[0].eventDate);
  }

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
      const attendeeCount = getEventAttendeeCount(event.id, event.notes || "");
      return attendeeCount * ((event.estimatedCost || 0) / 100);
    } else {
      return (event.estimatedCost || 0) / 100;
    }
  };

  const handleViewEvent = (event: any) => {
    setSelectedEventId(event.id);
    setShowEventModal(true);
  };

  const handleSendEventEmail = async (event: any) => {
    // TODO: Implement send email to all attendees
    console.log("Sending email to attendees for event:", event.id);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        {/* Search Box */}
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Search events by name, notes, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            data-testid="input-search-events"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
            data-testid="button-toggle-sort"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {sortDirection === "desc" ? "Newest First" : "Oldest First"}
          </Button>
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <label className="text-sm font-medium whitespace-nowrap">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
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
          
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <label className="text-sm font-medium whitespace-nowrap">Event Type:</label>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="public">Host Hampton Events</SelectItem>
                <SelectItem value="private">Private Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-archived"
              checked={showArchived}
              onCheckedChange={(checked) => setShowArchived(checked as boolean)}
              data-testid="checkbox-show-archived"
            />
            <label htmlFor="show-archived" className="text-sm font-medium cursor-pointer">
              Show Archived
            </label>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            data-testid="button-refresh-events"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-4">
        {filteredPublicEvents.map((event: any) => {
          const attendeeCount = getEventAttendeeCount(event.id, event.notes || "");
          const revenue = calculateRevenue(event, true);
          const eventName = event.notes || `Event #${event.id}`;
          
          return (
            <Card key={`mobile-public-${event.id}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{eventName}</h3>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3" />
                        {attendeeCount} signed up / 20 max
                      </div>
                    </div>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    {formatDateTime(event.eventDate, event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Host Hampton Event
                      </Badge>
                      <div className="text-xs font-medium text-gray-900">
                        Revenue: ${revenue.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewEvent(event)}
                        data-testid={`button-view-event-${event.id}`}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => archiveMutation.mutate({ eventId: event.id, archived: !event.archived })}
                        data-testid={`button-archive-event-${event.id}`}
                      >
                        <Archive className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredPrivateEvents.map((event: any) => {
          const revenue = calculateRevenue(event, false);
          const eventName = event.customerName || event.notes || `Event #${event.id}`;
          
          // Generate booking link if event has leadId
          const getBookingLink = () => {
            if (!event.leadId) return null;
            
            const eventTypeName = (event.eventTypeName || '').toLowerCase();
            const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            if (eventTypeName.includes('birthday') || eventTypeName.includes('party')) {
              return `/my-theme-party/${randomId}?leadId=${event.leadId}`;
            } else if (eventTypeName.includes('jewelry')) {
              return `/my-permanent-jewelry/${randomId}?leadId=${event.leadId}`;
            } else if (eventTypeName.includes('studio') || eventTypeName.includes('rental')) {
              return `/my-studio-rental/${randomId}?leadId=${event.leadId}`;
            } else if (eventTypeName.includes('trucker') || eventTypeName.includes('hat')) {
              return `/my-trucker-hat/${randomId}?leadId=${event.leadId}`;
            }
            return null;
          };
          
          const bookingLink = getBookingLink();
          
          return (
            <Card key={`mobile-private-${event.id}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
                        {eventName}
                        {bookingLink && (
                          <a 
                            href={bookingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="View booking page"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </h3>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.eventTypeName || "Private Event"}
                      </div>
                    </div>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    {formatDateTime(event.eventDate, event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {event.eventTypeName || "Private Event"}
                      </Badge>
                      <div className="text-xs font-medium text-gray-900">
                        Revenue: ${revenue.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewEvent(event)}
                        data-testid={`button-view-event-${event.id}`}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => archiveMutation.mutate({ eventId: event.id, archived: !event.archived })}
                        data-testid={`button-archive-event-${event.id}`}
                      >
                        <Archive className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          {/* Refresh Button - positioned above the table */}

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
                {/* Public Events (Individual Sessions) */}
                {filteredPublicEvents.map((event: any) => {
                  const attendeeCount = getEventAttendeeCount(event.id, event.notes || "");
                  const revenue = calculateRevenue(event, true);
                  const eventName = event.notes || `Event #${event.id}`;
                  
                  return (
                    <tr key={`public-${event.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{eventName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {attendeeCount} signed up / 20 max
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
                        <Badge className="bg-green-100 text-green-800">
                          Host Hampton Event
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewEvent(event)}
                            data-testid={`button-view-event-${event.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => archiveMutation.mutate({ eventId: event.id, archived: !event.archived })}
                            data-testid={`button-archive-event-${event.id}`}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Private Events */}
                {filteredPrivateEvents.map((event: any) => {
                  const revenue = calculateRevenue(event, false);
                  
                  // Generate booking link if event has leadId
                  const getBookingLink = () => {
                    if (!event.leadId) return null;
                    
                    const eventTypeName = (event.eventTypeName || '').toLowerCase();
                    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
                    
                    if (eventTypeName.includes('birthday') || eventTypeName.includes('party')) {
                      return `/my-theme-party/${randomId}?leadId=${event.leadId}`;
                    } else if (eventTypeName.includes('jewelry')) {
                      return `/my-permanent-jewelry/${randomId}?leadId=${event.leadId}`;
                    } else if (eventTypeName.includes('studio') || eventTypeName.includes('rental')) {
                      return `/my-studio-rental/${randomId}?leadId=${event.leadId}`;
                    } else if (eventTypeName.includes('trucker') || eventTypeName.includes('hat')) {
                      return `/my-trucker-hat/${randomId}?leadId=${event.leadId}`;
                    }
                    return null;
                  };
                  
                  const bookingLink = getBookingLink();
                  
                  return (
                    <tr key={`private-${event.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {event.customerName || `Event #${event.id}`}
                            {bookingLink && (
                              <a 
                                href={bookingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="View booking page"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            {event.eventTypeName && (
                              <span className="text-xs font-medium text-gray-600 mr-2">
                                {event.eventTypeName}
                              </span>
                            )}
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
                        {event.duration && (
                          <div className="text-xs text-purple-600 font-medium mt-1">
                            {event.duration}hr party
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
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewEvent(event)}
                            data-testid={`button-view-event-${event.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => archiveMutation.mutate({ eventId: event.id, archived: !event.archived })}
                            data-testid={`button-archive-event-${event.id}`}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        </div>
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
      <EventDetailsDialog 
        eventId={selectedEventId}
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEventId(null);
        }}
        mode="view"
      />
    </div>
  );
} 
