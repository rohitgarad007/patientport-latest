import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";
import {
  fetchDiagnosis,
  addDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
  fetchMedicationNames,
  addMedicationName,
  updateMedicationName,
  deleteMedicationName,
  fetchMedicationUnits,
  addMedicationUnit,
  updateMedicationUnit,
  deleteMedicationUnit,
  fetchMedicationFrequencies,
  addMedicationFrequency,
  updateMedicationFrequency,
  deleteMedicationFrequency,
  fetchMedicationDurations,
  addMedicationDuration,
  updateMedicationDuration,
  deleteMedicationDuration,
  fetchLabTests,
  addLabTest,
  updateLabTest,
  deleteLabTest,
  fetchProcedures,
  addProcedure,
  updateProcedure,
  deleteProcedure,
} from "@/services/HSTreatmentService";
import { CloneLabTestModal } from "@/components/hospitals/CloneLabTestModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

type Status = "active" | "inactive";

interface MasterItem {
  id: number;
  name: string;
  code?: string;
  status: Status;
}

interface MasterSectionProps {
  title: string;
  hint?: string;
  showCode?: boolean;
  entity: "diagnosis" | "medication_name" | "medication_unit" | "medication_frequency" | "medication_duration" | "lab_tests" | "procedure";
}

const MasterSection = ({ title, hint, showCode = false, entity }: MasterSectionProps) => {
  const [items, setItems] = useState<MasterItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
  const [formData, setFormData] = useState<MasterItem>({ id: 0, name: "", code: "", status: "active" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  const paginationItems = useMemo<(number | string)>(() => {
    const tp = totalPages;
    const cp = page;
    const items: (number | string)[] = [];
    if (tp <= 7) {
      for (let i = 1; i <= tp; i++) items.push(i);
      return items;
    }
    if (cp <= 4) {
      items.push(1, 2, 3, 4, "...", tp - 1, tp);
      return items;
    }
    if (cp >= tp - 3) {
      items.push(1, 2, "...", tp - 3, tp - 2, tp - 1, tp);
      return items;
    }
    items.push(1, "...", cp - 1, cp, cp + 1, "...", tp);
    return items;
  }, [page, totalPages]);

  const services = useMemo(() => {
    return {
      list:
        entity === "diagnosis" ? fetchDiagnosis :
        entity === "medication_name" ? fetchMedicationNames :
        entity === "medication_unit" ? fetchMedicationUnits :
        entity === "medication_frequency" ? fetchMedicationFrequencies :
        entity === "medication_duration" ? fetchMedicationDurations :
        entity === "lab_tests" ? fetchLabTests :
        fetchProcedures,
      add:
        entity === "diagnosis" ? addDiagnosis :
        entity === "medication_name" ? addMedicationName :
        entity === "medication_unit" ? addMedicationUnit :
        entity === "medication_frequency" ? addMedicationFrequency :
        entity === "medication_duration" ? addMedicationDuration :
        entity === "lab_tests" ? addLabTest :
        addProcedure,
      update:
        entity === "diagnosis" ? updateDiagnosis :
        entity === "medication_name" ? updateMedicationName :
        entity === "medication_unit" ? updateMedicationUnit :
        entity === "medication_frequency" ? updateMedicationFrequency :
        entity === "medication_duration" ? updateMedicationDuration :
        entity === "lab_tests" ? updateLabTest :
        updateProcedure,
      remove:
        entity === "diagnosis" ? deleteDiagnosis :
        entity === "medication_name" ? deleteMedicationName :
        entity === "medication_unit" ? deleteMedicationUnit :
        entity === "medication_frequency" ? deleteMedicationFrequency :
        entity === "medication_duration" ? deleteMedicationDuration :
        entity === "lab_tests" ? deleteLabTest :
        deleteProcedure,
    };
  }, [entity]);

  const load = async () => {
    try {
      const res = await services.list(page, limit, searchQuery);
      setItems(res.items.map((r) => ({ 
        id: r.id, 
        name: r.name, 
        code: r.description || "", 
        status: r.status,
        master_test_id: r.master_test_id 
      })));
      setTotal(res.total);
    } catch (e: any) {
      toast({ title: `Failed to fetch ${title.toLowerCase()}`, description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const text = `${item.name} ${item.code ?? ""}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    });
  }, [items, searchQuery]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ id: 0, name: "", code: "", status: "active" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: MasterItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const r = await services.remove(id);
        if (!r.success) throw new Error(r.message || "Delete failed");
        await Swal.fire({ title: "Deleted!", text: `${title} deleted successfully.`, icon: "success", timer: 1200 });
        load();
      } catch (e: any) {
        toast({ title: `Failed to delete ${title.toLowerCase()}`, description: e.message, variant: "destructive" });
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({ title: `Please enter ${title.toLowerCase()} name`, variant: "destructive" });
      return;
    }

    try {
      const payload = { name: formData.name, description: formData.code || "", status: formData.status === "active" ? "1" : "0" };
      if (editingItem) {
        const r = await services.update(editingItem.id, payload);
        if (!r.success) throw new Error(r.message || "Update failed");
        toast({ title: `${title} updated successfully` });
      } else {
        const r = await services.add(payload);
        if (!r.success) throw new Error(r.message || "Add failed");
        toast({ title: `${title} added successfully` });
      }
      setIsDialogOpen(false);
      load();
    } catch (e: any) {
      toast({ title: `Failed to save ${title.toLowerCase()}`, description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div className="flex gap-2">
            {entity === "lab_tests" && (
                <Button size="sm" variant="outline" onClick={() => setIsCloneModalOpen(true)}>
                    Clone Master Test
                </Button>
            )}
            <Button size="sm" onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
        </div>
      </div>

      <div className="relative mt-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="pl-10" />
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>{showCode ? "Code" : "Description"}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.code || "-"}</TableCell>
                {entity === "lab_tests" && (
                  <TableCell>
                    {item.master_test_id ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Clone</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Custom</Badge>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant={item.status === "active" ? "default" : "secondary"}>
                    {item.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
            <DialogDescription>
              Fill out the form below to {editingItem ? "update" : "create"} a record.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={`Enter ${title.toLowerCase()} name`} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{showCode ? "Code (stored as description)" : "Description"}</Label>
              <Textarea className="min-h-[140px] w-full" value={formData.code || ""} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder={showCode ? "Optional ICD code" : "Optional description"} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.status === "active" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, status: "active" })}
                >
                  Active
                </Button>
                <Button
                  type="button"
                  variant={formData.status === "inactive" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, status: "inactive" })}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingItem ? "Update" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {entity === "lab_tests" && (
        <CloneLabTestModal
            isOpen={isCloneModalOpen}
            onClose={() => setIsCloneModalOpen(false)}
            onSuccess={load}
        />
      )}

      {/* Pagination */}
      <div className="mt-4 w-full">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
              />
            </PaginationItem>
            {paginationItems.map((itm, idx) => (
              <PaginationItem key={`${itm}-${idx}`}>
                {itm === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={page === (itm as number)}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(itm as number);
                    }}
                  >
                    {itm as number}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

const DoctorTreatmentMasters = () => {
  // Dynamic sections wired to encrypted services

  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="px-4 sm:px-6 lg:px-8 pt-1 w-full">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold text-foreground pb-4">
              Doctor Treatment Masters
            </h1>
          </div>

          <Tabs defaultValue="diagnosis" className="w-full">
  
            {/* WRAP TABS INSIDE A BLOCK CONTAINER TO AVOID OVERLAP */}
            <div className="w-full mb-4">
              <TabsList
                className="
                  w-full 
                  flex flex-wrap 
                  gap-2
                  justify-start 
                  bg-muted/40
                  p-2
                  rounded-lg
                "
              >
                <TabsTrigger className="flex-1 min-w-[140px]" value="diagnosis">Diagnosis</TabsTrigger>
                <TabsTrigger className="flex-1 min-w-[140px]" value="lab_tests">Lab Tests</TabsTrigger>
                <TabsTrigger className="flex-1 min-w-[140px]" value="procedure">Procedure</TabsTrigger>
                <TabsTrigger className="flex-1 min-w-[140px]" value="medication_name">Medication Name</TabsTrigger>
                <TabsTrigger className="flex-1 min-w-[140px]" value="medication_unit">Medication Unit</TabsTrigger>
                <TabsTrigger className="flex-1 min-w-[140px]" value="medication_frequency">Medication Frequency</TabsTrigger>
                <TabsTrigger className="flex-1 min-w-[140px]" value="medication_duration">Medication Duration</TabsTrigger>
              </TabsList>
            </div>

            {/* CONTENT ALWAYS BELOW — NEVER OVERLAPS */}
            <div className="mt-2 w-full">

              <TabsContent value="diagnosis">
                <MasterSection title="Diagnosis" hint="Maintain diagnosis names" entity="diagnosis" />
              </TabsContent>

              <TabsContent value="lab_tests">
                <MasterSection title="Lab Tests" hint="Manage lab investigations" entity="lab_tests" />
              </TabsContent>

              <TabsContent value="procedure">
                <MasterSection title="Procedure" hint="Manage procedures" entity="procedure" />
              </TabsContent>

              <TabsContent value="medication_name">
                <MasterSection title="Medication Name" hint="Master list of medicines" entity="medication_name" />
              </TabsContent>

              <TabsContent value="medication_unit">
                <MasterSection title="Medication Unit" hint="Units like mg, ml, IU" entity="medication_unit" />
              </TabsContent>

              <TabsContent value="medication_frequency">
                <MasterSection title="Medication Frequency" hint="OD, BD, TID, etc." entity="medication_frequency" />
              </TabsContent>

              <TabsContent value="medication_duration">
                <MasterSection title="Medication Duration" hint="Treatment durations" entity="medication_duration" />
              </TabsContent>

            </div>
          </Tabs>

        </div>
      </main>
    </div>
  );
};

export default DoctorTreatmentMasters;
