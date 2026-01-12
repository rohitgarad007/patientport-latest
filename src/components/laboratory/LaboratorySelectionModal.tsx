import { useState, useMemo, useEffect } from 'react';
import { Laboratory } from '@/types/laboratory';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MapPin, FlaskConical } from 'lucide-react';

interface LaboratorySelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterLabs: Laboratory[];
  preferredLabIds: string[];
  onSave: (selectedIds: string[]) => void;
}

export const LaboratorySelectionModal = ({
  open,
  onOpenChange,
  masterLabs,
  preferredLabIds,
  onSave,
}: LaboratorySelectionModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(preferredLabIds);

  const filteredLabs = useMemo(() => {
    if (!searchQuery.trim()) return masterLabs;
    const query = searchQuery.toLowerCase();
    return masterLabs.filter(
      (lab) =>
        lab.name.toLowerCase().includes(query) ||
        lab.city.toLowerCase().includes(query) ||
        lab.type.toLowerCase().includes(query)
    );
  }, [masterLabs, searchQuery]);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setSearchQuery('');
    }
  }, [open]);

  const handleToggle = (labId: string) => {
    setSelectedIds((prev) =>
      prev.includes(labId)
        ? prev.filter((id) => id !== labId)
        : [...prev, labId]
    );
  };

  const handleSave = () => {
    onSave(selectedIds);
    onOpenChange(false);
  };

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            Select Preferred Laboratories
          </DialogTitle>
          <DialogDescription>
            Choose laboratories from the master list to add to your preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, city, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground py-2">
          <span>{filteredLabs.length} laboratories found</span>
          <span>{selectedIds.length} selected</span>
        </div>

        <ScrollArea className="h-[400px] -mx-6 px-6">
          <div className="space-y-2 pr-2 pb-6">
            {filteredLabs.map((lab) => {
              const isSelected = selectedIds.includes(lab.id);
              return (
                <div
                  key={lab.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer
                    ${isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border/50 hover:border-primary/30 hover:bg-muted/20'
                    }`}
                  onClick={() => handleToggle(lab.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(lab.id)}
                    className="pointer-events-none"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground truncate">{lab.name}</h4>
                      <Badge 
                        variant={lab.status === 'Active' ? 'default' : 'secondary'}
                        className={`text-xs ${lab.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {lab.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {lab.city}
                      </span>
                      <Badge variant="outline" className={`text-xs ${getTypeColor(lab.type)}`}>
                        {lab.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredLabs.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No laboratories match your search criteria.
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Save Selection ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
