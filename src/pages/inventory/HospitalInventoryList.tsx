import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Package, AlertTriangle, Calendar, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { ProductInventory } from '@/data/inventory2Data';
import { fetchInventoryOverviewPaged } from '@/services/HSHospitalInventoryService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProductInventoryTable from '@/pages/inventory/ProductInventoryTable';
export default function HospitalInventoryList() {
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetchInventoryOverviewPaged(search, page, limit);
        if (!active) return;
        setProducts(resp.items);
        setTotal(resp.total);
      } catch (err: any) {
        console.error('Failed to load inventory overview', err);
        toast({
          title: 'Failed to load inventory',
          description: err?.message ?? 'Please try again later.',
          variant: 'destructive'
        });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [search, page, limit]);

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.totalStock || 0), 0);
  const lowStockCount = products.filter((p) => p.status === 'low-stock').length;
  const inStockCount = products.filter((p) => p.status === 'in-stock').length;

  return(
    
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground pb-4">
            Product Inventory
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">Active SKUs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStock.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Units available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Stock</CardTitle>
              <CheckCircle className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{inStockCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Healthy stock levels</p>
            </CardContent>
          </Card>
        </div>


        <Card>
          <CardContent className="p-4">
            {loading ? (
              <div className="py-6 text-center text-muted-foreground">Loading inventory...</div>
            ) : (
              <ProductInventoryTable
                products={products}
                serverMode
                page={page}
                limit={limit}
                total={total}
                onPageChange={(p) => setPage(p)}
                onSearchChange={(q) => {
                  setSearch(q);
                  setPage(1);
                }}
              />
            )}
          </CardContent>
        </Card>


      </main>
    </div>
    
  );
}