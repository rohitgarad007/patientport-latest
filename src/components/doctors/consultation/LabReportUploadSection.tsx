import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { searchLabTestSuggestions } from "@/services/doctorService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  FileText,
  Image,
  X,
  Eye,
  Download,
  CheckCircle,
  Clock,
  FileUp,
  Files,
  Link2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { uploadReport, deleteReport } from "@/services/patientTreatmentService";

export interface LabTest {
  id: string;
  name: string;
  category: string;
}

interface SuggestionItem {
  name: string;
  description?: string;
  code?: string;
}

export interface UploadedReport {
  id: string;
  patientId: string;
  treatmentId: string;
  labTestId: string | null;
  fileName: string;
  fileUrl: string;
  fileType: "pdf" | "image" | "doc" | "other";
  isCombinedReport: boolean;
  coveredTestIds: string[];
  isFinalized: boolean;
  createdAt: Date;
}

interface LabReportUploadSectionProps {
  patientId: string;
  treatmentId: string;
  selectedLabTests: string[];
  labTestOptions: LabTest[];
  uploadedReports: UploadedReport[];
  onReportsChange: (reports: UploadedReport[]) => void;
}

const LabReportUploadSection = ({
  patientId,
  treatmentId,
  selectedLabTests,
  labTestOptions,
  uploadedReports,
  onReportsChange,
}: LabReportUploadSectionProps) => {
  const { toast } = useToast();
  // Removed local uploadedReports state in favor of props
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<UploadedReport | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"combined" | "individual">("individual");
  const [selectedTestsForUpload, setSelectedTestsForUpload] = useState<string[]>([]);
  const [selectedFileForUpload, setSelectedFileForUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Extra lab tests state
  const [extraLabTests, setExtraLabTests] = useState<string[]>([]);
  const [showAddExtraTestModal, setShowAddExtraTestModal] = useState(false);
  const [extraTestSearchQuery, setExtraTestSearchQuery] = useState("");
  const [extraTestSearchOpen, setExtraTestSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<LabTest[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cachedLabTests, setCachedLabTests] = useState<LabTest[]>([]);

  // Function to search lab tests from API
  const searchLabTests = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setExtraTestSearchOpen(true); // Open dropdown when search starts
    try {
      const items = await searchLabTestSuggestions(query, 1, 20);
      if (items) {
        const mappedTests: LabTest[] = items.map((item: any) => ({
          id: String(item.id || item.code || item.name),
          name: item.name || item.test_name || "",
          category: item.description || "Lab Test"
        }));
        setSearchResults(mappedTests);
      }
    } catch (error) {
      console.error("Failed to search lab tests", error);
      toast({
        title: "Search Failed",
        description: "Could not fetch lab tests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Removed useEffect for auto-search to prevent searching while typing

  const SuggestionDropdown = ({
    items,
    onSelect,
    onFetchAI,
    aiItems,
    showAI,
    loading,
    aiLoading,
    onFetchMore,
  }: {
    items: (string | SuggestionItem)[];
    onSelect: (s: string | SuggestionItem) => void;
    onFetchAI?: (q: string) => void;
    aiItems?: (string | SuggestionItem)[];
    showAI?: boolean;
    loading?: boolean;
    aiLoading?: boolean;
    onFetchMore?: () => void;
  }) => {
    const [q, setQ] = useState("");
    const toObj = (s: string | SuggestionItem): SuggestionItem =>
      typeof s === "string" ? { name: s } : s;
    const normalized = (v?: string) => (v || "").toLowerCase();
    const base = (items || []).map(toObj);
    const filtered = base.filter(i => {
      const n = normalized(i.name);
      const d = normalized(i.description);
      const qq = normalized(q);
      return !qq || n.includes(qq) || d.includes(qq);
    });
    const baseAI = (aiItems || []).map(toObj);
    const filteredAI = baseAI.filter(i => {
      const n = normalized(i.name);
      const d = normalized(i.description);
      const qq = normalized(q);
      return !qq || n.includes(qq) || d.includes(qq);
    });
    return (
      <div className="absolute top-full right-0 z-50 mt-1 w-[420px] min-w-[300px] rounded-lg border border-border bg-background shadow-lg overflow-hidden">
        {/* Top control bar: mini search + AI button */}
        <div className="flex items-center gap-2 p-2 border-b bg-muted/20">
          <input
            type="text"
            placeholder="Type to filter…"
            className="flex-1 px-2 py-1 text-sm rounded-md border bg-background"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {onFetchAI && (
            <button
              type="button"
              className="px-2 py-1 text-sm rounded-md border hover:bg-primary hover:text-primary-foreground flex items-center gap-1"
              onClick={() => onFetchAI((q || "").trim())}
              disabled={!!aiLoading}
            >
              <Sparkles className="w-3 h-3" />
              AI Search
            </button>
          )}
          {onFetchMore && (
            <button
              type="button"
              className="px-2 py-1 text-sm rounded-md border hover:bg-muted flex items-center gap-1"
              onClick={onFetchMore}
            >
              More
            </button>
          )}
        </div>

        {/* Results list with auto-height scrollbar */}
        <div className="max-h-72 overflow-auto">
          {filtered.map((item, idx) => (
            <button
              key={`${item.name}-${idx}`}
              type="button"
              onClick={() => onSelect(item)}
              className="w-full text-left p-3 hover:bg-muted/40 border-b last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
              </div>
              {item.description && (
                <div className="pl-4 mt-1">
                  <span className="text-xs text-muted-foreground truncate block">{item.description}</span>
                </div>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-3 text-xs text-muted-foreground">No matches. Try AI for alternatives.</div>
          )}
        </div>

        {/* Optional AI section below */}
        {showAI && aiItems && (
          <div className="border-t">
            {filteredAI.map((item, idx) => (
              <button
                key={`ai-${item.name}-${idx}`}
                type="button"
                onClick={() => onSelect(item)}
                className="w-full text-left p-3 hover:bg-muted/40 border-b last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">AI</span>
                </div>
                {item.description && (
                  <div className="pl-4 mt-1">
                    <span className="text-xs text-muted-foreground truncate block">{item.description}</span>
                  </div>
                )}
              </button>
            ))}
            {filteredAI.length === 0 && (
              <div className="p-3 text-xs text-muted-foreground">No AI matches for current query.</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // All available lab tests for search (dummy data representing full lab test catalog)
  const allAvailableLabTests: LabTest[] = useMemo(() => [
    { id: "cbc", name: "Complete Blood Count (CBC)", category: "Hematology" },
    { id: "lipid-panel", name: "Lipid Panel", category: "Chemistry" },
    { id: "thyroid-panel", name: "Thyroid Function Tests", category: "Endocrinology" },
    { id: "liver-panel", name: "Liver Function Tests", category: "Chemistry" },
    { id: "kidney-panel", name: "Kidney Function Tests", category: "Chemistry" },
    { id: "hba1c", name: "HbA1c", category: "Chemistry" },
    { id: "fasting-glucose", name: "Fasting Blood Glucose", category: "Chemistry" },
    { id: "electrolytes", name: "Electrolytes Panel", category: "Chemistry" },
    { id: "urinalysis", name: "Urinalysis", category: "Urinalysis" },
    { id: "crp", name: "C-Reactive Protein", category: "Chemistry" },
    { id: "vitamin-d", name: "Vitamin D Level", category: "Chemistry" },
    { id: "vitamin-b12", name: "Vitamin B12", category: "Chemistry" },
    { id: "iron-studies", name: "Iron Studies", category: "Hematology" },
    { id: "uric-acid", name: "Uric Acid", category: "Chemistry" },
    { id: "esr", name: "ESR (Erythrocyte Sedimentation Rate)", category: "Hematology" },
    { id: "prothrombin", name: "Prothrombin Time (PT/INR)", category: "Hematology" },
    { id: "d-dimer", name: "D-Dimer", category: "Hematology" },
    { id: "troponin", name: "Troponin I/T", category: "Cardiology" },
    { id: "bnp", name: "BNP/NT-proBNP", category: "Cardiology" },
    { id: "amylase", name: "Amylase", category: "Chemistry" },
    { id: "lipase", name: "Lipase", category: "Chemistry" },
    { id: "calcium", name: "Calcium Level", category: "Chemistry" },
    { id: "magnesium", name: "Magnesium Level", category: "Chemistry" },
    { id: "phosphorus", name: "Phosphorus Level", category: "Chemistry" },
    { id: "ferritin", name: "Ferritin", category: "Hematology" },
    { id: "folate", name: "Folate (Folic Acid)", category: "Chemistry" },
    { id: "psa", name: "PSA (Prostate Specific Antigen)", category: "Oncology" },
    { id: "cea", name: "CEA (Carcinoembryonic Antigen)", category: "Oncology" },
    { id: "afp", name: "AFP (Alpha-Fetoprotein)", category: "Oncology" },
    { id: "cortisol", name: "Cortisol Level", category: "Endocrinology" },
    ...labTestOptions.filter(t => !["cbc", "lipid-panel", "thyroid-panel", "liver-panel", "kidney-panel", "hba1c", "fasting-glucose", "electrolytes", "urinalysis"].includes(t.id))
  ], [labTestOptions]);

  // Combine suggested tests with extra tests
  const suggestedTests = labTestOptions.filter((test) =>
    selectedLabTests.includes(test.id)
  );

  const extraLabTestsData = useMemo(() => {
    const combined = [...allAvailableLabTests, ...cachedLabTests];
    const map = new Map();
    combined.forEach(t => {
      if (!map.has(t.id)) map.set(t.id, t);
    });
    return Array.from(map.values()).filter((test) =>
      extraLabTests.includes(test.id) && 
      !suggestedTests.some(st => 
        st.id === test.id || 
        (st.name && test.name && st.name.toLowerCase().trim() === test.name.toLowerCase().trim())
      )
    );
  }, [allAvailableLabTests, cachedLabTests, extraLabTests, suggestedTests]);

  const allActiveTests = useMemo(() => {
    const all = [...suggestedTests, ...extraLabTestsData];
    const unique = new Map();
    all.forEach(t => {
      // Use name as key for deduping if available, otherwise ID
      const key = t.name ? t.name.toLowerCase().trim() : t.id;
      if (!unique.has(key)) {
        unique.set(key, t);
      }
    });
    return Array.from(unique.values());
  }, [suggestedTests, extraLabTestsData]);

  const getTestUploadStatus = (testId: string) => {
    // Check individual report (match by labTestId OR check if coveredTestIds contains it)
    const individualReport = uploadedReports.find(
      (r) => !r.isCombinedReport && (r.labTestId === testId || (r.coveredTestIds && r.coveredTestIds.includes(testId)))
    );
    if (individualReport) return { status: "uploaded", report: individualReport };

    // Check combined report
    const combinedReport = uploadedReports.find(
      (r) => r.isCombinedReport && r.coveredTestIds && r.coveredTestIds.includes(testId)
    );
    if (combinedReport) return { status: "covered", report: combinedReport };

    return { status: "pending", report: null };
  };

  const combinedReports = uploadedReports.filter((r) => r.isCombinedReport);
  const individualReports = uploadedReports.filter((r) => !r.isCombinedReport);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileForUpload(e.target.files[0]);
    }
  };

  const getFileType = (file: File): "pdf" | "image" | "doc" | "other" => {
    if (file.type.includes("pdf")) return "pdf";
    if (file.type.includes("image")) return "image";
    if (file.type.includes("word") || file.name.match(/\.(doc|docx)$/i)) return "doc";
    return "other";
  };

  const handleUpload = async () => {
    if (!selectedFileForUpload) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!treatmentId) {
      toast({
        title: "Upload Failed",
        description: "Invalid Treatment ID",
        variant: "destructive",
      });
      return;
    }

    if (uploadType === "combined" && selectedTestsForUpload.length === 0) {
      toast({
        title: "No tests selected",
        description: "Please select which tests this report covers",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadReport(selectedFileForUpload, treatmentId, {
        isCombined: uploadType === "combined",
        coveredTestIds: selectedTestsForUpload,
        labTestId: uploadType === "individual" && selectedTestsForUpload.length > 0 ? selectedTestsForUpload[0] : undefined
      });
      
      if (response.success) {
        const newReport: UploadedReport = {
          id: response.id || response.data?.id || `report-${Date.now()}`,
          patientId,
          treatmentId,
          labTestId: uploadType === "individual" ? selectedTestsForUpload[0] : null,
          fileName: response.data?.fileName || response.file_name,
          fileUrl: response.data?.fileUrl || response.full_url,
          fileType: getFileType(selectedFileForUpload),
          isCombinedReport: uploadType === "combined",
          coveredTestIds: selectedTestsForUpload,
          isFinalized: false,
          createdAt: new Date(),
        };

        onReportsChange([...uploadedReports, newReport]);
        setShowUploadModal(false);
        setSelectedFileForUpload(null);
        setSelectedTestsForUpload([]);

        toast({
          title: "Report Uploaded",
          description: `${selectedFileForUpload.name} has been uploaded successfully`,
        });
      } else {
        toast({
          title: "Upload Failed",
          description: response.message || "Failed to upload report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading the report",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    // Optimistic update
    const previousReports = [...uploadedReports];
    onReportsChange(uploadedReports.filter((r) => r.id !== reportId));
    setDeleteConfirm(null);

    try {
      // Check if it's a real ID (numeric usually) or temp
      // If it starts with "report-", it might be a temp ID from this session
      // However, backend IDs are integers. Temp IDs are "report-TIMESTAMP".
      // We should only call backend if it's NOT a temp ID, 
      // OR if we are sure the temp ID wasn't just created and not saved?
      // Actually, uploadReport returns a temp ID? 
      // No, uploadReport returns the backend ID now.
      // Wait, in handleUpload:
      // const newReport: UploadedReport = { id: `report-${Date.now()}`, ... }
      // This is WRONG if we want to delete it later from backend.
      // We should use the ID returned from the server.
      
      // Let's fix handleUpload first? 
      // But for now, let's assume if it is a string starting with "report-", it is local only?
      // If it is local only, we don't need to call backend.
      
      if (!String(reportId).startsWith("report-")) {
          const res = await deleteReport(reportId);
          if (!res.success) {
              throw new Error(res.message);
          }
      }
      
      toast({
        title: "Report Deleted",
        description: "The report has been removed",
      });
    } catch (error) {
      console.error("Delete failed", error);
      // Revert
      onReportsChange(previousReports);
      toast({
        title: "Delete Failed",
        description: "Failed to delete report from server",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsFinal = (reportId: string) => {
    onReportsChange(
      uploadedReports.map((r) => (r.id === reportId ? { ...r, isFinalized: true } : r))
    );
    toast({
      title: "Report Finalized",
      description: "The report has been marked as final",
    });
  };

  const handlePreview = (report: UploadedReport) => {
    setSelectedPreview(report);
    setShowPreviewModal(true);
  };

  const handleDownload = (report: UploadedReport) => {
    if (report?.fileUrl) {
      window.open(report.fileUrl, "_blank");
    }
  };

  const openUploadModal = (type: "combined" | "individual", testId?: string) => {
    setUploadType(type);
    setSelectedTestsForUpload(testId ? [testId] : []);
    setSelectedFileForUpload(null);
    setShowUploadModal(true);
  };

  const toggleTestForUpload = (testId: string) => {
    setSelectedTestsForUpload((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const handleAddExtraTest = (testId: string) => {
    // Find the test details first
    const testToAdd = 
      searchResults.find(t => t.id === testId) || 
      allAvailableLabTests.find(t => t.id === testId) || 
      cachedLabTests.find(t => t.id === testId);

    const testName = testToAdd?.name?.toLowerCase().trim();

    // Check against all active tests (both suggested and extra)
    const duplicate = allActiveTests.find(existing => {
      // Check by ID
      if (existing.id === testId) return true;
      // Check by Name (if available)
      if (testName && existing.name?.toLowerCase().trim() === testName) return true;
      return false;
    });

    if (duplicate) {
      toast({
        title: "Test Already Added",
        description: `"${duplicate.name}" is already in the list.`,
        variant: "destructive",
      });
      setExtraTestSearchOpen(false);
      setExtraTestSearchQuery("");
      return;
    }

    setExtraLabTests((prev) => [...prev, testId]);
      
    // Check if we need to cache this test (if it came from API and not in static list)
    const inStatic = allAvailableLabTests.find(t => t.id === testId);
    if (!inStatic) {
      if (testToAdd) {
        setCachedLabTests(prev => [...prev, testToAdd]);
      }
    }

    toast({
      title: "Extra Lab Test Added",
      description: `${testToAdd?.name || "Test"} has been added`,
    });
    
    setExtraTestSearchOpen(false);
    setExtraTestSearchQuery("");
  };

  const handleRemoveExtraTest = (testId: string) => {
    setExtraLabTests((prev) => prev.filter((id) => id !== testId));
    toast({
      title: "Lab Test Removed",
      description: "The extra lab test has been removed",
    });
  };

  const formatDate = (date: Date | string | null | undefined) => {
    const d = typeof date === "string" ? new Date(date) : date instanceof Date ? date : null;
    if (!d || isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Test Reports</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload and manage lab test results
              </p>
            </div>
          </div>
          <Button
            onClick={() => openUploadModal("combined")}
            className="gap-2"
            size="sm"
          >
            <Files className="h-4 w-4" />
            Upload Combined Report
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Add Extra Lab Test Section */}
        <div className="p-4 rounded-lg border border-dashed border-primary/40 bg-primary/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Add Extra Tests
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Patient did more tests than suggested?
            </p>
          </div>
          
          <div className="relative flex gap-2">
            <Input
              placeholder="Search and add extra lab tests..."
              value={extraTestSearchQuery}
              onChange={(e) => {
                setExtraTestSearchQuery(e.target.value);
                setExtraTestSearchOpen(false); // Hide dropdown while typing
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  searchLabTests(extraTestSearchQuery);
                }
              }}
              className="flex-1"
            />
            <Button 
              variant="outline"
              size="icon"
              onClick={() => {
                searchLabTests(extraTestSearchQuery);
              }}
              className="hover:bg-primary hover:text-primary-foreground"
            >
              <Search className="h-4 w-4" />
            </Button>
            {extraTestSearchOpen && (
              <SuggestionDropdown
                items={searchResults.length > 0 ? searchResults.map(t => ({
                  name: t.name,
                  description: t.category,
                  code: t.id
                })) : (isSearching ? [{ name: "Searching...", code: "" }] : [])}
                onSelect={(s) => {
                  const item = typeof s === 'string' ? { name: s, code: '' } : s;
                  if (item.code) {
                    handleAddExtraTest(item.code);
                    setExtraTestSearchOpen(false);
                    setExtraTestSearchQuery("");
                  }
                }}
              />
            )}
          </div>
          
          {/* Show added extra tests */}
          {extraLabTestsData.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {extraLabTestsData.map((test) => (
                <Badge
                  key={test.id}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {test.name}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 ml-1 hover:bg-destructive/20"
                    onClick={() => handleRemoveExtraTest(test.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* All Lab Tests Status (Suggested + Extra) */}
        {allActiveTests.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Tests Status
              <Badge variant="outline" className="text-xs ml-2">
                {suggestedTests.length} suggested {extraLabTestsData.length > 0 && `+ ${extraLabTestsData.length} extra`}
              </Badge>
            </h4>
            <div className="grid gap-2">
              {allActiveTests.map((test) => {
                const { status, report } = getTestUploadStatus(test.id);
                const isExtraTest = extraLabTests.includes(test.id);
                return (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      status === "uploaded"
                        ? "bg-success/5 border-success/30"
                        : status === "covered"
                        ? "bg-primary/5 border-primary/30"
                        : "bg-muted/30 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {status === "uploaded" ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : status === "covered" ? (
                        <Link2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{test.name}</p>
                          {isExtraTest && (
                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                              Extra
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {status === "uploaded"
                            ? "Individual report uploaded"
                            : status === "covered"
                            ? "Covered in combined report"
                            : "Awaiting report"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {status !== "pending" && report && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePreview(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUploadModal("individual", test.id)}
                          className="gap-1"
                        >
                          <Upload className="h-3 w-3" />
                          Upload
                        </Button>
                      )}
                      {isExtraTest && status === "pending" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveExtraTest(test.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <Separator />

        {/* Uploaded Reports Display */}
        <div className="space-y-4">
          {/* Combined Reports */}
          {combinedReports.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Files className="h-4 w-4 text-primary" />
                Combined Reports
              </h4>
              <div className="space-y-2">
                <AnimatePresence>
                  {combinedReports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                            {report.fileType === "pdf" ? (
                              <FileText className="h-5 w-5 text-primary" />
                            ) : (
                              <Image className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-foreground truncate">
                                {report.fileName}
                              </p>
                              {report.isFinalized ? (
                                <Badge className="bg-success/10 text-success border-success/30">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Final
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Draft</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded: {formatDate(report.createdAt)}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {report.coveredTestIds.map((testId) => {
                                const test = allAvailableLabTests.find((t) => t.id === testId) || 
                                             labTestOptions.find((t) => t.id === testId) ||
                                             cachedLabTests.find((t) => t.id === testId);
                                return (
                                  <Badge
                                    key={testId}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {test?.name || testId}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handlePreview(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          {!report.isFinalized && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-success hover:text-success"
                                onClick={() => handleMarkAsFinal(report.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteConfirm(report.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Individual Reports */}
          {individualReports.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-secondary-foreground" />
                Individual Test Reports
              </h4>
              <div className="space-y-2">
                <AnimatePresence>
                  {individualReports.map((report) => {
                    const testId = report.labTestId || (report.coveredTestIds && report.coveredTestIds.length > 0 ? report.coveredTestIds[0] : null);
                    const test = allAvailableLabTests.find((t) => t.id === testId) || 
                                 labTestOptions.find((t) => t.id === testId) ||
                                 cachedLabTests.find((t) => t.id === testId);
                    return (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-secondary/10 shrink-0">
                              {report.fileType === "pdf" ? (
                                <FileText className="h-5 w-5 text-secondary-foreground" />
                              ) : report.fileType === "image" ? (
                                <Image className="h-5 w-5 text-secondary-foreground" />
                              ) : (
                                <Files className="h-5 w-5 text-secondary-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-foreground truncate">
                                  {report.fileName}
                                </p>
                                {report.isFinalized ? (
                                  <Badge className="bg-success/10 text-success border-success/30">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Final
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Draft</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Uploaded: {formatDate(report.createdAt)}
                              </p>
                              <Badge variant="outline" className="text-xs mt-2">
                                {test?.name || testId || "Unknown Test"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handlePreview(report)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                            {!report.isFinalized && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-success hover:text-success"
                                  onClick={() => handleMarkAsFinal(report.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                {/* Delete button hidden as requested
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setDeleteConfirm(report.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                */}
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Empty State */}
          {uploadedReports.length === 0 && (
            <div className="text-center py-8">
              <div className="p-4 rounded-full bg-muted/50 inline-block mb-3">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No reports uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload lab test reports to continue
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {uploadType === "combined"
                ? "Upload Combined Report"
                : "Upload Individual Report"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                selectedFileForUpload
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/30 hover:border-primary/50"
              }`}
            >
              {selectedFileForUpload ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">
                      {selectedFileForUpload.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFileForUpload.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedFileForUpload(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, PNG, JPG (max 10MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                  />
                </label>
              )}
            </div>

            {/* Test Selection for Combined Report */}
            {uploadType === "combined" && allActiveTests.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Select tests covered by this report:
                </p>
                <ScrollArea className="h-[200px] border rounded-lg p-3">
                  <div className="space-y-2">
                    {allActiveTests.map((test) => {
                      const { status } = getTestUploadStatus(test.id);
                      const isDisabled = status !== "pending";
                      const isExtraTest = extraLabTests.includes(test.id);
                      return (
                        <label
                          key={test.id}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            isDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-muted/50 cursor-pointer"
                          }`}
                        >
                          <Checkbox
                            checked={selectedTestsForUpload.includes(test.id)}
                            onCheckedChange={() =>
                              !isDisabled && toggleTestForUpload(test.id)
                            }
                            disabled={isDisabled}
                          />
                          <div className="flex-1 flex items-center gap-2">
                            <p className="text-sm font-medium">{test.name}</p>
                            {isExtraTest && (
                              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                                Extra
                              </Badge>
                            )}
                          </div>
                          {isDisabled && (
                            <p className="text-xs text-muted-foreground">
                              Already has a report
                            </p>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Test Selection for Individual Report */}
            {uploadType === "individual" && selectedTestsForUpload.length === 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Select test for this report:
                </p>
                <ScrollArea className="h-[150px] border rounded-lg p-3">
                  <div className="space-y-2">
                    {allActiveTests.map((test) => {
                      const { status } = getTestUploadStatus(test.id);
                      const isDisabled = status !== "pending";
                      const isExtraTest = extraLabTests.includes(test.id);
                      return (
                        <label
                          key={test.id}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            isDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-muted/50 cursor-pointer"
                          }`}
                        >
                          <Checkbox
                            checked={selectedTestsForUpload.includes(test.id)}
                            onCheckedChange={() =>
                              !isDisabled && toggleTestForUpload(test.id)
                            }
                            disabled={isDisabled}
                          />
                          <div className="flex-1 flex items-center gap-2">
                            <p className="text-sm font-medium">{test.name}</p>
                            {isExtraTest && (
                              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                                Extra
                              </Badge>
                            )}
                          </div>
                          {isDisabled && (
                            <p className="text-xs text-muted-foreground">
                              Already has a report
                            </p>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}

            {uploadType === "individual" && selectedTestsForUpload.length > 0 && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm">
                  <span className="font-medium">Selected: </span>
                  {allActiveTests.find((t) => t.id === selectedTestsForUpload[0])?.name}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFileForUpload || isUploading || !treatmentId}>
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? "Uploading..." : "Upload Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Report Preview
          </DialogTitle>
        </DialogHeader>
        {selectedPreview && (
          <div className="flex-1 flex flex-col min-h-0 gap-4 mt-2">
            <div className="p-4 bg-muted/30 rounded-lg shrink-0 border">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{selectedPreview.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selectedPreview.createdAt)}
                  </p>
                </div>
              </div>
              {selectedPreview.isCombinedReport && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-sm text-muted-foreground mr-2">Covers:</span>
                  {selectedPreview.coveredTestIds.map((testId) => {
                    const test = allAvailableLabTests.find((t) => t.id === testId) || 
                                 labTestOptions.find((t) => t.id === testId) ||
                                 cachedLabTests.find((t) => t.id === testId);
                    return (
                      <Badge key={testId} variant="outline" className="text-xs">
                        {test?.name || testId}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="flex-1 bg-muted/50 rounded-lg border w-full overflow-hidden flex flex-col">
              {selectedPreview.fileType === "image" ? (
                <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center">
                  <img
                    src={selectedPreview.fileUrl}
                    alt={selectedPreview.fileName}
                    className="w-full h-auto object-contain max-w-none shadow-sm"
                  />
                </div>
              ) : selectedPreview.fileType === "pdf" ? (
                <iframe
                  src={selectedPreview.fileUrl}
                  className="w-full h-full"
                  title={selectedPreview.fileName}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Preview not available for this file type</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click download to view the full report
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Close
            </Button>
            {selectedPreview && (
              <Button onClick={() => handleDownload(selectedPreview)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default LabReportUploadSection;
