import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Minus, Save, Send, Eye } from "lucide-react";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1753333962128.png";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  estimatedCost: number;
  formData: any;
}

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function InvoiceCreate() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const leadId = searchParams.get('leadId');

  // Form state
  const [invoiceData, setInvoiceData] = useState({
    leadId: leadId ? parseInt(leadId) : null,
    customerId: null,
    invoiceNumber: `INV-${Date.now()}`,
    // Client information
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    // Event details
    description: '',
    eventDetails: '', // New text area field for detailed event description
    eventDate: '',
    eventStartTime: '',
    eventEndTime: '',
    eventLocation: 'Host Hampton, Speonk NY',
    depositAmount: 200, // Fixed $200 deposit
    taxRate: 8.75, // NY sales tax
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    status: 'draft',
    termsAndConditions: `Terms and Conditions:
1. A $200 deposit is required to secure your booking
2. Final payment is due 7 days before event date
3. Cancellations made 14+ days before event: full refund minus processing fee
4. Cancellations made 7-13 days before: 50% refund
5. Cancellations made less than 7 days: no refund
6. Setup begins 30 minutes before event start time
7. Client is responsible for any damages to venue or equipment
8. Additional fees may apply for cleanup if venue is left excessively messy
9. Weather policy: Indoor events are not affected; outdoor events may be rescheduled`
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: 'Event Package', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  // Fetch lead data if leadId is provided
  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ["/api/leads", leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const response = await apiRequest("GET", `/api/leads/${leadId}`);
      const data = await response.json();
      return data.success ? data.lead : null;
    },
    enabled: !!leadId
  });

  // Populate form with lead data
  useEffect(() => {
    if (lead) {
      const formData = lead.formData || {};
      
      // Build detailed event description from form data
      let eventDetails = `Event Type: ${lead.eventType}\n`;
      if (lead.childName) eventDetails += `Child: ${lead.childName}`;
      if (lead.childAge) eventDetails += ` (Age ${lead.childAge})`;
      if (lead.childName || lead.childAge) eventDetails += '\n';
      if (lead.guestCount) eventDetails += `Guest Count: ${lead.guestCount}\n`;
      if (formData.partyTheme) eventDetails += `Theme: ${formData.partyTheme}\n`;
      if (formData.partyPackage) eventDetails += `Package: ${formData.partyPackage}\n`;
      if (formData.specialNeeds && formData.specialNeeds.length > 0) {
        eventDetails += `Special Needs: ${formData.specialNeeds.join(', ')}\n`;
      }
      if (formData.questions || formData.partyNotes || lead.notes) {
        eventDetails += `Notes: ${formData.questions || formData.partyNotes || lead.notes}\n`;
      }

      setInvoiceData(prev => ({
        ...prev,
        // Client information from lead
        clientName: lead.name || '',
        clientEmail: lead.email || '',
        clientPhone: lead.phone || '',
        // Event information
        description: `${lead.eventType} for ${lead.name}`,
        eventDetails: eventDetails.trim(),
        eventDate: lead.eventDate || formData.partyDate || '',
        eventStartTime: formData.partyTime || formData.startTime || '10:00',
        eventEndTime: formData.endTime || '12:00'
      }));

      // Set initial invoice item based on lead
      setInvoiceItems([{
        description: `${lead.eventType}${lead.guestCount ? ` (${lead.guestCount} guests)` : ''}`,
        quantity: 1,
        unitPrice: (lead.estimatedCost || 87500) / 100, // Convert cents to dollars
        total: (lead.estimatedCost || 87500) / 100
      }]);
    }
  }, [lead]);

  // Add new invoice item
  const addInvoiceItem = () => {
    setInvoiceItems(prev => [...prev, {
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  // Remove invoice item
  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Update invoice item
  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  // Calculate totals
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (invoiceData.taxRate / 100);
  const totalAmount = subtotal + taxAmount;
  const depositAmount = invoiceData.depositAmount || 200; // Use fixed deposit amount
  const balanceDue = totalAmount - depositAmount;

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoicePayload: any) => {
      const response = await apiRequest("POST", "/api/invoices", invoicePayload);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Invoice Created",
          description: "Invoice has been successfully created."
        });
        queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
        navigate(`/admin-dashboard/invoice/${data.invoice.id}/edit`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice.",
        variant: "destructive"
      });
    }
  });

  const handleSave = (status: 'draft' | 'sent') => {
    const invoicePayload = {
      ...invoiceData,
      leadId: leadId ? parseInt(leadId) : null, // Include leadId for backend to create event from lead data
      status,
      subtotal,
      taxAmount,
      totalAmount,
      depositAmount,
      balanceDue,
      items: invoiceItems.filter(item => item.description.trim() !== '')
    };

    console.log('Creating invoice with payload:', invoicePayload);
    createInvoiceMutation.mutate(invoicePayload);
  };

  if (leadLoading) {
    return <div className="p-8">Loading lead data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin-dashboard')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
                {lead && (
                  <p className="text-gray-600">
                    Converting lead: {lead.name} - {lead.eventType}
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={createInvoiceMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave('sent')}
                disabled={createInvoiceMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Save & Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={invoiceData.clientName}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))}
                      placeholder="Client full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientEmail">Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={invoiceData.clientEmail}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="client@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientPhone">Phone</Label>
                      <Input
                        id="clientPhone"
                        value={invoiceData.clientPhone}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, clientPhone: e.target.value }))}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={invoiceData.description}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Event description"
                  />
                </div>
                <div>
                  <Label htmlFor="eventDetails">Event Details</Label>
                  <Textarea
                    id="eventDetails"
                    value={invoiceData.eventDetails}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, eventDetails: e.target.value }))}
                    placeholder="Detailed event information, notes, special requirements..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={invoiceData.eventDate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, eventDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={invoiceData.eventStartTime}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, eventStartTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={invoiceData.eventEndTime}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, eventEndTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="eventLocation">Event Location</Label>
                  <Input
                    id="eventLocation"
                    value={invoiceData.eventLocation}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, eventLocation: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice Items</CardTitle>
                  <Button onClick={addInvoiceItem} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoiceItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          placeholder="Service description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Total</Label>
                        <Input
                          value={`$${item.total.toFixed(2)}`}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInvoiceItem(index)}
                          disabled={invoiceItems.length === 1}
                          className="p-2"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      value={invoiceData.depositAmount}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 200 }))}
                      step="1"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={invoiceData.taxRate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      step="0.001"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="terms">Terms and Conditions</Label>
                  <Textarea
                    id="terms"
                    value={invoiceData.termsAndConditions}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    rows={8}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Invoice Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="text-center">
                    <img src={hostHamptonLogo} alt="Host Hampton" className="h-12 mx-auto mb-2" />
                    <h3 className="font-bold">Host Hampton</h3>
                    <p className="text-gray-600">Speonk, NY</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold">Invoice #{invoiceData.invoiceNumber}</h4>
                    <p>Due: {new Date(invoiceData.dueDate).toLocaleDateString()}</p>
                    {lead && (
                      <div className="mt-2">
                        <p className="font-medium">{lead.name}</p>
                        <p>{lead.email}</p>
                        <p>{lead.phone}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Event Details</h4>
                    <p>{invoiceData.description}</p>
                    {invoiceData.eventDate && (
                      <p>Date: {new Date(invoiceData.eventDate).toLocaleDateString()}</p>
                    )}
                    {invoiceData.eventStartTime && invoiceData.eventEndTime && (
                      <p>Time: {invoiceData.eventStartTime} - {invoiceData.eventEndTime}</p>
                    )}
                    <p>Location: {invoiceData.eventLocation}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Items</h4>
                    {invoiceItems.map((item, index) => (
                      <div key={index} className="flex justify-between py-1">
                        <span>{item.description}</span>
                        <span>${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({invoiceData.taxRate}%):</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Deposit:</span>
                      <span>${depositAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Balance Due:</span>
                      <span>${balanceDue.toFixed(2)}</span>
                    </div>
                  </div>

                  {invoiceData.status === 'sent' && (
                    <div className="text-center pt-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Ready to Send
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}