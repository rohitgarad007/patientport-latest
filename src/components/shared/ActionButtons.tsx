import { Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ActionButtons({ onView, onEdit, onDelete }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {onView && (
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye className="w-4 h-4" />
        </Button>
      )}
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4" />
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
