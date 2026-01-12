import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  QrCode,
  Eye,
  MoreVertical,
  Printer,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle,
  X,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Barcode,
  MapPin,
} from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { patients, doctors, tests, testPackages } from '@/data/dummyData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { fetchAllOrders, collectSample, fetchMasterLabTests, fetchCollectedSamples, updateLabOrderStatus } from '@/services/LaboratoryService';
import { formatDistanceToNow } from "date-fns";

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

export default function LaboratoryOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<{ orderId: string; sampleId: string; patientName: string; testName: string } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);

  const loadOrders = async () => {
    try {
      const data = await fetchAllOrders();
      const mapped = data.map((item: any) => ({
        id: item.treatment_id,
        orderId: item.appointment_id || item.treatment_id,
        labOrderId: item.order_id,
        patient: {
          name: `${item.fname || ''} ${item.lname || ''}`.trim() || 'Unknown',
          age: item.dob ? Math.floor((new Date().getTime() - new Date(item.dob).getTime()) / 31557600000) : 'N/A',
          gender: item.gender || 'N/A',
          phone: item.phone || 'N/A',
          email: item.email || 'N/A'
        },
        doctor: doctors[0] || { name: 'Unknown', hospital: 'Unknown' },
        tests: (item.tests || []).map((t: any) => ({
          ...t,
          sampleType: t.sample_type || t.sampleType,
          method: t.method,
          tat: t.tat
        })), 
        priority: 'Normal', 
        status: item.order_status || item.treatment_status || 'Ordered',
        timestamp: item.created_at,
        createdAt: item.created_at,
        totalAmount: 0,
        paymentStatus: 'Pending'
      }));
      setOrders(mapped);
    } catch (err) {
      console.error("Failed to load all orders", err);
      toast.error("Failed to load orders");
    }
  };

  const loadLabTests = async () => {
    try {
      const response = await fetchMasterLabTests(1, 1000);
      if (response.success) {
        setLabTests(response.data);
      }
    } catch (err) {
      console.error("Failed to load lab tests", err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadLabTests();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'ordered') {
      matchesStatus = ['Ordered', 'Registered'].some(s => order.status.toLowerCase().includes(s.toLowerCase()));
    } else if (statusFilter === 'in_processing') {
      matchesStatus = ['Processing', 'Received in Lab'].some(s => order.status.toLowerCase().includes(s.toLowerCase()));
    } else {
      matchesStatus = order.status.toLowerCase().includes(statusFilter.toLowerCase());
    }

    return matchesSearch && matchesStatus;
  });

  const handlePrintBarcode = (orderId: string, sampleId: string, patientName: string, testName: string) => {
    setSelectedBarcode({ orderId, sampleId, patientName, testName });
    setShowBarcodeModal(true);
  };

  const handleExport = () => {
    toast.success('Export started', {
      description: 'Orders data will be downloaded as CSV'
    });
  };

  const handleCancelOrder = (orderId: string) => {
    toast.success('Order cancelled', {
      description: `Order ${orderId} has been cancelled`
    });
  };

  const handleResample = (orderId: string) => {
    toast.info('Re-sample requested', {
      description: `Re-sample request sent for ${orderId}`
    });
  };

  return (
    <div className="min-h-screen">
      
      
      <div className="p-4 lg:p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search orders, patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="collected">Sample Collected</SelectItem>
                <SelectItem value="received">Received in Lab</SelectItem>
                <SelectItem value="in_processing">In Processing</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="validation">Validation Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="report">Report Generated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Order</DialogTitle>
                </DialogHeader>
                <NewOrderForm onClose={() => setIsNewOrderOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Orders', value: orders.length, color: 'primary' },
            { label: 'Pending Collection', value: orders.filter((o: any) => (o.tests || []).some((t: any) => String(t.status || '').toLowerCase() !== 'collected')).length, color: 'warning' },
            { label: 'In Processing', value: orders.filter(o => ['Processing', 'Received in Lab'].includes(o.status)).length, color: 'processing' },
            { label: 'Completed Today', value: orders.filter(o => o.status === 'Report Generated').length, color: 'success' },
            { label: 'Critical', value: orders.filter(o => o.priority === 'STAT').length, color: 'critical' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-card rounded-lg border p-3">
              <p className={cn('text-2xl font-bold', `text-${stat.color}`)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs for Desktop */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="orders">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Sample Collection</TabsTrigger>
            <TabsTrigger value="samples">Sample Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            {/* Orders Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="data-table-header">
                      <th className="text-left px-4 py-3 w-32">Order ID</th>
                      <th className="text-left px-4 py-3">Patient</th>
                      <th className="text-left px-4 py-3 hidden lg:table-cell">Doctor</th>
                      <th className="text-left px-4 py-3">Tests</th>
                      <th className="text-left px-4 py-3 w-24">Priority</th>
                      <th className="text-left px-4 py-3 w-36">Status</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">TAT</th>
                      <th className="text-left px-4 py-3 w-24">Payment</th>
                      <th className="text-left px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="data-table-row group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-primary font-medium">{order.orderId}</span>
                            <button 
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handlePrintBarcode(order.orderId, order.tests[0]?.sampleId || 'N/A', order.patient.name, order.tests[0]?.testName || 'Multiple')}
                            >
                              <QrCode className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{order.patient.name}</p>
                            <p className="text-xs text-muted-foreground">{order.patient.age}y / {order.patient.gender} • {order.patient.phone}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(order.createdAt)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div>
                            <p className="text-sm">{order.doctor?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{order.doctor?.hospital || 'Unknown'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {order.tests.map((test: any, idx: number) => (
                              <span key={test.id || idx} className="text-xs bg-muted px-2 py-0.5 rounded font-medium" title={test.testName}>
                                {test.testName}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.priority} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>4.2 hrs</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.paymentStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedOrderId(order.id)}>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintBarcode(order.orderId, order.tests[0]?.sampleId || 'N/A', order.patient.name, order.tests[0]?.testName || 'Multiple')}>
                                <QrCode className="h-4 w-4 mr-2" /> Print Barcode
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" /> Print Order
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleResample(order.orderId)}>
                                <RefreshCw className="h-4 w-4 mr-2" /> Re-sample
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleCancelOrder(order.orderId)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Cancel Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <SampleCollection orders={orders} onRefresh={loadOrders} />
          </TabsContent>

          <TabsContent value="samples" className="mt-4">
            <SampleTracking orders={orders} onPrintBarcode={handlePrintBarcode} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrderId && orders.find(o => o.id === selectedOrderId) && (
            <OrderDetails order={orders.find(o => o.id === selectedOrderId)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Barcode Modal */}
      <Dialog open={showBarcodeModal} onOpenChange={setShowBarcodeModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sample Barcode</DialogTitle>
          </DialogHeader>
          {selectedBarcode && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="bg-gray-900 text-white p-4 rounded mb-3">
                  <div className="flex justify-center gap-0.5 mb-2">
                    {/* Barcode visualization */}
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-white" 
                        style={{ 
                          width: Math.random() > 0.5 ? '2px' : '1px',
                          height: '40px'
                        }} 
                      />
                    ))}
                  </div>
                  <p className="font-mono text-sm">{selectedBarcode.sampleId}</p>
                </div>
                <p className="font-medium">{selectedBarcode.patientName}</p>
                <p className="text-sm text-muted-foreground">{selectedBarcode.orderId}</p>
                <p className="text-sm text-muted-foreground">{selectedBarcode.testName}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowBarcodeModal(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Barcode sent to printer');
                  setShowBarcodeModal(false);
                }}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderDetails({ order }: { order: any }) {
  if (!order) return null;

  return (
    <div className="space-y-6">
      {/* Patient Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" /> Patient Information
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> <strong>{order.patient.name}</strong></p>
            <p><span className="text-muted-foreground">Age/Gender:</span> {order.patient.age} years / {order.patient.gender}</p>
            <p className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /> {order.patient.phone}</p>
            <p className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" /> {order.patient.email}</p>
            <p className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" /> {order.patient.address}</p>
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" /> Order Information
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Order ID:</span> <strong className="font-mono text-primary">{order.orderId}</strong></p>
            <p><span className="text-muted-foreground">Referring Doctor:</span> {order.doctor?.name || 'Unknown'}</p>
            <p><span className="text-muted-foreground">Hospital:</span> {order.doctor?.hospital || 'Unknown'}</p>
            <p className="flex items-center gap-2">
              <span className="text-muted-foreground">Priority:</span> <StatusBadge status={order.priority} />
            </p>
            <p className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span> <StatusBadge status={order.status} />
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Order Timeline</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Created', time: order.createdAt, icon: Calendar },
            { label: 'Collected', time: order.collectedAt, icon: CheckCircle },
            { label: 'Received', time: order.receivedAt, icon: CheckCircle },
            { label: 'Completed', time: order.completedAt, icon: CheckCircle },
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center',
                step.time ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
              )}>
                <step.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-xs text-muted-foreground">
                  {step.time ? new Date(step.time).toLocaleString() : 'Pending'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tests */}
      <div>
        <h3 className="font-semibold mb-3">Tests</h3>
        <div className="space-y-2">
          {order.tests.map((test, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Barcode className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{test.testName}</p>
                  <p className="text-xs text-muted-foreground">Sample: {test.sampleId || 'Not collected'} • {test.sampleType}</p>
                </div>
              </div>
              <StatusBadge status={test.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Payment Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold">₹{order.totalAmount}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-lg font-bold text-success">₹{order.paidAmount}</p>
            <p className="text-xs text-muted-foreground">Paid</p>
          </div>
          <div>
            <p className="text-lg font-bold text-warning">₹{order.totalAmount - order.paidAmount}</p>
            <p className="text-xs text-muted-foreground">Balance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewOrderForm({ onClose, orders }: { onClose: () => void; orders: any[] }) {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [priority, setPriority] = useState('normal');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [showNewPatient, setShowNewPatient] = useState(false);

  const handleTestToggle = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackage(prev => prev === pkgId ? '' : pkgId);
  };

  const calculateTotal = () => {
    let total = 0;
    
    // Add individual tests
    selectedTests.forEach(testId => {
      const test = tests.find(t => t.id === testId);
      if (test) total += test.price;
    });
    
    // Add package if selected
    if (selectedPackage) {
      const pkg = testPackages.find(p => p.id === selectedPackage);
      if (pkg) {
        const pkgTotal = tests
          .filter(t => pkg.tests.includes(t.id))
          .reduce((sum, t) => sum + t.price, 0);
        total += pkgTotal * (1 - pkg.discount / 100);
      }
    }
    
    return Math.round(total);
  };

  const getSampleTypes = () => {
    const samples: Record<string, number> = {};
    
    selectedTests.forEach(testId => {
      const test = tests.find(t => t.id === testId);
      if (test) {
        samples[test.sampleType] = (samples[test.sampleType] || 0) + 1;
      }
    });
    
    if (selectedPackage) {
      const pkg = testPackages.find(p => p.id === selectedPackage);
      if (pkg) {
        pkg.tests.forEach(testId => {
          const test = tests.find(t => t.id === testId);
          if (test && !selectedTests.includes(testId)) {
            samples[test.sampleType] = (samples[test.sampleType] || 0) + 1;
          }
        });
      }
    }
    
    return samples;
  };

  const getRequiredTubes = (testsList: any[]) => {
    const tubes: Record<string, any> = {};
    testsList.forEach((test: any) => {
      const type = test.sampleType || test.sample_type || 'Unknown';
      if (!tubes[type]) {
        tubes[type] = {
          name: test.tubeName || test.sampleName || type,
          type: type,
          volume: test.volume || 'N/A',
          storage: test.storage || 'N/A',
          anticoagulant: test.anticoagulant || 'N/A',
          tubes: test.tubes || 1,
          color: 'bg-muted/40',
          tests: []
        };
      }
      tubes[type].tests.push(test.testName || test.name || 'Test');
    });
    return Object.values(tubes);
  };

  const handleSubmit = () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    if (selectedTests.length === 0 && !selectedPackage) {
      toast.error('Please select at least one test or package');
      return;
    }
    
    toast.success('Order created successfully', {
      description: `Order ID: LAB-2024-${String(orders.length + 1).padStart(5, '0')}`
    });
    onClose();
  };

  const sampleTypes = getSampleTypes();

  return (
    <div className="space-y-6">
      {/* Patient Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Patient *</label>
          <div className="flex gap-2">
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                      <span className="text-muted-foreground">({p.age}y / {p.gender})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setShowNewPatient(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Referring Doctor</label>
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger>
              <SelectValue placeholder="Select doctor (optional)" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map(d => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name} - {d.specialization}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="text-sm font-medium mb-2 block">Priority</label>
        <div className="flex gap-2">
          {[
            { value: 'normal', label: 'Normal', color: 'bg-muted' },
            { value: 'urgent', label: 'Urgent', color: 'bg-warning/20 border-warning' },
            { value: 'stat', label: 'STAT', color: 'bg-critical/20 border-critical' },
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPriority(p.value)}
              className={cn(
                'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                priority === p.value ? p.color : 'hover:bg-muted/50'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Packages */}
      <div>
        <label className="text-sm font-medium mb-2 block">Test Packages</label>
        <div className="grid sm:grid-cols-2 gap-3">
          {testPackages.map(pkg => {
            const packageTests = tests.filter(t => pkg.tests.includes(t.id));
            const originalPrice = packageTests.reduce((sum, t) => sum + t.price, 0);
            const discountedPrice = originalPrice - (originalPrice * pkg.discount / 100);

            return (
              <button
                key={pkg.id}
                onClick={() => handlePackageSelect(pkg.id)}
                className={cn(
                  'p-3 rounded-lg border text-left transition-all',
                  selectedPackage === pkg.id 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{pkg.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {packageTests.map(t => (
                        <Badge key={t.id} variant="secondary" className="text-xs">{t.code}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">₹{Math.round(discountedPrice)}</p>
                    <p className="text-xs text-muted-foreground line-through">₹{originalPrice}</p>
                    <Badge className="mt-1 bg-success/10 text-success border-success/30">{pkg.discount}% OFF</Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Individual Tests */}
      <div>
        <label className="text-sm font-medium mb-2 block">Individual Tests</label>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
          {tests.map(test => (
            <label
              key={test.id}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all',
                selectedTests.includes(test.id) 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Checkbox
                checked={selectedTests.includes(test.id)}
                onCheckedChange={() => handleTestToggle(test.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{test.name}</p>
                <p className="text-xs text-muted-foreground">{test.sampleType}</p>
              </div>
              <span className="text-sm font-medium">₹{test.price}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sample Types Summary */}
      {Object.keys(sampleTypes).length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2">Sample Requirements</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sampleTypes).map(([type, count]) => (
              <span key={type} className="text-sm bg-info/10 text-info px-2 py-1 rounded">
                {type} × {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      {(selectedTests.length > 0 || selectedPackage) && (
        <div className="bg-primary/5 rounded-lg p-4 flex items-center justify-between">
          <span className="font-medium">Estimated Total</span>
          <span className="text-2xl font-bold text-primary">₹{calculateTotal()}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Create Order</Button>
      </div>

      {/* New Patient Dialog */}
      <Dialog open={showNewPatient} onOpenChange={setShowNewPatient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name *</label>
                <Input placeholder="Enter full name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone *</label>
                <Input placeholder="+1-555-0000" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Age *</label>
                <Input type="number" placeholder="25" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Gender *</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input placeholder="email@example.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Address</label>
              <Input placeholder="Enter address" />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewPatient(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Patient added successfully');
                setShowNewPatient(false);
              }}>Add Patient</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SampleTracking({ orders, onPrintBarcode }: { orders: any[]; onPrintBarcode: (orderId: string, sampleId: string, patientName: string, testName: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list: any[] = [];
        for (const order of orders) {
          try {
            const rows = await fetchCollectedSamples(order.orderId);
            for (const r of rows) {
              const testName = order.tests.find((t: any) => String(t.id) === String(r.test_id))?.testName || 'Test';
              list.push({
                id: r.id || `${order.orderId}-${r.test_id}`,
                orderId: order.orderId,
                patient: order.patient.name,
                type: r.sample_type || 'N/A',
                test: testName,
                status: r.status || 'Collected',
                collectedAt: r.created_at || order.createdAt,
                barcode: r.id ? `SMP${String(r.id).padStart(4,'0')}${(testName || '').replace(/\s+/g,'').toUpperCase()}` : `${order.orderId}-${r.test_id}`
              });
            }
          } catch {}
        }
        setItems(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orders]);
  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="data-table-header">
              <th className="text-left px-4 py-3">Sample ID</th>
              <th className="text-left px-4 py-3">Patient</th>
              <th className="text-left px-4 py-3">Sample Type</th>
              <th className="text-left px-4 py-3">Test</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Barcode</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={7}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={7}>No collected samples</td></tr>
            ) : (
              items.map((sample) => (
                <tr key={`${sample.orderId}-${sample.id}`} className="data-table-row">
                  <td className="px-4 py-3 font-mono text-sm text-primary">{sample.id}</td>
                  <td className="px-4 py-3">{sample.patient}</td>
                  <td className="px-4 py-3">{sample.type}</td>
                  <td className="px-4 py-3">
                    <span className="bg-muted px-2 py-0.5 rounded text-sm">{sample.test}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sample.status} />
                    <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(sample.collectedAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded">{sample.barcode}</code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => onPrintBarcode(sample.orderId, String(sample.id), sample.patient, sample.test)}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Mock data for tube requirements
// Tube requirements are now derived dynamically from collectedSamples or test metadata

function SampleCollection({ orders, onRefresh }: { orders: any[], onRefresh: () => void }) {
  const hasPendingTests = (order: any) => {
    const tests = order.tests || [];
    return tests.some((t: any) => String(t.status || '').toLowerCase() !== 'collected');
  };
  const pendingOrders = orders.filter(hasPendingTests);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedSamples, setSelectedSamples] = useState<Record<string, string[]>>({});
  const [extraSamples, setExtraSamples] = useState<Record<string, any[]>>({});
  const [showAddSample, setShowAddSample] = useState(false);
  const [collectPopupOpen, setCollectPopupOpen] = useState(false);
  const [collectPopupData, setCollectPopupData] = useState<any>(null);
  const [collectedSamples, setCollectedSamples] = useState<Record<string, any[]>>({});
  const [newSample, setNewSample] = useState({
    name: 'EDTA Tube (Purple)',
    type: 'EDTA Blood',
    volume: '3-5 mL',
    tubes: '1',
    anticoagulant: 'K2-EDTA',
    storage: '2-8°C',
    method: 'N/A',
    tat: 'N/A'
  });

  useEffect(() => {
    const preloadCollected = async () => {
      try {
        const updates: Record<string, any[]> = {};
        await Promise.all((orders || []).map(async (o: any) => {
          try {
            const rows = await fetchCollectedSamples(o.orderId);
            updates[o.orderId] = rows;
          } catch {}
        }));
        if (Object.keys(updates).length > 0) {
          setCollectedSamples(prev => ({ ...prev, ...updates }));
        }
      } catch {}
    };
    preloadCollected();
  }, [orders]);

  const toggleOrder = async (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
    const next = expandedOrderId === orderId ? null : orderId;
    if (next) {
      try {
        const items = await fetchCollectedSamples(orderId);
        setCollectedSamples(prev => ({ ...prev, [orderId]: items }));
      } catch (e) {}
    }
  };

  const handleAddSample = (orderId: string) => {
    const sampleEntry = {
      testName: 'Extra Collection',
      sampleType: newSample.type,
      tubeName: newSample.name,
      volume: newSample.volume,
      anticoagulant: newSample.anticoagulant,
      storage: newSample.storage,
      method: newSample.method,
      tat: newSample.tat,
      tubes: newSample.tubes,
      code: 'EXTRA',
      status: 'Pending',
      isExtra: true
    };
    
    setExtraSamples(prev => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), sampleEntry]
    }));

    toast.success('Extra sample added to collection list');
    setShowAddSample(false);
  };

  const handleSampleToggle = (orderId: string, testIndex: number) => {
    setSelectedSamples(prev => {
      const current = prev[orderId] || [];
      const idxStr = testIndex.toString();
      const updated = current.includes(idxStr)
        ? current.filter(id => id !== idxStr)
        : [...current, idxStr];
      return { ...prev, [orderId]: updated };
    });
  };

  const handleCollectSample = (orderId: string) => {
    toast.success('Samples collected', {
      description: `Samples marked as collected for order ${orderId}`
    });
    setExpandedOrderId(null);
  };

  const handleConfirmCollection = async () => {
    if (!collectPopupData) return;
    
    try {
      const payload = {
        orderId: collectPopupData.orderId,
        testId: collectPopupData.testId,
        sampleInfo: {
          name: collectPopupData.sampleName,
          type: collectPopupData.sampleType,
          volume: collectPopupData.volume,
          tubes: collectPopupData.tubes,
          anticoagulant: collectPopupData.anticoagulant,
          storage: collectPopupData.storage,
          method: collectPopupData.method,
          tat: collectPopupData.tat
        },
        status: 'Sample Received'
      };

      const response = await collectSample(payload);
      
      if (response && response.success) {
        toast.success('Sample collected successfully');
        setCollectPopupOpen(false);
        setCollectedSamples(prev => {
          const orderId = collectPopupData.orderId;
          const testId = collectPopupData.testId;
          const rows = prev[orderId] || [];
          const updatedRow = {
            id: response.id,
            order_id: orderId,
            test_id: testId,
            sample_name: collectPopupData.sampleName,
            sample_type: collectPopupData.sampleType,
            volume: collectPopupData.volume,
            tubes: collectPopupData.tubes,
            anticoagulant: collectPopupData.anticoagulant,
            storage: collectPopupData.storage,
            method: collectPopupData.method,
            tat: collectPopupData.tat,
            status: 'Collected'
          };
          const idx = rows.findIndex((r: any) => String(r.test_id) === String(testId));
          const nextRows = idx >= 0 ? rows.map((r: any, i: number) => (i === idx ? { ...r, ...updatedRow } : r)) : [...rows, updatedRow];
          return { ...prev, [orderId]: nextRows };
        });
        onRefresh();
      } else {
        toast.error(response?.message || 'Failed to collect sample');
      }
    } catch (error: any) {
      console.error('Error collecting sample:', error);
      toast.error(error.message || 'Failed to collect sample');
    }
  };

  // Helper to group tests by sample type for the guide (dynamic)
  const getRequiredTubes = (orderTests: any[]) => {
    const tubes: Record<string, any> = {};
    orderTests.forEach((test: any) => {
      const type = test.sampleType || test.sample_type || 'Unknown';
      if (!tubes[type]) {
        tubes[type] = {
          name: test.tubeName || test.sampleName || type,
          type: type,
          volume: test.volume || 'N/A',
          storage: test.storage || 'N/A',
          anticoagulant: test.anticoagulant || 'N/A',
          tubes: test.tubes || 1,
          color: 'bg-muted/40',
          tests: []
        };
      }
      tubes[type].tests.push(test.testName || test.name || 'Test');
    });
    return Object.values(tubes);
  };

  const handleOpenCollectPopup = (test: any, orderId: string) => {
    const fullTest = tests.find(t => t.id === (test.testId || test.id)) || {};
    const orderSamples = collectedSamples[orderId] || [];
    const sampleForTest = orderSamples.find((s: any) => String(s.test_id) === String(test.testId || test.id));
    setCollectPopupData({
      testId: test.testId || test.id,
      sampleName: sampleForTest?.sample_name ?? test.testName,
      sampleType: sampleForTest?.sample_type ?? test.sampleType,
      volume: sampleForTest?.volume ?? test.volume ?? 'N/A',
      tubes: sampleForTest?.tubes ?? test.tubes ?? '1',
      anticoagulant: sampleForTest?.anticoagulant ?? test.anticoagulant ?? 'N/A',
      storage: sampleForTest?.storage ?? test.storage ?? 'N/A',
      method: sampleForTest?.method ?? test.method ?? fullTest.method ?? 'N/A',
      tat: sampleForTest?.tat ?? test.tat ?? fullTest.tat ?? 'N/A',
      orderId: orderId 
    });
    setCollectPopupOpen(true);
  };

  return (
    <div className="space-y-4">
      {pendingOrders.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-success mb-3" />
          <p className="font-medium">No pending collections</p>
          <p className="text-sm text-muted-foreground mt-1">All samples have been collected</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingOrders.map(order => {
            const isExpanded = expandedOrderId === order.orderId;
            const orderExtraSamples = extraSamples[order.orderId] || [];
            const allTests = [...order.tests, ...orderExtraSamples];
            const requiredTubes = getRequiredTubes(allTests);
            const selectedCount = (selectedSamples[order.orderId] || []).length;
            const totalTests = allTests.length;
            const orderSamplesForCheck = collectedSamples[order.orderId] || [];
            const allOrderTestsCollected = (order.tests || []).every((t: any) => {
              return orderSamplesForCheck.some((s: any) => String(s.test_id) === String(t.id));
            });
            const collectedCount = (order.tests || []).filter((t: any) => {
              return orderSamplesForCheck.some((s: any) => String(s.test_id) === String(t.id));
            }).length;
            const remainingCount = (order.tests || []).length - collectedCount;

            return (
              <div key={order.id} className={cn("bg-card rounded-xl border transition-all", isExpanded ? "ring-2 ring-primary/20" : "")}>
                {/* Header Card */}
                <div className="p-4 cursor-pointer" onClick={() => toggleOrder(order.orderId)}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center transition-colors", isExpanded ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning")}>
                        {isExpanded ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm text-primary font-medium">{order.orderId}</p>
                          <StatusBadge status={order.priority} />
                        </div>
                        <p className="font-medium mt-1">{order.patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.patient.age}y / {order.patient.gender} • {order.patient.phone}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-2">
                         <div className="flex -space-x-2">
                           {requiredTubes.map((tube: any, i) => (
                             <div
                               key={i}
                               className="h-6 w-6 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold bg-muted/40"
                               title={tube.name || tube.type}
                             >
                               {(tube.name || tube.type || 'T').toString().charAt(0)}
                             </div>
                           ))}
                         </div>
                         <span className="text-xs text-muted-foreground">
                           {remainingCount > 0 ? `${remainingCount} Pending` : `${collectedCount} Collected`}
                         </span>
                         {isExpanded ? <div className="ml-2"><div className="h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" /></div> : <div className="ml-2"><div className="h-0 w-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-muted-foreground" /></div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t">
                    
                    {/* Tube Requirements Guide */}
                    <div className="mt-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-2">
                           <FileText className="h-4 w-4 text-muted-foreground" />
                           <h4 className="font-medium text-sm">Tube Requirements & Collection Guide</h4>
                         </div>
                         <Dialog open={showAddSample} onOpenChange={setShowAddSample}>
                           <DialogTrigger asChild>
                             <Button variant="outline" size="sm" className="h-8 gap-2">
                               <Plus className="h-3.5 w-3.5" /> Add Extra Tube
                             </Button>
                           </DialogTrigger>
                           <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add Extra Sample Tube</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Sample Name</label>
                                    <Select 
                                      value={newSample.name} 
                                      onValueChange={(val) => setNewSample({...newSample, name: val})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="EDTA Tube (Purple)">EDTA Tube (Purple)</SelectItem>
                                        <SelectItem value="SST Tube (Red/Gold)">SST Tube (Red/Gold)</SelectItem>
                                        <SelectItem value="Fluoride (Grey)">Fluoride (Grey)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Sample Type</label>
                                    <Input 
                                      value={newSample.type} 
                                      onChange={(e) => setNewSample({...newSample, type: e.target.value})}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Volume</label>
                                    <Input 
                                      value={newSample.volume} 
                                      onChange={(e) => setNewSample({...newSample, volume: e.target.value})}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Tubes</label>
                                    <Input 
                                      type="number" 
                                      value={newSample.tubes} 
                                      onChange={(e) => setNewSample({...newSample, tubes: e.target.value})}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                     <label className="text-sm font-medium">Anticoagulant</label>
                                     <Input 
                                       value={newSample.anticoagulant} 
                                       onChange={(e) => setNewSample({...newSample, anticoagulant: e.target.value})}
                                     />
                                   </div>
                                   <div className="space-y-2">
                                     <label className="text-sm font-medium">Storage</label>
                                     <Input 
                                       value={newSample.storage} 
                                       onChange={(e) => setNewSample({...newSample, storage: e.target.value})}
                                     />
                                   </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                     <label className="text-sm font-medium">Method</label>
                                     <Input 
                                       value={newSample.method} 
                                       onChange={(e) => setNewSample({...newSample, method: e.target.value})}
                                     />
                                   </div>
                                   <div className="space-y-2">
                                     <label className="text-sm font-medium">TAT</label>
                                     <Input 
                                       value={newSample.tat} 
                                       onChange={(e) => setNewSample({...newSample, tat: e.target.value})}
                                     />
                                   </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                                <Button variant="outline" onClick={() => setShowAddSample(false)}>Cancel</Button>
                                <Button onClick={() => handleAddSample(order.orderId)}>Add Tube</Button>
                              </div>
                            </div>
                          </DialogContent>
                         </Dialog>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {(collectedSamples[order.orderId] || []).map((s: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-4 bg-muted/20">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-muted/40">
                                <div className="h-5 w-5 rounded-full border-2 border-current opacity-50" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium text-sm">{s.sample_name || 'Collected Sample'}</p>
                                    <p className="text-xs text-muted-foreground">{s.sample_type || 'N/A'}</p>
                                  </div>
                                  <Badge variant="outline" className="bg-background">Tubes: {s.tubes || 'N/A'}</Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                                  <p>Volume: <span className="text-foreground">{s.volume || 'N/A'}</span></p>
                                  <p>Storage: <span className="text-foreground">{s.storage || 'N/A'}</span></p>
                                  <p className="col-span-2">Anticoagulant: <span className="text-foreground">{s.anticoagulant || 'N/A'}</span></p>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="secondary" className="text-[10px] h-5">
                                    {(order.tests.find((t: any) => String(t.id) === String(s.test_id))?.testName) || 'Test'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Samples to Collect List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <CheckCircle className="h-4 w-4 text-muted-foreground" />
                           <h4 className="font-medium text-sm">Samples to Collect</h4>
                         </div>
                         <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => {
                           const allIndices = allTests.map((_: any, i: number) => i.toString());
                           setSelectedSamples(prev => ({ ...prev, [order.orderId]: allIndices }));
                         }}>
                           Select All Pending
                         </Button>
                      </div>

                      <div className="border rounded-lg divide-y bg-background">
                        {allTests.map((test: any, idx: number) => {
                          const isSelected = (selectedSamples[order.orderId] || []).includes(idx.toString());
                          const fullTest = tests.find(t => t.id === test.testId) || {};
                          const orderSamples = collectedSamples[order.orderId] || [];
                          const sampleForTest = orderSamples.find((s: any) => String(s.test_id) === String(test.testId || test.id));
                          return (
                            <div key={idx} className={cn("p-3 flex items-center gap-3 transition-colors", isSelected ? "bg-primary/5" : "")}>
                              <Checkbox 
                                id={`test-${order.orderId}-${idx}`}
                                checked={isSelected}
                                onCheckedChange={() => handleSampleToggle(order.orderId, idx)}
                              />
                              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-muted/40">
                                <div className="h-4 w-4 rounded-full border-2 border-current opacity-50" />
                              </div>
                              <div className="flex-1">
                                <label htmlFor={`test-${order.orderId}-${idx}`} className="font-medium text-sm cursor-pointer block">
                                  {test.testName} <Badge variant="outline" className="ml-2 text-[10px]">{test.code || 'TEST'}</Badge>
                                </label>
                                {sampleForTest && (
                                  <p className="text-xs text-muted-foreground">
                                    {`${sampleForTest.sample_type} • ${sampleForTest.volume} • Tubes: ${sampleForTest.tubes}`}
                                  </p>
                                )}
                                
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleOpenCollectPopup(test, order.orderId)}
                                className="mr-2"
                              >
                                Collect Sample
                              </Button>
                               {sampleForTest ? (
                                 <div className="px-2 py-1 rounded-md border border-success/20 bg-success/10 text-success text-xs">
                                   Collected
                                 </div>
                               ) : (
                                 <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>
                               )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button 
                          onClick={async () => {
                            try {
                              const oid = order.labOrderId || order.orderId;
                              const res = await updateLabOrderStatus(String(oid), 'Collected');
                              if (res && res.success) {
                                toast.success('Order marked as Collected');
                                setExpandedOrderId(null);
                                onRefresh();
                              } else {
                                toast.error(res?.message || 'Failed to update order status');
                              }
                            } catch (e: any) {
                              toast.error(e?.message || 'Failed to update order status');
                            }
                          }} 
                          className="gap-2 ml-2"
                          disabled={!allOrderTestsCollected}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Order Collected
                        </Button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Collect Sample Popup */}
      <Dialog open={collectPopupOpen} onOpenChange={setCollectPopupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Sample</DialogTitle>
          </DialogHeader>
          {collectPopupData && (
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Sample Name</label>
                     <Input value={collectPopupData.sampleName} onChange={(e) => setCollectPopupData({ ...collectPopupData, sampleName: e.target.value })} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Sample Type</label>
                     <Input value={collectPopupData.sampleType} onChange={(e) => setCollectPopupData({ ...collectPopupData, sampleType: e.target.value })} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Volume</label>
                     <Input value={collectPopupData.volume} onChange={(e) => setCollectPopupData({ ...collectPopupData, volume: e.target.value })} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Tubes</label>
                     <Input value={collectPopupData.tubes} onChange={(e) => setCollectPopupData({ ...collectPopupData, tubes: e.target.value })} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Anticoagulant</label>
                     <Input value={collectPopupData.anticoagulant} onChange={(e) => setCollectPopupData({ ...collectPopupData, anticoagulant: e.target.value })} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Storage</label>
                     <Input value={collectPopupData.storage} onChange={(e) => setCollectPopupData({ ...collectPopupData, storage: e.target.value })} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Method</label>
                     <Input value={collectPopupData.method} onChange={(e) => setCollectPopupData({ ...collectPopupData, method: e.target.value })} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium">TAT</label>
                     <Input value={collectPopupData.tat} onChange={(e) => setCollectPopupData({ ...collectPopupData, tat: e.target.value })} />
                   </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button variant="outline" onClick={() => setCollectPopupOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmCollection}>Confirm Collection</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
