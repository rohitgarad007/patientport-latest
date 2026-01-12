import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Package, Calendar, MapPin, Truck, CheckCircle2, XCircle, AlertTriangle, FileText, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
import { fetchPendingReceipts, confirmReceiptVerification, ReceiptListItem } from "@/services/HSHospitalMedicalService";

export default function HSMedicalReceiptVerification() {

  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedDispatch, setSelectedDispatch] = useState<ReceiptListItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationData, setVerificationData] = useState<any>({});
  const [receivedBy, setReceivedBy] = useState("");
  const [remarks, setRemarks] = useState("");

  const loadReceipts = async () => {
    try {
      setLoading(true);
      setError("");
      const resp = await fetchPendingReceipts(1, 20);
      setReceipts(resp.items);
    } catch (e: any) {
      setError(e?.message || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const handleViewDispatch = (dispatch: ReceiptListItem) => {
    setSelectedDispatch(dispatch);
    setIsDialogOpen(true);
    setCurrentStep(1);
    
    // Initialize verification data
    const initialData: any = {};
    dispatch.items.forEach((item) => {
      initialData[item.id] = {
        verified: false,
        receivedQty: item.dispatchedQty,
        hasIssue: false,
        issueType: "",
        issueDescription: ""
      };
    });
    setVerificationData(initialData);
    setReceivedBy("");
    setRemarks("");
  };

  const handleItemVerification = (itemId: string, field: string, value: any) => {
    setVerificationData((prev: any) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate all items are verified
      const allVerified = Object.values(verificationData).every((item: any) => item.verified);
      if (!allVerified) {
        toast({
          title: "Verification Incomplete",
          description: "Please verify all items before proceeding.",
          variant: "destructive"
        });
        return;
      }
    }
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleConfirmReceipt = async () => {
    if (!receivedBy.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the name of the person receiving the goods.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDispatch) return;

    try {
      const itemsPayload = selectedDispatch.items.map((it) => ({
        allocation_id: String(it.id),
        received_qty: Number(verificationData[it.id]?.receivedQty ?? it.dispatchedQty) || it.dispatchedQty,
        has_issue: verificationData[it.id]?.hasIssue ? 1 : 0,
        issue_description: verificationData[it.id]?.issueDescription || "",
      }));
      await confirmReceiptVerification({
        dispatch_id: selectedDispatch.id,
        received_by: receivedBy,
        remarks,
        items: itemsPayload,
      });

      const hasIssues = Object.values(verificationData).some((item: any) => item.hasIssue);
      toast({
        title: hasIssues ? "Receipt Confirmed with Issues" : "Receipt Confirmed Successfully",
        description: hasIssues 
          ? "The goods have been received and issues have been reported for review."
          : "All items have been verified and received successfully.",
      });

      setIsDialogOpen(false);
      setSelectedDispatch(null);
      loadReceipts();
    } catch (e: any) {
      toast({ title: "Failed to confirm receipt", description: e?.message || "Please try again", variant: "destructive" });
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "complete";
    if (step === currentStep) return "active";
    return "upcoming";
  };

  const pendingReceipts = receipts.filter(order => order.status === "In Transit" || order.status === "Delivered");


  return(
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground pb-4">
            Goods Receipt Verification
          </h1>
          
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-blue-600">
                  {receipts.filter(o => o.status === "In Transit").length}
                </p>
                <Truck className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-green-600">
                  {receipts.filter(o => o.status === "Delivered").length}
                </p>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-purple-600">
                  {pendingReceipts.reduce((acc, order) => acc + order.items.length, 0)}
                </p>
                <Package className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-amber-600">{pendingReceipts.length}</p>
                <ClipboardCheck className="h-8 w-8 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4">
          {/* Pending Receipts List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pending Dispatch Receipts
              </CardTitle>
              <CardDescription>
                Click on any dispatch to begin the verification process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading && (
                  <div className="text-sm text-muted-foreground">Loading receipts...</div>
                )}
                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}
                {pendingReceipts.map((dispatch) => (
                  <Card key={dispatch.id} className="hover:shadow-md transition-all border-l-4 border-l-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">{dispatch.id}</h3>
                            <Badge variant={dispatch.status === "Delivered" ? "default" : "secondary"}>
                              {dispatch.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <span>Request: {dispatch.requestId}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{dispatch.store}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Dispatched: {dispatch.dispatchDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Truck className="h-4 w-4" />
                              <span>Courier: {dispatch.courier}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-2 rounded-md w-fit">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="font-medium">{dispatch.items.length} items</span>
                          </div>
                        </div>

                        <Button onClick={() => handleViewDispatch(dispatch)} className="ml-4">
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Verify Receipt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Goods Receipt Verification</DialogTitle>
              <DialogDescription>
                Complete the 2-step verification process to confirm receipt
              </DialogDescription>
            </DialogHeader>

            {selectedDispatch && (
              <div className="space-y-6">
                {/* Progress Steps */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {[
                      { number: 1, title: "Verify Items & Report Issues" },
                      { number: 2, title: "Sign & Confirm" }
                    ].map((step, index) => (
                      <div key={step.number} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                              getStepStatus(step.number) === "complete"
                                ? "bg-green-500 text-white"
                                : getStepStatus(step.number) === "active"
                                ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {getStepStatus(step.number) === "complete" ? (
                              <CheckCircle2 className="h-6 w-6" />
                            ) : (
                              step.number
                            )}
                          </div>
                          <p
                            className={`mt-2 text-sm font-medium text-center ${
                              getStepStatus(step.number) === "active"
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.title}
                          </p>
                        </div>
                        {index < 1 && (
                          <div className="flex-1 h-1 bg-muted mx-4 mb-8">
                            <div
                              className={`h-full transition-all ${
                                getStepStatus(step.number + 1) === "complete" ||
                                getStepStatus(step.number + 1) === "active"
                                  ? "bg-primary"
                                  : "bg-muted"
                              }`}
                              style={{
                                width: getStepStatus(step.number + 1) !== "upcoming" ? "100%" : "0%"
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Progress value={(currentStep / 2) * 100} className="h-2" />
                </div>

                {/* Dispatch Details */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Dispatch Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Dispatch ID</p>
                        <p className="font-semibold">{selectedDispatch.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Request ID</p>
                        <p className="font-semibold">{selectedDispatch.requestId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Store</p>
                        <p className="font-semibold">{selectedDispatch.store}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dispatch Date</p>
                        <p className="font-semibold">{selectedDispatch.dispatchDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Courier</p>
                        <p className="font-semibold">{selectedDispatch.courier}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tracking Number</p>
                        <p className="font-semibold">{selectedDispatch.trackingNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 1: Verify Items & Report Issues */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ClipboardCheck className="h-5 w-5" />
                          Verify Items & Report Issues
                        </CardTitle>
                        <CardDescription>
                          Check each item carefully and report any issues found
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedDispatch.items.map((item: any) => (
                          <Card key={item.id} className="border-2">
                            <CardContent className="pt-6 space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                  <h4 className="font-semibold text-lg">{item.name}</h4>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Category: </span>
                                      <span className="font-medium">{item.category}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Batch: </span>
                                      <span className="font-medium">{item.batchNumber}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Dispatched Qty: </span>
                                      <span className="font-medium">{item.dispatchedQty} {item.unit}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Expiry: </span>
                                      <span className="font-medium">{item.expiryDate}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Received Quantity</Label>
                                  <Input
                                    type="number"
                                    value={verificationData[item.id]?.receivedQty || ""}
                                    onChange={(e) =>
                                      handleItemVerification(item.id, "receivedQty", parseInt(e.target.value) || 0)
                                    }
                                  />
                                </div>

                                <div className="flex items-center space-x-2 pt-8">
                                  <Checkbox
                                    id={`verified-${item.id}`}
                                    checked={verificationData[item.id]?.verified || false}
                                    onCheckedChange={(checked) =>
                                      handleItemVerification(item.id, "verified", checked)
                                    }
                                  />
                                  <label
                                    htmlFor={`verified-${item.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Item Verified
                                  </label>
                                </div>
                              </div>

                              {/* Issue Reporting Section */}
                              <div className="space-y-3 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                                  <Label className="text-amber-900 dark:text-amber-100">Report Issue (Optional)</Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`issue-${item.id}`}
                                    checked={verificationData[item.id]?.hasIssue || false}
                                    onCheckedChange={(checked) =>
                                      handleItemVerification(item.id, "hasIssue", checked)
                                    }
                                  />
                                  <label
                                    htmlFor={`issue-${item.id}`}
                                    className="text-sm font-medium leading-none"
                                  >
                                    This item has an issue
                                  </label>
                                </div>

                                {verificationData[item.id]?.hasIssue && (
                                  <div className="space-y-3 mt-3">
                                    <div className="space-y-2">
                                      <Label>Issue Type</Label>
                                      <Select
                                        value={verificationData[item.id]?.issueType || ""}
                                        onValueChange={(value) =>
                                          handleItemVerification(item.id, "issueType", value)
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select issue type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="shortage">Shortage</SelectItem>
                                          <SelectItem value="damage">Damaged Items</SelectItem>
                                          <SelectItem value="expiry">Near Expiry</SelectItem>
                                          <SelectItem value="quality">Quality Issue</SelectItem>
                                          <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Issue Description</Label>
                                      <Textarea
                                        placeholder="Describe the issue in detail..."
                                        value={verificationData[item.id]?.issueDescription || ""}
                                        onChange={(e) =>
                                          handleItemVerification(item.id, "issueDescription", e.target.value)
                                        }
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Step 2: Sign & Confirm */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Sign & Confirm Receipt
                        </CardTitle>
                        <CardDescription>
                          Provide your signature and confirm the receipt
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Summary */}
                        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                          <h4 className="font-semibold">Verification Summary</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total Items</p>
                              <p className="font-semibold text-lg">{selectedDispatch.items.length}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Items with Issues</p>
                              <p className="font-semibold text-lg text-amber-600">
                                {Object.values(verificationData).filter((item: any) => item.hasIssue).length}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Issues Summary */}
                        {Object.values(verificationData).some((item: any) => item.hasIssue) && (
                          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2 text-amber-900 dark:text-amber-100">
                                <AlertTriangle className="h-4 w-4" />
                                Reported Issues
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {selectedDispatch.items.map((item: any) => {
                                const itemData = verificationData[item.id];
                                if (itemData?.hasIssue) {
                                  return (
                                    <div key={item.id} className="text-sm">
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-muted-foreground">
                                        {itemData.issueType}: {itemData.issueDescription}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </CardContent>
                          </Card>
                        )}

                        {/* Signature Section */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="receivedBy">Received By (Full Name) *</Label>
                            <Input
                              id="receivedBy"
                              placeholder="Enter your full name"
                              value={receivedBy}
                              onChange={(e) => setReceivedBy(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="remarks">Additional Remarks</Label>
                            <Textarea
                              id="remarks"
                              placeholder="Any additional comments or observations..."
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              rows={4}
                            />
                          </div>
                        </div>

                        {/* Confirmation */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-semibold text-blue-900 dark:text-blue-100">
                                Confirmation Declaration
                              </p>
                              <p className="text-blue-700 dark:text-blue-300 mt-1">
                                By signing below, I confirm that I have received and verified the items listed above.
                                I acknowledge that the information provided is accurate and any issues reported have been
                                properly documented.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentStep === 1) {
                        setIsDialogOpen(false);
                      } else {
                        handlePreviousStep();
                      }
                    }}
                  >
                    {currentStep === 1 ? "Cancel" : "Previous"}
                  </Button>

                  <div className="flex gap-2">
                    {currentStep < 2 && (
                      <Button onClick={handleNextStep}>
                        Next Step
                      </Button>
                    )}
                    {currentStep === 2 && (
                      <Button onClick={handleConfirmReceipt} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirm Receipt
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}