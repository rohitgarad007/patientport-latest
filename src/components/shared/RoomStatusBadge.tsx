import { Badge } from "@/components/ui/badge";

type StatusVariant = "positive" | "negative" | "pending" | "inactive" | "active";

interface RoomStatusBadgeProps {
  status: string;
  variant?: StatusVariant;
}

export function RoomStatusBadge({ status, variant = "inactive" }: RoomStatusBadgeProps) {
  let colorClasses = "";

  switch (variant) {
    case "positive":
      colorClasses = "bg-green-100 text-green-800 border-green-300";
      break;
    case "negative":
      colorClasses = "bg-red-100 text-red-800 border-red-300";
      break;
    case "pending":
      colorClasses = "bg-yellow-100 text-yellow-800 border-yellow-300";
      break;
    case "active":
      colorClasses = "bg-blue-100 text-blue-800 border-blue-300";
      break;
    default:
      colorClasses = "bg-gray-100 text-gray-700 border-gray-300";
  }

  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium px-2 py-0.5 border ${colorClasses}`}
    >
      {status}
    </Badge>
  );
}
