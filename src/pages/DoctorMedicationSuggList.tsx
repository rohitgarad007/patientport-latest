import { useEffect, useState,  useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import { PaIcons } from "@/components/icons/PaIcons";
import { Trash2, Plus, FileText } from "lucide-react";

import { ConsultationCard } from "@/components/doctors/consultation/ConsultationCard";
import { ConsultationFilters } from "@/components/doctors/consultation/ConsultationFilters";
import { DeleteConfirmDialog } from "@/components/doctors/consultation/DeleteConfirmDialog";
import { ViewSummaryDialog } from "@/components/doctors/consultation/ViewSummaryDialog";
import { Pagination } from "@/components/doctors/consultation/Pagination";
import type { ConsultationSummary } from "@/data/consultationSummaries";
import { fetchTreatmentSuggestions } from "@/services/doctorSuggestionService";
import { toast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 4;

export default function DoctorMedicationSuggList() {
  const [consultations, setConsultations] = useState<ConsultationSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<ConsultationSummary | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetchTreatmentSuggestions({ page: 1, limit: 30 });
      if (mounted) {
        if (res.success) {
          setConsultations(res.data);
        } else {
          toast({ title: "Failed to load", description: res.message || "Unable to fetch suggestions" });
        }
        setCurrentPage(1);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredConsultations = useMemo(() => {
    let filtered = consultations;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.diagnosis.toLowerCase().includes(query) ||
          c.diagnosisCode.toLowerCase().includes(query) ||
          c.patientName.toLowerCase().includes(query)
      );
    }

    if (dateFilter !== "all") {
      const today = new Date();
      filtered = filtered.filter((c) => {
        const createdDate = new Date(c.createdOn);
        switch (dateFilter) {
          case "today":
            return createdDate.toDateString() === today.toDateString();
          case "week":
            const weekAgo = new Date(today.setDate(today.getDate() - 7));
            return createdDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
            return createdDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [consultations, searchQuery, dateFilter]);

  const totalPages = Math.ceil(filteredConsultations.length / ITEMS_PER_PAGE);
  const paginatedConsultations = filteredConsultations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleView = (id: string) => {
    const summary = consultations.find((c) => c.id === id);
    if (summary) {
      setSelectedSummary(summary);
      setViewDialogOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    setViewDialogOpen(false);
    navigate(`/doctor-medication-edit-sugg/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    const summary = consultations.find((c) => c.id === id);
    setSelectedSummary(summary || null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedSummary) {
      setConsultations((prev) => prev.filter((c) => c.id !== selectedSummary.id));
      toast({
        title: "Summary Deleted",
        description: "The consultation summary has been removed.",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setSelectedSummary(null);
  };


  return (
    <div className="p-6" style={{
      backgroundColor: '#f5f5f5',
       minHeight: '91vh', 
    }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold">Medication Suggestions</h1>

          <Link to="/doctor-medication-add-sugg">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Suggestion
            </Button>
          </Link>
        </div>

        
        {/* Filters */}
        <ConsultationFilters
          searchQuery={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          dateFilter={dateFilter}
          onDateFilterChange={(value) => {
            setDateFilter(value);
            setCurrentPage(1);
          }}
        />

        {/* Content */}
        {paginatedConsultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No summaries found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {paginatedConsultations.map((summary) => (
              <ConsultationCard
                key={summary.id}
                summary={summary}
                viewMode={viewMode}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedConsultations.map((summary) => (
              <ConsultationCard
                key={summary.id}
                summary={summary}
                viewMode={viewMode}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Delete Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          diagnosisName={selectedSummary?.diagnosis}
        />

        {/* View Dialog */}
        <ViewSummaryDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          summary={selectedSummary}
          onEdit={handleEdit}
        />
        
      </div>
    </div>
  );
}
