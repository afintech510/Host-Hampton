import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
}

interface EventDetailsDialogProps {
  eventId: number | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "edit";
}

export default function EventDetailsDialog({ eventId, isOpen, onClose, mode }: EventDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(mode === "edit");

  const { data: event, isLoading } = useQuery({
    queryKey: ["/api/events", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const response = await apiRequest("GET", `/api/events/${eventId}`);
      return await response.json();
    },
    enabled: !!eventId && isOpen,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/customers");
      const data = await response.json();
      return data.customers || [];
    },
  });

  const { data: eventTypes = [] } = useQuery({
    queryKey: ["/api/event-types"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/event-types");
      const data = await response.json();
      return data.eventTypes || [];
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (updates: Partial<Event>) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Updated",
        description: "The event has been successfully updated.",
      });
      setEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updates = {
      eventDate: formData.get("eventDate") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      guestCount: parseInt(formData.get("guestCount") as string),
      status: formData.get("status") as string,
      customerId: parseInt(formData.get("customerId") as string),
      eventTypeId: parseInt(formData.get("eventTypeId") as string),
      estimatedCost: parseInt((parseFloat(formData.get("estimatedCost") as string) * 100).toString()),
      notes: formData.get("notes") as string,
    };

    updateEventMutation.mutate(updates);
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

  if (!eventId || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Edit Event" : "Event Details"} #{eventId}
          </DialogTitle>
          <DialogDescription>
            {editMode ? "Update the event information below." : "View event details and information."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : event ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerId">Customer</Label>
                {editMode ? (
                  <Select name="customerId" defaultValue={event.customerId?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium">{event.customerName || `Customer #${event.customerId}`}</p>
                )}
              </div>

              <div>
                <Label htmlFor="eventTypeId">Event Type</Label>
                {editMode ? (
                  <Select name="eventTypeId" defaultValue={event.eventTypeId?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type: any) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium">{event.eventTypeName || `Type #${event.eventTypeId}`}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                {editMode ? (
                  <Input
                    name="eventDate"
                    type="date"
                    defaultValue={event.eventDate ? format(new Date(event.eventDate), 'yyyy-MM-dd') : ''}
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {event.eventDate ? format(new Date(event.eventDate), 'PPP') : 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="startTime">Start Time</Label>
                {editMode ? (
                  <Input
                    name="startTime"
                    type="time"
                    defaultValue={event.startTime || ''}
                  />
                ) : (
                  <p className="text-sm font-medium">{event.startTime || 'Not set'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                {editMode ? (
                  <Input
                    name="endTime"
                    type="time"
                    defaultValue={event.endTime || ''}
                  />
                ) : (
                  <p className="text-sm font-medium">{event.endTime || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="guestCount">Guest Count</Label>
                {editMode ? (
                  <Input
                    name="guestCount"
                    type="number"
                    defaultValue={event.guestCount || ''}
                  />
                ) : (
                  <p className="text-sm font-medium">{event.guestCount || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                {editMode ? (
                  <Select name="status" defaultValue={event.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inquiry">Inquiry</SelectItem>
                      <SelectItem value="quote_requested">Quote Requested</SelectItem>
                      <SelectItem value="quote_sent">Quote Sent</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(event.status)}>
                    {event.status || 'Unknown'}
                  </Badge>
                )}
              </div>

              <div>
                <Label htmlFor="estimatedCost">Estimated Cost</Label>
                {editMode ? (
                  <Input
                    name="estimatedCost"
                    type="number"
                    step="0.01"
                    defaultValue={event.estimatedCost ? (event.estimatedCost / 100).toFixed(2) : ''}
                  />
                ) : (
                  <p className="text-sm font-medium">
                    ${event.estimatedCost ? (event.estimatedCost / 100).toFixed(2) : '0.00'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              {editMode ? (
                <Textarea
                  name="notes"
                  defaultValue={event.notes || ''}
                  rows={3}
                />
              ) : (
                <p className="text-sm">{event.notes || 'No notes'}</p>
              )}
            </div>

            <DialogFooter>
              {editMode ? (
                <>
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateEventMutation.isPending}>
                    {updateEventMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button type="button" onClick={() => setEditMode(true)}>
                    Edit Event
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        ) : (
          <p>Event not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}