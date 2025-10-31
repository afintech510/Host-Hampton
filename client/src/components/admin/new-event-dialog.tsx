import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Tag, 
  X, 
  Plus, 
  Trash2, 
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Settings,
  ImageIcon
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Enhanced schema for comprehensive event creation
const sessionSchema = z.object({
  sessionName: z.string().min(1, "Session name is required"),
  sessionDate: z.string().min(1, "Session date is required"),
  sessionTime: z.string().min(1, "Session time is required"),
  maxTickets: z.number().min(1, "Must have at least 1 ticket"),
  priceOverride: z.number().optional(),
});

const productOptionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  description: z.string().optional(),
  priceModifier: z.number().default(0),
  isDefault: z.boolean().default(false),
});

const optionCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  isRequired: z.boolean().default(true),
  options: z.array(productOptionSchema).min(1, "At least one option is required"),
});

const newEventSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  
  // Event Type Configuration
  eventType: z.enum(["single", "multi-session-choose", "multi-session-series"]),
  
  // Pricing Configuration
  basePrice: z.number().min(0, "Price must be non-negative"),
  hasSiblingDiscount: z.boolean().default(false),
  siblingPrice: z.number().optional(),
  
  // Media
  imageUrl: z.string().optional(),
  
  // Single Event Fields (when eventType === "single")
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  maxTickets: z.number().min(1, "Must have at least 1 ticket"),
  
  // Multi-Session Fields (when eventType starts with "multi-session")
  sessions: z.array(sessionSchema).optional(),
  
  // Option Categories (for workshops with choices like wood types)
  optionCategories: z.array(optionCategorySchema).optional(),
  
  // Associated Event Type for booking management (optional)
  associatedEventType: z.string().optional(),
});

type NewEventFormData = z.infer<typeof newEventSchema>;

interface NewEventPanelProps {
  onClose: () => void;
}

