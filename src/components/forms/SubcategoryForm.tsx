import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Subcategory, Category } from "@/types/master";

interface SubcategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Subcategory, "id" | "createdAt" | "categoryName">) => void;
  initialData?: Subcategory;
  mode: "add" | "edit";
  categories: Category[];
}

export const SubcategoryForm = ({ open, onOpenChange, onSubmit, initialData, mode, categories }: SubcategoryFormProps) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<Omit<Subcategory, "id" | "createdAt" | "categoryName">>({
    defaultValues: initialData || {
      name: "",
      categoryId: "",
      description: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({ name: initialData.name, categoryId: initialData.categoryId, description: initialData.description, status: initialData.status });
    } else {
      reset({ name: "", categoryId: "", description: "", status: "Active" });
    }
  }, [initialData, reset, open]);

  const onFormSubmit = (data: Omit<Subcategory, "id" | "createdAt" | "categoryName">) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-modal sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "add" ? "Add Subcategory" : "Edit Subcategory"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Create a new subcategory" : "Update subcategory information"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subcategory Name *</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="Enter subcategory name"
              className="focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            <Select
              value={watch("categoryId")}
              onValueChange={(value) => setValue("categoryId", value)}
            >
              <SelectTrigger className="focus:border-primary">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {categories.filter(c => c.status === "Active").map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
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
              placeholder="Enter subcategory description"
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
              {mode === "add" ? "Add Subcategory" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
