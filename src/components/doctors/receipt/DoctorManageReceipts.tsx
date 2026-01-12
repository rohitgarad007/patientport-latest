import { useState, useEffect } from "react";
import { Check, Eye, Star, FileText, Layers, Moon, Heart, Sparkles, Building2, Sun, Leaf, Newspaper, Waves, Zap, Crown, Shield, Gem, Palette, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { fetchReceiptTemplates, ReceiptTemplate, setDefaultReceipt } from "@/services/receiptService";

export default function DoctorMedicationSuggList() {

  const [receiptTemplates, setReceiptTemplates] = useState<ReceiptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<number | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<ReceiptTemplate | null>(null);
  const [pendingDefault, setPendingDefault] = useState<ReceiptTemplate | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Load images from src/assets/images
  const receiptImages = import.meta.glob('/src/assets/images/*.png', { eager: true, as: 'url' });

  useEffect(() => {
    const loadReceipts = async () => {
      setLoading(true);
      const res = await fetchReceiptTemplates();
      if (res.success) {
        const mapped = res.data.map((item, index) => {
          // Resolve image path
          // keys are like "/src/assets/images/Receipt3.png"
          const imgKey = `/src/assets/images/${item.receipt_img}`;
          const imgSrc = receiptImages[imgKey] as string;

          return {
            ...item,
            // Map other properties if missing in DB or just use defaults
            icon: FileText, // Default icon
            gradient: item.gradient || "from-emerald-100 to-teal-200",
            accentColor: item.accent_color || "bg-emerald-500",
            previewImage: imgSrc || "",
            // Ensure ID is number if needed
            id: Number(item.id)
          };
        });
        setReceiptTemplates(mapped);
        
        // Set default receipt from response
        if (res.default_receipt_id) {
            setSelectedReceipt(Number(res.default_receipt_id));
        } else {
            // Check if any item is marked as default (fallback)
            const defaultItem = mapped.find(t => t.is_default === 1);
            if (defaultItem) {
                setSelectedReceipt(defaultItem.id);
            }
        }

      } else {
        toast({
          title: "Error",
          description: res.message,
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    loadReceipts();
  }, []);

  const handleSetDefault = (template: ReceiptTemplate) => {
    setPendingDefault(template);
    setShowConfirmDialog(true);
  };

  const confirmSetDefault = async () => {
    if (pendingDefault) {
      const res = await setDefaultReceipt(pendingDefault.id);
      
      if (res.success) {
        setSelectedReceipt(pendingDefault.id);
        toast({
          title: "Default Receipt Updated",
          description: `"${pendingDefault.name}" is now your default receipt template.`,
        });
      } else {
        toast({
            title: "Error",
            description: res.message || "Failed to update default receipt",
            variant: "destructive",
        });
      }
    }
    setShowConfirmDialog(false);
    setPendingDefault(null);
  };

	return(

		<div className="p-6 fullgray-wrapper">
	      	<div className="max-w-6xl mx-auto">

		        <div className="flex items-center justify-between mb-4">
		          	<h1 className="text-2xl font-heading font-bold">Manage Receipts</h1>
		          	<Badge variant="secondary" className="w-fit">
		              <Star className="w-4 h-4 mr-1 text-amber-500" />
		              {receiptTemplates.length} Templates Available
		            </Badge>
		        </div>


		        

		        {/* Receipt Grid */}
		        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
		          {receiptTemplates.map((template) => {
		            const Icon = template.icon || FileText;
		            const isSelected = selectedReceipt === template.id;
		            
		            return (
		              <div
		                key={template.id}
		                className={`group relative rounded-xl border-2 transition-all duration-300 overflow-hidden bg-card hover:shadow-lg hover:-translate-y-1 ${
		                  isSelected ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border hover:border-primary/50"
		                }`}
		              >
		                {/* Gradient Header */}
		                <div className={`h-24 md:h-28 bg-gradient-to-br ${template.gradient} relative`}>
		                  <div className="absolute inset-0 flex items-center justify-center">
		                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${template.accentColor} flex items-center justify-center shadow-lg`}>
		                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
		                    </div>
		                  </div>
		                  {isSelected && (
		                    <div className="absolute top-2 right-2">
		                      <Badge className="bg-primary text-primary-foreground">
		                        <Check className="w-3 h-3 mr-1" /> Default
		                      </Badge>
		                    </div>
		                  )}
		                </div>

		                {/* Content */}
		                <div className="p-4">
		                  <div className="flex items-start justify-between gap-2 mb-2">
		                    <h3 className="font-semibold text-foreground line-clamp-1">{template.name}</h3>
		                    <Badge variant="outline" className="text-xs shrink-0">Receipt {template.id}</Badge>
		                  </div>
		                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{template.description}</p>
		                  
		                  {/* Progress bar accent */}
		                  <div className="h-1 rounded-full bg-muted mb-4">
		                    <div className={`h-full rounded-full ${template.accentColor} w-2/3`} />
		                  </div>

		                  {/* Actions */}
		                  <div className="flex gap-2">
		                    <Button
		                      variant="ghost"
		                      size="sm"
		                      className="flex-1 text-primary hover:text-primary hover:bg-primary/10"
		                      onClick={() => setPreviewReceipt(template)}
		                    >
		                      <Eye className="w-4 h-4 mr-1" />
		                      Preview
		                    </Button>
		                    {!isSelected && (
		                      <Button
		                        variant="outline"
		                        size="sm"
		                        className="flex-1"
		                        onClick={() => handleSetDefault(template)}
		                      >
		                        Set Default
		                      </Button>
		                    )}
		                  </div>
		                </div>
		              </div>
		            );
		          })}
		        </div>


		        {/* Preview Dialog */}
			      <Dialog open={!!previewReceipt} onOpenChange={() => setPreviewReceipt(null)}>
			        <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
			          <DialogHeader className="p-4 pb-2 border-b">
			            <DialogTitle className="flex items-center gap-2">
			              {previewReceipt?.icon && <previewReceipt.icon className="w-5 h-5 text-primary" />}
			              {previewReceipt?.name}
			            </DialogTitle>
			            <DialogDescription>{previewReceipt?.description}</DialogDescription>
			          </DialogHeader>
			          <ScrollArea className="h-[60vh]">
			            <div className="p-4 flex items-center justify-center bg-gray-100 min-h-full">
			              {previewReceipt?.previewImage ? (
			                <img 
			                  src={previewReceipt.previewImage} 
			                  alt={previewReceipt.name} 
			                  className="w-full h-auto object-contain rounded shadow-lg"
			                />
			              ) : (
			                <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
			                  <FileText className="w-16 h-16 mb-4 opacity-20" />
			                  <p>No preview image available</p>
			                </div>
			              )}
			            </div>
			          </ScrollArea>
			          <DialogFooter className="p-4 pt-2 border-t">
			            <Button variant="outline" onClick={() => setPreviewReceipt(null)}>Close</Button>
			            {selectedReceipt !== previewReceipt?.id && (
			              <Button onClick={() => {
			                if (previewReceipt) handleSetDefault(previewReceipt);
			                setPreviewReceipt(null);
			              }}>
			                Set as Default
			              </Button>
			            )}
			          </DialogFooter>
			        </DialogContent>
			      </Dialog>

			      {/* Confirmation Dialog */}
			      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
			        <AlertDialogContent>
			          <AlertDialogHeader>
			            <AlertDialogTitle>Set Default Receipt Template</AlertDialogTitle>
			            <AlertDialogDescription>
			              Are you sure you want to set "{pendingDefault?.name}" as your default receipt template? 
			              This will be used for all new prescriptions.
			            </AlertDialogDescription>
			          </AlertDialogHeader>
			          <AlertDialogFooter>
			            <AlertDialogCancel onClick={() => setPendingDefault(null)}>Cancel</AlertDialogCancel>
			            <AlertDialogAction onClick={confirmSetDefault}>Confirm</AlertDialogAction>
			          </AlertDialogFooter>
			        </AlertDialogContent>
			      </AlertDialog>


	    	</div>
		</div>

	);
}


