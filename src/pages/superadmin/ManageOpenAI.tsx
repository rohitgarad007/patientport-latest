import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Plus, Search, MoreVertical, Key, Cpu
} from "lucide-react";
import Swal from "sweetalert2";

// ✅ Services
import {
  fetchOpenAIList,
  addOpenAI,
  updateOpenAI,
  deleteOpenAI,
  changeOpenAIStatus
} from "@/services/aiManageServices";

export default function ManageOpenAI() {

  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState({
    name: "",
    apiKey: "",
    model: "",
    description: "",
    status: "active"
  });

  // 🔹 Load API Data
  const loadData = async () => {
    try {
      setLoading(true);

      const res = await fetchOpenAIList(page, 10, search);

      const mapped = (res?.data || []).map((item: any) => ({
        ...item,
        status: item.status === "1" ? "active" : "inactive",
      }));

      setList(mapped);
      setTotal(res?.total || 0);

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load OpenAI configs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search]);

  // 🔹 Form change
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      apiKey: "",
      model: "",
      description: "",
      status: "active"
    });
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm(item);
    setOpen(true);
  };

  // 🔹 Submit API
  const submit = async () => {
    try {
      let res;

      if (!form.name || !form.apiKey) {
        Swal.fire("Error", "Name & API Key required", "error");
        return;
      }

      if (editing) {
        res = await updateOpenAI(editing.id, form);
      } else {
        res = await addOpenAI(form);
      }

      if (res?.success === false) {
        Swal.fire("Error", res.message || "Failed", "error");
        return;
      }

      setOpen(false);
      loadData();

      Swal.fire("Success", "Saved successfully", "success");

    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // 🔹 Delete API
  const deleteItem = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete config?",
      text: "This cannot be undone",
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      await deleteOpenAI(id);
      loadData();
      Swal.fire("Deleted!", "", "success");
    }
  };

  // 🔹 Status toggle API
  const toggleStatus = async (aiuid: string, current: string) => {
    const newStatus = current === "active" ? "inactive" : "active";
    await changeOpenAIStatus(aiuid, newStatus);
    loadData();
  };

  // 🔹 Mask API Key
  const maskKey = (key: string) => {
    if (!key) return "";
    return key.slice(0, 6) + "••••••••" + key.slice(-4);
  };

  const filtered = list;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">OpenAI Manager</h1>
          <p className="text-muted-foreground text-sm">
            Manage API keys & models
          </p>
        </div>

        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Config
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* MOBILE VIEW */}
      <div className="grid gap-4 md:hidden">
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground">No data found</p>
        ) : (
          filtered.map((item) => (
            <Card key={item.aiuid}>
              <CardContent className="p-4 space-y-2">

                <div className="flex justify-between">
                  <h2 className="font-semibold">{item.name}</h2>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleStatus(item.aiuid, item.status)}>
                        Toggle Status
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => openEdit(item)}>
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => deleteItem(item.aiuid)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                </div>

                <div className="text-sm flex gap-2 items-center">
                  <Key className="w-4 h-4" /> {maskKey(item.apiKey)}
                </div>

                <div className="text-sm flex gap-2 items-center">
                  <Cpu className="w-4 h-4" /> {item.model}
                </div>

                <Badge className={item.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"}>
                  {item.status}
                </Badge>

              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* DESKTOP TABLE */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Configurations</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.aiuid}>

                    <TableCell>{item.name}</TableCell>
                    <TableCell>{maskKey(item.apiKey)}</TableCell>
                    <TableCell>{item.model}</TableCell>

                    <TableCell>
                      <Badge className={item.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"}>
                        {item.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleStatus(item.aiuid, item.status)}>
                            Toggle Status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(item)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => deleteItem(item.aiuid)}>
                            Delete
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
      </Card>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Config" : "Add Config"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">

            <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
            <Input name="apiKey" placeholder="API Key" value={form.apiKey} onChange={handleChange} />
            <Input name="model" placeholder="Model" value={form.model} onChange={handleChange} />
            <Input name="description" placeholder="Description" value={form.description} onChange={handleChange} />

            <Button className="w-full" onClick={submit}>
              {editing ? "Update" : "Save"}
            </Button>

          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}