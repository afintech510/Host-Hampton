import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LeadManagement from "@/components/admin/lead-management";
import EventCalendar from "@/components/admin/event-calendar";
import EventDetailsDialog from "@/components/admin/event-details-dialog";
import InvoiceDetailsDialog from "@/components/admin/invoice-details-dialog";
import InvoiceCreationDialog from "@/components/admin/invoice-creation-dialog";
import NewEventPanel from "@/components/admin/new-event-dialog";
import { 
  Calendar, 
  Users, 
  FileText, 
  DollarSign, 
  Clock, 
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1753333962128.png";

interface Event {
  id: number;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: string;
  customerId: number;
  eventTypeId: number;
  guestCount: number;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  customerName?: string;
  eventTypeName?: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  taxAmount: number;
  depositAmount: number;
  balanceDue: number;
  status: string;
  dueDate: string;
  customerName?: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  createdAt: string;
  eventType?: string;
  notes?: string;
}

interface StaffMember {
  id: number;
  name: string;
  role: string;
  hourlyRate: number;
  active: boolean;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [eventViewMode, setEventViewMode] = useState<"list" | "calendar">("list");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [eventDialogMode, setEventDialogMode] = useState<"view" | "edit">("view");
  const [invoiceDialogMode, setInvoiceDialogMode] = useState<"view" | "edit">("view");
  const [showNewEventPanel, setShowNewEventPanel] = useState(false);
  const [showInvoiceCreationDialog, setShowInvoiceCreationDialog] = useState(false);
  const [invoiceEditData, setInvoiceEditData] = useState<any>(null);

  // Fetch dashboard data
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/events");
      const data = await response.json();
      return data.success ? data.events : [];
    }
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/invoices");
      const data = await response.json();
      return data.success ? data.invoices : [];
    }
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/leads");
      const data = await response.json();
      return data.success ? data.leads : [];
    }
  });

  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/staff");
      const data = await response.json();
      return data.success ? data.staff : [];
    }
  });

  // Calculate stats
  const upcomingEvents = events.filter((event: Event) => 
    new Date(event.eventDate) >= new Date() && event.status !== 'cancelled'
  ).length;

  const totalRevenue = invoices.reduce((sum: number, invoice: Invoice) => 
    sum + (invoice.totalAmount / 100), 0
  );

  const pendingInvoices = invoices.filter((invoice: Invoice) => 
    invoice.status === 'pending'
  ).length;

  const newLeads = leads.filter((lead: Lead) => 
    lead.status === 'new' || lead.status === 'contacted'
  ).length;

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'converted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={hostHamptonLogo} 
                alt="Host Hampton" 
                className="h-12 md:h-14 w-auto object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowNewEventPanel(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-slate-100">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Events</TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Invoices</TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Leads</TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Staff</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingEvents}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingInvoices}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{newLeads}</div>
                  <p className="text-xs text-muted-foreground">To follow up</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.slice(0, 5).map((event: Event) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{event.customerName || `Event #${event.id}`}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(event.eventDate).toLocaleDateString()} at {event.startTime}
                          </p>
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status || 'pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leads.slice(0, 5).map((lead: Lead) => (
                      <div key={lead.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-gray-600">{lead.email}</p>
                        </div>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status || 'new'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {showNewEventPanel ? (
              <div className="space-y-4">
                <NewEventPanel onClose={() => setShowNewEventPanel(false)} />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Event Management</h2>
                  <div className="flex items-center space-x-2">
                    <div className="flex rounded-md shadow-sm">
                      <button
                        onClick={() => setEventViewMode("list")}
                        className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                          eventViewMode === "list"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        List View
                      </button>
                      <button
                        onClick={() => setEventViewMode("calendar")}
                        className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                          eventViewMode === "calendar"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Calendar View
                      </button>
                    </div>
                    <Button onClick={() => setShowNewEventPanel(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Event
                    </Button>
                  </div>
                </div>

                {eventViewMode === "calendar" ? (
                  <EventCalendar />
                ) : (
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
                                Estimated Cost
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {eventsLoading ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-4 text-center">
                                  <div className="animate-spin w-6 h-6 border-4 border-blue-300 border-t-transparent rounded-full mx-auto" />
                                </td>
                              </tr>
                            ) : events.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                  No events found
                                </td>
                              </tr>
                            ) : (
                              events.map((event: Event) => (
                                <tr key={event.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">Event #{event.id}</div>
                                      <div className="text-sm text-gray-500">{event.guestCount} guests</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBD'}
                                    <br />
                                    <span className="text-gray-500">
                                      {event.startTime} - {event.endTime}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge className={getStatusColor(event.status)}>
                                      {event.status || 'pending'}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="font-medium text-gray-900">
                                      ${(event.estimatedCost ? event.estimatedCost / 100 : 0).toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                          setSelectedEventId(event.id);
                                          setEventDialogMode("view");
                                        }}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                          setSelectedEventId(event.id);
                                          setEventDialogMode("edit");
                                        }}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Invoice Management</h2>
              <Button
                onClick={() => {
                  setInvoiceEditData(null);
                  setShowInvoiceCreationDialog(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance Due
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoicesLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center">
                            <div className="animate-spin w-6 h-6 border-4 border-blue-300 border-t-transparent rounded-full mx-auto" />
                          </td>
                        </tr>
                      ) : invoices.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            No invoices found
                          </td>
                        </tr>
                      ) : (
                        invoices.map((invoice: any) => (
                          <tr key={invoice.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{invoice.clientName || invoice.customerName || 'Unknown Customer'}</div>
                              <div className="text-sm text-gray-500">{invoice.customerEmail || ''}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{invoice.eventTypeName || 'Event'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              ${(invoice.total ? invoice.total / 100 : 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-medium ${invoice.balanceDue && invoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ${(invoice.balanceDue ? invoice.balanceDue / 100 : 0).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {invoice.eventDate ? new Date(invoice.eventDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInvoiceId(invoice.id);
                                    setInvoiceDialogMode("view");
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setInvoiceEditData(invoice);
                                    setShowInvoiceCreationDialog(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads/Inquiries Tab */}
          <TabsContent value="leads" className="space-y-6">
            <LeadManagement />
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Staff Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffLoading ? (
                <div className="col-span-full text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-300 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : staff.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">
                  No staff members found
                </div>
              ) : (
                staff.map((member: StaffMember) => (
                  <Card key={member.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                        <Badge variant={member.active ? "default" : "secondary"}>
                          {member.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hourly Rate:</span>
                          <span className="text-sm font-medium">${member.hourlyRate}/hr</span>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Clock className="w-4 h-4 mr-2" />
                            Schedule
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Event Details Dialog */}
        <EventDetailsDialog
          eventId={selectedEventId}
          isOpen={!!selectedEventId}
          onClose={() => setSelectedEventId(null)}
          mode={eventDialogMode}
        />

        {/* Invoice Details Dialog */}
        <InvoiceDetailsDialog
          invoiceId={selectedInvoiceId}
          isOpen={!!selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
          mode={invoiceDialogMode}
        />

        {/* Invoice Creation Dialog */}
        <InvoiceCreationDialog
          isOpen={showInvoiceCreationDialog}
          onClose={() => {
            setShowInvoiceCreationDialog(false);
            setInvoiceEditData(null);
          }}
          mode={invoiceEditData ? 'edit' : 'create'}
          invoiceId={invoiceEditData?.id || null}
          lead={null}
          onSuccess={() => {
            setShowInvoiceCreationDialog(false);
            setInvoiceEditData(null);
          }}
        />


      </div>
    </div>
  );
}