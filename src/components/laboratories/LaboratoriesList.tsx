import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Mail, Phone, MapPin, MoreHorizontal, Edit, Trash2, Building, Users } from "lucide-react";
import Swal from "sweetalert2";
import AddLaboratoryForm from "@/components/laboratories/AddLaboratoryForm";
import { fetchLaboratories, addLaboratory, updateLaboratory, deleteLaboratory, changeLaboratoryStatus } from "@/services/masterLaboratoryService";
import { PaIcons } from "@/components/icons/PaIcons";
import { StatCard } from "@/components/dashboard/StatCard";
import { useNavigate } from "react-router-dom";

export default function LaboratoriesList() {
  const [loading, setLoading] = useState(false);
  const [labs, setLabs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [editRow, setEditRow] = useState<any | null>(null);

  const loadLabs = async () => {
    try {
      setLoading(true);
      const res = await fetchLaboratories(page, limit, searchTerm);
      const mapped = (res?.data || []).map((lab: any) => ({
        ...lab,
        status: lab.status === "1" ? "active" : "inactive",
      }));
      setLabs(mapped);
      setTotalCount(res?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLabs(); }, [page, searchTerm]);

  const handleAdd = async (form: any) => {
    try {
      const res = await addLaboratory(form);
      if (res.success) {
        Swal.fire("Added", "Laboratory added successfully", "success");
        setEditRow(null);
        loadLabs();
      } else {
        Swal.fire("Error", res.message || "Failed to add laboratory", "error");
      }
    } catch (e: any) {
      Swal.fire("Error", e.message || "Failed to add laboratory", "error");
    }
  };

  const handleUpdate = async (id: string, form: any) => {
    try {
      const res = await updateLaboratory(id, form);
      if (res.success) {
        Swal.fire("Updated", "Laboratory updated successfully", "success");
        setEditRow(null);
        loadLabs();
      } else {
        Swal.fire("Error", res.message || "Failed to update laboratory", "error");
      }
    } catch (e: any) {
      Swal.fire("Error", e.message || "Failed to update laboratory", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Delete Laboratory?",
      text: "This will mark the laboratory as deleted.",
      icon: "warning",
      showCancelButton: true
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await deleteLaboratory(id);
      if (res.success) {
        Swal.fire("Deleted", "Laboratory deleted successfully", "success");
        loadLabs();
      } else {
        Swal.fire("Error", res.message || "Failed to delete laboratory", "error");
      }
    } catch (e: any) {
      Swal.fire("Error", e.message || "Failed to delete laboratory", "error");
    }
  };

  const handleStatus = async (id: string, current: "active" | "inactive") => {
    try {
      const res = await changeLaboratoryStatus(id, current === "active" ? "inactive" : "active");
      if (res.success) {
        loadLabs();
      } else {
        Swal.fire("Error", res.message || "Failed to update status", "error");
      }
    } catch (e: any) {
      Swal.fire("Error", e.message || "Failed to update status", "error");
    }
  };

  const totalStats = {
    labs: totalCount,
  };

  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Active Laboratories"
          value={totalStats.labs.toString()}
          description="Registered labs"
          icon={PaIcons.hospital || Building}
          change={{ value: 0, type: 'increase' }}
          variant="teal"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search laboratories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-80" />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Add Laboratory</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Laboratory</DialogTitle>
                </DialogHeader>
                <AddLaboratoryForm onSubmit={handleAdd} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Laboratory</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labs.map((lab) => (
                  <TableRow key={lab.labuid}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{lab.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {lab.labuid}</div>
                        <div className="text-xs text-muted-foreground">Reg: {lab.registration_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-4 h-4" />
                          <span>{lab.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-4 h-4" />
                          <span>{lab.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{lab.city}, {lab.state}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{lab.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${lab.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {lab.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/super-laboratory/${lab.labuid}/staff?name=${encodeURIComponent(lab.name)}`)}>
                            <Users className="w-4 h-4 mr-2" /> View Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditRow(lab)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatus(lab.labuid, lab.status)}>
                            {lab.status === "active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(lab.labuid)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <Dialog open={!!editRow} onOpenChange={(open) => !open && setEditRow(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Laboratory</DialogTitle>
            </DialogHeader>
            {editRow && (
              <AddLaboratoryForm
                initial={editRow}
                onSubmit={(form) => handleUpdate(editRow.labuid, form)}
              />
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
