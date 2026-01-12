import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnitOfMeasure } from "@/types/master";

interface UnitOfMeasureFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<UnitOfMeasure, "id" | "createdAt">) => void;
  initialData?: UnitOfMeasure;
  mode: "add" | "edit";
}

export const UnitOfMeasureForm = ({ open, onOpenChange, onSubmit, initialData, mode }: UnitOfMeasureFormProps) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<Omit<UnitOfMeasure, "id" | "createdAt">>({
    defaultValues: initialData || {
      name: "",
      symbol: "",
      conversionRate: 1,
      status: "Active",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ name: "", symbol: "", conversionRate: 1, status: "Active" });
    }
  }, [initialData, reset, open]);

  const onFormSubmit = (data: Omit<UnitOfMeasure, "id" | "createdAt">) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-modal sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "add" ? "Add Unit of Measure" : "Edit Unit of Measure"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Create a new measurement unit" : "Update unit information"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Unit Name *</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="e.g., Box, Piece"
                className="focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                {...register("symbol", { required: true })}
                placeholder="e.g., BOX, PC"
                className="focus:border-primary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="conversionRate">Conversion Rate</Label>
            <Input
              id="conversionRate"
              type="number"
              step="0.01"
              {...register("conversionRate", { valueAsNumber: true })}
              placeholder="1"
              className="focus:border-primary"
            />
            <p className="text-xs text-muted-foreground">Base conversion rate (1 = base unit)</p>
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
              {mode === "add" ? "Add Unit" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
