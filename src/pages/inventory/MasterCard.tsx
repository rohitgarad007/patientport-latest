import { ReactNode, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface MasterCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  onAdd: () => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  customFilters?: ReactNode;
}

export const MasterCard = ({ 
  title, 
  description, 
  icon, 
  children, 
  onAdd,
  onSearch,
  searchPlaceholder,
  customFilters,
}: MasterCardProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <Card className="flex flex-col h-full shadow-card hover:shadow-card-hover transition-all duration-300 border-border hover:border-primary/20">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-primary text-primary-foreground">
              {icon}
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">{title}</CardTitle>
              <CardDescription className="text-sm mt-1">{description}</CardDescription>
            </div>
          </div>
          <Button 
            onClick={onAdd}
            size="sm"
            className="bg-primary hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        {customFilters ? (
          <div>{customFilters}</div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-background border-border focus:border-primary transition-colors"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {children}
      </CardContent>
    </Card>
  );
};
