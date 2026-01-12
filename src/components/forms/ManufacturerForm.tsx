import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Manufacturer } from "@/types/master";

interface ManufacturerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Manufacturer, "id" | "createdAt">) => void;
  initialData?: Manufacturer;
  mode: "add" | "edit";
}

export const ManufacturerForm = ({ open, onOpenChange, onSubmit, initialData, mode }: ManufacturerFormProps) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<Omit<Manufacturer, "id" | "createdAt">>({
    defaultValues: initialData || {
      name: "",
      contactPerson: "",
      address: "",
      phone: "",
      email: "",
      licenseNo: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ name: "", contactPerson: "", address: "", phone: "", email: "", licenseNo: "", status: "Active" });
    }
  }, [initialData, reset, open]);

  const onFormSubmit = (data: Omit<Manufacturer, "id" | "createdAt">) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-modal sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "add" ? "Add Manufacturer / Supplier" : "Edit Manufacturer / Supplier"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Create a new manufacturer or supplier" : "Update manufacturer information"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="Enter company name"
                className="focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                {...register("contactPerson", { required: true })}
                placeholder="Enter contact person"
                className="focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                {...register("phone", { required: true })}
                placeholder="+1 (555) 123-4567"
                className="focus:border-primary"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: true })}
                placeholder="contact@company.com"
                className="focus:border-primary"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Enter complete address"
                rows={2}
                className="focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNo">License Number</Label>
              <Input
                id="licenseNo"
                {...register("licenseNo")}
                placeholder="MED-LIC-2024-XXX"
                className="focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as "Active" | "Inactive")}
              >
                <SelectTrigger className="focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-hover">
              {mode === "add" ? "Add Manufacturer" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
