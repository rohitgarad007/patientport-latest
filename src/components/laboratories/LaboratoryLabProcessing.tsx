import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Save
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { fetchProcessingQueue, fetchValidationQueue, fetchCompletedReports, getMasterLabTestById, saveDraft, getDrafts, submitValidation, approveAndGenerateReport, fetchReportDetails, uploadGeneratedReport } from '@/services/LaboratoryService';

const orderDetailsCache: Record<string, Record<string, any>> = {};
const orderDraftsCache: Record<string, Record<string, any>> = {};

interface QueueTest {
  id: string;
  testName: string;
  status: string;
  urgency: string;
  lab_test_id: string;
  sample_type: string;
  method: string;
  tat: string;
  test_code: string;
}

interface QueueOrder {
  order_id: string;
  treatment_id: string;
  appointment_id: string;
  order_status: string;
  created_at: string;
  order_number: string;
  fname: string;
  lname: string;
  gender: string;
  dob: string;
  email: string;
  phone: string;
  tests: QueueTest[];
}

interface ResultValue {
  parameterId: string;
  value: string;
  flag: 'Normal' | 'Low' | 'High' | 'Critical';
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export default function LaboratoryLabProcessing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [queueData, setQueueData] = useState<QueueOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const [processing, validation, completed] = await Promise.all([
        fetchProcessingQueue(),
        fetchValidationQueue(),
        fetchCompletedReports()
      ]);
      setQueueData(processing);
      setValidationOrders(validation);
      setCompletedOrders(completed);
    } catch (error) {
      console.error('Failed to load processing queue:', error);
      toast.error('Failed to load processing queue');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders that are in processing stages
  const processingOrders = queueData.filter(o => {
    const fullName = `${o.fname} ${o.lname}`;
    const searchMatch = searchQuery === '' || 
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Additional filters can be implemented based on status if needed
    // currently showing all from queue which are 'Collected'
    return searchMatch;
  });

  const [validationOrders, setValidationOrders] = useState<QueueOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<QueueOrder[]>([]);
  const criticalCount = 0; // Placeholder

  return (
    <div className="min-h-screen">
     
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Sample Queue - Left Panel */}
        <div className="w-full lg:w-80 xl:w-96 border-r bg-card flex flex-col">
          <div className="p-3 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search samples..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Samples</SelectItem>
                <SelectItem value="pending">Pending Entry</SelectItem>
                <SelectItem value="validation">Needs Validation</SelectItem>
                <SelectItem value="critical">Critical Values</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-2 p-3 border-b bg-muted/30">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{processingOrders.length}</p>
              <p className="text-xs text-muted-foreground">In Queue</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-warning">{validationOrders.length}</p>
              <p className="text-xs text-muted-foreground">Validation</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-critical">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </div>

          {/* Queue Tabs */}
          <Tabs defaultValue="queue" className="flex-1 flex flex-col">
            <TabsList className="mx-3 mt-3 grid grid-cols-3">
              <TabsTrigger value="queue">Queue ({processingOrders.length})</TabsTrigger>
              <TabsTrigger value="validation">Validation ({validationOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="flex-1 overflow-y-auto scrollbar-thin m-0 p-0">
              <div className="p-2 space-y-1">
                {loading ? (
                   <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Loading queue...</p>
                  </div>
                ) : processingOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No samples in queue</p>
                  </div>
                ) : (
                  processingOrders.map(order => (
                    <button
                      key={order.order_id}
                      onClick={() => setSelectedOrder(order.order_id)}
                      className={cn(
                        'w-full p-3 rounded-lg text-left transition-all',
                        selectedOrder === order.order_id 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono text-sm text-primary font-medium">{order.order_number}</p>
                          <p className="font-medium truncate">{order.fname} {order.lname}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.gender} / {order.dob}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <StatusBadge status={order.order_status} />
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {order.tests.map((test, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              test.status === 'Validated' && 'border-success/50 text-success',
                              test.status === 'Results Entered' && 'border-warning/50 text-warning',
                              test.status === 'Processing' && 'border-processing/50 text-processing'
                            )}
                          >
                            {test.testName}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="validation" className="flex-1 overflow-y-auto scrollbar-thin m-0 p-0">
              <div className="p-2 space-y-1">
                {validationOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No pending validations</p>
                  </div>
                ) : (
                  validationOrders.map(order => (
                    <button
                      key={order.order_id}
                      onClick={() => setSelectedOrder(order.order_id)}
                      className={cn(
                        'w-full p-3 rounded-lg text-left transition-all',
                        selectedOrder === order.order_id 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono text-sm text-primary font-medium">{order.order_number}</p>
                          <p className="font-medium truncate">{order.fname} {order.lname}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.gender} / {order.dob}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <StatusBadge status={order.order_status} />
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {order.tests.map((test, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              test.status === 'Validated' && 'border-success/50 text-success',
                              test.status === 'Results Entered' && 'border-warning/50 text-warning',
                              test.status === 'Processing' && 'border-processing/50 text-processing'
                            )}
                          >
                            {test.testName}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </TabsContent>

          </Tabs>
        </div>

        {/* Result Entry - Right Panel */}
        <div className="flex-1 overflow-y-auto bg-background">
          {selectedOrder ? (
            <ResultEntryPanel 
                order={queueData.find(o => o.order_id === selectedOrder) || validationOrders.find(o => o.order_id === selectedOrder)!} 
                onOrderComplete={() => {
                    setSelectedOrder(null);
                    loadQueue();
                }} 
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Select a sample to process</p>
                <p className="text-sm mt-1">Choose from the queue on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultEntryPanel({ order, onOrderComplete }: { order: QueueOrder; onOrderComplete: () => void }) {
  const [resultValues, setResultValues] = useState<Record<string, ResultValue>>({});
  const [prevResultValues, setPrevResultValues] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [savedDraft, setSavedDraft] = useState(false);
  
  const [testDetailsMap, setTestDetailsMap] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const lastFetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchDetailsAndDrafts = async () => {
        setLoadingDetails(true);
        setResultValues({});
        const details: Record<string, any> = {};
        const draftsMap: Record<string, ResultValue> = {};

        try {
            const uniqueDetailIds = Array.from(new Set(order.tests.map(t => t.lab_test_id).filter(Boolean)));
            const detailPromises = uniqueDetailIds.map(id => 
              getMasterLabTestById(String(id))
                .then(res => { if (res.success && res.data) { details[String(id)] = res.data; } })
                .catch(e => {})
            );
            await Promise.all(detailPromises);
            setTestDetailsMap(details);

            const uniqueTestIds = Array.from(new Set(order.tests.map(t => t.id)));
            const draftsPromises = uniqueTestIds.map(tid =>
              getDrafts(order.order_id, String(tid))
                .then(testDrafts => {
                  if (testDrafts && Array.isArray(testDrafts)) {
                    testDrafts.forEach((d: any) => {
                      draftsMap[d.parameter_id] = {
                        parameterId: d.parameter_id,
                        value: d.result_value,
                        flag: d.flag as 'Normal' | 'Low' | 'High' | 'Critical'
                      };
                    });
                  }
                })
                .catch(e => {})
            );
            await Promise.all(draftsPromises);
            setResultValues(draftsMap);
            orderDetailsCache[String(order.order_id)] = details;
            orderDraftsCache[String(order.order_id)] = draftsMap;
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load test details or drafts");
        } finally {
            setLoadingDetails(false);
        }
    };

    if (order) {
        const key = String(order.order_id);
        if (orderDetailsCache[key] && orderDraftsCache[key]) {
          setTestDetailsMap(orderDetailsCache[key]);
          setResultValues(orderDraftsCache[key]);
        } else {
          if (lastFetchKeyRef.current === key) {
            return;
          }
          lastFetchKeyRef.current = key;
          fetchDetailsAndDrafts();
        }
    }
  }, [order.order_id]);


  // Calculate flag based on value and reference range
  const calculateFlag = (value: number, refMin: number, refMax: number, critMin?: number, critMax?: number): 'Normal' | 'Low' | 'High' | 'Critical' => {
    if (critMin !== undefined && value < critMin) return 'Critical';
    if (critMax !== undefined && value > critMax) return 'Critical';
    if (value < refMin) return 'Low';
    if (value > refMax) return 'High';
    return 'Normal';
  };

  // Handle value change with auto-flag calculation
  const handleValueChange = (parameterId: string, value: string, refMin: number, refMax: number, critMin?: number, critMax?: number) => {
    const numValue = parseFloat(value);
    const existing = resultValues[parameterId]?.value;
    const existingNum = existing !== undefined ? parseFloat(existing) : NaN;
    if (!isNaN(existingNum)) {
      setPrevResultValues(prev => ({ ...prev, [parameterId]: existingNum }));
    }
    const flag = isNaN(numValue) ? 'Normal' : calculateFlag(numValue, refMin, refMax, critMin, critMax);
    
    setResultValues(prev => ({
      ...prev,
      [parameterId]: { parameterId, value, flag }
    }));
  };

  // Delta check - compare with previous values (mock)
  const getDeltaCheck = (prevValue: number | undefined, currentValue: number): { delta: number; direction: 'up' | 'down' | 'stable' } | null => {
    if (prevValue === undefined || isNaN(currentValue) || prevValue === 0) return null;
    const delta = ((currentValue - prevValue) / prevValue) * 100;
    return {
      delta: Math.abs(delta),
      direction: delta > 5 ? 'up' : delta < -5 ? 'down' : 'stable'
    };
  };

  // Save draft
  const handleSaveDraft = async () => {
    try {
        const draftsToSave = [];
        for (const test of order.tests) {
            const details = testDetailsMap[test.lab_test_id];
            if (details && details.parameters) {
                for (const param of details.parameters) {
                    const result = resultValues[param.id];
                    if (result) {
                         // Calculate delta if needed, for now just basic fields
                         const prevValue = prevResultValues[param.id];
                         const numValue = parseFloat(result.value);
                         const deltaInfo = getDeltaCheck(prevValue, numValue);

                        draftsToSave.push({
                            order_id: order.order_id,
                            test_id: test.id,
                            parameter_id: param.id,
                            result_value: result.value,
                            flag: result.flag,
                            delta: deltaInfo ? deltaInfo.delta.toFixed(2) : null,
                            delta_direction: deltaInfo ? deltaInfo.direction : null,
                            draft_status: 'draft'
                        });
                    }
                }
            }
        }

        if (draftsToSave.length === 0) {
            toast.info("No data to save");
            return;
        }

        await saveDraft(draftsToSave);
        setSavedDraft(true);
        toast.success('Draft saved successfully', {
            description: 'Your progress has been saved'
        });
    } catch (error) {
        console.error("Failed to save draft:", error);
        toast.error("Failed to save draft");
    }
  };

  // Reset values
  const handleReset = () => {
    setResultValues({});
    setSavedDraft(false);
    toast.info('Values reset', {
      description: 'All entered values have been cleared'
    });
  };

  // Submit for validation
  const handleSubmitForValidation = async () => {
    try {
        // First save draft to ensure everything is up to date
        await handleSaveDraft();
        
        // Then submit for validation
        // We might need to do this per test or for the whole order. 
        // The API supports test_id, so we can iterate or send one request if the backend handles all.
        // For now, let's submit for each test in the order.
        for (const test of order.tests) {
            await submitValidation(order.order_id, test.id);
        }

        toast.success('Submitted for validation', {
            description: 'Results sent to pathologist for review'
        });
        onOrderComplete();
    } catch (error) {
        console.error("Failed to submit for validation:", error);
        toast.error("Failed to submit for validation");
    }
  };

  const generateReportPDF = (details: any) => {
    const doc = new jsPDF();
    let y = 20;

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

    doc.setDrawColor(200, 200, 200);
    doc.rect(15, y, 180, 35);
    
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("PATIENT INFORMATION", 20, y + 8);
    doc.text("REPORT DETAILS", 110, y + 8);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    doc.text(`Name: ${details.fname} ${details.lname}`, 20, y + 16);
    doc.text(`Gender/DOB: ${details.gender} / ${details.dob}`, 20, y + 22);
    doc.text(`Phone: ${details.phone}`, 20, y + 28);

    doc.text(`Order ID: ${details.order_number}`, 110, y + 16);
    doc.text(`Ref. Doctor: ${details.doc_name ? "Dr. " + details.doc_name : "—"}`, 110, y + 22);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 110, y + 28);

    y += 45;

    if (details.tests && Array.isArray(details.tests)) {
      details.tests.forEach((test: any) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(245, 245, 245);
        doc.rect(15, y, 180, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(test.testName || "Test", 20, y + 5);
        y += 12;

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

        if (test.results && Array.isArray(test.results)) {
          test.results.forEach((res: any) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            
            doc.setTextColor(0, 0, 0);
            doc.text(res.parameterName || "", 20, y);
            
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

  const handleApproveGenerateReport = async () => {
    try {
      await handleSaveDraft();
      const testIds = order.tests.map(t => t.id);
      const res = await approveAndGenerateReport(order.order_id, testIds, comments);
      if (!res.success) {
        toast.error(res.message || 'Failed to generate report');
        return;
      }

      toast.info('Generating and uploading report...', {
        description: 'Please wait while the report PDF is prepared'
      });

      const details = await fetchReportDetails(order.order_id);
      if (!details) {
        toast.error('Failed to load report details for PDF');
        return;
      }

      const doc = generateReportPDF(details);
      const pdfBlob = doc.output('blob');

      const formData = new FormData();
      formData.append('report_file', pdfBlob, `Report_${details.order_number}.pdf`);
      formData.append('patient_id', details.patient_id);
      formData.append('treatment_id', details.treatment_id);

      const testIdsForUpload = details.tests.map((t: any) => String(t.lab_test_id)).filter(Boolean);
      formData.append('covered_tests', JSON.stringify(testIdsForUpload));
      formData.append('lab_test_id', testIdsForUpload.join(','));

      const uploadRes = await uploadGeneratedReport(formData);
      if (uploadRes.success) {
        toast.success('Report generated and uploaded', {
          description: 'Results approved, report generated and file uploaded'
        });
        onOrderComplete();
      } else {
        toast.error(uploadRes.message || 'Failed to upload report');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate/upload report');
    }
  };

  // Request re-test
  const handleRequestRetest = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for re-test');
      return;
    }
    toast.warning('Re-test requested', {
      description: 'Sample marked for re-collection'
    });
    setShowRejectDialog(false);
    onOrderComplete();
  };

  // Mock audit log
  const auditLog: AuditLogEntry[] = [
    { id: '1', timestamp: '2024-01-15 10:00:00', user: 'Tech. John', action: 'Sample Received', details: 'Sample received in lab' },
    { id: '2', timestamp: '2024-01-15 10:15:00', user: 'Tech. John', action: 'Processing Started', details: 'Started processing CBC' },
    { id: '3', timestamp: '2024-01-15 11:30:00', user: 'Tech. John', action: 'Results Entered', details: 'Entered initial results' },
    { id: '4', timestamp: '2024-01-15 11:45:00', user: 'System', action: 'Critical Alert', details: 'Platelet count below critical threshold' },
  ];

  if (loadingDetails) {
      return <div className="p-8 text-center">Loading test details...</div>;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Patient Info Header */}
      <div className="bg-card rounded-xl border p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{order.fname} {order.lname}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={order.order_status} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
              <span>{order.dob} / {order.gender}</span>
              <span>•</span>
              <span>{order.phone}</span>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="font-mono text-sm text-primary font-semibold">{order.order_number}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString()} at{' '}
              {new Date(order.created_at).toLocaleTimeString()}
            </p>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAuditLog(true)}>
              <History className="h-4 w-4" />
              Audit Log
            </Button>
          </div>
        </div>
      </div>

      {/* Test Results Entry */}
      {order.tests.map((test, testIdx) => {
        const details = testDetailsMap[test.lab_test_id];
        const parameters = details?.parameters || [];
        
        return (
          <div key={testIdx} className="bg-card rounded-xl border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{test.testName}</h3>
                <StatusBadge status={test.status} />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{test.sample_type}</Badge>
              </div>
            </div>
            
            <div className="p-4">
                {parameters.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="data-table-header">
                    <th className="text-left px-3 py-2 w-1/4">Parameter</th>
                    <th className="text-left px-3 py-2 w-32">Result</th>
                    <th className="text-left px-3 py-2 w-20">Unit</th>
                    <th className="text-left px-3 py-2">Reference</th>
                    <th className="text-left px-3 py-2 w-24">Flag</th>
                    <th className="text-left px-3 py-2 w-24">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((param: any, idx: number) => {
                      const genderKey = (order.gender || '').toLowerCase();
                      const rangeByGender = param.reference_ranges?.find((r: any) => (r.gender || '').toLowerCase() === genderKey) || param.reference_ranges?.[0];
                      const critical = param.critical_values;
                      
                      const minVal = rangeByGender ? (rangeByGender.min_value ?? rangeByGender.range_min) : undefined;
                      const maxVal = rangeByGender ? (rangeByGender.max_value ?? rangeByGender.range_max) : undefined;
                      const min = minVal !== undefined ? parseFloat(String(minVal)) : 0;
                      const max = maxVal !== undefined ? parseFloat(String(maxVal)) : 0;
                      const critMin = critical && critical.critical_low !== undefined ? parseFloat(String(critical.critical_low)) : undefined;
                      const critMax = critical && critical.critical_high !== undefined ? parseFloat(String(critical.critical_high)) : undefined;

                      const currentValue = resultValues[param.id]?.value ?? '';
                      const numValue = parseFloat(currentValue);
                      const delta = getDeltaCheck(prevResultValues[param.id], numValue);
                      const currentFlag = resultValues[param.id]?.flag ?? 'Normal';
                      
                      return (
                        <tr key={idx} className="data-table-row">
                          <td className="px-3 py-2 font-medium">{param.parameter_name}</td>
                          <td className="px-3 py-2">
                            <Input 
                              type="text"
                              value={currentValue}
                              onChange={(e) => {
                                handleValueChange(param.id, e.target.value, min, max, critMin, critMax);
                              }}
                              className={cn(
                                'w-28 h-8 font-mono',
                                currentFlag === 'Critical' && 'border-critical bg-critical/5 text-critical',
                                currentFlag === 'High' && 'border-warning bg-warning/5 text-warning',
                                currentFlag === 'Low' && 'border-info bg-info/5 text-info'
                              )}
                            />
                          </td>
                          <td className="px-3 py-2 text-sm text-muted-foreground">{param.unit}</td>
                          <td className="px-3 py-2 font-mono text-sm">
                              {rangeByGender && minVal !== undefined && maxVal !== undefined ? `${minVal} - ${maxVal}` : '-'}
                          </td>
                          <td className="px-3 py-2">
                            {currentFlag === 'Normal' ? (
                              <span className="normal-value px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Normal
                              </span>
                            ) : currentFlag === 'Critical' ? (
                              <span className="critical-value px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Critical
                              </span>
                            ) : (
                              <span className={cn(
                                'px-2 py-1 rounded text-xs font-medium flex items-center gap-1',
                                currentFlag === 'High' ? 'high-value' : 'low-value'
                              )}>
                                {currentFlag === 'High' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {currentFlag}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {delta && (
                              <span className={cn(
                                'flex items-center gap-1',
                                delta.direction === 'up' && 'text-warning',
                                delta.direction === 'down' && 'text-info',
                                delta.direction === 'stable' && 'text-muted-foreground'
                              )}>
                                {delta.direction === 'up' && <TrendingUp className="h-3 w-3" />}
                                {delta.direction === 'down' && <TrendingDown className="h-3 w-3" />}
                                {delta.direction === 'stable' && <Minus className="h-3 w-3" />}
                                {delta.delta.toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                  })}
                </tbody>
              </table>
              ) : (
                  <div className="text-center py-4 text-muted-foreground">
                      No parameters defined for this test.
                  </div>
              )}
            </div>
          </div>
        );
      })}
      
      {order.order_status === 'Validation Pending' ? (
        <div className=" bottom-0 bg-warning/5 border-t p-4 space-y-3">
          <div>
            <p className="font-medium text-warning">Pathologist Validation Required</p>
            <p className="text-sm text-muted-foreground">Please review results and add comments, then approve and generate the report.</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Comments / Interpretation</p>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add pathologist comments or clinical interpretation..."
              className="w-full h-24 rounded-md border bg-muted/20 p-2 text-sm"
            />
          </div>
          <div className="flex justify-end">
            <Button className="gap-2 bg-success text-white hover:bg-success/90" onClick={handleApproveGenerateReport}>
              <CheckCircle2 className="h-4 w-4" />
              Approve & Generate Report
            </Button>
          </div>
        </div>
      ) : (
        <div className="sticky bottom-0 bg-background border-t p-4 flex justify-end gap-3">
          <Button variant="outline" className="gap-2" onClick={handleSaveDraft}>
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button className="gap-2 bg-success text-white hover:bg-success/90" onClick={handleSubmitForValidation}>
            <CheckCircle2 className="h-4 w-4" />
            Submit for Validation
          </Button>
        </div>
      )}
    </div>
  );
}
