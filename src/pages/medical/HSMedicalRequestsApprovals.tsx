import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, CheckCircle, XCircle, Package, Clock, AlertTriangle, CalendarClock, Building2, User } from "lucide-react";
import { Card } from "@/components/ui/card";
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
import Swal from "sweetalert2";
import { fetchMedicalRequests, fetchMedicalRequestDetails, fetchRequestItemsWithBatches, allocateRequestItems, declineMedicalRequest, MedicalRequestSummary } from "@/services/HSHospitalMedicalService";

export default function HospitalShiftTime() {

  const [pendingRequests, setPendingRequests] = useState<MedicalRequestSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemApprovals, setItemApprovals] = useState<Record<string, { approved: number; selectedBatches: Array<{batchNo: string; qty: number}> }>>({});

  const loadPending = async () => {
    try {
      setLoading(true);
      const resp = await fetchMedicalRequests(1, 20, "", "Pending");
      setPendingRequests(resp.items);
    } catch (e) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleViewRequest = async (request: MedicalRequestSummary) => {
    try {
      setLoading(true);
      const meta = await fetchMedicalRequestDetails(request.id);
      const items = await fetchRequestItemsWithBatches(request.id);
      const selected = {
        id: request.id,
        code: request.code,
        store: meta?.store ?? request.store,
        requestedBy: meta?.requestedBy ?? request.requestedBy,
        date: meta?.date ?? request.date,
        priority: meta?.priority ?? request.priority,
        remarks: meta?.remarks ?? request.remarks,
        items,
      };
      setSelectedRequest(selected);
      // Initialize approval quantities with FEFO logic (first batch selected by default)
      const approvals: Record<string, { approved: number; selectedBatches: Array<{batchNo: string; qty: number}> }> = {};
      items.forEach((item: any) => {
        const firstBatch = item.batches?.[0];
        const approvedQty = Math.min(item.requestedQty, item.availableQty ?? item.requestedQty);
        const batchQty = Math.min(approvedQty, firstBatch?.qty ?? approvedQty);
        approvals[item.id] = {
          approved: approvedQty,
          selectedBatches: firstBatch ? [{ batchNo: firstBatch.batchNo, qty: batchQty }] : [],
        };
      });
      setItemApprovals(approvals);
      setIsDialogOpen(true);
    } catch (e) {
      // swallow
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = (itemId: string, approved: number, item: any) => {
    const maxApproved = Math.min(approved, item.availableQty);
    
    // Auto-allocate to batches using FEFO
    let remainingQty = maxApproved;
    const selectedBatches: Array<{batchNo: string; qty: number}> = [];
    
    for (const batch of item.batches) {
      if (remainingQty <= 0) break;
      const allocatedQty = Math.min(remainingQty, batch.qty);
      selectedBatches.push({ batchNo: batch.batchNo, qty: allocatedQty });
      remainingQty -= allocatedQty;
    }
    
    setItemApprovals(prev => ({
      ...prev,
      [itemId]: { approved: maxApproved, selectedBatches }
    }));
  };

  const handleBatchChange = (itemId: string, batchNo: string, item: any) => {
    const selectedBatch = item.batches.find((b: any) => b.batchNo === batchNo);
    if (!selectedBatch) return;
    
    const approvedQty = Math.min(item.requestedQty, selectedBatch.qty);
    setItemApprovals(prev => ({
      ...prev,
      [itemId]: { 
        approved: approvedQty, 
        selectedBatches: [{ batchNo, qty: approvedQty }]
      }
    }));
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    try {
      setLoading(true);
      const itemsPayload = Object.entries(itemApprovals).map(([itemId, info]) => ({
        item_id: itemId,
        approved: info.approved,
        selectedBatches: info.selectedBatches,
      }));
      await allocateRequestItems({ request_id: selectedRequest.id, items: itemsPayload });
      // Close popup immediately and show auto-closing SweetAlert success
      setIsDialogOpen(false);
      await Swal.fire({
        title: `Request ${selectedRequest.code} approved & dispatched`,
        text: "Stock levels updated and dispatch created",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: { container: "swal-z-top" },
      });
      loadPending();
    } catch (e: any) {
      // Close popup and show auto-closing SweetAlert error
      setIsDialogOpen(false);
      await Swal.fire({
        title: "Failed to approve request",
        text: e?.message || "Please try again",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: { container: "swal-z-top" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!selectedRequest) return;
    try {
      setLoading(true);
      await declineMedicalRequest(selectedRequest.id);
      setIsDialogOpen(false);
      await Swal.fire({
        title: `Request ${selectedRequest.code} declined`,
        text: "Requester will be notified",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: { container: "swal-z-top" },
      });
      loadPending();
    } catch (e: any) {
      setIsDialogOpen(false);
      await Swal.fire({
        title: "Failed to decline request",
        text: e?.message || "Please try again",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: { container: "swal-z-top" },
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-500";
      case "High": return "bg-orange-500";
      case "Normal": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getDaysUntilExpiry = (expDate: string) => {
    const today = new Date();
    const exp = new Date(expDate);
    const days = Math.floor((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryStatus = (expDate: string) => {
    const days = getDaysUntilExpiry(expDate);
    if (days < 0) return { label: "EXPIRED", color: "text-red-600 bg-red-50 border-red-200" };
    if (days <= 30) return { label: `${days}d left`, color: "text-orange-600 bg-orange-50 border-orange-200" };
    if (days <= 90) return { label: `${days}d left`, color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
    return { label: `${days}d left`, color: "text-green-600 bg-green-50 border-green-200" };
  };


  return(
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-primary" />
            Request Approvals (Pending)
          </h1>
          <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-base px-4 py-2 border-2">
                <Clock className="w-4 h-4 mr-2" />
                {pendingRequests.length} Pending
              </Badge>
            </div>
        </div>

        <div className="pt-4 ">

          {/* Pending Requests */}
          
            
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-lg text-foreground">{request.code}</p>
                      <Badge className={`${getPriorityColor(request.priority)} text-white`}>
                        {request.priority}
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-500 text-white border-yellow-600">
                        Pending Review
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Building2 className="w-3 h-3" />
                        <span className="font-medium text-foreground">{request.store}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{request.requestedBy}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Package className="w-3 h-3" />
                        <span className="font-medium text-foreground">{request.items} items</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarClock className="w-3 h-3" />
                        <span>{request.date}</span>
                      </p>
                    </div>
                    {request.remarks && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        Note: {request.remarks}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button 
                      onClick={() => handleViewRequest(request)} 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                      size="lg"
                    >
                      Review & Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          

        </div>

        {/* Approval Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3">
                <Package className="w-6 h-6 text-primary" />
                Review Request - {selectedRequest?.code}
                <Badge className={`${getPriorityColor(selectedRequest?.priority)} text-white ml-2`}>
                  {selectedRequest?.priority}
                </Badge>
              </DialogTitle>
              <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Store</p>
                  <p className="font-semibold text-foreground">{selectedRequest?.store}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Requested By</p>
                  <p className="font-semibold text-foreground">{selectedRequest?.requestedBy}</p>
                  <p className="text-xs text-muted-foreground">{selectedRequest?.requestedByRole}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Request Date</p>
                  <p className="font-semibold text-foreground">{selectedRequest?.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                  <p className="font-semibold text-foreground">{selectedRequest?.items.length} items</p>
                </div>
                {selectedRequest?.remarks && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Remarks</p>
                    <p className="text-sm italic text-foreground">{selectedRequest.remarks}</p>
                  </div>
                )}
              </div>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              {/* Items Table */}
              {selectedRequest?.items.map((item: any) => (
                <Card key={item.id} className="p-6 bg-gradient-to-br from-white to-slate-50 border-2">
                  <div className="space-y-4">
                    {/* Item Header */}
                    <div className="flex items-start justify-between pb-4 border-b">
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">Code: <span className="font-mono font-semibold">{item.code}</span></p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <p className="text-xs text-muted-foreground mb-1">Requested</p>
                          <p className="font-bold text-lg text-blue-600">{item.requestedQty}</p>
                          <p className="text-xs text-muted-foreground">{item.unit}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-muted-foreground mb-1">Available</p>
                          <p className="font-bold text-lg text-green-600">{item.availableQty}</p>
                          <p className="text-xs text-muted-foreground">{item.unit}</p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                          <p className="text-xs text-muted-foreground mb-1">Approved</p>
                          <Input
                            type="number"
                            min="0"
                            max={Math.min(item.requestedQty, item.availableQty)}
                            value={itemApprovals[item.id]?.approved || 0}
                            onChange={(e) => handleApprovalChange(item.id, parseInt(e.target.value) || 0, item)}
                            className="w-20 h-10 text-center font-bold text-lg border-2 border-indigo-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FEFO Batch Selection */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h5 className="font-semibold text-foreground">Available Batches</h5>
                        <Badge variant="outline" className="text-xs">FEFO - First Expiry First Out</Badge>
                        <AlertTriangle className="w-4 h-4 text-orange-500 ml-auto" />
                        <span className="text-xs text-muted-foreground">Sorted by expiry date</span>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead>Batch No</TableHead>
                            <TableHead>Expiry Status</TableHead>
                            <TableHead>Mfg Date</TableHead>
                            <TableHead>Qty Available</TableHead>
                            <TableHead>Allocated</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Supplier</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {item.batches.map((batch: any, index: number) => {
                            const expiryStatus = getExpiryStatus(batch.expDate);
                            const isSelected = itemApprovals[item.id]?.selectedBatches[0]?.batchNo === batch.batchNo;
                            const allocatedQty = itemApprovals[item.id]?.selectedBatches.find(b => b.batchNo === batch.batchNo)?.qty || 0;
                            
                            return (
                              <TableRow 
                                key={batch.batchNo} 
                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border-2 border-indigo-300' : 'hover:bg-muted/30'} ${index === 0 ? 'border-l-4 border-l-green-500' : ''}`}
                                onClick={() => handleBatchChange(item.id, batch.batchNo, item)}
                              >
                                <TableCell>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono font-semibold">
                                  {batch.batchNo}
                                  {index === 0 && (
                                    <Badge className="ml-2 bg-green-500 text-white text-xs">FEFO Priority</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${expiryStatus.color}`}>
                                    <CalendarClock className="w-3 h-3" />
                                    {batch.expDate}
                                    <span className="ml-1">({expiryStatus.label})</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{batch.mfgDate}</TableCell>
                                <TableCell className="font-semibold">{batch.qty} {item.unit}</TableCell>
                                <TableCell>
                                  {allocatedQty > 0 && (
                                    <Badge className="bg-indigo-500 text-white">
                                      {allocatedQty} {item.unit}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{batch.location}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{batch.supplier}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t-2 sticky bottom-0 bg-white p-4 rounded-lg shadow-lg">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} size="lg">
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeclineRequest} 
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <XCircle className="w-4 h-4" />
                  Decline Request
                </Button>
                <Button 
                  onClick={handleApproveRequest} 
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex items-center gap-2 shadow-lg"
                  size="lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve & Dispatch
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>




      </main>
    </div>
  );
}