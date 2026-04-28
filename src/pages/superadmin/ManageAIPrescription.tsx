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
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Plus, MoreVertical, Brain, Sparkles
} from "lucide-react";

// services
import { fetchOpenAIList } from "@/services/aiManageServices";
import {
  fetchAIPrescriptions,
  addAIPrescription,
  updateAIPrescription,
  deleteAIPrescription,
  setDefaultAIPrescription
} from "@/services/aiPrescriptionServices";

export default function ManageAIPrescription() {

  const [list, setList] = useState<any[]>([]);
  const [aiList, setAIList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const [form, setForm] = useState({
    name: "",
    aiuid: "",
    model: "",
    systemPrompt: "",
    userPrompt: "",
    temperature: "0.7",
    maxTokens: "500",
    isDefault: false
  });

  // =====================
  // VALIDATION
  // =====================
  const validate = (values = form) => {
    const newErrors: any = {};

    if (!values.name.trim()) newErrors.name = "Name is required";
    if (!values.aiuid) newErrors.aiuid = "AI is required";
    if (!values.userPrompt.trim()) newErrors.userPrompt = "User prompt is required";

    const t = Number(values.temperature);
    if (t < 0 || t > 2) newErrors.temperature = "0 - 2 allowed";

    const m = Number(values.maxTokens);
    if (m <= 0) newErrors.maxTokens = "Must be > 0";

    setErrors(newErrors);
    return newErrors;
  };

  const isValid = Object.keys(errors).length === 0;

  // =====================
  // LOAD DATA
  // =====================
  const loadAI = async () => {
    const res = await fetchOpenAIList(1, 100, "");
    setAIList(res?.data || []);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAIPrescriptions(1, 50, "");
      setList(res?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAI();
    loadData();
  }, []);

  // =====================
  // FORM HANDLER
  // =====================
  const handleChange = (e: any) => {
    const updated = {
      ...form,
      [e.target.name]: e.target.value
    };

    setForm(updated);
    validate(updated); // ✅ safe
  };

  const resetForm = () => {
    const empty = {
      name: "",
      aiuid: "",
      model: "",
      systemPrompt: "",
      userPrompt: "",
      temperature: "0.7",
      maxTokens: "500",
      isDefault: false
    };
    setForm(empty);
    validate(empty);
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setOpen(true);
  };

  const openEdit = (item: any) => {
    const mapped = {
      name: item.name || "",
      aiuid: item.aiuid || "",
      model: item.model || "",
      systemPrompt: item.system_prompt || "",
      userPrompt: item.user_prompt || "",
      temperature: item.temperature || "0.7",
      maxTokens: item.max_tokens || "500",
      isDefault: item.is_default === "1"
    };

    setEditing(item);
    setForm(mapped);
    validate(mapped);
    setOpen(true);
  };

  // =====================
  // SUBMIT
  // =====================
  const submit = async () => {
    const validation = validate();
    if (Object.keys(validation).length > 0) return;

    const payload = {
      name: form.name,
      aiuid: form.aiuid,
      model: form.model,
      system_prompt: form.systemPrompt,
      user_prompt: form.userPrompt,
      temperature: form.temperature,
      max_tokens: form.maxTokens,
      is_default: form.isDefault ? "1" : "0"
    };

    if (editing) {
      await updateAIPrescription(editing.apuid, payload);
    } else {
      await addAIPrescription(payload);
    }

    setOpen(false);
    loadData();
  };

  // =====================
  // DELETE
  // =====================
  const deleteItem = async (apuid: string) => {
    if (confirm("Delete this item?")) {
      await deleteAIPrescription(apuid);
      loadData();
    }
  };

  const setDefault = async (apuid: string) => {
    await setDefaultAIPrescription(apuid);
    loadData();
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex gap-2 items-center">
          <Brain className="w-6 h-6" /> AI Prescriptions
        </h1>

        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>All Prescriptions</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? "Loading..." : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>AI</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Settings</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {list.map((item) => (
                  <TableRow key={item.apuid}>
                    <TableCell>{item.name}</TableCell>

                    <TableCell>
                      {aiList.find(a => a.aiuid === item.aiuid)?.name || "N/A"}
                    </TableCell>

                    <TableCell>{item.model}</TableCell>

                    <TableCell>
                      {item.is_default === "1" ? (
                        <Badge className="bg-green-100 text-green-700">
                          Default
                        </Badge>
                      ) : "-"}
                    </TableCell>

                    <TableCell>
                      Temp: {item.temperature} | Tokens: {item.max_tokens}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEdit(item)}>
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => setDefault(item.apuid)}>
                            Set Default
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => deleteItem(item.apuid)}>
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

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              {editing ? "Update" : "Add"} Prescription
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">

            <div>
              <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div>
              <select name="aiuid" value={form.aiuid} onChange={handleChange} className="w-full border p-2">
                <option value="">Select AI</option>
                {aiList.map(ai => (
                  <option key={ai.aiuid} value={ai.aiuid}>{ai.name}</option>
                ))}
              </select>
              {errors.aiuid && <p className="text-red-500 text-sm">{errors.aiuid}</p>}
            </div>

            <Input name="model" placeholder="Model" value={form.model} onChange={handleChange} />

            <textarea name="systemPrompt" value={form.systemPrompt} onChange={handleChange} className="w-full border p-2" />

            <div>
              <textarea name="userPrompt" value={form.userPrompt} onChange={handleChange} className="w-full border p-2" />
              {errors.userPrompt && <p className="text-red-500 text-sm">{errors.userPrompt}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input name="temperature" value={form.temperature} onChange={handleChange} />
                {errors.temperature && <p className="text-red-500 text-sm">{errors.temperature}</p>}
              </div>

              <div>
                <Input name="maxTokens" value={form.maxTokens} onChange={handleChange} />
                {errors.maxTokens && <p className="text-red-500 text-sm">{errors.maxTokens}</p>}
              </div>
            </div>

            <Button onClick={submit} disabled={!isValid}>
              <Sparkles className="w-4 h-4 mr-2" />
              {editing ? "Update" : "Save"}
            </Button>

          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}