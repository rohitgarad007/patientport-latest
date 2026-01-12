import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Check,
  X,
  Edit,
  FileText,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type {
  BedPermissionRequest,
  ApprovalStep,
  PatientStay,
} from "@/services/HSWardPermissionService";
import {
  fetchBedPermissionRequests,
  fetchBedApprovalSteps,
  fetchPatientStaysOverview,
  approveBedPermission,
  declineBedPermission,
} from "@/services/HSWardPermissionService";
import Swal from "sweetalert2";

export default function HospitalManageBedPermission() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<BedPermissionRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dynamic data states
  const [requests, setRequests] = useState<BedPermissionRequest[]>([]);
  const [steps, setSteps] = useState<ApprovalStep[]>([]);
  const [stepsLoading, setStepsLoading] = useState<boolean>(false);
  const [stepsError, setStepsError] = useState<string>("");

  const [stays, setStays] = useState<PatientStay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // Stop preloading approval steps here
        const [reqRes, stayRes] = await Promise.all([
          fetchBedPermissionRequests(1, 100, ""),
          fetchPatientStaysOverview(),
        ]);

        if (mounted) {
          setRequests((reqRes.data ?? []) as unknown as BedPermissionRequest[]);
          setStays((stayRes.data ?? []) as unknown as PatientStay[]);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || "Failed to load bed permission data");
          toast.error(e?.message || "Failed to load bed permission data");
          setRequests([]);
          setSteps([]);
          setStays([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { cls: string; label: string }> = {
      approved: { cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", label: "Approved" },
      pending: { cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", label: "Pending" },
      declined: { cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", label: "Declined" },
      "under-review": { cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", label: "Under Review" },
    };
    const config = styles[status] || { cls: "bg-muted text-foreground", label: status };
    return <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${config.cls}`}>{config.label}</div>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return (
      <Badge className={colors[priority] || colors.low}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "stable":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "improving":
        return <Activity className="h-4 w-4 text-blue-500" />;
      case "deteriorating":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const handleViewDetails = async (request: BedPermissionRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
    setStepsError("");
    setStepsLoading(true);
    try {
      const stepRes = await fetchBedApprovalSteps(request.id);
      setSteps((stepRes.data ?? []) as unknown as ApprovalStep[]);
    } catch (e: any) {
      const msg = e?.message || "Failed to load approval workflow";
      setSteps([]);
      setStepsError(msg);
      toast.error(msg);
    } finally {
      setStepsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    // Close the details dialog before showing Swal to avoid focus/overlay blocking
    setDetailsOpen(false);
    await new Promise((r) => setTimeout(r, 250));

    const result = await Swal.fire({
      title: "Approve Request?",
      text: `Approve bed permission request ${selectedRequest.id}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      focusConfirm: true,
      returnFocus: false,
      customClass: { container: "swal-z-top" },
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(true);
      const res = await approveBedPermission(selectedRequest.id);
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Approved",
          text: res.message || "Request approved successfully",
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: true,
          customClass: { container: "swal-z-top" },
        });
        setRequests((prev) => prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: "approved" } : r)));
      } else {
        Swal.fire({ icon: "error", title: "Approval Failed", text: res.message || "Please try again", customClass: { container: "swal-z-top" } });
      }
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Unexpected error", customClass: { container: "swal-z-top" } });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedRequest) return;
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }

    // Close decline dialog (and ensure details dialog is closed) before showing Swal
    setDeclineDialogOpen(false);
    setDetailsOpen(false);
    await new Promise((r) => setTimeout(r, 250));

    const result = await Swal.fire({
      title: "Decline Request?",
      text: `Decline bed permission request ${selectedRequest.id}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, decline",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      focusConfirm: true,
      returnFocus: false,
      customClass: { container: "swal-z-top" },
    });
    if (!result.isConfirmed) return;

    try {
      setActionLoading(true);
      const res = await declineBedPermission(selectedRequest.id, declineReason.trim());
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Declined",
          text: res.message || "Request declined successfully",
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: true,
          customClass: { container: "swal-z-top" },
        });
        setRequests((prev) => prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: "declined", declineReason: declineReason.trim() } : r)));
        setDeclineReason("");
      } else {
        Swal.fire({ icon: "error", title: "Decline Failed", text: res.message || "Please try again", customClass: { container: "swal-z-top" } });
      }
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Unexpected error", customClass: { container: "swal-z-top" } });
    } finally {
      setActionLoading(false);
    }
  };


  const getStepIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "declined":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
      case "under-review":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get patient details for overview
  const getPatientForRequest = (request: BedPermissionRequest) => {
    return stays.find((p) => p.patientId === request.patientId);
  };

  // Helper to check if a date is today
  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  // Overview metrics
  const totalRequests = requests.length;
  const pendingCount = requests.filter((r) => r.status === "pending" || r.status === "under-review").length;
  const approvedTodayCount = requests.filter((r) => r.status === "approved" && isToday(new Date(r.requestDate))).length;
  const urgentCount = requests.filter((r) => String(r.priority).toLowerCase() === "urgent").length;

  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1 doc-calendar">
        {/* Page Header and Overview Cards */}
        <div className="space-y-4 mb-4">
          <h2 className="text-2xl font-semibold">Bed Permission Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="text-sm text-muted-foreground">Total Requests</div>
              <div className="text-3xl font-bold">{totalRequests}</div>
              <div className="text-xs text-muted-foreground">Active permission requests</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground">Pending Approval</div>
              <div className="text-3xl font-bold text-yellow-500">{pendingCount}</div>
              <div className="text-xs text-muted-foreground">Awaiting review</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground">Approved Today</div>
              <div className="text-3xl font-bold text-green-600">{approvedTodayCount}</div>
              <div className="text-xs text-muted-foreground">Successfully processed</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground">Urgent Requests</div>
              <div className="text-3xl font-bold text-red-600">{urgentCount}</div>
              <div className="text-xs text-muted-foreground">Requires immediate attention</div>
            </Card>
          </div>
        </div>

        {/* Bed Activity Requests content without Tabs */}
        <div className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by request ID, patient, or staff..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("pending")}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={filterStatus === "approved" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("approved")}
                  >
                    Approved
                  </Button>
                  <Button
                    variant={filterStatus === "declined" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("declined")}
                  >
                    Declined
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Current Bed</TableHead>
                    <TableHead className="text-center">Target Bed</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>{request.activityTypeName}</TableCell>
                      <TableCell>{request.patientName}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.requestedBy}</div>
                          <div className="text-xs text-muted-foreground">
                            {request.requestedByRole}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.requestDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">{request.currentBed || "--"}</TableCell>
                      <TableCell className="text-center">{request.targetBed || "--" }</TableCell>
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Request Details Modal */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Request Details - {selectedRequest?.id}</DialogTitle>
              <DialogDescription>
                Review and manage bed permission request
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 pr-4">
                  {/* Patient Overview */}
                  {getPatientForRequest(selectedRequest) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Patient Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Patient Name</Label>
                            <p className="font-medium">{getPatientForRequest(selectedRequest)?.name}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Age / Gender</Label>
                            <p className="font-medium">
                              {getPatientForRequest(selectedRequest)?.age} / {getPatientForRequest(selectedRequest)?.gender}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Patient ID</Label>
                            <p className="font-medium font-mono">{selectedRequest.patientId}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Department</Label>
                            <p className="font-medium">{getPatientForRequest(selectedRequest)?.department}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Admission Date</Label>
                            <p className="font-medium">{getPatientForRequest(selectedRequest)?.admissionDate}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Current Status</Label>
                            <div className="flex items-center gap-2">
                              {getConditionIcon(getPatientForRequest(selectedRequest)?.condition || "")}
                              <span className="font-medium capitalize">
                                {getPatientForRequest(selectedRequest)?.condition}
                              </span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Attending Physician</Label>
                            <p className="font-medium">{getPatientForRequest(selectedRequest)?.attendingPhysician}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Diagnosis</Label>
                            <p className="font-medium">{getPatientForRequest(selectedRequest)?.diagnosis}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Request Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Request Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Activity Type</Label>
                          <p className="font-medium">{selectedRequest.activityType}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Priority</Label>
                          <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Requested By</Label>
                          <p className="font-medium">{selectedRequest.requestedBy}</p>
                          <p className="text-sm text-muted-foreground">{selectedRequest.requestedByRole}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Request Date</Label>
                          <p className="font-medium">
                            {new Date(selectedRequest.requestDate).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Current Location</Label>
                          <p className="font-medium">{selectedRequest.currentWard}</p>
                          <p className="text-sm text-muted-foreground">{selectedRequest.currentBed}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Target Location</Label>
                          <p className="font-medium">{selectedRequest.targetWard}</p>
                          <p className="text-sm text-muted-foreground">{selectedRequest.targetBed}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label className="text-muted-foreground">Justification</Label>
                        <p className="mt-2 p-3 bg-muted rounded-md">{selectedRequest.justification}</p>
                      </div>
                      {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                        <div className="mt-4">
                          <Label className="text-muted-foreground">Attachments</Label>
                          <div className="flex gap-2 mt-2">
                            {selectedRequest.attachments.map((file, idx) => (
                              <Badge key={idx} variant="outline" className="gap-1">
                                <FileText className="h-3 w-3" />
                                {file}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Approval Workflow Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Approval Workflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stepsLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading approval workflow...</span>
                        </div>
                      ) : stepsError ? (
                        <div className="text-sm text-red-600 dark:text-red-400">{stepsError}</div>
                      ) : steps.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No workflow steps found for this request.</div>
                      ) : (
                        <div className="space-y-4">
                          {steps.map((step, idx) => (
                            <div key={step.id} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                {getStepIcon(step.status)}
                                {idx < steps.length - 1 && (
                                  <div className="w-0.5 h-12 bg-border mt-2" />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{step.stepName}</h4>
                                  {getStatusBadge(step.status)}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Assigned to: {step.assignedTo}
                                </p>
                                {step.timestamp && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(step.timestamp).toLocaleString()}
                                  </p>
                                )}
                                {step.notes && (
                                  <p className="text-sm mt-2 p-2 bg-muted rounded">{step.notes}</p>
                                )}
                              </div>
                            </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}

            <DialogFooter>
              {selectedRequest?.status === "pending" || selectedRequest?.status === "under-review" ? (
                <>
                  <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDetailsOpen(false);
                      setDeclineDialogOpen(true);
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                    Decline
                  </Button>
                  <Button onClick={handleApprove} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    Approve
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Decline Dialog */}
        <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Decline Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for declining this bed permission request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="decline-reason">Decline Reason *</Label>
                <Textarea
                  id="decline-reason"
                  placeholder="Enter detailed reason for declining this request..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDecline} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Confirm Decline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
