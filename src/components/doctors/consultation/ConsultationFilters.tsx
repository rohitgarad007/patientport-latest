import { Search, LayoutGrid, List, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConsultationFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
}

export function ConsultationFilters({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  dateFilter,
  onDateFilterChange,
}: ConsultationFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by diagnosis..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border bg-card p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="gap-1 px-3"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="gap-1 px-3"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
