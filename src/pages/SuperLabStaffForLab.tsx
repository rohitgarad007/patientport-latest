import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Mail, Phone, MoreHorizontal, Edit, Trash2, Users } from "lucide-react";
import Swal from "sweetalert2";
import AddLabStaffForm from "@/components/laboratories/AddLabStaffForm";
import { fetchLaboratoryStaff, addLaboratoryStaff, updateLaboratoryStaff, deleteLaboratoryStaff } from "@/services/masterLaboratoryService";

export default function SuperLabStaffForLab() {
  const { labId } = useParams();
  const [sp] = useSearchParams();
  const labNameFromQuery = sp.get("name") || "";

  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [editRow, setEditRow] = useState<any | null>(null);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await fetchLaboratoryStaff(page, limit, searchTerm);
      const mapped = (res?.data || []).map((s: any) => ({
        ...s,
        status: s.status === "1" ? "active" : s.status,
      }));
      const filtered = labId ? mapped.filter((s: any) => String(s.lab_id) === String(labId)) : mapped;
      setStaff(filtered);
      setTotalCount(filtered.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, [page, searchTerm, labId]);

  const handleAdd = async (form: any) => {
    try {
      const res = await addLaboratoryStaff(form);
      if (res.success) {
        Swal.fire("Added", "Staff added successfully", "success");
        setEditRow(null);
        loadStaff();
      } else {
        Swal.fire("Error", res.message || "Failed to add staff", "error");
      }
    } catch (e: any) {
      Swal.fire("Error", e.message || "Failed to add staff", "error");
    }
  };

  const handleUpdate = async (form: any) => {
    try {
      const res = await updateLaboratoryStaff(form);
      if (res.success) {
        Swal.fire("Updated", "Staff updated successfully", "success");
        setEditRow(null);
        loadStaff();
      } else {
        Swal.fire("Error", res.message || "Failed to update staff", "error");
      }
    } catch (e: any) {
      Swal.fire("Error", e.message || "Failed to update staff", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Delete Staff?",
      text: "This will mark the staff as deleted.",
      icon: "warning",
      showCancelButton: true
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await deleteLaboratoryStaff(id);
      if (res.success) {
        Swal.fire("Deleted", "Staff deleted successfully", "success");
        loadStaff();
      } else {
        Swal.fire("Error", res.message || "Failed to delete staff", "error");
      }
    } catch (e: any) {
      Swal.fire("Error", e.message || "Failed to delete staff", "error");
    }
  };

  const activeLab = useMemo(() => {
    if (!labId) return [];
    return [{ labuid: labId, name: labNameFromQuery || `Lab ${labId}` }];
  }, [labId, labNameFromQuery]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-600" />
          Staff for Laboratory {labNameFromQuery ? `— ${labNameFromQuery}` : `#${labId}`}
        </h1>
        <div className="flex gap-2">
          <Link to="/super-laboratories">
            <Button>Labs</Button>
          </Link>
          <Link to="/super-lab-staff">
            <Button variant="outline">Labs Staff</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-80" />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Add Staff</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Laboratory Staff</DialogTitle>
                </DialogHeader>
                <AddLabStaffForm onSubmit={handleAdd} activeLaboratories={activeLab} />
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
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Laboratory</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{s.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {s.staff_uid}</div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{s.role}</TableCell>
                    <TableCell>{s.lab_name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-4 h-4" />
                          <span>{s.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-4 h-4" />
                          <span>{s.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditRow(s)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(s.staff_uid)}>
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
              <DialogTitle>Edit Laboratory Staff</DialogTitle>
            </DialogHeader>
            {editRow && (
              <AddLabStaffForm
                initial={editRow}
                activeLaboratories={activeLab}
                onSubmit={(form) => handleUpdate({ ...form, id: editRow.staff_uid })}
              />
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
