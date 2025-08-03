import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Eye, X } from "lucide-react";

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

interface InvoiceCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  invoiceId?: number | null;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export default function InvoiceCreationDialog({
  isOpen,
  onClose,
  lead = null,
  invoiceId = null,
  mode = 'create',
  onSuccess
}: InvoiceCreationDialogProps) {
  const { toast } = useToast();

  // Helper function to format time to AM/PM
  const formatTimeToAMPM = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to extract comprehensive event details from form data
  const extractEventDetails = (lead: Lead) => {
    let formData: any = {};
    try {
      formData = lead.formData ? JSON.parse(lead.formData as string) : {};
    } catch (e) {
      formData = {};
    }

    const details = [];
    
    // Basic event info
    if (lead.eventType) details.push(`Event Type: ${lead.eventType}`);
    if (lead.eventDescription || formData.eventDescription) {
      details.push(`Description: ${lead.eventDescription || formData.eventDescription}`);
    }

    // Birthday party specific details
    if (lead.eventType === 'birthday-party' || formData.eventType === 'birthday-party') {
      if (lead.childName || formData.childName) details.push(`Child Name: ${lead.childName || formData.childName}`);
      if (lead.childAge || formData.childAge) details.push(`Child Age: ${lead.childAge || formData.childAge}`);
      if (lead.partyTheme || formData.partyTheme) details.push(`Party Theme: ${lead.partyTheme || formData.partyTheme}`);
      if (lead.packageSelection || formData.partyPackage) details.push(`Party Package: ${lead.packageSelection || formData.partyPackage}`);
      
      // Handle add-ons
      if (lead.selectedAddons && Array.isArray(lead.selectedAddons) && lead.selectedAddons.length > 0) {
        details.push(`Party Add-ons: ${lead.selectedAddons.map((addon: any) => addon.name || addon).join(', ')}`);
      } else if (formData.partyAddons && Array.isArray(formData.partyAddons) && formData.partyAddons.length > 0) {
        details.push(`Party Add-ons: ${formData.partyAddons.join(', ')}`);
      }
      
      // Food preferences with proper null checking
      if ((lead.foodPreferences as any)?.foodChoice || formData.foodChoice) {
        details.push(`Food Choice: ${(lead.foodPreferences as any)?.foodChoice || formData.foodChoice}`);
      }
      if ((lead.foodPreferences as any)?.cupcakeFlavor || formData.cupcakeFlavor) {
        details.push(`Cupcake Flavor: ${(lead.foodPreferences as any)?.cupcakeFlavor || formData.cupcakeFlavor}`);
      }
      
      // Special needs
      if (lead.specialRequirements && Array.isArray(lead.specialRequirements) && lead.specialRequirements.length > 0) {
        details.push(`Special Needs: ${lead.specialRequirements.join(', ')}`);
      } else if (formData.specialNeeds && Array.isArray(formData.specialNeeds) && formData.specialNeeds.length > 0) {
        details.push(`Special Needs: ${formData.specialNeeds.join(', ')}`);
      }
    }

    // Guest count info
    if (lead.guestCount || formData.guestCount) details.push(`Guest Count: ${lead.guestCount || formData.guestCount}`);
    if (lead.adultCount || formData.adultCount) details.push(`Adult Count: ${lead.adultCount || formData.adultCount}`);
    if (lead.childCount || formData.childCount) details.push(`Child Count: ${lead.childCount || formData.childCount}`);

    return details.join('\n');
  };

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
    clientName: lead?.name || '',
    clientPhone: lead?.phone || '',
    clientEmail: lead?.email || '',
    eventDate: formatDateForInput(lead?.eventDate || null),
    eventDetails: lead ? extractEventDetails(lead) : '',
    eventStartTime: lead?.startTime || '10:00',
    eventEndTime: lead?.endTime || '12:00',
    eventLocation: locationType === 'host-hampton' ? 'Host Hampton, Speonk NY' : `${mobileAddress.street}, ${mobileAddress.city}, ${mobileAddress.state} ${mobileAddress.zip}`,
    depositAmount: 200,
    dueDate: lead ? calculateDueDate(formatDateForInput(lead.eventDate || null)) : '',
    status: 'draft'
  });

  // Start with editable basic invoice item
  const [invoiceItems, setInvoiceItems] = useState([
    {
      id: Date.now(),
      type: 'custom',
      itemId: 'custom',
      description: lead ? `${lead.eventType}${lead.guestCount ? ` (${lead.guestCount} guests)` : ''}` : 'Custom Service',
      quantity: 1,
      unitPrice: 875,
      total: 875,
      isCustom: true,
      customDescription: lead ? `${lead.eventType}${lead.guestCount ? ` (${lead.guestCount} guests)` : ''}` : 'Custom Service'
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

  // Create/Update invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoicePayload: InvoiceCreatePayload) => {
      const url = mode === 'edit' && invoiceId ? `/api/invoices/${invoiceId}` : "/api/invoices";
      const method = mode === 'edit' ? 'PATCH' : 'POST';
      const response = await apiRequest(method, url, invoicePayload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: mode === 'edit' ? "Invoice Updated" : "Invoice Created",
        description: `Invoice has been ${mode === 'edit' ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: `Invoice ${mode === 'edit' ? 'Update' : 'Creation'} Failed`,
        description: error.message || `Failed to ${mode} invoice.`,
        variant: "destructive",
      });
    },
  });

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
    const calculation = calculateInvoiceTotal(invoiceItems as InvoiceItem[]);

    const invoicePayload: InvoiceCreatePayload = {
      eventId: null,
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Invoice' : 'Create Invoice'}
            {lead && ` - ${lead.name}`}
          </DialogTitle>
        </DialogHeader>

        {/* 2-Panel Layout */}
        <div className="grid grid-cols-2 gap-6 py-4">

          {/* Invoice Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Invoice Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  rows={4}
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
                      
                      {item.isCustom && (
                        <Input
                          placeholder="Enter custom item description"
                          value={item.customDescription}
                          onChange={(e) => updateInvoiceItem(item.id, 'customDescription', e.target.value)}
                        />
                      )}
                      
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
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={handleCreateInvoice}
                  disabled={createInvoiceMutation.isPending}
                >
                  {createInvoiceMutation.isPending 
                    ? (mode === 'edit' ? 'Updating...' : 'Creating...') 
                    : (mode === 'edit' ? 'Update Invoice' : 'Create Invoice')
                  }
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Preview */}
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
                  <div className="text-sm whitespace-pre-line">{invoiceData.eventDetails}</div>
                  <p className="text-sm text-gray-600">
                    {locationType === 'host-hampton' 
                      ? 'Host Hampton, Speonk NY' 
                      : `${mobileAddress.street}, ${mobileAddress.city}, ${mobileAddress.state} ${mobileAddress.zip}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTimeToAMPM(invoiceData.eventStartTime)} - {formatTimeToAMPM(invoiceData.eventEndTime)}
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
      </DialogContent>
    </Dialog>
  );
}