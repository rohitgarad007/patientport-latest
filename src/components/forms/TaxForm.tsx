import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tax } from "@/types/master";

interface TaxFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Tax, "id" | "createdAt">) => void;
  initialData?: Tax;
  mode: "add" | "edit";
}

export const TaxForm = ({ open, onOpenChange, onSubmit, initialData, mode }: TaxFormProps) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<Omit<Tax, "id" | "createdAt">>({
    defaultValues: initialData || {
      name: "",
      percentage: 0,
      type: "GST",
      region: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ name: "", percentage: 0, type: "GST", region: "", status: "Active" });
    }
  }, [initialData, reset, open]);

  const onFormSubmit = (data: Omit<Tax, "id" | "createdAt">) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-modal sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "add" ? "Add Tax" : "Edit Tax"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Create a new tax rate" : "Update tax information"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tax Name *</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="e.g., Standard GST"
              className="focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentage">Percentage *</Label>
              <Input
                id="percentage"
                type="number"
                step="0.01"
                {...register("percentage", { required: true, valueAsNumber: true })}
                placeholder="18"
                className="focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value as "GST" | "VAT")}
              >
                <SelectTrigger className="focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="GST">GST</SelectItem>
                  <SelectItem value="VAT">VAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Applicable Region</Label>
            <Input
              id="region"
              {...register("region")}
              placeholder="e.g., National, State Level"
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
              {mode === "add" ? "Add Tax" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
