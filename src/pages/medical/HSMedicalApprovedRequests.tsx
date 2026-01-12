import { useEffect, useState } from "react";
import { Package, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchMedicalRequests, fetchMedicalRequestDetails, MedicalRequestDetails, MedicalRequestSummary } from "@/services/HSHospitalMedicalService";

const initialPagination = { page: 1, limit: 20 };

export default function HSMedicalApprovedRequests() {
  const [requests, setRequests] = useState<MedicalRequestSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [pagination] = useState(initialPagination);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<MedicalRequestDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-blue-500";
      case "Dispatched": return "bg-purple-500";
      case "Received": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      // Many approvals proceed via allocation which marks status 'Dispatched'.
      const approvedResp = await fetchMedicalRequests(pagination.page, pagination.limit, "", "Approved");
      const dispatchedResp = await fetchMedicalRequests(pagination.page, pagination.limit, "", "Dispatched");
      // Merge and dedupe by id
      const combined = [...approvedResp.items, ...dispatchedResp.items].reduce<MedicalRequestSummary[]>((acc, cur) => {
        if (!acc.find((a) => a.id === cur.id)) acc.push(cur);
        return acc;
      }, []);
      setRequests(combined);
    } catch (e: any) {
      setError(e?.message || "Failed to load approved/dispatch requests");
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
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground pb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Approved Requests
            <Badge variant="outline" className="ml-2 text-base px-3 py-1 border-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              {requests.length}
            </Badge>
          </h1>
        </div>

        <Card className="p-6">
          <div className="space-y-3">
            {loading && <div className="text-sm text-muted-foreground">Loading approved requests...</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
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

            {/* Basic summary */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Store</p>
                  <p className="font-semibold text-foreground">{selectedRequestDetails?.store}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Requested By</p>
                  <p className="font-semibold text-foreground">{selectedRequestDetails?.requestedBy}</p>
                </div>
              </div>
              {selectedRequestDetails?.remarks && (
                <div>
                  <p className="text-xs text-muted-foreground">Remarks</p>
                  <p className="text-sm italic text-foreground">{selectedRequestDetails?.remarks}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}