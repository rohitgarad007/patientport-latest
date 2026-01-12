import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2,
  Trash2,
  Package,
  Save,
  Eye,
  Copy,
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
import { testPackages, tests, TestPackage } from '@/data/dummyData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function LaboratoryPackages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TestPackage | null>(null);
  const [viewingPackage, setViewingPackage] = useState<TestPackage | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredPackages = testPackages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePackage = (pkgId: string) => {
    toast.success('Package deleted successfully');
    setShowDeleteConfirm(null);
  };

  const handleDuplicatePackage = (pkg: TestPackage) => {
    toast.success('Package duplicated', {
      description: `Copy of ${pkg.name} created`
    });
  };

  return (
    <div className="min-h-screen">
      
      
      <div className="p-4 lg:p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold text-primary">{testPackages.length}</p>
            <p className="text-xs text-muted-foreground">Total Packages</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold text-success">
              {testPackages.reduce((max, p) => Math.max(max, p.discount), 0)}%
            </p>
            <p className="text-xs text-muted-foreground">Max Discount</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold">
              {testPackages.reduce((sum, p) => sum + p.tests.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Tests Bundled</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold text-warning">
              ₹{Math.round(testPackages.reduce((sum, p) => {
                const pkgTests = tests.filter(t => p.tests.includes(t.id));
                return sum + pkgTests.reduce((s, t) => s + t.price, 0) * (1 - p.discount / 100);
              }, 0) / testPackages.length)}
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
              <PackageForm onClose={() => setShowAddPackage(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Packages Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map(pkg => {
            const packageTests = tests.filter(t => pkg.tests.includes(t.id));
            const originalPrice = packageTests.reduce((sum, t) => sum + t.price, 0);
            const discountedPrice = originalPrice - (originalPrice * pkg.discount / 100);

            return (
              <div key={pkg.id} className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="p-4 border-b bg-primary/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <p className="text-xs text-muted-foreground">{packageTests.length} tests included</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/30">
                      {pkg.discount}% OFF
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {packageTests.slice(0, 5).map(test => (
                      <span key={test.id} className="text-xs bg-muted px-2 py-1 rounded">
                        {test.code}
                      </span>
                    ))}
                    {packageTests.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{packageTests.length - 5} more</span>
                    )}
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">₹{originalPrice}</p>
                      <p className="text-2xl font-bold text-primary">₹{Math.round(discountedPrice)}</p>
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
                        onClick={() => handleDuplicatePackage(pkg)}
                      >
                        <Copy className="h-4 w-4" />
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
            <DialogTitle>Edit Package - {editingPackage?.name}</DialogTitle>
          </DialogHeader>
          {editingPackage && <PackageForm pkg={editingPackage} onClose={() => setEditingPackage(null)} />}
        </DialogContent>
      </Dialog>

      {/* View Package Dialog */}
      <Dialog open={!!viewingPackage} onOpenChange={() => setViewingPackage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingPackage?.name}</DialogTitle>
          </DialogHeader>
          {viewingPackage && <PackageDetails pkg={viewingPackage} />}
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

function PackageDetails({ pkg }: { pkg: TestPackage }) {
  const packageTests = tests.filter(t => pkg.tests.includes(t.id));
  const originalPrice = packageTests.reduce((sum, t) => sum + t.price, 0);
  const discountedPrice = originalPrice - (originalPrice * pkg.discount / 100);
  const savings = originalPrice - discountedPrice;

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">{pkg.description}</p>
      
      <div className="bg-success/10 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">Package Price</p>
        <p className="text-3xl font-bold text-primary">₹{Math.round(discountedPrice)}</p>
        <p className="text-sm text-success mt-1">You save ₹{Math.round(savings)} ({pkg.discount}% off)</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">Included Tests ({packageTests.length})</h4>
        <div className="space-y-2">
          {packageTests.map(test => (
            <div key={test.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium text-sm">{test.name}</p>
                <p className="text-xs text-muted-foreground">{test.sampleType} • TAT: {test.tat}</p>
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
          <span className="font-mono text-primary">₹{Math.round(discountedPrice)}</span>
        </div>
      </div>
    </div>
  );
}

function PackageForm({ pkg, onClose }: { pkg?: TestPackage; onClose: () => void }) {
  const [name, setName] = useState(pkg?.name || '');
  const [description, setDescription] = useState(pkg?.description || '');
  const [discount, setDiscount] = useState(pkg?.discount?.toString() || '');
  const [selectedTests, setSelectedTests] = useState<string[]>(pkg?.tests || []);

  const handleTestToggle = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const calculateTotal = () => {
    const total = tests
      .filter(t => selectedTests.includes(t.id))
      .reduce((sum, t) => sum + t.price, 0);
    const discountValue = parseFloat(discount) || 0;
    return {
      original: total,
      discounted: Math.round(total * (1 - discountValue / 100)),
      savings: Math.round(total * discountValue / 100)
    };
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a package name');
      return;
    }
    if (selectedTests.length === 0) {
      toast.error('Please select at least one test');
      return;
    }

    toast.success(pkg ? 'Package updated successfully' : 'Package created successfully');
    onClose();
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
          {tests.map(test => (
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
                <p className="text-sm font-medium">{test.name}</p>
                <p className="text-xs text-muted-foreground">{test.code} • {test.sampleType}</p>
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
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {pkg ? 'Update Package' : 'Save Package'}
        </Button>
      </div>
    </div>
  );
}
