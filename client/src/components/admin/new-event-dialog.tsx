import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, MapPin, Users, DollarSign, Clock, Tag } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const newEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  eventDate: z.string().min(1, "Event date is required"),
  location: z.string().min(1, "Location is required"),
  maxTickets: z.string().min(1, "Maximum tickets is required"),
  eventType: z.string().min(1, "Event type is required"),
});

type NewEventFormData = z.infer<typeof newEventSchema>;

interface NewEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewEventDialog({ open, onOpenChange }: NewEventDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewEventFormData>({
    resolver: zodResolver(newEventSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      eventDate: "",
      location: "Host Hampton Studio",
      maxTickets: "",
      eventType: "",
    },
  });

  // Fetch event types for the dropdown
  const { data: eventTypes = [] } = useQuery({
    queryKey: ["/api/event-types"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/event-types");
      const data = await response.json();
      return data.success ? data.eventTypes : [];
    }
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/products", productData);
      if (!response.ok) {
        throw new Error("Failed to create event");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event Created",
        description: "New event has been created successfully and is now available for sale.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: NewEventFormData) => {
    setIsSubmitting(true);
    
    try {
      // Convert price from dollars to cents
      const priceInCents = Math.round(parseFloat(data.price) * 100);
      
      const productData = {
        name: data.name,
        description: data.description,
        price: priceInCents,
        category: data.category,
        eventDate: new Date(data.eventDate).toISOString(),
        location: data.location,
        maxTickets: parseInt(data.maxTickets),
        availableTickets: parseInt(data.maxTickets),
        isActive: true,
      };

      await createProductMutation.mutateAsync(productData);
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventCategories = [
    { value: "birthday-party", label: "Birthday Party", icon: "🎂" },
    { value: "adult-workshop", label: "Adult Workshop", icon: "🎨" },
    { value: "permanent-jewelry", label: "Permanent Jewelry", icon: "💍" },
    { value: "room-rental", label: "Room Rental", icon: "🏠" },
    { value: "private-party", label: "Private Party", icon: "🎉" },
    { value: "appointment", label: "Appointment", icon: "📅" },
    { value: "popup-event", label: "Pop-up Event", icon: "✨" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Create New Event for Sale
          </DialogTitle>
          <DialogDescription>
            Create a new event that will be available for customers to purchase on the Shop Events page.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kids Birthday Party Package" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <span className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              {category.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what's included in this event package..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Price (USD)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the ticket price in dollars
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Tickets */}
              <FormField
                control={form.control}
                name="maxTickets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Maximum Tickets
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="20" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Total number of tickets available
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Date */}
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Event Date
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Host Hampton Studio" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Event Type */}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Event Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes.map((type: any) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Link this product to an existing event type for booking management
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-slate-600 hover:bg-slate-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Creating...
                  </div>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}