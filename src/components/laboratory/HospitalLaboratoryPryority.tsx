import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  LayoutGrid, 
  List, 
  Plus, 
  Search, 
  FlaskConical,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Laboratory } from '@/types/laboratory';
// import { masterLaboratories, initialPreferredLabs } from '@/data/laboratoryData';
import { LaboratoryCard } from '@/components/laboratory/LaboratoryCard';
import { LaboratoryTable } from '@/components/laboratory/LaboratoryTable';
import { LaboratorySelectionModal } from '@/components/laboratory/LaboratorySelectionModal';
import { LaboratoryDetailsDialog } from '@/components/laboratory/LaboratoryDetailsDialog';
import { DeleteConfirmDialog } from '@/components/laboratory/DeleteConfirmDialog';
import { 
  fetchPreferredLaboratories, 
  fetchAvailableLaboratories, 
  addPreferredLaboratory, 
  removePreferredLaboratory 
} from '@/services/HospitalLaboratoryService';

type ViewMode = 'grid' | 'list';

const HospitalLaboratoryPryority = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [preferredLabs, setPreferredLabs] = useState<Laboratory[]>([]);
  const [availableLabs, setAvailableLabs] = useState<Laboratory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; lab: Laboratory | null }>({
    open: false,
    lab: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; lab: Laboratory | null }>({
    open: false,
    lab: null,
  });

  const loadPreferredLabs = async () => {
    setIsLoading(true);
    try {
      const res = await fetchPreferredLaboratories();
      if (res.success) {
        const mappedLabs: Laboratory[] = res.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            location: item.address || item.city || '',
            city: item.city || '',
            contactNumber: item.phone || '',
            email: item.email || '',
            type: item.type || 'Diagnostic',
            status: item.status === 'Active' || item.status == 1 ? 'Active' : 'Inactive',
            licenseNo: item.registration_number || '',
            accreditation: item.accreditation || ''
        }));
        setPreferredLabs(mappedLabs);
      } else {
        // toast.error(res.message || 'Failed to load preferred laboratories');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error loading preferred laboratories');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableLabs = async () => {
      try {
          const res = await fetchAvailableLaboratories();
          if (res.success) {
               const mappedLabs: Laboratory[] = res.data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    location: item.address || item.city || '',
                    city: item.city || '',
                    contactNumber: item.phone || '',
                    email: item.email || '',
                    type: item.type || 'Diagnostic',
                    status: item.status === 'Active' || item.status == 1 ? 'Active' : 'Inactive',
                    licenseNo: item.registration_number || '',
                    accreditation: item.accreditation || ''
               }));
               setAvailableLabs(mappedLabs);
          }
      } catch (error) {
          console.error(error);
          toast.error('Failed to load available laboratories');
      }
  };

  useEffect(() => {
    loadPreferredLabs();
  }, []);

  useEffect(() => {
      if (selectionModalOpen) {
          loadAvailableLabs();
      }
  }, [selectionModalOpen]);

  const filteredLabs = useMemo(() => {
    if (!searchQuery.trim()) return preferredLabs;
    const query = searchQuery.toLowerCase();
    return preferredLabs.filter(
      (lab) =>
        lab.name.toLowerCase().includes(query) ||
        lab.city.toLowerCase().includes(query) ||
        lab.type.toLowerCase().includes(query)
    );
  }, [preferredLabs, searchQuery]);

  const handleView = (lab: Laboratory) => {
    setDetailsDialog({ open: true, lab });
  };

  const handleRemove = (lab: Laboratory) => {
    setDeleteDialog({ open: true, lab });
  };

  const confirmRemove = async () => {
    if (deleteDialog.lab) {
      try {
          const res = await removePreferredLaboratory(deleteDialog.lab.id);
          if (res.success) {
              toast.success(`${deleteDialog.lab.name} removed from preferences`);
              loadPreferredLabs();
              setDeleteDialog({ open: false, lab: null });
          } else {
              toast.error(res.message || "Failed to remove laboratory");
          }
      } catch (error) {
          toast.error("Error removing laboratory");
      }
    }
  };

  const handleSaveSelection = async (selectedIds: string[]) => {
    try {
        let successCount = 0;
        for (const id of selectedIds) {
            const res = await addPreferredLaboratory(id);
            if (res.success) successCount++;
        }
        
        if (successCount > 0) {
            toast.success(`${successCount} laboratories added successfully`);
            loadPreferredLabs();
            setSelectionModalOpen(false);
        } else {
            toast.error("Failed to add laboratories");
        }
    } catch (error) {
        toast.error("Error adding laboratories");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40  backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Manage Preferred Laboratory</h1>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setSelectionModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Laboratory
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search laboratories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-border/50 bg-card">
            <div className="text-2xl font-bold text-foreground">{preferredLabs.length}</div>
            <div className="text-sm text-muted-foreground">Preferred Labs</div>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-card">
            <div className="text-2xl font-bold text-emerald-600">
              {preferredLabs.filter((l) => l.status === 'Active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Labs</div>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-card">
            <div className="text-2xl font-bold text-muted-foreground">
              {availableLabs.length}
            </div>
            <div className="text-sm text-muted-foreground">Available to Add</div>
          </div>
        </div>

        {/* Laboratory List */}
        {isLoading ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLabs.map((lab) => (
              <LaboratoryCard
                key={lab.id}
                laboratory={lab}
                onView={handleView}
                onRemove={handleRemove}
              />
            ))}
            {filteredLabs.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                {searchQuery
                  ? 'No laboratories match your search criteria.'
                  : 'No preferred laboratories. Click "Add Laboratory" to get started.'}
              </div>
            )}
          </div>
        ) : (
          <LaboratoryTable
            laboratories={filteredLabs}
            onView={handleView}
            onRemove={handleRemove}
          />
        )}
      </main>

      {/* Modals */}
      <LaboratorySelectionModal
        open={selectionModalOpen}
        onOpenChange={setSelectionModalOpen}
        masterLabs={availableLabs}
        preferredLabIds={[]}
        onSave={handleSaveSelection}
      />

      <LaboratoryDetailsDialog
        open={detailsDialog.open}
        onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}
        laboratory={detailsDialog.lab}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={confirmRemove}
        itemName={deleteDialog.lab?.name || ''}
        itemType="Laboratory"
      />
    </div>
  );
};

export default HospitalLaboratoryPryority;
