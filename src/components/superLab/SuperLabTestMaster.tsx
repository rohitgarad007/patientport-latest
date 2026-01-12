import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  FlaskConical,
  Clock,
  IndianRupee,
  GripVertical,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Settings2,
  TestTube2,
  Beaker,
  Activity,
  Eye,
  CalendarDays,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  fetchMasterLabTests,
  getMasterLabTestById,
  addMasterLabTest,
  updateMasterLabTest,
  deleteMasterLabTest
} from '@/services/masterLaboratoryService';

// Extended Test Master interface
interface TestParameterExtended {
  id: string;
  name: string;
  unit: string;
  method: string;
  resultType: 'numeric' | 'text' | 'positive_negative' | 'range_based';
  referenceRanges: {
    male: { min: number; max: number };
    female: { min: number; max: number };
    child?: { min: number; max: number };
  };
  criticalLow?: number;
  criticalHigh?: number;
  decimalPrecision: number;
  showInReport: boolean;
  displayOrder: number;
}

interface SuperLabTestMasterExtended {
  id: string;
  code: string;
  name: string;
  department: string;
  sampleType: string;
  method: string;
  tat: string;
  price: number;
  status: 'active' | 'inactive';
  parameters: TestParameterExtended[];
  panicAlertEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const departments = ['Hematology', 'Biochemistry', 'Immunoassay', 'Microbiology', 'Clinical Pathology', 'Molecular Biology', 'Histopathology', 'Cytology'];
const sampleTypes = ['Blood', 'EDTA Blood', 'Serum', 'Plasma', 'Urine', 'Stool', 'CSF', 'Sputum', 'Swab', 'Nasopharyngeal Swab', 'Tissue', 'Serum (Fasting)'];
const methods = [
  'Automated',
  'Manual',
  'Spectrophotometry',
  'CLIA',
  'ELISA',
  'HPLC',
  'RT-PCR',
  'PCR',
  'Slide Agglutination',
  'Kinetic',
  'ISE',
  'Colorimetric',
  'Turbidimetric',
  'Nephelometric',
  'Immunoturbidimetric',
  'Chemiluminescence',
  'Electrochemiluminescence (ECLIA)',
  'Latex Agglutination',
  'Flow Cytometry',
  'Western Blot',
  'Mass Spectrometry',
  'Electrophoresis',
  'Chromatography',
  'Microscopy',
  'Culture',
  'Rapid Test',
  'Point of Care (POC)',
  'Enzymatic',
  'Immunofluorescence',
  'Radioimmunassay (RIA)',
  'Visual',
  'Dipstick',
  'Calculated',
  'Refractometry',
  'Osmometry',
  'Coagulometry',
  'Aggregometry',
];

const parameterUnits = [
  // Concentration units
  { group: 'Concentration', units: ['g/dL', 'mg/dL', 'µg/dL', 'ng/dL', 'pg/dL', 'g/L', 'mg/L', 'µg/L', 'ng/L', 'pg/L', 'mmol/L', 'µmol/L', 'nmol/L', 'pmol/L', 'mEq/L', 'IU/L', 'U/L', 'mIU/L', 'µIU/mL', 'mU/L'] },
  // Cell counts
  { group: 'Cell Counts', units: ['×10³/µL', '×10⁶/µL', '×10⁹/L', '×10¹²/L', 'cells/µL', 'cells/mm³', '/HPF', '/LPF'] },
  // Percentage & Ratio
  { group: 'Percentage & Ratio', units: ['%', 'Ratio', 'Index'] },
  // Time units
  { group: 'Time', units: ['seconds', 'minutes', 'hours'] },
  // Volume & Mass
  { group: 'Volume & Mass', units: ['mL', 'L', 'fL', 'pg', 'mg', 'g', 'kg'] },
  // Other
  { group: 'Other', units: ['mm/hr', 'mm Hg', 'pH', 'mOsm/kg', 'Titre', 'Copy/mL', 'CFU/mL', 'EU/mL', 'BAU/mL', 'kU/L', 'ng/mL', 'µg/mL', 'pg/mL', 'IU/mL', 'AU/mL', 'U/mL', 'mU/mL', ''] },
];

const tatOptions = ['30 minutes', '1 hour', '2 hours', '4 hours', '6 hours', '12 hours', '24 hours', '48 hours', '72 hours'];
const resultTypes = [
  { value: 'numeric', label: 'Numeric' },
  { value: 'text', label: 'Text' },
  { value: 'positive_negative', label: 'Positive / Negative' },
  { value: 'range_based', label: 'Range Based' },
];

const emptyParameter: TestParameterExtended = {
  id: '',
  name: '',
  unit: '',
  method: 'Automated',
  resultType: 'numeric',
  referenceRanges: {
    male: { min: 0, max: 0 },
    female: { min: 0, max: 0 },
  },
  decimalPrecision: 2,
  showInReport: true,
  displayOrder: 0,
};

const emptyTest: SuperLabTestMasterExtended = {
  id: '',
  code: '',
  name: '',
  department: '',
  sampleType: '',
  method: '',
  tat: '4 hours',
  price: 0,
  status: 'active',
  parameters: [],
  panicAlertEnabled: true,
  createdAt: new Date().toISOString().split('T')[0],
  updatedAt: new Date().toISOString().split('T')[0],
};

const SuperLabTestMaster = () => {
  const { toast } = useToast();
  const [tests, setTests] = useState<SuperLabTestMasterExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingTest, setViewingTest] = useState<SuperLabTestMasterExtended | null>(null);
  const [editingTest, setEditingTest] = useState<SuperLabTestMasterExtended | null>(null);
  const [formData, setFormData] = useState<SuperLabTestMasterExtended>(emptyTest);
  const [activeTab, setActiveTab] = useState('basic');
  const [expandedParameterId, setExpandedParameterId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Load tests
  const loadTests = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchMasterLabTests(page, itemsPerPage, searchTerm, filterDepartment, filterStatus);
      if (res.success && res.data) {
        const mappedTests = res.data.map((t: any) => ({
          id: t.id,
          code: t.test_code,
          name: t.test_name,
          department: t.department,
          sampleType: t.sample_type,
          method: t.method,
          tat: t.tat,
          price: Number(t.price),
          status: t.status === '1' || t.status === 1 ? 'active' : 'inactive',
          parameters: [], // List doesn't return parameters for performance
          panicAlertEnabled: t.panic_alert_enabled === '1' || t.panic_alert_enabled === 1,
          createdAt: t.created_at,
          updatedAt: t.updated_at
        }));
        setTests(mappedTests);
        setTotalRecords(res.total || 0);
        setTotalPages(Math.ceil((res.total || 0) / itemsPerPage));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load tests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load initial data, search is now manual
    loadTests(1);
  }, []); // Remove searchTerm dependency

