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
import { Mail, Phone, Calendar, DollarSign, Eye, Edit, Send, MessageSquare, UserCheck, LayoutGrid, Table, Save, X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// Import Lead type from schema
import type { Lead } from "@/../../shared/schema";

// Import types from our new type-safe interfaces
import { 
  InvoiceItem, 
  InvoiceFormData, 
  LocationType, 
  MobileAddress, 
  PredefinedItem,
  InvoiceCreatePayload,
  toCents,
  formatCurrency,
  calculateInvoiceTotal
} from "@/../../shared/types/invoice";
import { 
  LeadStatus, 
  LeadFilters,
  calculateLeadAge,
  formatLeadEventDate,
  getLeadPriorityColor,
  getStatusColor
} from "@/../../shared/types/lead";
import { 
  populateInvoiceFromLead,
  createInitialInvoiceItems,
  validateInvoiceItems,
  createPredefinedItems
} from "@/../../shared/utils/invoice";
import type { 
  EmailTemplate,
  DashboardStats 
} from "@/../../shared/types/admin";

// Remove duplicate interfaces and helper functions - now using imported types

export default function LeadManagement() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [invoiceMode, setInvoiceMode] = useState(false);
  const [selectedInvoiceLead, setSelectedInvoiceLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<Lead>>({});
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
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

  const handleEditLead = (leadId: number) => {
    const lead = leads.find((l: Lead) => l.id === leadId);
    if (lead) {
      setEditingLead(leadId);
      setEditingData(lead);
    }
  };

  const handleSaveLead = async () => {
    if (!editingLead || !editingData) return;
    
    try {
      await updateLeadMutation.mutateAsync({
        leadId: editingLead,
        updates: editingData
      });
      setEditingLead(null);
      setEditingData({});
    } catch (error) {
      console.error('Failed to save lead:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingLead(null);
    setEditingData({});
  };

  const handleInvoiceMode = (lead: Lead) => {
    setSelectedInvoiceLead(lead);
    setCurrentLeadIndex(filteredLeads.findIndex((l: Lead) => l.id === lead.id));
    setInvoiceMode(true);
  };

  const handleNextLead = () => {
    const nextIndex = (currentLeadIndex + 1) % filteredLeads.length;
    setCurrentLeadIndex(nextIndex);
    setSelectedInvoiceLead(filteredLeads[nextIndex]);
  };

  const handlePrevLead = () => {
    const prevIndex = currentLeadIndex === 0 ? filteredLeads.length - 1 : currentLeadIndex - 1;
    setCurrentLeadIndex(prevIndex);
    setSelectedInvoiceLead(filteredLeads[prevIndex]);
  };

  if (invoiceMode && selectedInvoiceLead) {
    return <InvoiceCreationInterface 
      lead={selectedInvoiceLead}
      onBack={() => setInvoiceMode(false)}
      onNext={handleNextLead}
      onPrev={handlePrevLead}
      hasNext={currentLeadIndex < filteredLeads.length - 1}
      hasPrev={currentLeadIndex > 0}
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
        <div className="flex items-center gap-4">
          {/* View Mode Selector */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-8"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8"
            >
              <Table className="w-4 h-4" />
            </Button>
          </div>
          
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

      {/* Content based on view mode */}
      {viewMode === 'cards' ? (
        <EnhancedLeadCards 
          leads={filteredLeads}
          editingLead={editingLead}
          editingData={editingData}
          onEdit={handleEditLead}
          onSave={handleSaveLead}
          onCancel={handleCancelEdit}
          onInvoice={handleInvoiceMode}
          onUpdateEditingData={setEditingData}
          updateLeadMutation={updateLeadMutation}
        />
      ) : (
        <LeadTable 
          leads={filteredLeads}
          onEdit={handleEditLead}
          onInvoice={handleInvoiceMode}
        />
      )}

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

// Enhanced Lead Cards Component
function EnhancedLeadCards({ 
  leads, 
  editingLead, 
  editingData, 
  onEdit, 
  onSave, 
  onCancel, 
  onInvoice, 
  onUpdateEditingData,
  updateLeadMutation 
}: {
  leads: Lead[];
  editingLead: number | null;
  editingData: Partial<Lead>;
  onEdit: (leadId: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onInvoice: (lead: Lead) => void;
  onUpdateEditingData: (data: Partial<Lead>) => void;
  updateLeadMutation: any;
}) {
  // Helper function to format time to AM/PM
  const formatTimeToAMPM = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to render event-specific details based on formData
  const renderEventDetails = (lead: Lead) => {
    let formData = {};
    try {
      formData = lead.formData ? JSON.parse(lead.formData as string) : {};
    } catch (e) {
      formData = {};
    }

    const details = [];

    // Common details
    if (lead.eventType) details.push(<div key="event"><strong>Event:</strong> {lead.eventType}</div>);
    if (lead.eventDescription || (formData as any).eventDescription) {
      details.push(<div key="desc"><strong>Description:</strong> {lead.eventDescription || (formData as any).eventDescription}</div>);
    }
    if (lead.eventLocation || (formData as any).eventLocation) {
      details.push(<div key="location"><strong>Location:</strong> {lead.eventLocation || (formData as any).eventLocation}</div>);
    }

    // Time details with AM/PM format
    if (lead.startTime && lead.endTime) {
      details.push(<div key="time"><strong>Time:</strong> {formatTimeToAMPM(lead.startTime)} - {formatTimeToAMPM(lead.endTime)}</div>);
    } else if ((formData as any).startTime && (formData as any).endTime) {
      details.push(<div key="time-form"><strong>Time:</strong> {formatTimeToAMPM((formData as any).startTime)} - {formatTimeToAMPM((formData as any).endTime)}</div>);
    }

    // Guest counts
    if (lead.guestCount || (formData as any).guestCount) details.push(<div key="guests"><strong>Guests:</strong> {lead.guestCount || (formData as any).guestCount}</div>);
    if (lead.adultCount || (formData as any).adultCount) details.push(<div key="adults"><strong>Adults:</strong> {lead.adultCount || (formData as any).adultCount}</div>);
    if (lead.childCount || (formData as any).childCount) details.push(<div key="children"><strong>Children:</strong> {lead.childCount || (formData as any).childCount}</div>);
    if (lead.attendeeCount || (formData as any).attendeeCount || (formData as any).expectedAttendees) {
      details.push(<div key="attendees"><strong>Attendees:</strong> {lead.attendeeCount || (formData as any).attendeeCount || (formData as any).expectedAttendees}</div>);
    }

    // Event type specific details - handle both "birthday-party" and "kids-party" 
    if (lead.eventType === 'birthday-party' || lead.eventType === 'kids-party' || (formData as any).eventType === 'birthday-party') {
      if (lead.childName || (formData as any).childName) details.push(<div key="child"><strong>Child:</strong> {lead.childName || (formData as any).childName}</div>);
      if (lead.childAge || (formData as any).childAge) details.push(<div key="age"><strong>Age:</strong> {lead.childAge || (formData as any).childAge}</div>);
      if (lead.partyTheme || (formData as any).partyTheme) details.push(<div key="theme"><strong>Theme:</strong> {lead.partyTheme || (formData as any).partyTheme}</div>);
      if (lead.packageSelection || (formData as any).partyPackage) details.push(<div key="package"><strong>Package:</strong> {lead.packageSelection || (formData as any).partyPackage}</div>);
      if (lead.packageTotal) details.push(<div key="package-total"><strong>Package Total:</strong> ${(lead.packageTotal / 100).toFixed(2)}</div>);
      if (lead.foodPreferences?.foodChoice || (formData as any).foodChoice) details.push(<div key="food"><strong>Food:</strong> {lead.foodPreferences?.foodChoice || (formData as any).foodChoice}</div>);
      if (lead.foodPreferences?.cupcakeFlavor || (formData as any).cupcakeFlavor) details.push(<div key="cupcake"><strong>Cupcake:</strong> {lead.foodPreferences?.cupcakeFlavor || (formData as any).cupcakeFlavor}</div>);
      if (lead.selectedAddons && Array.isArray(lead.selectedAddons) && lead.selectedAddons.length > 0) {
        details.push(<div key="addons"><strong>Add-ons:</strong> {lead.selectedAddons.map((addon: any) => addon.name || addon).join(', ')}</div>);
      } else if ((formData as any).partyAddons && Array.isArray((formData as any).partyAddons) && (formData as any).partyAddons.length > 0) {
        details.push(<div key="addons"><strong>Add-ons:</strong> {(formData as any).partyAddons.join(', ')}</div>);
      }
      if (lead.specialRequirements && Array.isArray(lead.specialRequirements) && lead.specialRequirements.length > 0) {
        details.push(<div key="special"><strong>Special Needs:</strong> {lead.specialRequirements.join(', ')}</div>);
      } else if ((formData as any).specialNeeds && Array.isArray((formData as any).specialNeeds) && (formData as any).specialNeeds.length > 0) {
        details.push(<div key="special"><strong>Special Needs:</strong> {(formData as any).specialNeeds.join(', ')}</div>);
      }
      if (lead.dateNotes) details.push(<div key="date-notes"><strong>Date Notes:</strong> {lead.dateNotes}</div>);
    }

    if (lead.eventType === 'workshop') {
      if (lead.workshopType || (formData as any).workshopType) details.push(<div key="workshop-type"><strong>Workshop:</strong> {lead.workshopType || (formData as any).workshopType}</div>);
      if (lead.classFormat || (formData as any).classFormat) details.push(<div key="format"><strong>Format:</strong> {lead.classFormat || (formData as any).classFormat}</div>);
      if (lead.scheduleNotes || (formData as any).scheduleNotes) details.push(<div key="schedule"><strong>Schedule:</strong> {lead.scheduleNotes || (formData as any).scheduleNotes}</div>);
      if ((formData as any).workshopDescription) details.push(<div key="workshop-desc"><strong>Description:</strong> {(formData as any).workshopDescription}</div>);
    }

    if (lead.eventType === 'permanent-jewelry') {
      if (lead.jewelryPieces && Array.isArray(lead.jewelryPieces)) {
        details.push(<div key="jewelry"><strong>Jewelry:</strong> {lead.jewelryPieces.join(', ')}</div>);
      } else if ((formData as any).selectedJewelryPieces && Array.isArray((formData as any).selectedJewelryPieces)) {
        details.push(<div key="jewelry"><strong>Jewelry:</strong> {(formData as any).selectedJewelryPieces.join(', ')}</div>);
      }
      if (lead.attendeeCount || (formData as any).jewelryPeopleCount) details.push(<div key="jewelry-people"><strong>People:</strong> {lead.attendeeCount || (formData as any).jewelryPeopleCount}</div>);
      if (lead.jewelryVision || (formData as any).jewelryVision) details.push(<div key="jewelry-vision"><strong>Vision:</strong> {lead.jewelryVision || (formData as any).jewelryVision}</div>);
    }

    if (lead.eventType === 'studio-rental') {
      if (lead.studioUsage || (formData as any).studioUsage) details.push(<div key="usage"><strong>Usage:</strong> {lead.studioUsage || (formData as any).studioUsage}</div>);
      if ((formData as any).studioSubType) details.push(<div key="subtype"><strong>Type:</strong> {(formData as any).studioSubType}</div>);
      if (lead.scheduleNotes || (formData as any).studioTimeNotes) details.push(<div key="time-notes"><strong>Notes:</strong> {lead.scheduleNotes || (formData as any).studioTimeNotes}</div>);
    }

    if (lead.eventType === 'trucker-hat' || lead.eventType === 'diy-party') {
      if (lead.pricingDetails || (formData as any).rentalPricing) {
        const pricing = lead.pricingDetails || (formData as any).rentalPricing;
        if (pricing.basePrice) details.push(<div key="base-price"><strong>Base Price:</strong> ${(pricing.basePrice / 100).toFixed(2)}</div>);
        if (pricing.hours) details.push(<div key="hours"><strong>Duration:</strong> {pricing.hours} hours</div>);
      }
      if (lead.scheduleNotes || (formData as any).unsureDetails) details.push(<div key="date-uncertainty"><strong>Date Notes:</strong> {lead.scheduleNotes || (formData as any).unsureDetails}</div>);
    }

    // Questions/Messages
    if ((formData as any).questions) details.push(<div key="questions"><strong>Questions:</strong> {(formData as any).questions}</div>);
    if ((formData as any).message) details.push(<div key="message"><strong>Message:</strong> {(formData as any).message}</div>);

    return details;
  };

  return (
    <div className={editingLead ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
      {leads.map((lead: Lead) => {
        const isEditing = editingLead === lead.id;
        const currentData = isEditing ? editingData : lead;
        
        return (
          <Card key={lead.id} className={`hover:shadow-md transition-all ${isEditing ? 'ring-2 ring-blue-500 md:col-span-2 lg:col-span-3' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {isEditing ? (
                  <Input
                    value={currentData.name || ''}
                    onChange={(e) => onUpdateEditingData({ ...editingData, name: e.target.value })}
                    className="text-lg font-semibold"
                  />
                ) : (
                  <CardTitle className="text-lg">{lead.name}</CardTitle>
                )}
                <div className="flex gap-2">
                  <Badge className={getLeadPriorityColor(lead.leadScore as any)}>
                    {lead.leadScore}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Contact Information */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {isEditing ? (
                    <Input
                      value={currentData.email || ''}
                      onChange={(e) => onUpdateEditingData({ ...editingData, email: e.target.value })}
                      className="text-sm"
                    />
                  ) : (
                    <span>{lead.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {isEditing ? (
                    <Input
                      value={currentData.phone || ''}
                      onChange={(e) => onUpdateEditingData({ ...editingData, phone: e.target.value })}
                      className="text-sm"
                    />
                  ) : (
                    <span>{lead.phone}</span>
                  )}
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
              
              {/* Event Details */}
              <div className="text-sm text-gray-600 space-y-1">
                {renderEventDetails(lead)}
              </div>
              
              {/* Notes */}
              {(lead.notes || isEditing) && (
                <div className="text-sm text-gray-600">
                  {isEditing ? (
                    <Textarea
                      value={currentData.notes || ''}
                      onChange={(e) => onUpdateEditingData({ ...editingData, notes: e.target.value })}
                      placeholder="Add notes..."
                      rows={3}
                    />
                  ) : (
                    <div className="bg-gray-50 p-2 rounded">
                      {lead.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCancel}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={onSave}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onSave();
                        setTimeout(() => onInvoice(lead), 100);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Save & Invoice
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(lead.id)}
                      disabled={lead.status === 'converted'}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Update
                    </Button>
                    
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onInvoice(lead)}
                      disabled={lead.status === 'converted'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Invoice
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Lead Table Component
function LeadTable({ leads, onEdit, onInvoice }: {
  leads: Lead[];
  onEdit: (leadId: number) => void;
  onInvoice: (lead: Lead) => void;
}) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Event Type</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Guests</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Value</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-500">{lead.email}</div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{lead.eventType}</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {lead.eventDate ? new Date(lead.eventDate).toLocaleDateString() : 'TBD'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {lead.guestCount || lead.adultCount || lead.attendeeCount || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                ${lead.estimatedCost ? (lead.estimatedCost / 100).toLocaleString() : 'TBD'}
              </td>
              <td className="px-4 py-3">
                <Badge className={getStatusColor(lead.status as LeadStatus)}>
                  {lead.status.replace('_', ' ')}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(lead.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onInvoice(lead)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Invoice Creation Interface - 3 Panel Layout
function InvoiceCreationInterface({ 
  lead, 
  onBack, 
  onNext, 
  onPrev, 
  hasNext, 
  hasPrev 
}: {
  lead: Lead;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}) {
  const [leadData, setLeadData] = useState(lead);
  const [locationType, setLocationType] = useState<'host-hampton' | 'mobile'>('host-hampton');
  const [mobileAddress, setMobileAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: ''
  });
  
  // Calculate due date as day before event
  const calculateDueDate = (eventDate: string) => {
    if (!eventDate) return '';
    const event = new Date(eventDate);
    const due = new Date(event);
    due.setDate(due.getDate() - 1);
    return due.toISOString().split('T')[0];
  };

  // Format date for HTML input (handle both Date objects and strings)
  const formatDateForInput = (date: string | Date | null) => {
    if (!date) return '';
    if (typeof date === 'string') {
      // If it's already a string, try to parse and format it
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return '';
      return parsed.toISOString().split('T')[0];
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  };

  const [invoiceData, setInvoiceData] = useState({
    clientName: lead.name,
    clientPhone: lead.phone,
    clientEmail: lead.email,
    eventDate: formatDateForInput(lead.eventDate),
    eventDetails: `${lead.eventType} for ${lead.name}`,
    eventStartTime: lead.startTime || '10:00',
    eventEndTime: lead.endTime || '12:00',
    eventLocation: locationType === 'host-hampton' ? 'Host Hampton, Speonk NY' : `${mobileAddress.street}, ${mobileAddress.city}, ${mobileAddress.state} ${mobileAddress.zip}`,
    depositAmount: 200,
    dueDate: calculateDueDate(formatDateForInput(lead.eventDate)),
    status: 'draft'
  });

  // Start with editable basic invoice item, not locked to quote price
  const [invoiceItems, setInvoiceItems] = useState([
    {
      id: Date.now(),
      type: 'custom',
      itemId: 'custom',
      description: `${lead.eventType}${lead.guestCount ? ` (${lead.guestCount} guests)` : ''}`,
      quantity: 1,
      unitPrice: 875, // Start with base price, not locked quote
      total: 875,
      isCustom: true,
      customDescription: `${lead.eventType}${lead.guestCount ? ` (${lead.guestCount} guests)` : ''}`
    }
  ]);

  // Fetch predefined items
  const { data: partyThemes = [] } = useQuery({
    queryKey: ["/api/party-themes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/party-themes");
      const data = await response.json();
      return data.success ? data.themes : [];
    }
  });

  const { data: addons = [] } = useQuery({
    queryKey: ["/api/addons"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/addons");
      const data = await response.json();
      return data.success ? data.addons : [];
    }
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["/api/packages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/packages");
      const data = await response.json();
      return data.success ? data.packages : [];
    }
  });

  // Combine all predefined items
  const predefinedItems = [
    { value: 'custom', label: 'Custom Item', price: 0, type: 'custom' },
    ...partyThemes.map((theme: any) => ({ 
      value: `theme-${theme.id}`, 
      label: theme.name, 
      price: theme.price / 100, 
      type: 'theme' 
    })),
    ...addons.map((addon: any) => ({ 
      value: `addon-${addon.id}`, 
      label: addon.name, 
      price: addon.price / 100, 
      type: 'addon' 
    })),
    ...packages.map((pkg: any) => ({ 
      value: `package-${pkg.id}`, 
      label: pkg.name, 
      price: pkg.basePrice / 100, 
      type: 'package' 
    }))
  ];

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoicePayload: InvoiceCreatePayload) => {
      const response = await apiRequest("POST", "/api/invoices", invoicePayload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invoice Created",
        description: "Invoice has been created successfully.",
      });
      onBack();
    },
    onError: (error: any) => {
      toast({
        title: "Invoice Creation Failed",
        description: error.message || "Failed to create invoice.",
        variant: "destructive",
      });
    },
  });

  const { toast } = useToast();

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, {
      id: Date.now(),
      type: 'custom',
      itemId: 'custom',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      isCustom: true,
      customDescription: ''
    }]);
  };

  const removeInvoiceItem = (id: number) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const updateInvoiceItem = (id: number, field: string, value: any) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Handle item selection
        if (field === 'itemId') {
          const selectedItem = predefinedItems.find(pi => pi.value === value);
          if (selectedItem) {
            updated.description = selectedItem.label;
            updated.unitPrice = selectedItem.price;
            updated.isCustom = selectedItem.value === 'custom';
            updated.type = selectedItem.type;
            updated.itemId = selectedItem.value;
          }
        }
        
        // Calculate total
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const handleCreateInvoice = () => {
    // Use type-safe calculation
    const calculation = calculateInvoiceTotal(invoiceItems as InvoiceItem[]);

    const invoicePayload: InvoiceCreatePayload = {
      eventId: null, // Will need to create event if needed
      subtotal: toCents(calculation.subtotal),
      tax: toCents(calculation.tax),
      total: toCents(calculation.total),
      deposit: toCents(invoiceData.depositAmount),
      balanceDue: toCents(calculation.balanceDue),
      notes: `Invoice for ${invoiceData.eventDetails}`,
      items: invoiceItems.map(item => ({
        type: item.type,
        name: item.isCustom ? item.customDescription : item.description,
        quantity: item.quantity,
        unitPrice: toCents(item.unitPrice),
        total: toCents(item.total)
      }))
    };

    createInvoiceMutation.mutate(invoicePayload);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Leads
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">Create Invoice - {lead.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={!hasPrev}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev Lead
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!hasNext}
            >
              Next Lead
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3-Panel Layout - No height restrictions, natural expansion */}
      <div className="grid grid-cols-3 gap-6 p-6">
        
        {/* Left Panel - Lead Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Lead Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={leadData.name || ''}
                  onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <Input
                  value={leadData.eventType || ''}
                  onChange={(e) => setLeadData({...leadData, eventType: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={leadData.email || ''}
                  onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={leadData.phone || ''}
                  onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Event Description</label>
              <Textarea
                value={leadData.eventDescription || ''}
                onChange={(e) => setLeadData({...leadData, eventDescription: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Adults</label>
                <Input
                  type="number"
                  value={leadData.adultCount || ''}
                  onChange={(e) => setLeadData({...leadData, adultCount: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Children</label>
                <Input
                  type="number"
                  value={leadData.childCount || ''}
                  onChange={(e) => setLeadData({...leadData, childCount: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Guests</label>
                <Input
                  type="number"
                  value={leadData.guestCount || ''}
                  onChange={(e) => setLeadData({...leadData, guestCount: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                value={leadData.notes || ''}
                onChange={(e) => setLeadData({...leadData, notes: e.target.value})}
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Lead
              </Button>
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => {
                  setInvoiceData({
                    ...invoiceData,
                    clientName: leadData.name,
                    clientPhone: leadData.phone,
                    clientEmail: leadData.email,
                    eventDetails: `${leadData.eventType} for ${leadData.name}`
                  });
                }}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Push to Invoice
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Middle Panel - Invoice Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Invoice Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* One field per row as requested */}
            <div>
              <label className="block text-sm font-medium mb-1">Client Name</label>
              <Input
                value={invoiceData.clientName || ''}
                onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={invoiceData.clientPhone || ''}
                onChange={(e) => setInvoiceData({...invoiceData, clientPhone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={invoiceData.clientEmail || ''}
                onChange={(e) => setInvoiceData({...invoiceData, clientEmail: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Event Date</label>
              <Input
                type="date"
                value={invoiceData.eventDate}
                onChange={(e) => {
                  const newEventDate = e.target.value;
                  setInvoiceData({
                    ...invoiceData, 
                    eventDate: newEventDate,
                    dueDate: calculateDueDate(newEventDate)
                  });
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Event Details</label>
              <Textarea
                value={invoiceData.eventDetails}
                onChange={(e) => setInvoiceData({...invoiceData, eventDetails: e.target.value})}
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Event Start Time</label>
              <Input
                type="time"
                value={invoiceData.eventStartTime || ''}
                onChange={(e) => setInvoiceData({...invoiceData, eventStartTime: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Event End Time</label>
              <Input
                type="time"
                value={invoiceData.eventEndTime}
                onChange={(e) => setInvoiceData({...invoiceData, eventEndTime: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <div className="space-y-2">
                <Select value={locationType} onValueChange={(value: 'host-hampton' | 'mobile') => setLocationType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="host-hampton">Host Hampton</SelectItem>
                    <SelectItem value="mobile">Mobile (address fields appear)</SelectItem>
                  </SelectContent>
                </Select>
                
                {locationType === 'mobile' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Street Address"
                      value={mobileAddress.street}
                      onChange={(e) => setMobileAddress({...mobileAddress, street: e.target.value})}
                    />
                    <Input
                      placeholder="City"
                      value={mobileAddress.city}
                      onChange={(e) => setMobileAddress({...mobileAddress, city: e.target.value})}
                    />
                    <Input
                      placeholder="State"
                      value={mobileAddress.state}
                      onChange={(e) => setMobileAddress({...mobileAddress, state: e.target.value})}
                    />
                    <Input
                      placeholder="ZIP"
                      value={mobileAddress.zip}
                      onChange={(e) => setMobileAddress({...mobileAddress, zip: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Invoice Items</label>
              <div className="space-y-3">
                {invoiceItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-2">
                    {/* Item dropdown on its own row */}
                    <div className="flex gap-2">
                      <Select
                        value={item.itemId}
                        onValueChange={(value) => updateInvoiceItem(item.id, 'itemId', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select item..." />
                        </SelectTrigger>
                        <SelectContent>
                          {predefinedItems.map((predefinedItem) => (
                            <SelectItem key={predefinedItem.value} value={predefinedItem.value}>
                              {predefinedItem.label} {predefinedItem.price > 0 && `($${predefinedItem.price})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {invoiceItems.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeInvoiceItem(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Custom description when "custom" is selected */}
                    {item.isCustom && (
                      <Input
                        placeholder="Enter custom item description"
                        value={item.customDescription}
                        onChange={(e) => updateInvoiceItem(item.id, 'customDescription', e.target.value)}
                      />
                    )}
                    
                    {/* Qty * Price on next row */}
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                      <span className="text-center">×</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="text-right font-medium">
                      Total: ${item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addInvoiceItem}
                  className="w-full"
                >
                  Add Item
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Deposit Amount</label>
              <Input
                type="number"
                value={invoiceData.depositAmount}
                onChange={(e) => setInvoiceData({...invoiceData, depositAmount: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1">
                Save Draft
              </Button>
              <Button 
                variant="default" 
                className="flex-1"
                onClick={handleCreateInvoice}
                disabled={createInvoiceMutation.isPending}
              >
                {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Invoice Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Invoice Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-6 border rounded-lg">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-gray-600">Host Hampton</p>
                <p className="text-sm text-gray-500">Speonk, NY</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <p className="text-sm">{invoiceData.clientName}</p>
                  <p className="text-sm text-gray-600">{invoiceData.clientEmail}</p>
                  <p className="text-sm text-gray-600">{invoiceData.clientPhone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm"><span className="font-medium">Invoice Date:</span> {new Date().toLocaleDateString()}</p>
                  <p className="text-sm"><span className="font-medium">Due Date:</span> {invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : 'Day before event'}</p>
                  <p className="text-sm"><span className="font-medium">Event Date:</span> {invoiceData.eventDate ? new Date(invoiceData.eventDate).toLocaleDateString() : 'TBD'}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Event Details:</h3>
                <p className="text-sm">{invoiceData.eventDetails}</p>
                <p className="text-sm text-gray-600">
                  {locationType === 'host-hampton' 
                    ? 'Host Hampton, Speonk NY' 
                    : `${mobileAddress.street}, ${mobileAddress.city}, ${mobileAddress.state} ${mobileAddress.zip}`}
                </p>
                <p className="text-sm text-gray-600">
                  {invoiceData.eventStartTime} - {invoiceData.eventEndTime}
                </p>
              </div>

              <div className="mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">
                          {item.isCustom ? item.customDescription : item.description}
                        </td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-right py-2">${item.unitPrice.toFixed(2)}</td>
                        <td className="text-right py-2">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-right mb-6">
                <div className="space-y-1">
                  <p className="text-sm">
                    <span>Subtotal: </span>
                    <span>${invoiceItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                  </p>
                  <p className="text-sm">
                    <span>Tax (8.75%): </span>
                    <span>${(invoiceItems.reduce((sum, item) => sum + item.total, 0) * 0.0875).toFixed(2)}</span>
                  </p>
                  <p className="text-sm border-t pt-1">
                    <span className="font-semibold">Total: </span>
                    <span className="font-semibold">
                      ${(invoiceItems.reduce((sum, item) => sum + item.total, 0) * 1.0875).toFixed(2)}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span>Deposit Required: </span>
                    <span>${invoiceData.depositAmount.toFixed(2)}</span>
                  </p>
                  <p className="text-sm font-semibold">
                    <span>Balance Due: </span>
                    <span>
                      ${((invoiceItems.reduce((sum, item) => sum + item.total, 0) * 1.0875) - invoiceData.depositAmount).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500 border-t pt-4">
                <p className="whitespace-pre-line">
                  Terms and Conditions:
                  {'\n'}1. A ${invoiceData.depositAmount} deposit is required to secure your booking
                  {'\n'}2. Final payment is due day before event date
                  {'\n'}3. Cancellations made 14+ days before event: full refund minus processing fee
                  {'\n'}4. Cancellations made 7-13 days before: 50% refund
                  {'\n'}5. Cancellations made less than 7 days: no refund
                  {'\n'}6. Setup begins 30 minutes before event start time
                  {'\n'}7. Client is responsible for any damages to venue or equipment
                  {'\n'}8. Additional fees may apply for cleanup if venue is left excessively messy
                  {'\n'}9. Weather policy: Indoor events are not affected; outdoor events may be rescheduled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}