import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductInventory, ProductBatch } from '@/data/inventory2Data';
import { Search, Download, Grid3x3, List, Package, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface BatchDetailsModalProps {
  product: ProductInventory | null;
  open: boolean;
  onClose: () => void;
}

export default function BatchDetailsModal({ product, open, onClose }: BatchDetailsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'expiry' | 'quantity' | 'date'>('expiry');

  if (!product) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh':
        return 'bg-success text-success-foreground';
      case 'expiring-soon':
        return 'bg-warning text-warning-foreground';
      case 'expired':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredBatches = product.batches
    .filter(
      (batch) =>
        batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'expiry') {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      } else if (sortBy === 'quantity') {
        return b.quantity - a.quantity;
      } else {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });

  const totalBatches = filteredBatches.length;
  const totalQuantity = filteredBatches.reduce((sum, batch) => sum + batch.quantity, 0);
  const totalValue = filteredBatches.reduce((sum, batch) => sum + batch.quantity * batch.unitCost, 0);

  const BatchCard = ({ batch }: { batch: ProductBatch }) => {
    const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
    const batchValue = batch.quantity * batch.unitCost;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold text-foreground">{batch.batchNumber}</p>
              <p className="text-sm text-muted-foreground">{batch.supplier}</p>
            </div>
            <Badge className={getStatusColor(batch.status)}>
              {batch.status === 'fresh' ? 'Fresh' : batch.status === 'expiring-soon' ? 'Expiring Soon' : 'Expired'}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-medium">{batch.quantity.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unit Cost:</span>
              <span className="font-medium">Rs. {batch.unitCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batch Value:</span>
              <span className="font-medium">Rs. {batchValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mfg Date:</span>
              <span>{format(new Date(batch.manufactureDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exp Date:</span>
              <span className={daysUntilExpiry < 90 ? 'text-destructive font-medium' : ''}>
                {format(new Date(batch.expiryDate), 'MMM dd, yyyy')}
                {daysUntilExpiry > 0 && <span className="text-xs ml-1">({daysUntilExpiry}d)</span>}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{batch.warehouse}</p>
                  <p className="text-xs text-muted-foreground">{batch.rackPosition}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <img
              src={product.productImage}
              alt={product.productName}
              className="w-16 h-16 rounded-lg object-cover border"
            />
            <div className="flex-1">
              <DialogTitle className="text-2xl">{product.productName}</DialogTitle>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>SKU: {product.sku}</span>
                <span>Brand: {product.brand}</span>
                <span className="font-semibold text-foreground">Total Stock: {product.totalStock.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search and Controls */}
          <div className="flex gap-3 mb-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by batch number or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-md border bg-background text-sm"
            >
              <option value="expiry">Sort by Expiry</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="date">Sort by Date</option>
            </select>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="grid" className="gap-2">
                  <Grid3x3 className="w-4 h-4" />
                  Grid
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'list' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Batch Value</TableHead>
                    <TableHead>Mfg Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Rack Position</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map((batch) => {
                    const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
                    const batchValue = batch.quantity * batch.unitCost;
                    return (
                      <TableRow key={batch.batchNumber}>
                        <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                        <TableCell>{batch.quantity.toLocaleString()}</TableCell>
                        <TableCell>Rs. {batch.unitCost.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">Rs. {batchValue.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(batch.manufactureDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <div className={daysUntilExpiry < 90 ? 'text-destructive font-medium' : ''}>
                            {format(new Date(batch.expiryDate), 'MMM dd, yyyy')}
                            {daysUntilExpiry > 0 && (
                              <span className="text-xs ml-1">({daysUntilExpiry}d)</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{batch.rackPosition}</code>
                        </TableCell>
                        <TableCell>{batch.supplier}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status === 'fresh' ? 'Fresh' : batch.status === 'expiring-soon' ? 'Expiring Soon' : 'Expired'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBatches.map((batch) => (
                  <BatchCard key={batch.batchNumber} batch={batch} />
                ))}
              </div>
            )}

            {filteredBatches.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No batches found matching your search</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Total Batches: </span>
                <span className="font-semibold">{totalBatches}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Quantity: </span>
                <span className="font-semibold">{totalQuantity.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Value: </span>
                <span className="font-semibold">Rs. {totalValue.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Export Batch Data
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
