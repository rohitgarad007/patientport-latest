import { DashboardLayout } from "@/components/DashboardLayout";
import { doctors, layoutOptions } from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { 
  Monitor, 
  MapPin, 
  Layout,
  Save,
  ArrowLeft,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const AddScreen = () => {
  const [selectedLayout, setSelectedLayout] = useState("standard");
  const [showQueue, setShowQueue] = useState(true);
  const [showScrollingMessage, setShowScrollingMessage] = useState(true);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/manage-screens">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add New Screen</h1>
            <p className="text-muted-foreground">Configure a new display screen for token announcements</p>
          </div>
        </div>

        <form className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
              <CardDescription>Enter the basic details for this screen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="screenName">Screen Name *</Label>
                  <Input 
                    id="screenName" 
                    placeholder="e.g., Main Lobby Display"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="screenId">Screen ID</Label>
                  <Input 
                    id="screenId" 
                    placeholder="Auto-generated"
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="location" 
                    placeholder="e.g., Building A - Ground Floor"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Add any additional notes about this screen..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Doctor Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Assignment</CardTitle>
              <CardDescription>Select the doctor/department for this screen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Assigned Doctor *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center gap-3">
                          <img 
                            src={doctor.avatar} 
                            alt={doctor.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-medium">{doctor.name}</span>
                            <span className="text-muted-foreground ml-2">- {doctor.specialty}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room">Room Number</Label>
                  <Input id="room" placeholder="e.g., Room 101" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avgTime">Avg. Time per Patient</Label>
                  <Input id="avgTime" placeholder="e.g., 15 min" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                Display Settings
              </CardTitle>
              <CardDescription>Configure how the screen will display information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Screen Resolution</Label>
                <Select defaultValue="1920x1080">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1920x1080">1920 x 1080 (Full HD)</SelectItem>
                    <SelectItem value="1280x720">1280 x 720 (HD)</SelectItem>
                    <SelectItem value="3840x2160">3840 x 2160 (4K)</SelectItem>
                    <SelectItem value="1080x1920">1080 x 1920 (Portrait)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Layout Template *</Label>
                <RadioGroup 
                  value={selectedLayout} 
                  onValueChange={setSelectedLayout}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {layoutOptions.map((layout) => (
                    <div key={layout.id}>
                      <RadioGroupItem
                        value={layout.id}
                        id={layout.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={layout.id}
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <div className="w-full h-20 bg-muted rounded mb-3 flex items-center justify-center">
                          <Layout className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{layout.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{layout.description}</p>
                        </div>
                        {selectedLayout === layout.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Queue Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Queue Display Options</CardTitle>
              <CardDescription>Configure how the patient queue is displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showQueue">Show Upcoming Queue</Label>
                  <p className="text-sm text-muted-foreground">Display waiting patients on screen</p>
                </div>
                <Switch
                  id="showQueue"
                  checked={showQueue}
                  onCheckedChange={setShowQueue}
                />
              </div>

              {showQueue && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label>Max Visible Patients</Label>
                    <Select defaultValue="5">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 patients</SelectItem>
                        <SelectItem value="5">5 patients</SelectItem>
                        <SelectItem value="10">10 patients</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Refresh Interval</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">Every 10 seconds</SelectItem>
                        <SelectItem value="30">Every 30 seconds</SelectItem>
                        <SelectItem value="60">Every 1 minute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="space-y-0.5">
                  <Label htmlFor="scrollingMessage">Scrolling Message</Label>
                  <p className="text-sm text-muted-foreground">Show a scrolling message at the bottom</p>
                </div>
                <Switch
                  id="scrollingMessage"
                  checked={showScrollingMessage}
                  onCheckedChange={setShowScrollingMessage}
                />
              </div>

              {showScrollingMessage && (
                <div className="space-y-2">
                  <Label htmlFor="message">Message Text</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Please have your documents ready. Thank you for your patience."
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button variant="outline" asChild>
              <Link to="/manage-screens">Cancel</Link>
            </Button>
            <Button className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Create Screen
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddScreen;
