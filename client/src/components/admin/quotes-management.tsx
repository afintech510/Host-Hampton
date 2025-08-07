import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Eye, 
  Edit, 
  Copy, 
  Search, 
  Calendar,
  DollarSign,
  Users,
  Clock,
  Filter,
  ArrowUpDown,
  ExternalLink,
  FileText,
  Lock,
  Unlock
} from "lucide-react";
import { format } from "date-fns";
import { generateBookingId } from "@/lib/id-generator";

interface Quote {
  id: number;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  partyTheme?: string;
  guestCount?: number;
  estimatedCost?: number;
  status: string;
  createdAt: string;
  formData?: any;
  isLocked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export default function QuotesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all leads/quotes
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/leads");
      const data = await response.json();
      return data.success ? data.leads : [];
    }
  });

  // Lock quote mutation
  const lockQuoteMutation = useMutation({
    mutationFn: async ({ quoteId, lockedBy }: { quoteId: number; lockedBy: string }) => {
      const response = await apiRequest("POST", `/api/leads/${quoteId}/lock`, {
        lockedBy
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Quote Locked",
        description: `Quote has been locked for editing.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lock Failed",
        description: error.message || "Failed to lock quote",
        variant: "destructive",
      });
    }
  });

  // Unlock quote mutation
  const unlockQuoteMutation = useMutation({
    mutationFn: async ({ quoteId, unlockedBy }: { quoteId: number; unlockedBy: string }) => {
      const response = await apiRequest("POST", `/api/leads/${quoteId}/unlock`, {
        unlockedBy
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Quote Unlocked",
        description: `Quote has been unlocked and is available for editing.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unlock Failed",
        description: error.message || "Failed to unlock quote",
        variant: "destructive",
      });
    }
  });

  // Get quote type from lead data
  const getQuoteType = (quote: Quote) => {
    const formData = quote.formData || {};
    
    if (formData.eventType === 'birthday-party' || quote.eventType === 'kids-party') {
      return 'theme';
    } else if (formData.eventType === 'trucker-hat-party' || quote.eventType === 'trucker-hat') {
      return 'hat';
    } else if (formData.eventType === 'studio-rental' || quote.eventType === 'studio-rental') {
      return 'studio';
    } else if (formData.eventType === 'permanent-jewelry' || quote.eventType === 'permanent-jewelry') {
      return 'jewelry';
    }
    return 'other';
  };

  // Generate secure booking URL for quote
  const generateQuoteUrl = (quote: Quote) => {
    const type = getQuoteType(quote);
    const randomId = generateBookingId();
    
    const baseUrls = {
      theme: '/my-theme-party',
      hat: '/my-trucker-hat', 
      studio: '/my-studio-rental',
      jewelry: '/my-permanent-jewelry'
    };
    
    const baseUrl = baseUrls[type as keyof typeof baseUrls] || '/my-theme-party';
    return `${window.location.origin}${baseUrl}/${randomId}?leadId=${quote.id}`;
  };

  // Copy quote URL to clipboard
  const copyQuoteUrl = async (quote: Quote) => {
    const url = generateQuoteUrl(quote);
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL Copied",
        description: "Quote booking URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed", 
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  // Open quote URL in new tab
  const openQuoteUrl = (quote: Quote) => {
    const url = generateQuoteUrl(quote);
    window.open(url, '_blank');
  };

  // Filter and sort quotes
  const filteredQuotes = quotes
    .filter((quote: Quote) => {
      const matchesSearch = quote.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.phone?.includes(searchTerm);
      
      const matchesType = typeFilter === "all" || getQuoteType(quote) === typeFilter;
      const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a: Quote, b: Quote) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "cost":
          comparison = (a.estimatedCost || 0) - (b.estimatedCost || 0);
          break;
        case "guests":
          comparison = (a.guestCount || 0) - (b.guestCount || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "desc" ? -comparison : comparison;
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'theme': return '🎉';
      case 'hat': return '🧢'; 
      case 'studio': return '🏢';
      case 'jewelry': return '💍';
      default: return '📋';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'theme': return 'bg-pink-100 text-pink-800';
      case 'hat': return 'bg-blue-100 text-blue-800';
      case 'studio': return 'bg-purple-100 text-purple-800';
      case 'jewelry': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLockQuote = (quote: Quote) => {
    const currentUser = "Admin"; // In a real app, this would come from auth context
    lockQuoteMutation.mutate({ quoteId: quote.id, lockedBy: currentUser });
  };

  const handleUnlockQuote = (quote: Quote) => {
    const currentUser = "Admin"; // In a real app, this would come from auth context
    unlockQuoteMutation.mutate({ quoteId: quote.id, unlockedBy: currentUser });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quotes Management</h2>
          <p className="text-gray-600">Manage customer quotes and booking requests</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {filteredQuotes.length} quotes
        </Badge>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="theme">🎉 Theme Parties</SelectItem>
                <SelectItem value="hat">🧢 Trucker Hat</SelectItem>
                <SelectItem value="studio">🏢 Studio Rental</SelectItem>
                <SelectItem value="jewelry">💍 Permanent Jewelry</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Created</SelectItem>
                <SelectItem value="name">Customer Name</SelectItem>
                <SelectItem value="cost">Estimated Cost</SelectItem>
                <SelectItem value="guests">Guest Count</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading quotes...</span>
              </div>
            </CardContent>
          </Card>
        ) : filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "No quote requests yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote: Quote) => {
            const quoteType = getQuoteType(quote);
            return (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {quote.name || "Unknown Customer"}
                        </h3>
                        <Badge className={getTypeBadgeColor(quoteType)}>
                          {getTypeIcon(quoteType)} {quoteType.charAt(0).toUpperCase() + quoteType.slice(1)}
                        </Badge>
                        <Badge className={getStatusBadgeColor(quote.status)}>
                          {quote.status}
                        </Badge>
                        {quote.isLocked && (
                          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(quote.createdAt), 'MMM d, yyyy')}
                        </div>
                        
                        {quote.guestCount && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {quote.guestCount} guests
                          </div>
                        )}
                        
                        {quote.estimatedCost && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${(quote.estimatedCost / 100).toFixed(2)}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {quote.email || quote.phone || "No contact"}
                        </div>
                      </div>

                      {quote.partyTheme && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Theme:</span> {quote.partyTheme}
                        </div>
                      )}
                      
                      {quote.isLocked && (
                        <div className="mt-2 text-sm text-red-600">
                          <Lock className="h-3 w-3 inline mr-1" />
                          <span className="font-medium">Locked by {quote.lockedBy}</span>
                          {quote.lockedAt && (
                            <span className="text-gray-500"> on {format(new Date(quote.lockedAt), 'MMM d, h:mm a')}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* Lock/Unlock Button */}
                      {quote.isLocked ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlockQuote(quote)}
                          disabled={unlockQuoteMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLockQuote(quote)}
                          disabled={lockQuoteMutation.isPending}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedQuote(quote);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm" 
                        onClick={() => openQuoteUrl(quote)}
                        disabled={quote.isLocked}
                        title={quote.isLocked ? `Quote is locked by ${quote.lockedBy}` : "Open booking page"}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyQuoteUrl(quote)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Quote Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Customer Name</label>
                  <p className="text-sm text-gray-600">{selectedQuote.name || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Quote Type</label>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeBadgeColor(getQuoteType(selectedQuote))}>
                      {getTypeIcon(getQuoteType(selectedQuote))} {getQuoteType(selectedQuote)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-gray-600">{selectedQuote.email || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-gray-600">{selectedQuote.phone || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={getStatusBadgeColor(selectedQuote.status)}>
                    {selectedQuote.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedQuote.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Lock Status</label>
                  {selectedQuote.isLocked ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Locked by {selectedQuote.lockedBy}
                      </Badge>
                      {selectedQuote.lockedAt && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(selectedQuote.lockedAt), 'MMM d, h:mm a')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <Unlock className="h-3 w-3" />
                      Available
                    </Badge>
                  )}
                </div>
              </div>

              {selectedQuote.formData && (
                <div>
                  <label className="text-sm font-medium">Quote Details</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedQuote.formData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyQuoteUrl(selectedQuote)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Booking URL
                  </Button>
                  
                  {selectedQuote.isLocked ? (
                    <Button
                      variant="outline"
                      onClick={() => handleUnlockQuote(selectedQuote)}
                      disabled={unlockQuoteMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock Quote
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleLockQuote(selectedQuote)}
                      disabled={lockQuoteMutation.isPending}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Lock Quote
                    </Button>
                  )}
                </div>
                
                <Button
                  onClick={() => openQuoteUrl(selectedQuote)}
                  disabled={selectedQuote.isLocked}
                  title={selectedQuote.isLocked ? `Quote is locked by ${selectedQuote.lockedBy}` : "Open booking page"}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Booking Page
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}