// Helper component for managing options within a category
function OptionFieldArray({ control, categoryIndex }: { control: any; categoryIndex: number }) {
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `optionCategories.${categoryIndex}.options`,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm">Options</h5>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendOption({
            name: "",
            description: "",
            priceModifier: 0,
            isDefault: false
          })}
          className="flex items-center gap-1 text-xs"
        >
          <Plus className="w-3 h-3" />
          Add Option
        </Button>
      </div>
      
      {optionFields.length === 0 && (
        <div className="text-sm text-gray-500 p-3 border border-dashed rounded-md text-center">
          No options added yet. Click "Add Option" to create choices for this category.
        </div>
      )}

      {optionFields.map((option, optionIndex) => (
        <Card key={option.id} className="p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Option {optionIndex + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeOption(optionIndex)}
              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={control}
              name={`optionCategories.${categoryIndex}.options.${optionIndex}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Option Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Coaster" {...field} className="h-8 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`optionCategories.${categoryIndex}.options.${optionIndex}.priceModifier`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Price Modifier ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`optionCategories.${categoryIndex}.options.${optionIndex}.description`}
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-xs">Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional details about this option" {...field} className="h-8 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`optionCategories.${categoryIndex}.options.${optionIndex}.isDefault`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 md:col-span-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-xs">Default option</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function NewEventPanel({ onClose }: NewEventPanelProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<NewEventFormData>({
    resolver: zodResolver(newEventSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      eventType: "single",
      basePrice: 0,
      hasSiblingDiscount: false,
      siblingPrice: undefined,
      imageUrl: "",
      eventDate: "",
      eventTime: "",
      location: "Host Hampton",
      maxTickets: 1,
      sessions: [],
      optionCategories: [],
      associatedEventType: "",
    },
  });

  const { fields: sessionFields, append: appendSession, remove: removeSession } = useFieldArray({
    control: form.control,
    name: "sessions",
  });

  const { fields: optionCategoryFields, append: appendOptionCategory, remove: removeOptionCategory } = useFieldArray({
    control: form.control,
    name: "optionCategories",
  });

  const watchEventType = form.watch("eventType");
  const watchHasSiblingDiscount = form.watch("hasSiblingDiscount");

  // Auto-add a session when multi-session event type is selected
  useEffect(() => {
    if ((watchEventType === "multi-session-choose" || watchEventType === "multi-session-series") && sessionFields.length === 0) {
      appendSession({
        sessionName: "",
        sessionDate: "",
        sessionTime: "",
        maxTickets: 1,
        priceOverride: undefined,
      });
    }
  }, [watchEventType, sessionFields.length, appendSession]);

  // Fetch event types for the dropdown
  const { data: eventTypes = [] } = useQuery({
    queryKey: ["/api/event-types"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/event-types");
      const data = await response.json();
      return data.success ? data.eventTypes : [];
    }
  });

  // Create product and sessions mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: NewEventFormData) => {
      // Create the main product
      const priceInCents = Math.round(data.basePrice * 100);
      const siblingPriceInCents = data.hasSiblingDiscount && data.siblingPrice 
        ? Math.round(data.siblingPrice * 100) 
        : null;

      const productData = {
        name: data.name,
        description: data.description,
        price: priceInCents,
        siblingPrice: siblingPriceInCents,
        hasSiblingDiscount: data.hasSiblingDiscount,
        category: data.category,
        location: data.location,
        imageUrl: data.imageUrl || null,
        hasMultipleSessions: data.eventType !== "single",
        isActive: true,
        // For single events, set the event date directly
        eventDate: data.eventType === "single" && data.eventDate 
          ? data.eventDate 
          : null,
        maxTickets: data.eventType === "single" ? data.maxTickets : null,
        availableTickets: data.eventType === "single" ? data.maxTickets : null,
      };

      const productResponse = await apiRequest("POST", "/api/products", productData);
      if (!productResponse.ok) {
        throw new Error("Failed to create event");
      }
      
      const productResult = await productResponse.json();
      const productId = productResult.id;

      // For multi-session events, create the sessions
      if (data.eventType !== "single" && data.sessions && data.sessions.length > 0) {
        for (const session of data.sessions) {
          const sessionData = {
            productId,
            sessionName: session.sessionName,
            sessionDate: session.sessionDate,
            sessionTime: session.sessionTime,
            maxTickets: session.maxTickets,
            availableTickets: session.maxTickets,
            priceOverride: session.priceOverride ? Math.round(session.priceOverride * 100) : null,
            isActive: true,
          };

          const sessionResponse = await apiRequest("POST", "/api/product-sessions", sessionData);
          if (!sessionResponse.ok) {
            throw new Error(`Failed to create session: ${session.sessionName}`);
          }
        }
      }

      // Create option categories if any
      if (data.optionCategories && data.optionCategories.length > 0) {
        for (const category of data.optionCategories) {
          const categoryData = {
            productId,
            name: category.name,
            description: category.description,
            isRequired: category.isRequired,
          };

          const categoryResponse = await apiRequest("POST", "/api/product-option-categories", categoryData);
          if (!categoryResponse.ok) {
            throw new Error(`Failed to create option category: ${category.name}`);
          }
          
          const categoryResult = await categoryResponse.json();
          const categoryId = categoryResult.category.id;

          // Create options for this category
          for (const option of category.options) {
            const optionData = {
              categoryId,
              name: option.name,
              description: option.description,
              priceModifier: Math.round(option.priceModifier * 100), // Convert to cents
              isDefault: option.isDefault,
              isActive: true,
            };

            const optionResponse = await apiRequest("POST", "/api/product-options", optionData);
            if (!optionResponse.ok) {
              throw new Error(`Failed to create option: ${option.name}`);
            }
          }
        }
      }

      return { product: productResult };
    },
    onSuccess: () => {
      toast({
        title: "Event Created Successfully",
        description: "Your new event has been created and is now available for customers to purchase.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: NewEventFormData) => {
    setIsSubmitting(true);
    
    try {
      await createProductMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error creating event:", error);
      // Log the full error details for debugging
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      toast({
        title: "Error Creating Event",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSession = () => {
    appendSession({
      sessionName: "",
      sessionDate: "",
      sessionTime: "",
      maxTickets: 1,
      priceOverride: undefined,
    });
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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

  const eventTypeOptions = [
    {
      value: "single",
      label: "Single Event",
      description: "A one-time event with a specific date and time",
      icon: "📅"
    },
    {
      value: "multi-session-choose",
      label: "Multi-Session (Choose One)",
      description: "Customers choose one session from multiple available times",
      icon: "🎯"
    },
    {
      value: "multi-session-series",
      label: "Multi-Session Series",
      description: "Customers buy the entire series of sessions",
      icon: "📚"
    }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep
                ? "bg-blue-600 text-white"
                : step < currentStep
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < 2 && (
            <div
              className={`w-12 h-0.5 ${
                step < currentStep ? "bg-green-600" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Event Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Cookie Decorating Workshop" {...field} />
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

      {/* Event Type Selection */}
      <FormField
        control={form.control}
        name="eventType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Type</FormLabel>
            <FormControl>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {eventTypeOptions.map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      field.value === option.value
                        ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => field.onChange(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <div className="text-2xl">{option.icon}</div>
                        <h3 className="font-medium">{option.label}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Location & Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Input placeholder="Host Hampton" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="basePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Base Price (USD)
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                {watchEventType === "multi-session-series" 
                  ? "Price for the entire series" 
                  : "Price per person/ticket"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Photo Upload */}
      <FormField
        control={form.control}
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Event Photo URL
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="https://example.com/photo.jpg (optional)" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Add a photo URL to showcase your event. This will help customers understand what to expect.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sibling Discount */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="hasSiblingDiscount"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Sibling Discount</FormLabel>
                <FormDescription>
                  Offer a discounted price for additional siblings
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {watchHasSiblingDiscount && (
          <FormField
            control={form.control}
            name="siblingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sibling Price (USD)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Price for each additional sibling
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Single Event Fields */}
      {watchEventType === "single" && (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Configure the specific date, time, and capacity for your single event.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxTickets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Tickets</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="20" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* Multi-Session Configuration */}
      {watchEventType !== "single" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Session Configuration</h3>
              <p className="text-sm text-gray-600">
                {watchEventType === "multi-session-choose" 
                  ? "Add multiple sessions that customers can choose from"
                  : "Add all sessions in the series that customers will purchase together"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSession}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Session
            </Button>
          </div>

          {sessionFields.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Add at least one session to continue. Each session can have its own date, time, and capacity.
              </AlertDescription>
            </Alert>
          )}

          {sessionFields.map((session, index) => (
            <Card key={session.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Session {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSession(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`sessions.${index}.sessionName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Morning Session" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`sessions.${index}.maxTickets`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Tickets</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`sessions.${index}.sessionDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`sessions.${index}.sessionTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchEventType === "multi-session-choose" && (
                  <FormField
                    control={form.control}
                    name={`sessions.${index}.priceOverride`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Price Override (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Leave empty to use base price" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Override the base price for this specific session
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Option Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Workshop Options</h3>
            <p className="text-sm text-gray-600">
              Add customizable options like material choices, sizes, or add-ons with different prices
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendOptionCategory({
              name: "",
              description: "",
              isRequired: false,
              options: []
            })}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Option Category
          </Button>
        </div>

        {optionCategoryFields.map((category, categoryIndex) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Option Category {categoryIndex + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOptionCategory(categoryIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`optionCategories.${categoryIndex}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Wood Type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`optionCategories.${categoryIndex}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose your preferred material" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`optionCategories.${categoryIndex}.isRequired`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Required Selection</FormLabel>
                      <FormDescription>
                        Customers must choose an option from this category
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Option Management */}
              <OptionFieldArray 
                control={form.control} 
                categoryIndex={categoryIndex} 
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => {
    const sessions = form.watch("sessions") || [];
    const optionCategories = form.watch("optionCategories") || [];
    
    return (
      <div className="space-y-6">
        {/* Comprehensive Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Review Your Event</h3>
          <p className="text-sm text-gray-600">
            Please review all the details before creating your event. You can go back to make changes if needed.
          </p>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Event Name</p>
                  <p className="font-medium">{form.watch("name") || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Category</p>
                  <p className="font-medium">
                    {eventCategories.find(c => c.value === form.watch("category"))?.label || "Not set"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Description</p>
                  <p className="font-medium">{form.watch("description") || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Event Type</p>
                  <p className="font-medium">
                    {eventTypeOptions.find(t => t.value === watchEventType)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium">{form.watch("location")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Base Price</p>
                  <p className="font-medium text-lg text-green-600">
                    ${form.watch("basePrice")?.toFixed(2) || "0.00"}
                  </p>
                </div>
                {watchHasSiblingDiscount && (
                  <div>
                    <p className="text-gray-600">Sibling Discount Price</p>
                    <p className="font-medium text-lg text-green-600">
                      ${form.watch("siblingPrice")?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Photo */}
          {form.watch("imageUrl") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <img 
                    src={form.watch("imageUrl")} 
                    alt="Event preview" 
                    className="w-full max-w-md rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <p className="text-xs text-gray-500 break-all">{form.watch("imageUrl")}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Single Event Details */}
          {watchEventType === "single" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">
                      {form.watch("eventDate") || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time</p>
                    <p className="font-medium">
                      {form.watch("eventTime") || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Max Tickets</p>
                    <p className="font-medium">
                      {form.watch("maxTickets")} tickets
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Multi-Session Details */}
          {watchEventType !== "single" && sessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Sessions ({sessions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map((session, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium mb-2">{session.sessionName || `Session ${index + 1}`}</p>
                      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="text-xs">Date:</span> {session.sessionDate || "Not set"}
                        </div>
                        <div>
                          <span className="text-xs">Time:</span> {session.sessionTime || "Not set"}
                        </div>
                        <div>
                          <span className="text-xs">Tickets:</span> {session.maxTickets}
                        </div>
                        {session.priceOverride && (
                          <div className="col-span-3">
                            <span className="text-xs">Price Override:</span> ${session.priceOverride.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workshop Options */}
          {optionCategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Workshop Options ({optionCategories.length} categories)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optionCategories.map((category, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{category.name}</p>
                        {category.isRequired && (
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      )}
                      <div className="space-y-1">
                        {category.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {option.name}
                              {option.isDefault && <Badge className="text-xs">Default</Badge>}
                            </span>
                            {option.priceModifier !== 0 && (
                              <span className="text-gray-600">
                                {option.priceModifier > 0 ? '+' : ''}${option.priceModifier.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Create New Event for Sale
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Create a comprehensive event that will be available for customers to purchase on the Upcoming Events page.
        </p>
      </CardHeader>
      <CardContent>
        {renderStepIndicator()}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="text-sm text-gray-600">
                Step {currentStep} of 2
              </div>

              {currentStep < 2 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                  data-testid="button-create-event"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Event
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}