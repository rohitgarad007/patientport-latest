import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctors, layoutOptions } from "@/data/dummyData-2";
import { Edit, Save, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

interface Screen {
  id: string;
  name: string;
  location: string;
  doctor: any;
  currentPatient: any;
  queue: any[];
  status: string;
  resolution: string;
  lastUpdated: string;
  layout: string;
}

interface EditScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screen: Screen | null;
  onSave: (updatedScreen: Screen) => void;
}

export function EditScreenDialog({ open, onOpenChange, screen, onSave }: EditScreenDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    doctorId: "",
    resolution: "1920x1080",
    layout: "standard",
    description: "",
  });

  useEffect(() => {
    if (screen) {
      setFormData({
        name: screen.name,
        location: screen.location,
        doctorId: screen.doctor.id,
        resolution: screen.resolution,
        layout: screen.layout,
        description: "",
      });
    }
  }, [screen]);

  if (!screen) return null;

  const handleSave = () => {
    const selectedDoctor = doctors.find(d => d.id === formData.doctorId) || screen.doctor;
    const updatedScreen: Screen = {
      ...screen,
      name: formData.name,
      location: formData.location,
      doctor: selectedDoctor,
      resolution: formData.resolution,
      layout: formData.layout,
    };
    onSave(updatedScreen);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-primary" />
            Edit Screen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Screen Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Main Lobby Display"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Building A - Ground Floor"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assigned Doctor</Label>
            <Select
              value={formData.doctorId}
              onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex items-center gap-2">
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span>{doctor.name}</span>
                      <span className="text-muted-foreground">- {doctor.specialty}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Resolution</Label>
              <Select
                value={formData.resolution}
                onValueChange={(value) => setFormData({ ...formData, resolution: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1920x1080">1920 x 1080</SelectItem>
                  <SelectItem value="1280x720">1280 x 720</SelectItem>
                  <SelectItem value="3840x2160">3840 x 2160</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Layout</Label>
              <Select
                value={formData.layout}
                onValueChange={(value) => setFormData({ ...formData, layout: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {layoutOptions.map((layout) => (
                    <SelectItem key={layout.id} value={layout.id}>
                      {layout.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Notes (optional)</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any notes about this screen..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
