import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar,
  DollarSign,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X
} from "lucide-react";

interface InvoiceDetailsDialogProps {
  invoiceId: number | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "edit";
}

interface Invoice {
  id: number;
  invoiceNumber?: string;
  customerId: number;
  eventId?: number;
  total: number;
  taxAmount?: number;
  depositAmount?: number;
  balanceDue?: number;
  status: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  eventTypeName?: string;
  eventDate?: string;
}

export default function InvoiceDetailsDialog({ 
  invoiceId, 
  isOpen, 
  onClose, 
  mode 
}: InvoiceDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(mode === "edit");
  const [editedInvoice, setEditedInvoice] = useState<Partial<Invoice>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["/api/invoices", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const response = await apiRequest("GET", `/api/invoices/${invoiceId}`);
      const data = await response.json();
      return data.success ? data.invoice : null;
    },
    enabled: !!invoiceId && isOpen,
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<Invoice>) => {
      const response = await apiRequest("PATCH", `/api/invoices/${invoiceId}`, updatedData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices", invoiceId] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (invoice) {
      setEditedInvoice(invoice);
    }
    if (mode === "edit") {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [invoice, mode]);

  const handleSave = () => {
    updateMutation.mutate(editedInvoice);
  };

  const handleCancel = () => {
    setEditedInvoice(invoice || {});
    setIsEditing(false);
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "$0.00";
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !invoiceId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl">
            Invoice #{invoice?.invoiceNumber || invoice?.id?.toString().padStart(4, '0') || 'Loading...'}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-300 border-t-transparent rounded-full" />
          </div>
        ) : invoice ? (
          <div className="space-y-6">
            {/* Invoice Status */}
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status || 'Draft'}
              </Badge>
              <div className="text-sm text-gray-500">
                Created: {new Date(invoice.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Total</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(invoice.total)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Deposit</span>
                </div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(invoice.depositAmount)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Tax</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(invoice.taxAmount)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Balance Due</span>
                </div>
                <div className={`text-xl font-bold ${invoice.balanceDue && invoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(invoice.balanceDue)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                  <div className="text-gray-900">{invoice.customerName || 'N/A'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <div className="text-gray-900">{invoice.customerEmail || 'N/A'}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Event Information */}
            {invoice.eventId && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Event Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Event Type</Label>
                      <div className="text-gray-900">{invoice.eventTypeName || 'N/A'}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Event Date</Label>
                      <div className="text-gray-900">
                        {invoice.eventDate ? new Date(invoice.eventDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Invoice Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Invoice Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  {isEditing ? (
                    <Input
                      id="dueDate"
                      type="date"
                      value={editedInvoice.dueDate ? new Date(editedInvoice.dueDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditedInvoice({
                        ...editedInvoice,
                        dueDate: e.target.value
                      })}
                    />
                  ) : (
                    <div className="text-gray-900">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  {isEditing ? (
                    <select
                      id="status"
                      value={editedInvoice.status || ''}
                      onChange={(e) => setEditedInvoice({
                        ...editedInvoice,
                        status: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  ) : (
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status || 'Draft'}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="notes">Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={editedInvoice.notes || ''}
                    onChange={(e) => setEditedInvoice({
                      ...editedInvoice,
                      notes: e.target.value
                    })}
                    placeholder="Add any notes about this invoice..."
                    rows={3}
                  />
                ) : (
                  <div className="text-gray-900 mt-1">
                    {invoice.notes || 'No notes'}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Invoice not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}