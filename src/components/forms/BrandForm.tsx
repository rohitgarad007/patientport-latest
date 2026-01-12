import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brand, Manufacturer } from "@/types/master";

interface BrandFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Brand, "id" | "createdAt" | "manufacturerName">) => void;
  initialData?: Brand;
  mode: "add" | "edit";
  manufacturers: Manufacturer[];
}

export const BrandForm = ({ open, onOpenChange, onSubmit, initialData, mode, manufacturers }: BrandFormProps) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<Omit<Brand, "id" | "createdAt" | "manufacturerName">>({
    defaultValues: initialData || {
      name: "",
      manufacturerId: "",
      description: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({ name: initialData.name, manufacturerId: initialData.manufacturerId, description: initialData.description, status: initialData.status });
    } else {
      reset({ name: "", manufacturerId: "", description: "", status: "Active" });
    }
  }, [initialData, reset, open]);

  const onFormSubmit = (data: Omit<Brand, "id" | "createdAt" | "manufacturerName">) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-modal sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "add" ? "Add Brand" : "Edit Brand"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Create a new brand" : "Update brand information"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name *</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="Enter brand name"
              className="focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manufacturerId">Manufacturer *</Label>
            <Select
              value={watch("manufacturerId")}
              onValueChange={(value) => setValue("manufacturerId", value)}
            >
              <SelectTrigger className="focus:border-primary">
                <SelectValue placeholder="Select manufacturer" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {manufacturers.filter(m => m.status === "Active").map((mfr) => (
                  <SelectItem key={mfr.id} value={mfr.id}>
                    {mfr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter brand description"
              rows={3}
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
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-hover">
              {mode === "add" ? "Add Brand" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
