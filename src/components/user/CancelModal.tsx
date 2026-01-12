import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle } from "lucide-react";

interface CancelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

const cancellationReasons = [
  "Emergency - Cannot make it",
  "Feeling better - No longer need appointment",
  "Scheduling conflict",
  "Transportation issue",
  "Doctor unavailable",
  "Other (please specify)",
];

export const CancelModal = ({ open, onOpenChange, onConfirm }: CancelModalProps) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleCancel = () => {
    const finalReason = selectedReason === "Other (please specify)" ? customReason : selectedReason;
    
    if (!finalReason.trim()) {
      return;
    }

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    onConfirm(finalReason);
    onOpenChange(false);
    setShowConfirmation(false);
    setSelectedReason("");
    setCustomReason("");
  };

  const handleBack = () => {
    setShowConfirmation(false);
  };

  const isValid = selectedReason && (selectedReason !== "Other (please specify)" || customReason.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {!showConfirmation ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Cancel Appointment
              </DialogTitle>
              <DialogDescription>
                Please let us know why you're cancelling. This helps us improve our service.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label>Reason for Cancellation *</Label>
                <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                  {cancellationReasons.map((reason) => (
                    <div key={reason} className="flex items-center space-x-2">
                      <RadioGroupItem value={reason} id={reason} />
                      <Label htmlFor={reason} className="font-normal cursor-pointer">
                        {reason}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {selectedReason === "Other (please specify)" && (
                <div className="space-y-2 animate-slide-in">
                  <Label htmlFor="custom-reason">Please specify *</Label>
                  <Textarea
                    id="custom-reason"
                    placeholder="Enter your reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Keep Appointment
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancel}
                disabled={!isValid}
              >
                Continue to Cancel
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Confirm Cancellation
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 px-4 bg-destructive-light rounded-lg border border-destructive/20">
              <p className="text-sm font-medium text-destructive mb-2">Cancellation Reason:</p>
              <p className="text-sm text-foreground">
                {selectedReason === "Other (please specify)" ? customReason : selectedReason}
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleBack}>
                Go Back
              </Button>
              <Button variant="destructive" onClick={handleCancel}>
                Yes, Cancel Appointment
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
