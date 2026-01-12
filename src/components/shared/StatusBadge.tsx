import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  variant?: "active" | "inactive" | "pending" | "positive" | "negative";
}

export function StatusBadge({ status, variant = "active" }: StatusBadgeProps) {
  const getVariantClass = () => {
    switch (variant) {
      case "active":
        return "status-badge-active";
      case "inactive":
        return "status-badge-inactive";
      case "pending":
        return "status-badge-pending";
      case "positive":
        return "status-badge-positive";
      case "negative":
        return "status-badge-negative";
      default:
        return "";
    }
  };

  return (
    <Badge className={`${getVariantClass()} font-medium`}>
      {status}
    </Badge>
  );
}