  const handleSearch = () => {
    loadTests(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadTests(page);
    }
  };

  const fetchDetails = async (id: string) => {
    try {
      const res = await getMasterLabTestById(id);
      if (res.success && res.data) {
        const { test, advanced, parameters } = res.data;
        const fullTest: SuperLabTestMasterExtended = {
          id: test.id,
          code: test.test_code,
          name: test.test_name,
          department: test.department,
          sampleType: test.sample_type,
          method: test.method,
          tat: test.tat,
          price: Number(test.price),
          status: test.status === '1' || test.status === 1 ? 'active' : 'inactive',
          panicAlertEnabled: advanced ? (advanced.enable_panic_alerts === '1' || advanced.enable_panic_alerts === 1) : false,
          createdAt: test.created_at,
          updatedAt: test.updated_at,
          parameters: (parameters || []).map((p: any) => ({
            id: p.id,
            name: p.parameter_name,
            unit: p.unit,
            method: p.method,
            resultType: p.result_type,
            decimalPrecision: Number(p.decimal_precision),
            showInReport: p.show_in_report === '1' || p.show_in_report === 1,
            displayOrder: Number(p.display_order),
            criticalLow: p.critical_values?.critical_low ? Number(p.critical_values.critical_low) : undefined,
            criticalHigh: p.critical_values?.critical_high ? Number(p.critical_values.critical_high) : undefined,
            referenceRanges: {
              male: {
                min: Number(p.reference_ranges?.find((r: any) => r.gender === 'male')?.min_value || 0),
                max: Number(p.reference_ranges?.find((r: any) => r.gender === 'male')?.max_value || 0)
              },
              female: {
                min: Number(p.reference_ranges?.find((r: any) => r.gender === 'female')?.min_value || 0),
                max: Number(p.reference_ranges?.find((r: any) => r.gender === 'female')?.max_value || 0)
              },
              child: {
                min: Number(p.reference_ranges?.find((r: any) => r.gender === 'child')?.min_value || 0),
                max: Number(p.reference_ranges?.find((r: any) => r.gender === 'child')?.max_value || 0)
              }
            }
          }))
        };
        return fullTest;
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load test details", variant: "destructive" });
    }
    return null;
  };

  const handleViewTest = async (test: SuperLabTestMasterExtended) => {
    const fullTest = await fetchDetails(test.id);
    if (fullTest) {
      setViewingTest(fullTest);
      setIsViewDialogOpen(true);
    }
  };

  // Filter tests locally for department/status
  // const filteredTests = tests; 
  
  const handleAddTest = () => {
    setEditingTest(null);
    setFormData({ ...emptyTest });
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  const handleEditTest = async (test: SuperLabTestMasterExtended) => {
    const fullTest = await fetchDetails(test.id);
    if (fullTest) {
      setEditingTest(fullTest);
      setFormData({ ...fullTest });
      setActiveTab('basic');
      setIsDialogOpen(true);
    }
  };

  const handleDuplicateTest = async (test: SuperLabTestMasterExtended) => {
    const fullTest = await fetchDetails(test.id);
    if (!fullTest) return;
    
    const newTest = {
      ...fullTest,
      id: '', // Will be assigned by backend
      code: `${fullTest.code}-COPY`,
      name: `${fullTest.name} (Copy)`,
      parameters: fullTest.parameters.map(p => ({ ...p, id: `P${Date.now()}-${Math.random()}` })),
    };
    setEditingTest(null);
    setFormData(newTest);
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  const handleDeleteTest = async (testId: string) => {
    const result = await Swal.fire({
      title: "Delete Test",
      text: "Are you sure you want to delete this test?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      allowOutsideClick: false,
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      try {
        await deleteMasterLabTest(testId);
        await Swal.fire({
          title: "Deleted",
          text: "The test has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        loadTests(currentPage);
      } catch (e) {
        await Swal.fire({
          title: "Delete Failed",
          text: "Failed to delete test. Please try again.",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } else {
      toast({
        title: "Deletion Cancelled",
        description: "The test was not deleted.",
      });
    }
  };

  const handleSaveTest = async () => {
    if (!formData.code || !formData.name || !formData.department || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Code, Name, Department, Price).",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      test: {
        lab_id: null,
        test_code: formData.code,
        test_name: formData.name,
        department: formData.department,
        sample_type: formData.sampleType,
        method: formData.method,
        tat: formData.tat,
        price: formData.price,
        status: formData.status === 'active' ? 1 : 0
      },
      advanced: {
        enable_panic_alerts: formData.panicAlertEnabled ? 1 : 0
      },
      parameters: formData.parameters.map(p => ({
        basic: {
          parameter_name: p.name,
          unit: p.unit,
          method: p.method,
          result_type: p.resultType,
          decimal_precision: p.decimalPrecision,
          show_in_report: p.showInReport ? 1 : 0,
          display_order: p.displayOrder
        },
        critical: {
          critical_low: p.criticalLow,
          critical_high: p.criticalHigh
        },
        ranges: [
          { gender: 'male', min_value: p.referenceRanges.male.min, max_value: p.referenceRanges.male.max },
          { gender: 'female', min_value: p.referenceRanges.female.min, max_value: p.referenceRanges.female.max },
          { gender: 'child', min_value: p.referenceRanges.child?.min || 0, max_value: p.referenceRanges.child?.max || 0 }
        ]
      }))
    };

    try {
      if (editingTest) {
        await updateMasterLabTest(editingTest.id, payload);
        toast({
          title: "Test Updated",
          description: `${formData.name} has been successfully updated.`,
        });
      } else {
        await addMasterLabTest(payload);
        toast({
          title: "Test Created",
          description: `${formData.name} has been successfully created.`,
        });
      }
      setIsDialogOpen(false);
      loadTests();
    } catch (e) {
      toast({ title: "Error", description: "Failed to save test", variant: "destructive" });
    }
  };

  const handleAddParameter = () => {
    const newParameter: TestParameterExtended = {
      ...emptyParameter,
      id: `P${Date.now()}`,
      displayOrder: formData.parameters.length + 1,
    };
    setFormData({
      ...formData,
      parameters: [...formData.parameters, newParameter],
    });
    setExpandedParameterId(newParameter.id);
  };

  const handleUpdateParameter = (parameterId: string, updates: Partial<TestParameterExtended>) => {
    setFormData({
      ...formData,
      parameters: formData.parameters.map(p =>
        p.id === parameterId ? { ...p, ...updates } : p
      ),
    });
  };

  const handleDeleteParameter = (parameterId: string) => {
    setFormData({
      ...formData,
      parameters: formData.parameters.filter(p => p.id !== parameterId),
    });
  };

  const handleReorderParameters = (reorderedParams: TestParameterExtended[]) => {
    setFormData({
      ...formData,
      parameters: reorderedParams.map((p, index) => ({ ...p, displayOrder: index + 1 })),
    });
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'Hematology':
        return <Activity className="w-4 h-4" />;
      case 'Biochemistry':
        return <Beaker className="w-4 h-4" />;
      case 'Microbiology':
        return <FlaskConical className="w-4 h-4" />;
      default:
        return <TestTube2 className="w-4 h-4" />;
    }
  };

  return (
      <div className="space-y-6">
        {/* Stats Cards  */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FlaskConical className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalRecords}</p>
                  <p className="text-xs text-muted-foreground">Total Tests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{tests.filter(t => t.status === 'active').length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{tests.filter(t => t.panicAlertEnabled).length}</p>
                  <p className="text-xs text-muted-foreground">With Panic Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Settings2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                  </p>
                  <p className="text-xs text-muted-foreground">Total Parameters</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by test name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} variant="secondary">
                Search
              </Button>
              <Button onClick={handleAddTest} className="gap-2">
                <Plus className="w-4 h-4" />
                Add New Test
              </Button>
              
            </div>
          </CardContent>
        </Card>

        {/* Test List */}
        <div className="grid gap-4">
          {loading ? (
             <div className="text-center p-8">Loading...</div>
          ) : (
          <AnimatePresence mode="popLayout">
            {tests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-2 md:p-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${test.status === 'active' ? 'bg-primary/10' : 'bg-muted'}`}>
                          {getDepartmentIcon(test.department)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{test.name}</h3>
                            <Badge variant="outline" className="font-mono text-xs">{test.code}</Badge>
                            <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
                              {test.status}
                            </Badge>
                            {test.panicAlertEnabled && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Panic
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                            <span>{test.department}</span>
                            <span>•</span>
                            <span>{test.sampleType}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {test.tat}
                            </span>

                            <span className="flex items-center gap-1 text-lg font-semibold text-foreground">
                              <IndianRupee className="w-4 h-4" />
                              {test.price}
                            </span>

                          </div>
                          
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <Button variant="outline" size="sm" onClick={() => handleViewTest(test)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditTest(test)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteTest(test.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          )}
          {!loading && tests.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No tests found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button onClick={handleAddTest}>Add New Test</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="gap-1 h-9 px-4"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            <div className="flex items-center gap-1 overflow-x-auto max-w-[calc(100vw-200px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {(() => {
                const pages = [];
                const maxVisible = 5;
                let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                let end = Math.min(totalPages, start + maxVisible - 1);

                if (end - start + 1 < maxVisible) {
                  start = Math.max(1, end - maxVisible + 1);
                }

                for (let i = start; i <= end; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i)}
                      className={`w-9 h-9 p-0 ${currentPage === i ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      {i}
                    </Button>
                  );
                }
                return pages;
              })()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="gap-1 h-9 px-4"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                {editingTest ? 'Edit Test' : 'Add New Test'}
              </DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="parameters">Parameters ({formData.parameters.length})</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4 pr-2">
                <TabsContent value="basic" className="m-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Test Code <span className="text-destructive">*</span></Label>
                      <Input
                        id="code"
                        placeholder="e.g., CBC, LFT"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Test Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="name"
                        placeholder="e.g., Complete Blood Count"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData({ ...formData, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sampleType">Sample Type</Label>
                      <Select
                        value={formData.sampleType}
                        onValueChange={(value) => setFormData({ ...formData, sampleType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sample type" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="method">Method</Label>
                      <Select
                        value={formData.method}
                        onValueChange={(value) => setFormData({ ...formData, method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {methods.map(method => (
                            <SelectItem key={method} value={method}>{method}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tat">Turnaround Time (TAT)</Label>
                      <Select
                        value={formData.tat}
                        onValueChange={(value) => setFormData({ ...formData, tat: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select TAT" />
                        </SelectTrigger>
                        <SelectContent>
                          {tatOptions.map(tat => (
                            <SelectItem key={tat} value={tat}>{tat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹) <span className="text-destructive">*</span></Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Test Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="parameters" className="m-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Define test parameters with reference ranges and critical values</p>
                    <Button onClick={handleAddParameter} size="sm" className="gap-1">
                      <Plus className="w-4 h-4" />
                      Add Parameter
                    </Button>
                  </div>

                  {formData.parameters.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="p-8 text-center">
                        <Settings2 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <h4 className="font-medium mb-1">No Parameters Added</h4>
                        <p className="text-sm text-muted-foreground mb-4">Add parameters to define what values this test measures</p>
                        <Button onClick={handleAddParameter} variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add First Parameter
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Reorder.Group
                      axis="y"
                      values={formData.parameters}
                      onReorder={handleReorderParameters}
                      className="space-y-2"
                    >
                      {formData.parameters.map((param) => (
                        <Reorder.Item
                          key={param.id}
                          value={param}
                          className="cursor-move"
                        >
                          <Card className={`border ${expandedParameterId === param.id ? 'border-primary' : 'border-border'}`}>
                            <CardContent className="p-0">
                              <div
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50"
                                onClick={() => setExpandedParameterId(expandedParameterId === param.id ? null : param.id)}
                              >
                                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{param.name || 'Unnamed Parameter'}</span>
                                    {param.unit && <Badge variant="outline" className="text-xs">{param.unit}</Badge>}
                                    {(param.criticalLow || param.criticalHigh) && (
                                      <Badge variant="destructive" className="text-xs gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Critical
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteParameter(param.id);
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                {expandedParameterId === param.id ? (
                                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>

                              <AnimatePresence>
                                {expandedParameterId === param.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-4 pt-0 space-y-4 border-t">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                          <Label>Parameter Name</Label>
                                          <Input
                                            value={param.name}
                                            onChange={(e) => handleUpdateParameter(param.id, { name: e.target.value })}
                                            placeholder="e.g., Hemoglobin"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Unit</Label>
                                          <Select
                                            value={param.unit}
                                            onValueChange={(value) => handleUpdateParameter(param.id, { unit: value })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                              {parameterUnits.map(group => (
                                                <div key={group.group}>
                                                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">{group.group}</div>
                                                  {group.units.map(unit => (
                                                    <SelectItem key={unit || 'none'} value={unit || 'none'}>
                                                      {unit || '(No unit)'}
                                                    </SelectItem>
                                                  ))}
                                                </div>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Method</Label>
                                          <Select
                                            value={param.method}
                                            onValueChange={(value) => handleUpdateParameter(param.id, { method: value })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {methods.map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Result Type</Label>
                                          <Select
                                            value={param.resultType}
                                            onValueChange={(value: TestParameterExtended['resultType']) => handleUpdateParameter(param.id, { resultType: value })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {resultTypes.map(rt => (
                                                <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Decimal Precision</Label>
                                          <Input
                                            type="number"
                                            min={0}
                                            max={4}
                                            value={param.decimalPrecision}
                                            onChange={(e) => handleUpdateParameter(param.id, { decimalPrecision: parseInt(e.target.value) || 0 })}
                                          />
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <Label className="text-sm font-medium">Reference Ranges</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                                            <Label className="text-xs text-muted-foreground block mb-2">Male Range</Label>
                                            <div className="flex items-center gap-2">
                                              <Input
                                                type="number"
                                                placeholder="Min"
                                                className="h-9 text-sm"
                                                value={param.referenceRanges.male.min || ''}
                                                onChange={(e) => handleUpdateParameter(param.id, {
                                                  referenceRanges: {
                                                    ...param.referenceRanges,
                                                    male: { ...param.referenceRanges.male, min: parseFloat(e.target.value) || 0 }
                                                  }
                                                })}
                                              />
                                              <span className="text-muted-foreground font-medium">–</span>
                                              <Input
                                                type="number"
                                                placeholder="Max"
                                                className="h-9 text-sm"
                                                value={param.referenceRanges.male.max || ''}
                                                onChange={(e) => handleUpdateParameter(param.id, {
                                                  referenceRanges: {
                                                    ...param.referenceRanges,
                                                    male: { ...param.referenceRanges.male, max: parseFloat(e.target.value) || 0 }
                                                  }
                                                })}
                                              />
                                            </div>
                                          </div>
                                          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                                            <Label className="text-xs text-muted-foreground block mb-2">Female Range</Label>
                                            <div className="flex items-center gap-2">
                                              <Input
                                                type="number"
                                                placeholder="Min"
                                                className="h-9 text-sm"
                                                value={param.referenceRanges.female.min || ''}
                                                onChange={(e) => handleUpdateParameter(param.id, {
                                                  referenceRanges: {
                                                    ...param.referenceRanges,
                                                    female: { ...param.referenceRanges.female, min: parseFloat(e.target.value) || 0 }
                                                  }
                                                })}
                                              />
                                              <span className="text-muted-foreground font-medium">–</span>
                                              <Input
                                                type="number"
                                                placeholder="Max"
                                                className="h-9 text-sm"
                                                value={param.referenceRanges.female.max || ''}
                                                onChange={(e) => handleUpdateParameter(param.id, {
                                                  referenceRanges: {
                                                    ...param.referenceRanges,
                                                    female: { ...param.referenceRanges.female, max: parseFloat(e.target.value) || 0 }
                                                  }
                                                })}
                                              />
                                            </div>
                                          </div>
                                          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                                            <Label className="text-xs text-muted-foreground block mb-2">Child Range (Optional)</Label>
                                            <div className="flex items-center gap-2">
                                              <Input
                                                type="number"
                                                placeholder="Min"
                                                className="h-9 text-sm"
                                                value={param.referenceRanges.child?.min || ''}
                                                onChange={(e) => handleUpdateParameter(param.id, {
                                                  referenceRanges: {
                                                    ...param.referenceRanges,
                                                    child: { min: parseFloat(e.target.value) || 0, max: param.referenceRanges.child?.max || 0 }
                                                  }
                                                })}
                                              />
                                              <span className="self-center text-muted-foreground">-</span>
                                              <Input
                                                type="number"
                                                placeholder="Max"
                                                className="h-8"
                                                value={param.referenceRanges.child?.max || ''}
                                                onChange={(e) => handleUpdateParameter(param.id, {
                                                  referenceRanges: {
                                                    ...param.referenceRanges,
                                                    child: { min: param.referenceRanges.child?.min || 0, max: parseFloat(e.target.value) || 0 }
                                                  }
                                                })}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <Label className="text-sm font-medium">Critical Values (Panic Alerts)</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Critical Low</Label>
                                            <Input
                                              type="number"
                                              placeholder="Leave empty if not applicable"
                                              value={param.criticalLow || ''}
                                              onChange={(e) => handleUpdateParameter(param.id, { criticalLow: parseFloat(e.target.value) || undefined })}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Critical High</Label>
                                            <Input
                                              type="number"
                                              placeholder="Leave empty if not applicable"
                                              value={param.criticalHigh || ''}
                                              onChange={(e) => handleUpdateParameter(param.id, { criticalHigh: parseFloat(e.target.value) || undefined })}
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-2">
                                          <Switch
                                            checked={param.showInReport}
                                            onCheckedChange={(checked) => handleUpdateParameter(param.id, { showInReport: checked })}
                                          />
                                          <Label className="text-sm">Show in Report</Label>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  )}
                </TabsContent>

                <TabsContent value="advanced" className="m-0 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Alert Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Panic/Critical Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Trigger alerts when results fall outside critical values
                          </p>
                        </div>
                        <Switch
                          checked={formData.panicAlertEnabled}
                          onCheckedChange={(checked) => setFormData({ ...formData, panicAlertEnabled: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Display Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Configure how this test appears in reports and the lab workflow.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Report Display Priority</Label>
                          <Select defaultValue="normal">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High Priority</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="low">Low Priority</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Result Entry Mode</Label>
                          <Select defaultValue="manual">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Manual Entry</SelectItem>
                              <SelectItem value="auto">Auto from Analyzer</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Audit Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2 font-medium">{formData.createdAt}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span className="ml-2 font-medium">{formData.updatedAt}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTest} className="gap-2">
                <Check className="w-4 h-4" />
                {editingTest ? 'Update Test' : 'Create Test'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Test Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Test Details - {viewingTest?.name}
              </DialogTitle>
            </DialogHeader>

            {viewingTest && (
              <div className="flex-1 overflow-y-auto p-1 pr-2">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Test Code</p>
                          <p className="font-medium font-mono">{viewingTest.code}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Test Name</p>
                          <p className="font-medium">{viewingTest.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Department</p>
                          <p className="font-medium">{viewingTest.department}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sample Type</p>
                          <p className="font-medium">{viewingTest.sampleType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Method</p>
                          <p className="font-medium">{viewingTest.method}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Turnaround Time</p>
                          <p className="font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {viewingTest.tat}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="font-medium flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {viewingTest.price}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <Badge variant={viewingTest.status === 'active' ? 'default' : 'secondary'}>
                            {viewingTest.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Panic Alert</p>
                          <Badge variant={viewingTest.panicAlertEnabled ? 'destructive' : 'outline'}>
                            {viewingTest.panicAlertEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            Created At
                          </p>
                          <p className="font-medium">{viewingTest.createdAt}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            Last Updated
                          </p>
                          <p className="font-medium">{viewingTest.updatedAt}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Parameters */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TestTube2 className="w-4 h-4" />
                        Test Parameters ({viewingTest.parameters.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3 font-medium">#</th>
                              <th className="text-left p-3 font-medium">Parameter Name</th>
                              <th className="text-left p-3 font-medium">Unit</th>
                              <th className="text-left p-3 font-medium">Method</th>
                              <th className="text-left p-3 font-medium">Result Type</th>
                              <th className="text-left p-3 font-medium">Reference Range (M)</th>
                              <th className="text-left p-3 font-medium">Reference Range (F)</th>
                              <th className="text-left p-3 font-medium">Critical Values</th>
                              <th className="text-center p-3 font-medium">In Report</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewingTest.parameters.map((param, idx) => (
                              <tr key={param.id} className="border-t hover:bg-muted/30">
                                <td className="p-3 text-muted-foreground">{idx + 1}</td>
                                <td className="p-3 font-medium">{param.name}</td>
                                <td className="p-3">{param.unit || '-'}</td>
                                <td className="p-3">{param.method}</td>
                                <td className="p-3">
                                  <Badge variant="outline" className="text-xs">
                                    {param.resultType.replace('_', '/')}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  {param.resultType === 'numeric' ? (
                                    `${param.referenceRanges.male.min} - ${param.referenceRanges.male.max}`
                                  ) : '-'}
                                </td>
                                <td className="p-3">
                                  {param.resultType === 'numeric' ? (
                                    `${param.referenceRanges.female.min} - ${param.referenceRanges.female.max}`
                                  ) : '-'}
                                </td>
                                <td className="p-3">
                                  {(param.criticalLow !== undefined || param.criticalHigh !== undefined) ? (
                                    <span className="text-destructive font-medium">
                                      {param.criticalLow !== undefined && `<${param.criticalLow}`}
                                      {param.criticalLow !== undefined && param.criticalHigh !== undefined && ', '}
                                      {param.criticalHigh !== undefined && `>${param.criticalHigh}`}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="p-3 text-center">
                                  {param.showInReport ? (
                                    <Check className="w-4 h-4 text-success mx-auto" />
                                  ) : (
                                    <X className="w-4 h-4 text-muted-foreground mx-auto" />
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Child Reference Ranges (if any) */}
                  {viewingTest.parameters.some(p => p.referenceRanges.child) && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Child Reference Ranges
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {viewingTest.parameters
                            .filter(p => p.referenceRanges.child)
                            .map(param => (
                              <div key={param.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                <span className="font-medium">{param.name}</span>
                                <span>
                                  {param.referenceRanges.child?.min} - {param.referenceRanges.child?.max} {param.unit}
                                </span>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                if (viewingTest) handleEditTest(viewingTest);
              }} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default SuperLabTestMaster;
