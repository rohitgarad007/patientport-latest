import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchMasterCatalog, cloneLabTests } from "@/services/HSTreatmentService";

interface CloneLabTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CloneLabTestModal = ({ isOpen, onClose, onSuccess }: CloneLabTestModalProps) => {
  const [masterCatalog, setMasterCatalog] = useState<any[]>([]);
  const [selectedCloneTests, setSelectedCloneTests] = useState<number[]>([]);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadMasterCatalog();
      setSelectedCloneTests([]);
    }
  }, [isOpen]);

  const loadMasterCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetchMasterCatalog(search);
      if (res.success && res.data) {
        setMasterCatalog(res.data);
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load master catalog", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
      const timer = setTimeout(() => {
          if(isOpen) loadMasterCatalog();
      }, 500);
      return () => clearTimeout(timer);
  }, [search]);


  const handleCloneTests = async () => {
    if (selectedCloneTests.length === 0) return;

    setCloneLoading(true);
    try {
      const res = await cloneLabTests(selectedCloneTests);
      if (res.success) {
        toast({ title: "Success", description: res.message || `Cloned ${res.count} tests successfully.` });
        onSuccess();
        onClose();
      } else {
        toast({ title: "Error", description: res.message || "Failed to clone tests", variant: "destructive" });
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Failed to clone tests", variant: "destructive" });
    } finally {
      setCloneLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Clone Master Lab Tests</DialogTitle>
          <DialogDescription>Select tests from the master catalog to add to your hospital.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search master tests..." 
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={masterCatalog.length > 0 && selectedCloneTests.length === masterCatalog.length}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedCloneTests(masterCatalog.map((t) => t.id));
                        else setSelectedCloneTests([]);
                      }}
                    />
                  </TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {masterCatalog.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCloneTests.includes(test.id)}
                        onCheckedChange={(checked) => {
                            if (checked === true) {
                                setSelectedCloneTests([...selectedCloneTests, test.id]);
                            } else {
                                setSelectedCloneTests(selectedCloneTests.filter((id) => id !== test.id));
                            }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{test.test_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span>{test.department}</span>
                        <span>{test.method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                         <Badge variant="outline">{test.sample_type}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {masterCatalog.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No tests found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter className="mt-4">
          <div className="flex-1 text-sm text-muted-foreground flex items-center">
            {selectedCloneTests.length} tests selected
          </div>
          <Button variant="outline" onClick={onClose} disabled={cloneLoading}>Cancel</Button>
          <Button onClick={handleCloneTests} disabled={selectedCloneTests.length === 0 || cloneLoading}>
            {cloneLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Clone Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
