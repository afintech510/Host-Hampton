import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Calendar, Clock, DollarSign, CheckCircle, XCircle, Loader2, MessageSquare, ChevronDown, ChevronUp, Users, MapPin, AlertCircle } from "lucide-react";
import Navigation from "@/components/navigation";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CustomerEvent {
  id: number;
  eventType: string;
  eventDate: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  description: string;
  location?: string;
  guestCount?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  customerEmail: string | null;
}

export default function MyEvents() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    customerEmail: null,
  });
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [changeRequest, setChangeRequest] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const { toast } = useToast();

  // Send verification code mutation
  const sendCodeMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/auth/send-code", { email });
      return res.json();
    },
    onSuccess: () => {
      setShowCodeInput(true);
      toast({
        title: "Code Sent",
        description: "A verification code has been sent to your email address.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code.",
        variant: "destructive",
      });
    },
  });

  // Verify code mutation
  const verifyCodeMutation = useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-code", { email, code });
      return res.json();
    },
    onSuccess: (data) => {
      setAuthState({
        isAuthenticated: true,
        customerEmail: email,
      });
      toast({
        title: "Welcome!",
        description: "You have been successfully logged in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invalid Code",
        description: error.message || "The verification code is incorrect or expired.",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout", {});
      return res.json();
    },
    onSuccess: () => {
      setAuthState({
        isAuthenticated: false,
        customerEmail: null,
      });
      setEmail("");
      setVerificationCode("");
      setShowCodeInput(false);
    },
  });

  // Send change request mutation
  const sendChangeRequestMutation = useMutation({
    mutationFn: async ({ eventId, message }: { eventId: number; message: string }) => {
      const res = await apiRequest("POST", "/api/events/change-request", { 
        eventId, 
        message,
        customerEmail: authState.customerEmail 
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Sent",
        description: "Your change request has been sent to our team. We'll contact you soon!",
      });
      setChangeRequest("");
      setSelectedEventId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch customer events, quotes, and public events (uses session authentication)
  const { data: customerData, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/customer/events"],
    queryFn: async () => {
      const response = await fetch("/api/customer/events", {
        credentials: "include", // Include cookies for session auth
      });
      return response.json();
    },
    enabled: authState.isAuthenticated,
  });

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    sendCodeMutation.mutate(email);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }
    verifyCodeMutation.mutate({ email, code: verificationCode });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F1EB' }}>
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!authState.isAuthenticated ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Access Your Events
                </CardTitle>
                <CardDescription>
                  Enter your email address to view your party bookings and events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showCodeInput ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full text-white"
                      style={{ backgroundColor: '#A1B5C8' }}
                      disabled={sendCodeMutation.isPending}
                    >
                      {sendCodeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Verification Code
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <Input
                        id="code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter the 6-digit code"
                        maxLength={6}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Check your email for the verification code
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full text-white"
                      style={{ backgroundColor: '#A1B5C8' }}
                      disabled={verifyCodeMutation.isPending}
                    >
                      {verifyCodeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Access Events"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => {
                        setShowCodeInput(false);
                        setVerificationCode("");
                      }}
                    >
                      Back to Email
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
                <p className="text-gray-600 mt-2">
                  Welcome back, {authState.customerEmail}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="rounded-full"
              >
                Logout
              </Button>
            </div>

            {/* Events List */}
            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#A1B5C8' }} />
                <span className="ml-2 text-gray-600">Loading your information...</span>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Saved Quotes Section */}
                {customerData?.quotes && customerData.quotes.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Saved Quotes</h2>
                    <div className="space-y-4">
                      {customerData.quotes.map((quote: any) => (
                        <Card key={quote.id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">
                                    {quote.eventType}
                                  </h3>
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    Quote #{quote.quoteNumber}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 mb-2">{quote.description}</p>
                                {quote.location && (
                                  <p className="text-sm text-gray-500">{quote.location}</p>
                                )}
                              </div>
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {quote.eventDate && (
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {new Date(quote.eventDate).toLocaleDateString()}
                                </div>
                              )}
                              <div className="flex items-center text-gray-600">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Estimated: ${(quote.totalAmount / 100).toFixed(2)}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                {quote.startTime && quote.endTime ? `${quote.startTime} - ${quote.endTime}` : 'Time TBD'}
                              </div>
                            </div>
                            
                            <div className="mt-4 flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                data-testid={`button-view-quote-${quote.id}`}
                              >
                                View Details
                              </Button>
                              <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                data-testid={`button-confirm-quote-${quote.id}`}
                              >
                                Confirm Booking
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Confirmed Bookings Section */}
                {customerData?.events && customerData.events.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirmed Bookings</h2>
                    <div className="space-y-4">
                      {customerData.events.map((event: CustomerEvent) => {
                        const remainingBalance = event.totalAmount - event.paidAmount;
                        const eventDate = new Date(event.eventDate);
                        const balanceDueDate = new Date(eventDate);
                        balanceDueDate.setDate(balanceDueDate.getDate() - 7); // Balance due 7 days before event
                        const isExpanded = expandedEvent === event.id;
                        
                        return (
                          <Card key={event.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {event.eventType}
                                  </h3>
                                  <p className="text-gray-600 mb-2">{event.description}</p>
                                  {event.location && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                                <Badge className={getStatusColor(event.status)}>
                                  {getStatusIcon(event.status)}
                                  <span className="ml-1 capitalize">{event.status}</span>
                                </Badge>
                              </div>
                              
                              <Separator className="my-4" />
                              
                              {/* Payment Summary */}
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                      <span className="text-gray-600">Total Amount:</span>
                                      <span className="font-semibold">${(event.totalAmount / 100).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                      <span className="text-gray-600 flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                        Amount Paid:
                                      </span>
                                      <span className="font-semibold text-green-600">${(event.paidAmount / 100).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                                      <span className="text-gray-900 font-medium flex items-center">
                                        {remainingBalance > 0 ? (
                                          <>
                                            <AlertCircle className="h-4 w-4 mr-1 text-orange-600" />
                                            Remaining Balance:
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                            Paid in Full
                                          </>
                                        )}
                                      </span>
                                      <span className={`font-bold ${remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        ${(remainingBalance / 100).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      <span className="font-medium">Event Date:</span>
                                      <span className="ml-2">{eventDate.toLocaleDateString()}</span>
                                    </div>
                                    {remainingBalance > 0 && (
                                      <div className="flex items-center text-sm text-orange-600 font-medium">
                                        <Clock className="h-4 w-4 mr-2" />
                                        <span>Balance Due:</span>
                                        <span className="ml-2">{balanceDueDate.toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Event Details Toggle */}
                              <Button
                                variant="ghost"
                                className="w-full justify-between mb-2"
                                onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                              >
                                <span className="font-medium">Party Details</span>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              
                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="bg-blue-50 rounded-lg p-4 mb-4 space-y-3">
                                  <h4 className="font-semibold text-gray-900 mb-2">Event Information</h4>
                                  {event.guestCount && (
                                    <div className="flex items-center text-sm">
                                      <Users className="h-4 w-4 mr-2 text-gray-600" />
                                      <span className="text-gray-700">
                                        <strong>Guest Count:</strong> {event.guestCount} guests
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center text-sm">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                                    <span className="text-gray-700">
                                      <strong>Date:</strong> {eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                                    <span className="text-gray-700">
                                      <strong>Location:</strong> {event.location || 'Host Hampton'}
                                    </span>
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-blue-200">
                                    <p className="text-sm text-gray-600">
                                      For any questions about your booking, please contact us at{' '}
                                      <a href="tel:631-998-9325" className="text-blue-600 hover:underline">631-998-9325</a>
                                      {' '}or{' '}
                                      <a href="mailto:hosthampton295@gmail.com" className="text-blue-600 hover:underline">
                                        hosthampton295@gmail.com
                                      </a>
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Request Changes Dialog */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSelectedEventId(event.id)}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Request Changes
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Request Changes</DialogTitle>
                                    <DialogDescription>
                                      Send a message to our team about changes you'd like to make to your booking.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <label htmlFor="change-request" className="text-sm font-medium">
                                        What would you like to change?
                                      </label>
                                      <Textarea
                                        id="change-request"
                                        placeholder="e.g., I'd like to add 5 more guests, change the date to March 15th, add extra activities..."
                                        value={changeRequest}
                                        onChange={(e) => setChangeRequest(e.target.value)}
                                        rows={4}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={() => {
                                        if (!changeRequest.trim()) {
                                          toast({
                                            title: "Message Required",
                                            description: "Please describe what you'd like to change.",
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        sendChangeRequestMutation.mutate({ 
                                          eventId: event.id, 
                                          message: changeRequest 
                                        });
                                      }}
                                      disabled={sendChangeRequestMutation.isPending}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      {sendChangeRequestMutation.isPending ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Sending...
                                        </>
                                      ) : (
                                        "Send Request"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Public Events Section */}
                {customerData?.publicEvents && customerData.publicEvents.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Public Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerData.publicEvents.map((event: any) => (
                        <Card key={event.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {event.eventType}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(event.eventDate).toLocaleDateString()}
                              </div>
                              {event.sessionTime && (
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-4 w-4 mr-2" />
                                  {event.sessionTime}
                                </div>
                              )}
                              <div className="flex items-center text-gray-600">
                                <DollarSign className="h-4 w-4 mr-2" />
                                ${(event.price / 100).toFixed(0)}
                                {event.siblingPrice && ` (Siblings: $${(event.siblingPrice / 100).toFixed(0)})`}
                              </div>
                              {event.availableTickets !== null && (
                                <div className="flex items-center text-gray-600">
                                  <span className="mr-2">🎟️</span>
                                  {event.availableTickets} / {event.maxTickets} spots available
                                </div>
                              )}
                            </div>
                            
                            <Button
                              className="w-full mt-4"
                              style={{ backgroundColor: '#A1B5C8' }}
                              data-testid={`button-register-${event.id}`}
                            >
                              Register Now
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Empty State */}
                {(!customerData?.quotes || customerData.quotes.length === 0) &&
                 (!customerData?.events || customerData.events.length === 0) &&
                 (!customerData?.publicEvents || customerData.publicEvents.length === 0) && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Events Found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        You don't have any quotes, bookings, or public events yet.
                      </p>
                      <Button 
                        className="text-white rounded-full"
                        style={{ backgroundColor: '#A1B5C8' }}
                        onClick={() => window.location.href = '/'}
                      >
                        Explore Events
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}