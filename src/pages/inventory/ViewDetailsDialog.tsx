import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ViewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  title: string;
  fields: { key: string; label: string; render?: (value: any) => React.ReactNode }[];
}

export const ViewDetailsDialog = ({ open, onOpenChange, data, title, fields }: ViewDetailsDialogProps) => {
  if (!data) return null;

  const renderValue = (field: { key: string; label: string; render?: (value: any) => React.ReactNode }, value: any) => {
    if (field.render) {
      return field.render(value);
    }
    
    if (field.key === "status") {
      return (
        <Badge variant={value === "Active" ? "default" : "secondary"} className={value === "Active" ? "bg-success hover:bg-success/90" : "bg-muted"}>
          {value}
        </Badge>
      );
    }
    
    return <span className="text-foreground">{value || "—"}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-modal sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title} Details</DialogTitle>
          <DialogDescription>
            Complete information about {data.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {fields.map((field, index) => (
            <div key={field.key}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm font-medium text-muted-foreground min-w-[140px]">
                  {field.label}
                </span>
                <div className="text-sm flex-1 text-right">
                  {renderValue(field, data[field.key])}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
