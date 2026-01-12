import { Laboratory } from '@/types/laboratory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LaboratoryTableProps {
  laboratories: Laboratory[];
  onView: (lab: Laboratory) => void;
  onRemove: (lab: Laboratory) => void;
}

export const LaboratoryTable = ({ laboratories, onView, onRemove }: LaboratoryTableProps) => {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Pathology: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      Diagnostic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Imaging: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      Clinical: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      Research: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold">Laboratory Name</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {laboratories.map((lab) => (
            <TableRow key={lab.id} className="hover:bg-muted/20">
              <TableCell className="font-medium">{lab.name}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{lab.location}</div>
                  <div className="text-muted-foreground">{lab.city}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{lab.contactNumber}</div>
                  <div className="text-muted-foreground">{lab.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getTypeColor(lab.type)}>
                  {lab.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={lab.status === 'Active' ? 'default' : 'secondary'}
                  className={lab.status === 'Active' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }
                >
                  {lab.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => onView(lab)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(lab)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {laboratories.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                No preferred laboratories found. Click "Add Laboratory" to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
