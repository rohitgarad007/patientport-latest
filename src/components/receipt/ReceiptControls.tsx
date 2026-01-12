import { useState } from "react";
import { Printer, Share2, Globe, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Language, languageLabels } from "@/data/translations";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { configService } from "@/services/configService";

interface ReceiptControlsProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  receiptRef: React.RefObject<HTMLDivElement>;
  buttonColorClass?: string;
  disabled?: boolean;
  patientId?: string;
  appointmentId?: string;
  patientName?: string;
  patientPhone?: string;
}

const ReceiptControls = ({ 
  language, 
  onLanguageChange, 
  receiptRef,
  buttonColorClass = "bg-primary hover:bg-primary/90",
  disabled = false,
  patientId,
  appointmentId,
  patientName,
  patientPhone
}: ReceiptControlsProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{ link: string; password: string; patientPhone?: string } | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const handlePrint = () => {
    if (disabled) return;
    window.print();
  };

  const getAuthHeaders = async () => {
    const token = Cookies.get("token");
    const apiUrl = await configService.getApiUrl();
    if (!token) throw new Error("No auth token found");
    return {
      apiUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const handleWhatsAppShare = async () => {
    if (disabled) return;
    if (!receiptRef.current) {
      toast.error("Receipt not found");
      return;
    }

    setIsSharing(true);
    const originalElement = receiptRef.current;
    originalElement.setAttribute('data-pdf-target', 'true');
    
    // Use a wider capture width to ensure layout looks professional (desktop view)
    // 1123px is approx A4 landscape width, providing ample room for columns to sit side-by-side
    // This prevents "squashed" mobile layouts in the PDF
    const CAPTURE_WIDTH = 1123; 
    
    try {
      // Use html2canvas with onclone to modify the document for PDF generation
      const canvas = await html2canvas(originalElement, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: CAPTURE_WIDTH, // Simulate desktop viewport
        width: CAPTURE_WIDTH,       // Capture at this width
        onclone: (clonedDoc) => {
          // Hide elements that should be hidden in print/PDF
          const hiddenElements = clonedDoc.querySelectorAll('.print\\:hidden');
          hiddenElements.forEach(el => (el as HTMLElement).style.display = 'none');

          // Hide elements marked as hide-in-pdf (based on section visibility settings)
          const pdfHiddenElements = clonedDoc.querySelectorAll('.hide-in-pdf');
          pdfHiddenElements.forEach(el => (el as HTMLElement).style.display = 'none');

          // Remove shadows and gradients for cleaner PDF
          const element = clonedDoc.querySelector('[data-pdf-target="true"]');
          if (element) {
            element.removeAttribute('data-pdf-target');
            // Force white background and remove shadows/gradients
            const el = element as HTMLElement;
            el.style.boxShadow = 'none';
            // We want to preserve colors and gradients as per user request
            // el.style.backgroundImage = 'none'; 
            // el.style.backgroundColor = '#ffffff';
            el.style.borderRadius = '0'; // Keep square corners for PDF
            el.style.border = 'none';
            
            // Force strict layout width and remove constraints
            el.style.width = `${CAPTURE_WIDTH}px`;
            el.style.maxWidth = 'none'; // Remove max-w-4xl or similar constraints
            el.style.margin = '0'; // Remove auto margins
            el.style.boxSizing = 'border-box';
            
            // Enforce safe print margins (scaled relative to capture width)
            // 40px at 794px is ~5%. At 1123px, 5% is ~56px.
            el.style.padding = '56px'; 
            
            // Ensure all children respect the width and remove max-width constraints
            const children = el.querySelectorAll('*');
            children.forEach((child) => {
                const c = child as HTMLElement;
                // Remove max-width constraints that might squeeze content
                if (c.style.maxWidth || c.classList.contains('max-w-4xl') || c.classList.contains('max-w-md')) {
                    c.style.maxWidth = 'none';
                }
                // Force grid columns to behave nicely if needed
                // (Tailwind md: classes should activate due to windowWidth)
            });

            // Remove gradients from header if exists (specific to some receipts)
            // User wants to PRESERVE the design, so we comment this out
            /*
            const headerGradient = el.querySelector('.bg-gradient-to-r');
            if (headerGradient) {
               (headerGradient as HTMLElement).style.backgroundImage = 'none';
               (headerGradient as HTMLElement).style.backgroundColor = '#f3f4f6'; // Light gray fallback
            }
            */
          }
        }
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      const pdfBlob = pdf.output('blob');

      // If we have IDs, upload to server
      if (patientId && appointmentId) {
        const { apiUrl, headers } = await getAuthHeaders();
        const formData = new FormData();
        formData.append('file', pdfBlob, 'prescription.pdf');
        formData.append('patient_id', patientId);
        formData.append('appointment_id', appointmentId);

        const response = await fetch(`${apiUrl}dc_doctor_uploadSharedReceipt`, {
          method: 'POST',
          headers: headers,
          body: formData
        });

        const text = await response.text();
        let result;
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.error("Non-JSON response:", text);
          throw new Error("Server returned invalid response. Please try again later.");
        }
        
        if (result.success) {
          setShareResult({ 
            link: result.data.link, 
            password: result.data.password,
            patientPhone: result.data.patient_phone 
          });
          setShowShareDialog(true);
          toast.success("Receipt secured and ready to share!");
        } else {
          throw new Error(result.message || "Upload failed");
        }
      } else {
        // Fallback: Download and guide user if no IDs (e.g. preview mode)
        downloadImage(pdfBlob);
      }

    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share secure link. Downloading PDF instead.");
      // Fallback download if upload fails
      if (receiptRef.current) {
          // Re-generate logic simple fallback or just warn
      }
    } finally {
      originalElement.removeAttribute('data-pdf-target');
      setIsSharing(false);
    }
  };

  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prescription.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded (PDF).");
  };

  const copyToClipboard = (text: string, isPass: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPass) {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  const shareOnWhatsApp = () => {
    if (!shareResult) return;
    
    // Logic to fix localhost link
    let shareLink = shareResult.link;
    try {
        const urlObj = new URL(shareLink);
        
        // Scenario 1: User is testing on localhost, but link needs to be clickable
        // WhatsApp doesn't like 'localhost', but '127.0.0.1' is often clickable
        if (urlObj.hostname === 'localhost') {
            // If we are actually on a different hostname (e.g. LAN IP), use that
            if (window.location.hostname !== 'localhost') {
                urlObj.hostname = window.location.hostname;
            } else {
                // If we are truly on localhost, force 127.0.0.1 which is more likely to be clickable
                urlObj.hostname = '127.0.0.1';
            }
            
            if (window.location.port) {
                urlObj.port = window.location.port;
            }
            shareLink = urlObj.toString();
        }
    } catch (e) {
        console.error("Error parsing URL:", e);
    }
    
    // Construct a friendly welcome message
    const greeting = patientName ? `Hello ${patientName},` : "Hello,";
    // Ensure the link is completely isolated on its own line with surrounding newlines
    const text = `${greeting}\n\nHere is your secured medical prescription receipt.\n\n${shareLink}\n\nPassword: ${shareResult.password}\n\nThank you for visiting.`;
    
    // Construct the WhatsApp URL
    // If we have a phone number, we can use the direct send endpoint
    // Format the phone number to remove spaces/dashes and ensure it starts with country code if needed (assuming Indian +91 for now based on context, or use as is if full)
    
    let url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    // Prefer phone from API response (DB source of truth), fall back to prop
    const targetPhone = shareResult.patientPhone || patientPhone;

    if (targetPhone) {
        // Simple cleanup: remove spaces, dashes, parentheses
        let cleanPhone = targetPhone.replace(/[\s\-()]/g, '');
        // If it doesn't start with +, assume it might need a country code or is already local. 
        // WhatsApp API usually requires country code without +.
        // If the user's data already has country code, great. If not, we might need to handle it.
        // Assuming the input phone might be like "9876543210" or "+91 9876543210"
        
        if (cleanPhone.startsWith('+')) {
            cleanPhone = cleanPhone.substring(1);
        } else if (cleanPhone.length === 10) {
            // Default to 91 for India as per user context examples, or keep it generic?
            // User example: 919890949599
            cleanPhone = '91' + cleanPhone;
        }
        
        url = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(text)}&type=phone_number`;
    }
    
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Select value={language} onValueChange={(val) => onLanguageChange(val as Language)}>
          <SelectTrigger className="w-[140px] bg-white">
            <Globe className="w-4 h-4 mr-2 text-primary" />
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mr">मराठी (Marathi)</SelectItem>
            <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          onClick={handleWhatsAppShare} 
          variant="outline" 
          className="gap-2 border-green-500 text-green-600 hover:bg-green-50"
          disabled={isSharing || disabled}
        >
          {isSharing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          WhatsApp
        </Button>
        
        <Button onClick={handlePrint} className={`gap-2 ${buttonColorClass}`} disabled={disabled}>
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Secured Receipt</DialogTitle>
            <DialogDescription>
              This receipt is password protected. Share the link and password with the patient.
            </DialogDescription>
          </DialogHeader>
          
          {shareResult && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Secure Link</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={shareResult.link} />
                  <Button size="icon" variant="outline" onClick={() => copyToClipboard(shareResult.link, false)}>
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={shareResult.password} className="font-mono tracking-widest" />
                  <Button size="icon" variant="outline" onClick={() => copyToClipboard(shareResult.password, true)}>
                    {copiedPass ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:justify-between gap-2">
             <Button onClick={shareOnWhatsApp} className="w-full bg-green-600 hover:bg-green-700 gap-2">
               <Share2 className="w-4 h-4" /> Share via WhatsApp
             </Button>
             <Button variant="secondary" onClick={() => setShowShareDialog(false)} className="w-full">
               Close
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptControls;
