import { useEffect, useState } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { fetchMedicalRequests, fetchMedicalRequestDetails, MedicalRequestDetails, MedicalRequestSummary } from "@/services/HSHospitalMedicalService";

// Dynamic state for requests list and details
const initialPagination = { page: 1, limit: 20 };

export default function HSMedicalRequests() {
  const [requests, setRequests] = useState<MedicalRequestSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [pagination] = useState(initialPagination);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<MedicalRequestDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);


  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-500";
      case "Approved": return "bg-blue-500";
      case "Dispatched": return "bg-purple-500";
      case "Received": return "bg-green-500";
      case "Declined": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "border-red-500 bg-red-50";
      case "High": return "border-orange-500 bg-orange-50";
      case "Normal": return "border-blue-500 bg-blue-50";
      case "Low": return "border-gray-500 bg-gray-50";
      default: return "border-gray-300 bg-gray-50";
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const resp = await fetchMedicalRequests(pagination.page, pagination.limit);
      setRequests(resp.items);
    } catch (e: any) {
      setError(e?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetails = async (request: MedicalRequestSummary) => {
    try {
      setLoading(true);
      const details = await fetchMedicalRequestDetails(request.id);
      if (details) {
        setSelectedRequestDetails(details);
        setIsDetailsDialogOpen(true);
      }
    } catch (e) {
      // swallow for now; could show toast
    } finally {
      setLoading(false);
    }
  };


  return(
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground pb-4">
            Medical Stores Inventory Requests
          </h1>
          <Link to="/hs-medical-inventory-requests/new">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </Link>
          
        </div>


        {/* Existing Requests */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            My Requests
          </h2>
          <div className="space-y-3">
            {loading && (
              <div className="text-sm text-muted-foreground">Loading requests...</div>
            )}
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-900">{request.code}</p>
                    <Badge className={`${getStatusColor(request.status)} text-white`}>
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {request.items} items • Requested by {request.requestedBy}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{request.date}</p>
                  <Button size="sm" variant="link" className="text-blue-600 p-0 h-auto mt-1" onClick={() => handleViewDetails(request)}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Request Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3">
                <Package className="w-6 h-6 text-primary" />
                Request Details - {selectedRequestDetails?.code}
                <Badge className={`${getStatusColor(selectedRequestDetails?.status || "")} text-white`}>
                  {selectedRequestDetails?.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Request Summary */}
              <Card className="p-4 bg-muted">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Request Code</p>
                    <p className="font-bold text-lg text-foreground">{selectedRequestDetails?.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Store</p>
                    <p className="font-semibold text-foreground">{selectedRequestDetails?.store}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Requested By</p>
                    <p className="font-semibold text-foreground">{selectedRequestDetails?.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Request Date</p>
                    <p className="font-semibold text-foreground">{selectedRequestDetails?.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <Badge variant="outline" className={getPriorityColor(selectedRequestDetails?.priority || "Normal")}>
                      {selectedRequestDetails?.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(selectedRequestDetails?.status)} text-white`}>
                      {selectedRequestDetails?.status}
                    </Badge>
                  </div>
                  {selectedRequestDetails?.remarks && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Remarks</p>
                      <p className="text-sm italic text-foreground">{selectedRequestDetails?.remarks}</p>
                    </div>
                  )}
                  {selectedRequestDetails?.dispatchedBy && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">Dispatched By</p>
                        <p className="font-semibold text-foreground">{selectedRequestDetails?.dispatchedBy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Dispatch Date</p>
                        <p className="font-semibold text-foreground">{selectedRequestDetails?.dispatchDate}</p>
                      </div>
                    </>
                  )}
                  {selectedRequestDetails?.receivedBy && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">Received By</p>
                        <p className="font-semibold text-foreground">{selectedRequestDetails?.receivedBy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Received Date</p>
                        <p className="font-semibold text-foreground">{selectedRequestDetails?.receivedDate}</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Items Details */}
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Requested Items ({selectedRequestDetails?.itemDetails?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedRequestDetails?.itemDetails?.map((item, index: number) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="col-span-2">
                          <p className="font-bold text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Code: <span className="font-mono">{item.code}</span></p>
                          {item.batchNo && (
                            <p className="text-xs text-muted-foreground mt-1">Batch: <span className="font-mono font-semibold">{item.batchNo}</span></p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Requested Qty</p>
                          <p className="font-semibold text-blue-600">{item.requestedQty} {item.unit}</p>
                        </div>
                        {item.approvedQty !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Approved Qty</p>
                            <p className="font-semibold text-green-600">{item.approvedQty} {item.unit}</p>
                          </div>
                        )}
                        {item.dispatchedQty !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Dispatched Qty</p>
                            <p className="font-semibold text-purple-600">{item.dispatchedQty} {item.unit}</p>
                          </div>
                        )}
                        {item.receivedQty !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Received Qty</p>
                            <p className="font-semibold text-green-600">{item.receivedQty} {item.unit}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


        





      </main>
    </div>
  );
}