import { useState, useEffect, useRef, type RefObject } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  Printer,
  Eye,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Shield,
  Receipt,
  RefreshCw,
  MoreVertical,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataCard } from '@/components/ui/data-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Invoice } from '@/data/dummyData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { fetchBillingData } from '@/services/LabPaymentService';

export default function LaboratoryBilling() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState<Invoice | null>(null);
  const [showRefundDialog, setShowRefundDialog] = useState<Invoice | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    collectedToday: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    refunds: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const invoicePrintRef = useRef<HTMLDivElement | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBillingData(1, 100, searchQuery, statusFilter);
      if (data) {
        setInvoices(data.invoices || []);
        if (data.stats) {
            setStats({
                collectedToday: Number(data.stats.collectedToday),
                totalRevenue: Number(data.stats.totalRevenue),
                pendingAmount: Number(data.stats.pendingAmount),
                refunds: Number(data.stats.refunds)
            });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadData, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const handleExport = () => {
    toast.success('Export started', {
      description: 'Billing data will be downloaded as CSV'
    });
  };

  const handlePrintInvoice = async (invoiceNumber: string) => {
    const element = invoicePrintRef.current;
    if (!element) {
      toast.error('Unable to print invoice');
      return;
    }
    try {
      const canvas = await html2canvas(element, {
        scale: 1,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.6);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;
      let imgWidth = maxWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > maxHeight) {
        const scaleFactor = maxHeight / imgHeight;
        imgWidth = imgWidth * scaleFactor;
        imgHeight = imgHeight * scaleFactor;
      }

      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');
      pdf.save(`${invoiceNumber || 'invoice'}.pdf`);
      toast.success('Invoice downloaded', {
        description: `Invoice ${invoiceNumber} saved as PDF`,
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to print invoice');
    }
  };

  const handleDownloadInvoice = (invoiceNumber: string) => {
    toast.success('Downloading invoice', {
      description: `Invoice ${invoiceNumber} will be downloaded`
    });
  };

  return (
    <div className="min-h-screen">
      
      
      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DataCard 
            title="Today's Collection" 
            value={`₹${stats.collectedToday.toLocaleString()}`}
            icon={Banknote}
            variant="success"
            loading={isLoading}
          />
          <DataCard 
            title="Pending Payments" 
            value={`₹${stats.pendingAmount.toLocaleString()}`}
            icon={CreditCard}
            variant="warning"
            loading={isLoading}
          />
          <DataCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={Receipt}
            loading={isLoading}
          />
          <DataCard 
            title="Refunds" 
            value={`₹${stats.refunds.toLocaleString()}`}
            icon={RefreshCw}
            variant="default"
            loading={isLoading}
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="refunds">Refunds</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-4">
            {/* Invoices Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="data-table-header">
                      <th className="text-left px-4 py-3">Invoice #</th>
                      <th className="text-left px-4 py-3">Order ID</th>
                      <th className="text-left px-4 py-3">Patient</th>
                      <th className="text-left px-4 py-3">Items</th>
                      <th className="text-right px-4 py-3">Total</th>
                      <th className="text-right px-4 py-3">Paid</th>
                      <th className="text-right px-4 py-3">Pending</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                        <tr><td colSpan={9} className="text-center py-4">Loading...</td></tr>
                    ) : invoices.length === 0 ? (
                        <tr><td colSpan={9} className="text-center py-4">No invoices found</td></tr>
                    ) : (
                        invoices.map(invoice => (
                      <tr key={invoice.id} className="data-table-row">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-primary font-medium">{invoice.invoiceNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm">{invoice.orderId}</span>
                        </td>
                        <td className="px-4 py-3 font-medium">{invoice.patientName}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {invoice.items && invoice.items.slice(0, 2).map((item, idx) => (
                              <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded">
                                {item.testName.split(' ').map(w => w[0]).join('')}
                              </span>
                            ))}
                            {invoice.items && invoice.items.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{invoice.items.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium">₹{Number(invoice.total).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-success">₹{Number(invoice.paidAmount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={invoice.balance > 0 ? "text-warning" : "text-muted-foreground"}>
                            ₹{Number(invoice.balance).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={invoice.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setSelectedInvoice(invoice.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {invoice.balance > 0 && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-success"
                                onClick={() => setShowPaymentDialog(invoice)}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePrintInvoice(invoice.invoiceNumber)}>
                                  <Printer className="h-4 w-4 mr-2" /> Print Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.invoiceNumber)}>
                                  <Download className="h-4 w-4 mr-2" /> Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {invoice.paidAmount > 0 && (
                                  <DropdownMenuItem onClick={() => setShowRefundDialog(invoice)}>
                                    <RefreshCw className="h-4 w-4 mr-2" /> Process Refund
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            <PaymentHistory invoices={invoices} />
          </TabsContent>

          <TabsContent value="refunds" className="mt-4">
            <RefundsList />
          </TabsContent>
        </Tabs>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <DialogTitle>Invoice Details</DialogTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => {
                  const inv = invoices.find(i => i.id === selectedInvoice);
                  if (inv) handlePrintInvoice(inv.invoiceNumber);
                }}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </div>
            </div>
          </DialogHeader>
          {selectedInvoice && (
            <InvoicePreview
              invoiceId={selectedInvoice}
              invoices={invoices}
              printRef={invoicePrintRef}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={!!showPaymentDialog} onOpenChange={() => setShowPaymentDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          {showPaymentDialog && (
            <PaymentForm 
              invoice={showPaymentDialog} 
              onClose={() => {
                  setShowPaymentDialog(null);
                  loadData(); // Refresh data after payment
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={!!showRefundDialog} onOpenChange={() => setShowRefundDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
          </DialogHeader>
          {showRefundDialog && (
            <RefundForm 
              invoice={showRefundDialog} 
              onClose={() => {
                  setShowRefundDialog(null);
                  loadData(); // Refresh data after refund
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PaymentHistory({ invoices }: { invoices: Invoice[] }) {
  const allPayments = invoices.flatMap(inv => 
    (inv.payments || []).map(p => ({ ...p, invoiceNumber: inv.invoiceNumber, patientName: inv.patientName }))
  );

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="data-table-header">
              <th className="text-left px-4 py-3">Payment ID</th>
              <th className="text-left px-4 py-3">Invoice</th>
              <th className="text-left px-4 py-3">Patient</th>
              <th className="text-left px-4 py-3">Mode</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Reference</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {allPayments.length === 0 ? (
                 <tr><td colSpan={7} className="text-center py-4">No payment history</td></tr>
            ) : (
            allPayments.map(payment => (
              <tr key={payment.id} className="data-table-row">
                <td className="px-4 py-3 font-mono text-sm">{payment.id}</td>
                <td className="px-4 py-3 font-mono text-sm text-primary">{payment.invoiceNumber}</td>
                <td className="px-4 py-3">{payment.patientName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {payment.mode === 'Cash' && <Banknote className="h-4 w-4" />}
                    {payment.mode === 'Card' && <CreditCard className="h-4 w-4" />}
                    {payment.mode === 'UPI' && <Smartphone className="h-4 w-4" />}
                    {payment.mode === 'Bank Transfer' && <Building2 className="h-4 w-4" />}
                    {payment.mode === 'Insurance' && <Shield className="h-4 w-4" />}
                    <span>{payment.mode}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium text-success">₹{Number(payment.amount).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{payment.reference || '—'}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(payment.receivedAt).toLocaleString()}
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RefundsList() {
  // Mock refunds data
  const refunds: any[] = [];

  if (refunds.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
        <RefreshCw className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No refunds processed</p>
        <p className="text-sm mt-1">Refund requests will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="data-table-header">
              <th className="text-left px-4 py-3">Refund ID</th>
              <th className="text-left px-4 py-3">Invoice</th>
              <th className="text-left px-4 py-3">Patient</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Reason</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map(refund => (
              <tr key={refund.id} className="data-table-row">
                <td className="px-4 py-3 font-mono text-sm">{refund.id}</td>
                <td className="px-4 py-3 font-mono text-sm text-primary">{refund.invoiceNumber}</td>
                <td className="px-4 py-3">{refund.patientName}</td>
                <td className="px-4 py-3 text-right font-mono font-medium text-destructive">-₹{refund.amount}</td>
                <td className="px-4 py-3 text-sm">{refund.reason}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={refund.status} />
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{refund.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoicePreview({
  invoiceId,
  invoices,
  printRef,
}: {
  invoiceId: string;
  invoices: Invoice[];
  printRef: RefObject<HTMLDivElement>;
}) {
  const invoice = invoices.find(inv => inv.id === invoiceId);
  if (!invoice) return null;

  return (
    <div ref={printRef} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">Invoice</h2>
          <p className="font-mono text-primary">{invoice.invoiceNumber}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {/* Patient & Order Info */}
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Patient</p>
          <p className="font-medium">{invoice.patientName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Order ID</p>
          <p className="font-mono">{invoice.orderId}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Invoice Date</p>
          <p>{new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Items */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="text-left px-4 py-2">Test</th>
              <th className="text-right px-4 py-2">Price</th>
              <th className="text-right px-4 py-2">Discount</th>
              <th className="text-right px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">{item.testName}</td>
                <td className="px-4 py-2 text-right font-mono">₹{item.unitPrice}</td>
                <td className="px-4 py-2 text-right font-mono text-muted-foreground">
                  {item.discount > 0 ? `-₹${item.discount}` : '—'}
                </td>
                <td className="px-4 py-2 text-right font-mono font-medium">₹{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono">₹{invoice.subtotal}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-mono text-success">-₹{invoice.discount}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (GST 18%)</span>
          <span className="font-mono">₹{invoice.tax}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Total</span>
          <span className="font-mono">₹{invoice.total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-success">Paid</span>
          <span className="font-mono text-success">₹{invoice.paidAmount}</span>
        </div>
        <div className="flex justify-between text-sm font-medium">
          <span className={invoice.balance > 0 ? "text-warning" : "text-muted-foreground"}>
            Pending Amount
          </span>
          <span
            className={
              invoice.balance > 0 ? "font-mono text-warning" : "font-mono text-muted-foreground"
            }
          >
            ₹{invoice.balance}
          </span>
        </div>
      </div>

      {/* Payment History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Payment History</h3>
          <div className="space-y-2">
            {invoice.payments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>{payment.mode}</span>
                  {payment.reference && <span className="text-muted-foreground">({payment.reference})</span>}
                </div>
                <div className="text-right">
                  <span className="font-mono font-medium">₹{payment.amount}</span>
                  <p className="text-xs text-muted-foreground">{new Date(payment.receivedAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentForm({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const [amount, setAmount] = useState(invoice.balance.toString());
  const [paymentMode, setPaymentMode] = useState('');
  const [reference, setReference] = useState('');

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!paymentMode) {
      toast.error('Please select a payment mode');
      return;
    }

    toast.success('Payment collected', {
      description: `₹${amount} received via ${paymentMode}`
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-lg p-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Invoice</span>
          <span className="font-mono">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">Pending Amount</span>
          <span className="font-mono font-semibold text-warning">₹{invoice.balance}</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Amount *</label>
        <Input 
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          max={invoice.balance}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Max: ₹{invoice.balance}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Payment Mode *</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'Cash', icon: Banknote },
            { value: 'Card', icon: CreditCard },
            { value: 'UPI', icon: Smartphone },
            { value: 'Bank Transfer', icon: Building2 },
          ].map(mode => (
            <button
              key={mode.value}
              onClick={() => setPaymentMode(mode.value)}
              className={cn(
                'p-3 rounded-lg border flex items-center gap-2 transition-all',
                paymentMode === mode.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'hover:border-primary/50'
              )}
            >
              <mode.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{mode.value}</span>
            </button>
          ))}
        </div>
      </div>

      {paymentMode && paymentMode !== 'Cash' && (
        <div>
          <label className="text-sm font-medium mb-2 block">Reference/Transaction ID</label>
          <Input 
            placeholder="Enter reference number"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} className="gap-2">
          <Check className="h-4 w-4" />
          Collect Payment
        </Button>
      </div>
    </div>
  );
}

function RefundForm({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) > invoice.paidAmount) {
      toast.error('Refund amount cannot exceed paid amount');
      return;
    }
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    toast.success('Refund processed', {
      description: `₹${amount} refunded to patient`
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
        <p className="text-sm text-warning">
          This action will process a refund for the selected invoice. This cannot be undone.
        </p>
      </div>

      <div className="bg-muted/30 rounded-lg p-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Invoice</span>
          <span className="font-mono">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">Amount Paid</span>
          <span className="font-mono font-semibold text-success">₹{invoice.paidAmount}</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Refund Amount *</label>
        <Input 
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          max={invoice.paidAmount}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Max: ₹{invoice.paidAmount}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Reason *</label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test_cancelled">Test Cancelled</SelectItem>
            <SelectItem value="duplicate_payment">Duplicate Payment</SelectItem>
            <SelectItem value="overcharge">Overcharge</SelectItem>
            <SelectItem value="patient_request">Patient Request</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={handleSubmit} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Process Refund
        </Button>
      </div>
    </div>
  );
}
