import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Mail, 
  Phone, 
  Printer,
  Image as ImageIcon
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
  customerName?: string;
  eventTypeName?: string;
  productImageUrl?: string;
}

interface Attendee {
  id: number;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  paidAmount: number;
}

interface EventDetailsDialogProps {
  eventId: number | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "edit";
}

export default function EventDetailsDialog({ eventId, isOpen, onClose, mode }: EventDetailsDialogProps) {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: ["/api/events", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const response = await apiRequest("GET", `/api/events/${eventId}`);
      const data = await response.json();
      return data.event || null; // Unwrap the response
    },
    enabled: !!eventId && isOpen,
  });

  // Fetch customer details
  const { data: customer } = useQuery({
    queryKey: ["/api/customers", event?.customerId],
    queryFn: async () => {
      if (!event?.customerId) return null;
      const response = await apiRequest("GET", `/api/customers`);
      const data = await response.json();
      return data.customers?.find((c: any) => c.id === event.customerId);
    },
    enabled: !!event?.customerId,
  });

  // Fetch all events with the same date/time/type to get attendees
  const { data: attendees = [], isLoading: attendeesLoading } = useQuery({
    queryKey: ["/api/events/attendees", event?.eventDate, event?.startTime, event?.eventTypeId],
    queryFn: async () => {
      if (!event?.eventDate || !event?.eventTypeId) return [];
      
      // Get all events matching this session
      const eventsResponse = await apiRequest("GET", "/api/events");
      const eventsData = await eventsResponse.json();
      const allEvents = eventsData.events || []; // Unwrap the response
      
      // Filter events that match the same session (date, time, type)
      const matchingEvents = allEvents.filter((e: Event) => 
        e.eventDate === event.eventDate &&
        e.startTime === event.startTime &&
        e.eventTypeId === event.eventTypeId &&
        e.status !== 'cancelled'
      );
      
      // Get customer info for each event
      const customersResponse = await apiRequest("GET", "/api/customers");
      const customersData = await customersResponse.json();
      const allCustomers = customersData.customers || [];
      
      // Build attendee list
      const attendeeList: Attendee[] = matchingEvents.map((e: Event) => {
        const cust = allCustomers.find((c: any) => c.id === e.customerId);
        return {
          id: e.customerId,
          name: cust?.name || e.customerName || "Unknown",
          email: cust?.email || "",
          phone: cust?.phone || "",
          tickets: e.guestCount || 1,
          paidAmount: e.estimatedCost || 0
        };
      });
      
      return attendeeList;
    },
    enabled: !!event,
  });

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'quote_requested': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const totalRevenue = attendees.reduce((sum, a) => sum + (a.paidAmount || 0), 0);
  const totalAttendees = attendees.reduce((sum, a) => sum + (a.tickets || 0), 0);

  if (!eventId || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : event ? (
          <div ref={printRef} className="space-y-6">
            {/* Header */}
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold mb-2">
                    {event.eventTypeName || 'Event'} Details
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">Event #{eventId}</span>
                  </div>
                </div>
                <Button 
                  onClick={handlePrint} 
                  variant="outline" 
                  size="sm"
                  className="print:hidden"
                  data-testid="button-print-event-details"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </DialogHeader>

            {/* Event Image - if available from product */}
            {event.productImageUrl && (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={event.productImageUrl} 
                  alt={event.eventTypeName || 'Event'} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <Separator />

            {/* Event Information Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date
                </div>
                <p className="font-medium" data-testid="text-event-date">
                  {event.eventDate ? format(new Date(event.eventDate), 'PPPP') : 'Not set'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  Time
                </div>
                <p className="font-medium" data-testid="text-event-time">
                  {event.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}` : 'Not set'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </div>
                <p className="font-medium" data-testid="text-event-location">
                  Host Hampton, Speonk NY
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  Capacity
                </div>
                <p className="font-medium" data-testid="text-event-capacity">
                  {totalAttendees} {totalAttendees === 1 ? 'attendee' : 'attendees'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Revenue
                </div>
                <p className="font-medium text-green-600" data-testid="text-event-revenue">
                  ${(totalRevenue / 100).toFixed(2)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  Bookings
                </div>
                <p className="font-medium" data-testid="text-event-bookings">
                  {attendees.length} {attendees.length === 1 ? 'booking' : 'bookings'}
                </p>
              </div>
            </div>

            {event.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700">Notes</h3>
                  <p className="text-sm text-gray-600">{event.notes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Attendee List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Attendee List</h3>
                <span className="text-sm text-gray-500">
                  {attendees.length} {attendees.length === 1 ? 'attendee' : 'attendees'} registered
                </span>
              </div>

              {attendeesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : attendees.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Contact</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Tickets</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {attendees.map((attendee, index) => (
                        <tr key={index} className="hover:bg-gray-50" data-testid={`row-attendee-${index}`}>
                          <td className="px-4 py-3 font-medium">{attendee.name}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {attendee.email && (
                                <div className="flex items-center text-gray-600">
                                  <Mail className="w-3 h-3 mr-1" />
                                  <span className="text-xs">{attendee.email}</span>
                                </div>
                              )}
                              {attendee.phone && (
                                <div className="flex items-center text-gray-600">
                                  <Phone className="w-3 h-3 mr-1" />
                                  <span className="text-xs">{attendee.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="secondary">{attendee.tickets}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-green-600">
                            ${(attendee.paidAmount / 100).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-semibold">
                      <tr>
                        <td className="px-4 py-3" colSpan={2}>Total</td>
                        <td className="px-4 py-3 text-center">{totalAttendees}</td>
                        <td className="px-4 py-3 text-right text-green-600">
                          ${(totalRevenue / 100).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No attendees registered yet</p>
                </div>
              )}
            </div>

            {/* Footer Actions - Hidden when printing */}
            <div className="flex justify-end gap-2 pt-4 print:hidden">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-close">
                Close
              </Button>
              <Button 
                type="button" 
                variant="default"
                onClick={() => {
                  const emails = attendees.map(a => a.email).filter(Boolean).join(', ');
                  if (emails) {
                    window.location.href = `mailto:${emails}`;
                  }
                }}
                disabled={attendees.length === 0}
                data-testid="button-email-attendees"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email All Attendees
              </Button>
            </div>
          </div>
        ) : (
          <p>Event not found</p>
        )}
      </DialogContent>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${printRef.current ? `
            #print-content,
            #print-content * {
              visibility: visible;
            }
            #print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          ` : ''}
        }
      `}</style>
    </Dialog>
  );
}
