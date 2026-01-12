import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  Printer,
  Eye,
  Share2,
  FileText,
  CheckCircle2,
  Clock,
  QrCode,
  Mail,
  MessageSquare,
  Copy,
  ExternalLink,
  Stethoscope,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { StatusBadge } from '@/components/ui/status-badge';
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
import { fetchCompletedReports, fetchReportDetails, uploadGeneratedReport } from '@/services/LaboratoryService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from "date-fns";

export default function LaboratoryReports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    try {
      const parts = dateString.split(/[- :]/);
      if (parts.length >= 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        const hour = parseInt(parts[3] || '0');
        const minute = parseInt(parts[4] || '0');
        const second = parseInt(parts[5] || '0');
        
        const date = new Date(year, month, day, hour, minute, second);
        
        if (!isNaN(date.getTime())) {
           return formatDistanceToNow(date, { addSuffix: true });
        }
      }

      const date = new Date(dateString.replace(" ", "T")); 
      if (isNaN(date.getTime())) return dateString;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  // Derived state to fix ReferenceError
  const completedOrders = orders;
  const pendingValidation = []; // Not available in this view currently

  useEffect(() => {
    const load = async () => {
      try {
        const list = await fetchCompletedReports();
        setOrders(Array.isArray(list) ? list : []);
      } catch (e) {
        setOrders([]);
      }
    };
    load();
  }, []);

  const filteredReports = orders.filter(order => {
    const matchesSearch = 
      String(order.order_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.fname} ${order.lname}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const generateReportPDF = (details: any) => {
      const doc = new jsPDF();
      let y = 20;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("LabFlow Diagnostics", 105, y, { align: "center" });
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("NABL Accredited Laboratory", 105, y, { align: "center" });
      y += 6;
      doc.text("123 Medical Center Road, Healthcare District • Ph: 1800-123-4567", 105, y, { align: "center" });
      y += 15;

      // Patient & Order Info
      doc.setDrawColor(200, 200, 200);
      doc.rect(15, y, 180, 35);
      
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("PATIENT INFORMATION", 20, y + 8);
      doc.text("REPORT DETAILS", 110, y + 8);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      // Patient Column
      doc.text(`Name: ${details.fname} ${details.lname}`, 20, y + 16);
      doc.text(`Gender/DOB: ${details.gender} / ${details.dob}`, 20, y + 22);
      doc.text(`Phone: ${details.phone}`, 20, y + 28);

      // Order Column
      doc.text(`Order ID: ${details.order_number}`, 110, y + 16);
      doc.text(`Ref. Doctor: ${details.doc_name ? "Dr. " + details.doc_name : "—"}`, 110, y + 22);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 110, y + 28);

      y += 45;

      // Tests
      if (details.tests && Array.isArray(details.tests)) {
        details.tests.forEach((test: any) => {
           // Check page break
           if (y > 250) {
             doc.addPage();
             y = 20;
           }

           // Test Header
           doc.setFillColor(245, 245, 245);
           doc.rect(15, y, 180, 8, "F");
           doc.setFont("helvetica", "bold");
           doc.setTextColor(0, 0, 0);
           doc.text(test.testName || "Test", 20, y + 5);
           y += 12;

           // Table Header
           doc.setFont("helvetica", "normal");
           doc.setFontSize(9);
           doc.setTextColor(100, 100, 100);
           doc.text("Parameter", 20, y);
           doc.text("Result", 90, y);
           doc.text("Unit", 130, y);
           doc.text("Reference Range", 160, y);
           y += 2;
           doc.setDrawColor(230, 230, 230);
           doc.line(15, y, 195, y);
           y += 6;

           // Results
           if (test.results && Array.isArray(test.results)) {
             test.results.forEach((res: any) => {
                if (y > 270) {
                  doc.addPage();
                  y = 20;
                }
                
                doc.setTextColor(0, 0, 0);
                doc.text(res.parameterName || "", 20, y);
                
                // Flag color
                if (res.flag === 'Critical') doc.setTextColor(220, 38, 38);
                else if (res.flag === 'High') doc.setTextColor(234, 88, 12);
                else if (res.flag === 'Low') doc.setTextColor(37, 99, 235);
                else doc.setTextColor(0, 0, 0);

                doc.setFont("courier", "bold");
                doc.text((res.value || "") + (res.flag && res.flag !== 'Normal' ? (res.flag === 'High' ? ' ↑' : res.flag === 'Low' ? ' ↓' : ' !') : ''), 90, y);
                doc.setFont("helvetica", "normal");
                
                doc.setTextColor(100, 100, 100);
                doc.text(res.unit || "", 130, y);
                doc.text(res.referenceRange || "", 160, y);
                
                y += 6;
             });
           }
           y += 10;
        });
      }

      // Footer
      if (y > 250) {
         doc.addPage();
         y = 20;
      }
      y += 10;
      doc.setDrawColor(200, 200, 200);
      doc.line(15, y, 195, y);
      y += 10;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Validated by: Dr. Pathologist Name", 20, y);
      doc.text("This report is generated electronically.", 195, y, { align: "right" });

      return doc;
  };

  const handleGenerateReport = async (orderId: string) => {
    toast.info("Generating report...", { description: "Please wait while we generate and upload the report." });
    try {
      const details = await fetchReportDetails(orderId);
      if (!details) throw new Error("Could not fetch report details");

      const doc = generateReportPDF(details);
      const pdfBlob = doc.output('blob');
      
      // Upload
      const formData = new FormData();
      formData.append('report_file', pdfBlob, `Report_${details.order_number}.pdf`);
      formData.append('patient_id', details.patient_id);
      formData.append('treatment_id', details.treatment_id);
      
      const testIds = details.tests.map((t: any) => String(t.lab_test_id)).filter(Boolean);
      formData.append('covered_tests', JSON.stringify(testIds));
      formData.append('lab_test_id', testIds.join(','));

      const uploadRes = await uploadGeneratedReport(formData);
      if (uploadRes.success) {
        toast.success("Report generated and uploaded successfully!");
      } else {
        throw new Error(uploadRes.message || "Upload failed");
      }

    } catch (error: any) {
      console.error(error);
      toast.error("Failed to generate/upload report", { description: error.message });
    }
  };

  const handleDownload = (orderId: string, format: 'pdf' | 'excel') => {
    toast.success(`Downloading ${format.toUpperCase()}`, {
      description: `Report for ${orderId} will be downloaded`
    });
  };

  const handlePrint = async (orderId: string) => {
    toast.info('Preparing report for printing...', {
      description: `Report for ${orderId} is being prepared`
    });
    try {
      const details = await fetchReportDetails(orderId);
      if (!details) throw new Error("Could not fetch report details");

      const doc = generateReportPDF(details);
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to print report", { description: error.message });
    }
  };

  const handleBulkDownload = () => {
    toast.success('Bulk download started', {
      description: `${filteredReports.length} reports will be downloaded as ZIP`
    });
  };

  return (
    <div className="min-h-screen">
      
      
      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedOrders.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingValidation.length}</p>
                <p className="text-sm text-muted-foreground">Pending Validation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by order ID, patient..."
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
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleBulkDownload}>
            <Download className="h-4 w-4" />
            Bulk Download
          </Button>
        </div>

        {/* Reports Table */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="data-table-header">
                  <th className="text-left px-4 py-3">Order ID</th>
                  <th className="text-left px-4 py-3">Patient</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Doctor</th>
                  <th className="text-left px-4 py-3">Tests</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Completed</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((order: any) => (
                  <tr key={order.order_id} className="data-table-row">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-primary font-medium">{order.order_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.fname} {order.lname}</p>
                        <p className="text-xs text-muted-foreground">{order.gender} / {order.dob}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(order.created_at)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-sm">{order.doc_name ? `Dr. ${order.doc_name}` : '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {order.tests.map((test: any, idx: number) => (
                          <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded">
                            {test.testName || ''}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.order_status} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">
                      <div>
                        {order.created_at 
                          ? new Date(order.created_at).toLocaleDateString()
                          : '—'}
                      </div>
                      <div className="text-xs mt-0.5">
                         {formatTimeAgo(order.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setSelectedReport(String(order.order_id))}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-600"
                          onClick={() => handleGenerateReport(order.order_id)}
                          title="Generate & Upload Report"
                        >
                          <Stethoscope className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handlePrint(order.order_id)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setShowShareDialog(String(order.order_id))}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Preview Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <DialogTitle>Report Preview</DialogTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => {
                    const order = orders.find(o => String(o.order_id) === selectedReport);
                    if (order) handleDownload(order.order_id, 'pdf');
                  }}
                >
                  <Download className="h-4 w-4" /> PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => {
                    const order = orders.find(o => String(o.order_id) === selectedReport);
                    if (order) handlePrint(order.order_id);
                  }}
                >
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </div>
            </div>
          </DialogHeader>
          {selectedReport && (() => {
            const order = orders.find(o => String(o.order_id) === selectedReport);
            return order ? <ReportPreview order={order} /> : null;
          })()}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={!!showShareDialog} onOpenChange={() => setShowShareDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
          </DialogHeader>
          {showShareDialog && (() => {
            const order = orders.find(o => String(o.order_id) === showShareDialog);
            return order ? <ShareReportForm order={order} onClose={() => setShowShareDialog(null)} /> : null;
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShareReportForm({ order, onClose }: { order: any; onClose: () => void }) {
  const [email, setEmail] = useState(order?.email || '');
  const [phone, setPhone] = useState(order?.phone || '');

  const reportLink = `https://labflow.com/reports/${order?.order_number}`;

  const handleSendEmail = () => {
    toast.success('Email sent', {
      description: `Report link sent to ${email}`
    });
    onClose();
  };

  const handleSendSMS = () => {
    toast.success('SMS sent', {
      description: `Report link sent to ${phone}`
    });
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reportLink);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-sm text-muted-foreground mb-2">Report Link</p>
        <div className="flex gap-2">
          <Input value={reportLink} readOnly className="font-mono text-sm" />
          <Button variant="outline" size="icon" onClick={handleCopyLink}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-2 block">Send via Email</label>
          <div className="flex gap-2">
            <Input 
              placeholder="email@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleSendEmail} className="gap-1">
              <Mail className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Send via SMS</label>
          <div className="flex gap-2">
            <Input 
              placeholder="+1-555-0000" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button onClick={handleSendSMS} className="gap-1">
              <MessageSquare className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Send via WhatsApp</label>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => {
              window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Your lab report is ready. View it here: ${reportLink}`)}`, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Open WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReportPreview({ order }: { order: any }) {
  const [detailedOrder, setDetailedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      if (!order?.order_id) return;
      setLoading(true);
      try {
        const details = await fetchReportDetails(order.order_id);
        if (details) {
          setDetailedOrder(details);
        } else {
          setDetailedOrder(order);
        }
      } catch (error) {
        console.error("Failed to load report details", error);
        setDetailedOrder(order);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [order?.order_id]);

  const displayOrder = detailedOrder || order;

  if (loading) {
    return <div className="p-8 text-center">Loading report details...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-white text-gray-900">
      {/* Report Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-2xl font-bold text-primary">LabFlow Diagnostics</h1>
        <p className="text-sm text-gray-500 mt-1">NABL Accredited Laboratory</p>
        <p className="text-xs text-gray-400 mt-2">123 Medical Center Road, Healthcare District • Ph: 1800-123-4567</p>
      </div>

      {/* Patient & Order Info */}
      <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Patient Information</h3>
          <div className="space-y-1">
            <p><span className="text-gray-500">Name:</span> <strong>{displayOrder.fname} {displayOrder.lname}</strong></p>
            <p><span className="text-gray-500">Gender/DOB:</span> {displayOrder.gender} / {displayOrder.dob}</p>
            <p><span className="text-gray-500">Phone:</span> {displayOrder.phone}</p>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Report Details</h3>
          <div className="space-y-1">
            <p><span className="text-gray-500">Order ID:</span> <strong className="font-mono">{displayOrder.order_id}</strong></p>
            <p><span className="text-gray-500">Ref. Doctor:</span> {displayOrder.doc_name ? `Dr. ${displayOrder.doc_name}` : '—'}</p>
            <p><span className="text-gray-500">Report Date:</span> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {displayOrder.tests && displayOrder.tests.map((test: any, idx: number) => (
        <div key={idx} className="border rounded-lg overflow-hidden">
          <div className="bg-primary/5 px-4 py-2 border-b">
            <h3 className="font-semibold">{test.testName}</h3>
          </div>
          {test.results && test.results.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <th className="text-left px-4 py-2">Parameter</th>
                  <th className="text-left px-4 py-2">Result</th>
                  <th className="text-left px-4 py-2">Unit</th>
                  <th className="text-left px-4 py-2">Reference Range</th>
                </tr>
              </thead>
              <tbody>
                {test.results.map((result: any, rIdx: number) => (
                  <tr key={rIdx} className="border-t">
                    <td className="px-4 py-2 font-medium">{result.parameterName}</td>
                    <td className={cn(
                      'px-4 py-2 font-mono font-semibold',
                      result.flag === 'Critical' && 'text-red-600',
                      result.flag === 'High' && 'text-orange-600',
                      result.flag === 'Low' && 'text-blue-600'
                    )}>
                      {result.value}
                      {result.flag && result.flag !== 'Normal' && (
                        <span className="ml-1 text-xs">
                          {result.flag === 'High' ? '↑' : result.flag === 'Low' ? '↓' : '⚠'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">{result.unit}</td>
                    <td className="px-4 py-2 font-mono text-sm">{result.referenceRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No detailed results available for this test.
            </div>
          )}
        </div>
      ))}

      {/* Interpretation */}
      {displayOrder.tests && displayOrder.tests.some((t: any) => t.results?.some((r: any) => r.flag && r.flag !== 'Normal')) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Clinical Notes</h3>
          <p className="text-sm text-yellow-700">
            Some values are outside the normal reference range. Please consult with your healthcare provider for proper interpretation and follow-up.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-6 mt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium">Validated by:</p>
            <p className="font-semibold mt-1">Dr. Pathologist Name</p>
            <p className="text-xs text-gray-500">MD Pathology | Reg No: MCI-12345</p>
            <div className="mt-3 w-32 h-12 border-b border-gray-400">
              <p className="text-xs text-gray-400 mt-1">Digital Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
              <QrCode className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Scan to verify</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-6 text-center">
          This is a computer-generated report. Results should be correlated clinically.
        </p>
      </div>
    </div>
  );
}
