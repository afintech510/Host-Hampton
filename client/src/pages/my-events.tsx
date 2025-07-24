import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, Clock, DollarSign, CheckCircle, XCircle, Loader2 } from "lucide-react";
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
}

interface AuthState {
  isAuthenticated: boolean;
  customerEmail: string | null;
  customerId: number | null;
}

export default function MyEvents() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    customerEmail: null,
    customerId: null,
  });
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
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
        customerId: data.customerId,
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

  // Fetch customer events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/customer/events", authState.customerId],
    enabled: authState.isAuthenticated && !!authState.customerId,
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
    setAuthState({
      isAuthenticated: false,
      customerEmail: null,
      customerId: null,
    });
    setEmail("");
    setVerificationCode("");
    setShowCodeInput(false);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
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
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
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
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
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
                      className="w-full"
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
                <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                <span className="ml-2 text-gray-600">Loading your events...</span>
              </div>
            ) : (events as any)?.events?.length > 0 ? (
              <div className="space-y-6">
                {(events as any).events.map((event: CustomerEvent) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {event.eventType}
                          </h3>
                          <p className="text-gray-600 mb-2">{event.description}</p>
                          {event.location && (
                            <p className="text-sm text-gray-500">{event.location}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {getStatusIcon(event.status)}
                          <span className="ml-1 capitalize">{event.status}</span>
                        </Badge>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(event.eventDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Total: ${(event.totalAmount / 100).toFixed(2)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Paid: ${(event.paidAmount / 100).toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Events Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any events or bookings yet.
                  </p>
                  <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full">
                    Book Your First Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}