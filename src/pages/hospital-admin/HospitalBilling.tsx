import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Search, Download, Eye, Edit, Trash2, DollarSign, Receipt, CreditCard, Clock, AlertTriangle, FileText, Filter, Home, Calculator, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { StatCard } from '@/components/dashboard/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientId: string;
  date: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  doctorName: string;
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    patientName: 'Robert Davis',
    patientId: 'p1',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    items: [
      { description: 'Consultation Fee', quantity: 1, rate: 200, amount: 200 },
      { description: 'ECG Test', quantity: 1, rate: 75, amount: 75 },
      { description: 'Blood Test', quantity: 1, rate: 50, amount: 50 },
    ],
    subtotal: 325,
    tax: 32.5,
    discount: 0,
    total: 357.5,
    status: 'pending',
    doctorName: 'Dr. Michael Chen',
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-002',
    patientName: 'Lisa Thompson',
    patientId: 'p2',
    date: '2024-01-16',
    dueDate: '2024-02-16',
    items: [
      { description: 'Pediatric Consultation', quantity: 1, rate: 150, amount: 150 },
      { description: 'Vaccination', quantity: 2, rate: 25, amount: 50 },
    ],
    subtotal: 200,
    tax: 20,
    discount: 10,
    total: 210,
    status: 'paid',
    paymentMethod: 'Credit Card',
    doctorName: 'Dr. Amanda Rodriguez',
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2024-003',
    patientName: 'John Wilson',
    patientId: 'p3',
    date: '2024-01-10',
    dueDate: '2024-01-25',
    items: [
      { description: 'Orthopedic Consultation', quantity: 1, rate: 300, amount: 300 },
      { description: 'X-Ray', quantity: 2, rate: 80, amount: 160 },
      { description: 'Physical Therapy Session', quantity: 3, rate: 60, amount: 180 },
    ],
    subtotal: 640,
    tax: 64,
    discount: 20,
    total: 684,
    status: 'overdue',
    doctorName: 'Dr. James Wilson',
  },
];

export function HospitalBilling() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const totalRevenue = mockInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const pendingAmount = mockInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0);
  const overdueAmount = mockInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);
  const totalInvoices = mockInvoices.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Billing Management
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-300">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-200">${totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">+12% from last month</p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Pending Payments</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-200">${pendingAmount.toLocaleString()}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">-5% from last month</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-300">Overdue Amount</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-200">${overdueAmount.toLocaleString()}</p>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">-8% from last month</p>
                </div>
                <div className="p-3 bg-red-500 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Total Invoices</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-200">{totalInvoices}</p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">+15% from last month</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="w-8 h-8 text-primary" />
              </div>
              Billing Management
            </h1>
            <p className="text-muted-foreground mt-2">Manage invoices, payments, and billing records</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Plus className="w-4 h-4" />
                Create New Invoice
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p1">Robert Davis</SelectItem>
                      <SelectItem value="p2">Lisa Thompson</SelectItem>
                      <SelectItem value="p3">John Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="d1">Dr. Michael Chen</SelectItem>
                      <SelectItem value="d2">Dr. Amanda Rodriguez</SelectItem>
                      <SelectItem value="d3">Dr. James Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Invoice Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Invoice Items</Label>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
                    <span>Description</span>
                    <span>Quantity</span>
                    <span>Rate</span>
                    <span>Amount</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <Input placeholder="Consultation Fee" />
                    <Input type="number" placeholder="1" />
                    <Input type="number" placeholder="200" />
                    <Input placeholder="200" disabled />
                  </div>
                  <Button type="button" variant="outline" size="sm">Add Item</Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal</Label>
                  <Input id="subtotal" placeholder="0.00" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax (%)</Label>
                  <Input id="tax" type="number" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount</Label>
                  <Input id="discount" type="number" placeholder="0" />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Invoice</Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by patient name or invoice number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Select value={filterStatus || 'all'} onValueChange={(v) => setFilterStatus(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Invoice Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.patientName}</TableCell>
                  <TableCell>{invoice.doctorName}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>${invoice.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Record Payment
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cancel Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      {/* Invoice Details Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Invoice Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Invoice #:</span> {selectedInvoice.invoiceNumber}</p>
                    <p><span className="font-medium">Date:</span> {selectedInvoice.date}</p>
                    <p><span className="font-medium">Due Date:</span> {selectedInvoice.dueDate}</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedInvoice.status)}`}>
                        {selectedInvoice.status.toUpperCase()}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Patient Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedInvoice.patientName}</p>
                    <p><span className="font-medium">Doctor:</span> {selectedInvoice.doctorName}</p>
                    {selectedInvoice.paymentMethod && (
                      <p><span className="font-medium">Payment Method:</span> {selectedInvoice.paymentMethod}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Invoice Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.rate.toFixed(2)}</TableCell>
                        <TableCell>${item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${selectedInvoice.tax.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${selectedInvoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Today's Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">$2,450</div>
            <p className="text-sm text-muted-foreground">From 8 payments received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Due This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">$1,890</div>
            <p className="text-sm text-muted-foreground">5 invoices due</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Average Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">$417</div>
            <p className="text-sm text-muted-foreground">Based on last 30 days</p>
          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}