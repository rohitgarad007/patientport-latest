import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProductInventory } from '@/data/inventory2Data';
import { Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import BatchDetailsModal from './BatchDetailsModal';
import { configService } from "@/services/configService";

interface ProductInventoryTableProps {
  products: ProductInventory[];
  serverMode?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  onSearchChange?: (q: string) => void;
  onPageChange?: (page: number) => void;
}

export default function ProductInventoryTable({ products, serverMode = false, page, limit, total, onSearchChange, onPageChange }: ProductInventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>('');
  const itemsPerPage = serverMode ? (limit ?? 10) : 10;

  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-success text-success-foreground';
      case 'low-stock':
        return 'bg-warning text-warning-foreground';
      case 'out-of-stock':
        return 'bg-destructive text-destructive-foreground';
      case 'overstocked':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredProducts = serverMode
    ? products
    : products.filter(
        (product) =>
          product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const effectiveTotal = serverMode ? (total ?? filteredProducts.length) : filteredProducts.length;
  const effectivePage = serverMode ? (page ?? 1) : currentPage;
  const totalPages = Math.ceil(effectiveTotal / itemsPerPage);
  const startIndex = (effectivePage - 1) * itemsPerPage;
  const paginatedProducts = serverMode
    ? products
    : filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (product: ProductInventory) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  };

  useEffect(() => {
    const loadApiUrl = async () => {
      try {
        const url = await configService.getApiUrl();
        setApiUrl(url);
      } catch (e) {
        console.warn('Failed to get API URL', e);
      }
    };
    loadApiUrl();
  }, []);

  const resolveImageSrc = (src?: string) => {
    const s = (src ?? '').trim();
    if (!s) return '/placeholder.svg';
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    if (s.startsWith('/')) return s;
    if (s.startsWith('assets/')) return '/' + s; // local asset fallback
    return apiUrl ? `${apiUrl}/${s}` : s;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by product name, SKU, category, or brand..."
              value={searchQuery}
              onChange={(e) => {
                const q = e.target.value;
                setSearchQuery(q);
                if (serverMode) {
                  onSearchChange?.(q);
                  setCurrentPage(1);
                  onPageChange?.(1);
                } else {
                  setCurrentPage(1);
                }
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU / Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total Stock</TableHead>
                <TableHead className="text-right">Min / Max</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/30">
                  <TableCell>
                    <img
                      src={resolveImageSrc(product.productImage)}
                      alt={product.productName}
                      className="w-12 h-12 rounded-md object-cover border"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.productName}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{product.sku}</code>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right font-semibold">{product.totalStock.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {product.minLevel} / {product.maxLevel}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status === 'in-stock'
                        ? 'In Stock'
                        : product.status === 'low-stock'
                        ? 'Low Stock'
                        : product.status === 'out-of-stock'
                        ? 'Out of Stock'
                        : 'Overstocked'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleViewDetails(product)}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {paginatedProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No products found matching your search criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {serverMode ? startIndex + paginatedProducts.length : Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{' '}
              {effectiveTotal} products
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = Math.max(1, effectivePage - 1);
                  if (serverMode) onPageChange?.(newPage);
                  else setCurrentPage(newPage);
                }}
                disabled={effectivePage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <Button
                    key={pg}
                    variant={effectivePage === pg ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (serverMode) onPageChange?.(pg);
                      else setCurrentPage(pg);
                    }}
                    className="w-8"
                  >
                    {pg}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = Math.min(totalPages, effectivePage + 1);
                  if (serverMode) onPageChange?.(newPage);
                  else setCurrentPage(newPage);
                }}
                disabled={effectivePage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <BatchDetailsModal product={selectedProduct} open={modalOpen} onClose={handleCloseModal} />
    </>
  );
}
