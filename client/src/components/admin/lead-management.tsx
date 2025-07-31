import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, Calendar, DollarSign, Eye, Edit, Send, MessageSquare, UserCheck } from "lucide-react";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  status: string;
  leadScore: string;
  notes: string;
  estimatedCost: number;
  source: string;
  createdAt: string;
  lastContactedAt?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  variables: string[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'quote_requested': return 'bg-yellow-100 text-yellow-800';
    case 'quote_sent': return 'bg-orange-100 text-orange-800';
    case 'follow_up': return 'bg-purple-100 text-purple-800';
    case 'converted': return 'bg-green-100 text-green-800';
    case 'lost': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getLeadScoreColor = (score: string) => {
  switch (score) {
    case 'hot': return 'bg-red-100 text-red-800';
    case 'warm': return 'bg-yellow-100 text-yellow-800';
    case 'cold': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function LeadManagement() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  // Fetch leads
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/leads");
      const data = await response.json();
      return data.success ? data.leads : [];
    }
  });

  // Fetch email templates
  const { data: emailTemplates = [] } = useQuery({
    queryKey: ["/api/email-templates"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/email-templates");
      const data = await response.json();
      return data.success ? data.templates : [];
    }
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: any) => {
      const response = await apiRequest("POST", "/api/send-email", emailData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Email has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setEmailContent('');
      setEmailSubject('');
    },
    onError: (error: any) => {
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email.",
        variant: "destructive",
      });
    },
  });

  // Update lead status mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: number; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/leads/${leadId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lead Updated",
        description: "Lead has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update lead.",
        variant: "destructive",
      });
    },
  });

  // Convert lead to event mutation
  const convertLeadMutation = useMutation({
    mutationFn: async ({ leadId, customerId }: { leadId: number; customerId: number }) => {
      const response = await apiRequest("POST", `/api/leads/${leadId}/convert`, { customerId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lead Converted",
        description: "Lead has been successfully converted to an event.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert lead.",
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = () => {
    if (!selectedLead || !emailSubject || !emailContent) return;

    sendEmailMutation.mutate({
      to: selectedLead.email,
      subject: emailSubject,
      html: emailContent,
      leadId: selectedLead.id,
      templateId: emailTemplate || undefined
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find((t: EmailTemplate) => t.id === templateId);
    if (template && selectedLead) {
      setEmailTemplate(templateId);
      setEmailSubject(template.subject.replace('{{customerName}}', selectedLead.name));
      
      // Replace template variables with lead data
      let content = template.html || '';
      content = content.replace(/{{customerName}}/g, selectedLead.name);
      content = content.replace(/{{eventType}}/g, selectedLead.eventType || 'event');
      content = content.replace(/{{eventDate}}/g, selectedLead.eventDate ? new Date(selectedLead.eventDate).toLocaleDateString() : 'TBD');
      content = content.replace(/{{guestCount}}/g, selectedLead.guestCount?.toString() || 'TBD');
      content = content.replace(/{{totalAmount}}/g, selectedLead.estimatedCost ? (selectedLead.estimatedCost / 100).toFixed(2) : 'TBD');
      
      setEmailContent(content);
    }
  };

  const filteredLeads = leads.filter((lead: Lead) => 
    statusFilter === 'all' || lead.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="quote_requested">Quote Requested</SelectItem>
              <SelectItem value="quote_sent">Quote Sent</SelectItem>
              <SelectItem value="follow_up">Follow Up</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold text-red-600">
                  {leads.filter((l: Lead) => l.leadScore === 'hot').length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-green-600">
                  {leads.filter((l: Lead) => l.status === 'converted').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Pipeline</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${(leads.reduce((sum: number, l: Lead) => sum + (l.estimatedCost || 0), 0) / 100).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead: Lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{lead.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getLeadScoreColor(lead.leadScore)}>
                    {lead.leadScore}
                  </Badge>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{lead.eventDate ? new Date(lead.eventDate).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span>${lead.estimatedCost ? (lead.estimatedCost / 100).toLocaleString() : 'TBD'}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <strong>Event:</strong> {lead.eventType} ({lead.guestCount} guests)
              </div>
              
              {lead.notes && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {lead.notes}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Lead Details: {lead.name}</DialogTitle>
                    </DialogHeader>
                    
                    <Tabs defaultValue="details" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="email">Send Email</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="details" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <Select
                              value={lead.status}
                              onValueChange={(value) => 
                                updateLeadMutation.mutate({ 
                                  leadId: lead.id, 
                                  updates: { status: value } 
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="quote_requested">Quote Requested</SelectItem>
                                <SelectItem value="quote_sent">Quote Sent</SelectItem>
                                <SelectItem value="follow_up">Follow Up</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Lead Score</label>
                            <Select
                              value={lead.leadScore}
                              onValueChange={(value) => 
                                updateLeadMutation.mutate({ 
                                  leadId: lead.id, 
                                  updates: { leadScore: value } 
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hot">Hot</SelectItem>
                                <SelectItem value="warm">Warm</SelectItem>
                                <SelectItem value="cold">Cold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Notes</label>
                          <Textarea
                            value={lead.notes || ''}
                            onChange={(e) => 
                              updateLeadMutation.mutate({ 
                                leadId: lead.id, 
                                updates: { notes: e.target.value } 
                              })
                            }
                            placeholder="Add notes about this lead..."
                            rows={4}
                          />
                        </div>

                        {lead.status !== 'converted' && (
                          <Button
                            onClick={() => convertLeadMutation.mutate({ 
                              leadId: lead.id, 
                              customerId: 1 // This should be dynamic based on customer creation
                            })}
                            className="w-full"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Convert to Event
                          </Button>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="email" className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Email Template</label>
                          <Select value={emailTemplate} onValueChange={handleTemplateSelect}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a template..." />
                            </SelectTrigger>
                            <SelectContent>
                              {emailTemplates.map((template: EmailTemplate) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Subject</label>
                          <Input
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Email subject..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Message</label>
                          <Textarea
                            value={emailContent}
                            onChange={(e) => setEmailContent(e.target.value)}
                            placeholder="Email content..."
                            rows={8}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleSendEmail}
                          disabled={sendEmailMutation.isPending || !emailSubject || !emailContent}
                          className="w-full"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="history">
                        <div className="text-center text-gray-500 py-8">
                          Email history feature coming soon...
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateLeadMutation.mutate({
                      leadId: lead.id,
                      updates: { status: 'quote_requested' }
                    });
                  }}
                  disabled={lead.status === 'converted'}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Update
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    window.location.href = `/admin-dashboard/invoice/create?leadId=${lead.id}`;
                  }}
                  disabled={lead.status === 'converted'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Create Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-2 text-gray-600">Loading leads...</p>
        </div>
      )}

      {!isLoading && filteredLeads.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No leads found.</p>
        </div>
      )}
    </div>
  );
}