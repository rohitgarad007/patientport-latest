import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
  onView?: (row: any) => void;
  itemsPerPage?: number;
}

export const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete,
  onView,
  itemsPerPage = 5 
}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const renderCellContent = (column: Column, row: any) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (column.key === "status") {
      return (
        <Badge 
          variant={value === "Active" ? "default" : "secondary"}
          className={value === "Active" ? "bg-success hover:bg-success/90" : "bg-muted"}
        >
          {value}
        </Badge>
      );
    }
    
    return value;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((column) => (
                <TableHead key={column.key} className="font-semibold">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-8">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, index) => (
                <TableRow key={row.id || index} className="hover:bg-muted/30 transition-colors">
                  {columns.map((column) => {
                    const value = row[column.key];
                    return (
                      <TableCell key={column.key} className="max-w-[180px] truncate overflow-hidden text-ellipsis whitespace-nowrap">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate block">{renderCellContent(column, row)}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-sm break-words">{String(value ?? "")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    );
                  })}

                  <TableCell className="text-right space-x-2">
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(row)}
                        className="hover:bg-secondary hover:text-secondary-foreground transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(row)}
                      className="hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {/*<Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(row)}
                      className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>*/}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3 py-1 bg-muted rounded-md">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
