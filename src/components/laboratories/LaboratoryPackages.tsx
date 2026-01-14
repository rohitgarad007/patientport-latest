import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2,
  Trash2,
  Package,
  Save,
  Eye,
  Copy,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  fetchPackages, 
  addPackage, 
  updatePackage, 
  deletePackage,
  fetchMasterLabTests 
} from '@/services/LaboratoryService';

interface LabTest {
  id: string;
  test_name: string;
  test_code: string;
  department: string;
  price: string;
  sample_type?: string;
  tat?: string;
}

interface TestPackage {
  id: string;
  package_name: string;
  description: string;
  price: string;
  discount: string;
  test_ids: string | null;
  test_count: string;
}

export default function LaboratoryPackages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TestPackage | null>(null);
  const [viewingPackage, setViewingPackage] = useState<TestPackage | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [packages, setPackages] = useState<TestPackage[]>([]);
  const [allTests, setAllTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [packagesData, testsData] = await Promise.all([
        fetchPackages(),
        fetchMasterLabTests(1, 1000) // Fetch all tests
      ]);
      setPackages(packagesData);
      setAllTests(testsData.data || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPackages = packages.filter(pkg => 
    pkg.package_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePackage = async (pkgId: string) => {
    try {
      await deletePackage(pkgId);
      toast.success('Package deleted successfully');
      setShowDeleteConfirm(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete package');
    }
  };

  const handleDuplicatePackage = (pkg: TestPackage) => {
    // TODO: Implement duplicate functionality via API if needed
    toast.info('Duplicate functionality coming soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-4 lg:p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold text-primary">{packages.length}</p>
            <p className="text-xs text-muted-foreground">Total Packages</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold text-success">
              {Math.max(0, ...packages.map(p => parseFloat(p.discount)))}%
            </p>
            <p className="text-xs text-muted-foreground">Max Discount</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold">
              {packages.reduce((sum, p) => sum + parseInt(p.test_count || '0'), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Tests Bundled</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold text-warning">
              ₹{packages.length > 0 ? Math.round(packages.reduce((sum, p) => sum + parseFloat(p.price), 0) / packages.length) : 0}
            </p>
            <p className="text-xs text-muted-foreground">Avg Package Price</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={showAddPackage} onOpenChange={setShowAddPackage}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Package</DialogTitle>
              </DialogHeader>
              <PackageForm 
                allTests={allTests} 
                onClose={() => {
                  setShowAddPackage(false);
                  loadData();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Packages Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map(pkg => {
            const testIds = pkg.test_ids ? pkg.test_ids.split(',') : [];
            const packageTests = allTests.filter(t => testIds.includes(t.id));
            const originalPrice = packageTests.reduce((sum, t) => sum + parseFloat(t.price || '0'), 0);
            
            // Calculate discounted price based on package definition (stored price is the final price?)
            // Or calculate it dynamically? The model stores 'price' and 'discount'.
            // Usually 'price' in DB is the final price.
            // Let's assume 'price' in DB is the final price.
            const finalPrice = parseFloat(pkg.price);
            
            return (
              <div key={pkg.id} className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="p-4 border-b bg-primary/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{pkg.package_name}</h3>
                        <p className="text-xs text-muted-foreground">{pkg.test_count} tests included</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/30">
                      {parseFloat(pkg.discount)}% OFF
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {packageTests.slice(0, 5).map(test => (
                      <span key={test.id} className="text-xs bg-muted px-2 py-1 rounded">
                        {test.test_code}
                      </span>
                    ))}
                    {packageTests.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{packageTests.length - 5} more</span>
                    )}
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">₹{originalPrice}</p>
                      <p className="text-2xl font-bold text-primary">₹{Math.round(finalPrice)}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setViewingPackage(pkg)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setEditingPackage(pkg)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setShowDeleteConfirm(pkg.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Package Dialog */}
      <Dialog open={!!editingPackage} onOpenChange={() => setEditingPackage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package - {editingPackage?.package_name}</DialogTitle>
          </DialogHeader>
          {editingPackage && (
            <PackageForm 
              pkg={editingPackage} 
              allTests={allTests}
              onClose={() => {
                setEditingPackage(null);
                loadData();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Package Dialog */}
      <Dialog open={!!viewingPackage} onOpenChange={() => setViewingPackage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingPackage?.package_name}</DialogTitle>
          </DialogHeader>
          {viewingPackage && <PackageDetails pkg={viewingPackage} allTests={allTests} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this package? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDeletePackage(showDeleteConfirm!)}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PackageDetails({ pkg, allTests }: { pkg: TestPackage; allTests: LabTest[] }) {
  const testIds = pkg.test_ids ? pkg.test_ids.split(',') : [];
  const packageTests = allTests.filter(t => testIds.includes(t.id));
  const originalPrice = packageTests.reduce((sum, t) => sum + parseFloat(t.price || '0'), 0);
  const finalPrice = parseFloat(pkg.price);
  const savings = originalPrice - finalPrice;

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">{pkg.description}</p>
      
      <div className="bg-success/10 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">Package Price</p>
        <p className="text-3xl font-bold text-primary">₹{Math.round(finalPrice)}</p>
        <p className="text-sm text-success mt-1">You save ₹{Math.round(savings)} ({pkg.discount}% off)</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">Included Tests ({packageTests.length})</h4>
        <div className="space-y-2">
          {packageTests.map(test => (
            <div key={test.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium text-sm">{test.test_name}</p>
                <p className="text-xs text-muted-foreground">{test.test_code}</p>
              </div>
              <span className="text-sm font-mono text-muted-foreground line-through">₹{test.price}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Original Total</span>
          <span className="font-mono">₹{originalPrice}</span>
        </div>
        <div className="flex justify-between text-success">
          <span>Discount ({pkg.discount}%)</span>
          <span className="font-mono">-₹{Math.round(savings)}</span>
        </div>
        <div className="flex justify-between font-semibold pt-1 border-t">
          <span>Final Price</span>
          <span className="font-mono text-primary">₹{Math.round(finalPrice)}</span>
        </div>
      </div>
    </div>
  );
}

function PackageForm({ pkg, allTests, onClose }: { pkg?: TestPackage; allTests: LabTest[]; onClose: () => void }) {
  const [name, setName] = useState(pkg?.package_name || '');
  const [description, setDescription] = useState(pkg?.description || '');
  const [discount, setDiscount] = useState(pkg?.discount?.toString() || '');
  const [selectedTests, setSelectedTests] = useState<string[]>(pkg?.test_ids ? pkg.test_ids.split(',') : []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTestToggle = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const calculateTotal = () => {
    const total = allTests
      .filter(t => selectedTests.includes(t.id))
      .reduce((sum, t) => sum + parseFloat(t.price || '0'), 0);
    const discountValue = parseFloat(discount) || 0;
    const discounted = Math.round(total * (1 - discountValue / 100));
    return {
      original: total,
      discounted: discounted,
      savings: Math.round(total * discountValue / 100)
    };
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a package name');
      return;
    }
    if (selectedTests.length === 0) {
      toast.error('Please select at least one test');
      return;
    }

    try {
      setIsSubmitting(true);
      const totals = calculateTotal();
      
      const payload = {
        package_name: name,
        description,
        discount: discount || '0',
        price: totals.discounted, // Save the calculated final price
        test_ids: selectedTests
      };

      if (pkg) {
        await updatePackage(pkg.id, payload);
        toast.success('Package updated successfully');
      } else {
        await addPackage(payload);
        toast.success('Package created successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save package');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const prices = calculateTotal();

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Package Name *</label>
          <Input 
            placeholder="e.g., Basic Health Checkup" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Discount (%)</label>
          <Input 
            type="number" 
            placeholder="20" 
            min="0"
            max="100"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <Input 
          placeholder="Brief description of the package" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Select Tests *</label>
        <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
          {allTests.map(test => (
            <label
              key={test.id}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all',
                selectedTests.includes(test.id) 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Checkbox
                checked={selectedTests.includes(test.id)}
                onCheckedChange={() => handleTestToggle(test.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{test.test_name}</p>
                <p className="text-xs text-muted-foreground">{test.test_code}</p>
              </div>
              <span className="text-sm font-medium">₹{test.price}</span>
            </label>
          ))}
        </div>
      </div>

      {selectedTests.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Original Total ({selectedTests.length} tests)</span>
            <span className="font-mono">₹{prices.original}</span>
          </div>
          {parseFloat(discount) > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Discount ({discount}%)</span>
              <span className="font-mono">-₹{prices.savings}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Package Price</span>
            <span className="font-mono text-primary">₹{prices.discounted}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSave} className="gap-2" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pkg ? 'Update Package' : 'Save Package'}
        </Button>
      </div>
    </div>
  );
}
