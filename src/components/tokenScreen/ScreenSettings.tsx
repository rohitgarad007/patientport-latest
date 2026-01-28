import { DashboardLayout } from "@/components/DashboardLayout";
import { screenZones, layoutOptions, screens } from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Monitor, 
  User as UserIcon, 
  Ticket,
  List,
  MessageSquare,
  Palette,
  Type,
  Layout,
  Save,
  RefreshCw,
  Eye
} from "lucide-react";
import { useState } from "react";

const ScreenSettings = () => {
  const [selectedScreen, setSelectedScreen] = useState(screens[0]?.id || "");
  const [zones, setZones] = useState(screenZones);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Screen Settings</h1>
            <p className="text-muted-foreground">Customize every aspect of your display screens</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedScreen} onValueChange={setSelectedScreen}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select a screen" />
              </SelectTrigger>
              <SelectContent>
                {screens.map((screen) => (
                  <SelectItem key={screen.id} value={screen.id}>
                    {screen.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="layout" className="space-y-6">
          <TabsList className="bg-muted p-1 h-auto flex-wrap">
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="header" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Header
            </TabsTrigger>
            <TabsTrigger value="doctor" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Doctor Info
            </TabsTrigger>
            <TabsTrigger value="token" className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Token Display
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Footer
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme
            </TabsTrigger>
          </TabsList>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout Template</CardTitle>
                <CardDescription>Choose how content is arranged on the screen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {layoutOptions.map((layout) => (
                    <div
                      key={layout.id}
                      className="border-2 border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="h-24 bg-muted rounded mb-3 flex items-center justify-center">
                        <Layout className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium text-foreground">{layout.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{layout.description}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Screen Orientation</Label>
                    <Select defaultValue="landscape">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                        <SelectItem value="portrait">Portrait (9:16)</SelectItem>
                        <SelectItem value="square">Square (1:1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label>Content Padding</Label>
                    <Slider defaultValue={[24]} max={64} step={4} />
                    <p className="text-xs text-muted-foreground">24px</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Header Tab */}
          <TabsContent value="header" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Header Settings</CardTitle>
                <CardDescription>Configure the header section of the screen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Logo</Label>
                    <p className="text-sm text-muted-foreground">Display hospital/clinic logo</p>
                  </div>
                  <Switch defaultChecked={zones.header.showLogo} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Date & Time</Label>
                    <p className="text-sm text-muted-foreground">Display current date and time</p>
                  </div>
                  <Switch defaultChecked={zones.header.showDateTime} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Department Name</Label>
                    <p className="text-sm text-muted-foreground">Display department/ward name</p>
                  </div>
                  <Switch defaultChecked={zones.header.showDepartment} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Header Background Color</Label>
                  <Select defaultValue={zones.header.backgroundColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary Blue</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctor Info Tab */}
          <TabsContent value="doctor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Information Display</CardTitle>
                <CardDescription>Configure what doctor information to show</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Avatar/Photo</Label>
                    <p className="text-sm text-muted-foreground">Display doctor's profile picture</p>
                  </div>
                  <Switch defaultChecked={zones.doctorInfo.showAvatar} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Specialty</Label>
                    <p className="text-sm text-muted-foreground">Display medical specialty</p>
                  </div>
                  <Switch defaultChecked={zones.doctorInfo.showSpecialty} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Room Number</Label>
                    <p className="text-sm text-muted-foreground">Display consultation room</p>
                  </div>
                  <Switch defaultChecked={zones.doctorInfo.showRoom} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Average Time</Label>
                    <p className="text-sm text-muted-foreground">Display avg. time per patient</p>
                  </div>
                  <Switch defaultChecked={zones.doctorInfo.showAvgTime} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">Show availability indicator</p>
                  </div>
                  <Switch defaultChecked={zones.doctorInfo.showStatus} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Token Display Tab */}
          <TabsContent value="token" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Token Display</CardTitle>
                <CardDescription>Configure how the current token is displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Token Font Size</Label>
                  <Select defaultValue={zones.currentToken.fontSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                      <SelectItem value="huge">Huge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Patient Name</Label>
                    <p className="text-sm text-muted-foreground">Display current patient's name</p>
                  </div>
                  <Switch defaultChecked={zones.currentToken.showPatientName} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Patient Details</Label>
                    <p className="text-sm text-muted-foreground">Display age and gender</p>
                  </div>
                  <Switch defaultChecked={zones.currentToken.showPatientDetails} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Visit Type</Label>
                    <p className="text-sm text-muted-foreground">Display appointment type badge</p>
                  </div>
                  <Switch defaultChecked={zones.currentToken.showVisitType} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Token Animation</Label>
                  <Select defaultValue={zones.currentToken.animation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="pulse">Pulse</SelectItem>
                      <SelectItem value="glow">Glow</SelectItem>
                      <SelectItem value="flash">Flash on Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Queue Display Settings</CardTitle>
                <CardDescription>Configure how the waiting queue is displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label>Maximum Visible Patients</Label>
                  <Slider defaultValue={[zones.queue.maxVisible]} max={15} min={3} step={1} />
                  <p className="text-xs text-muted-foreground">{zones.queue.maxVisible} patients</p>
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Show Token Number</Label>
                    <Switch defaultChecked={zones.queue.showToken} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Patient Name</Label>
                    <Switch defaultChecked={zones.queue.showName} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Age</Label>
                    <Switch defaultChecked={zones.queue.showAge} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Visit Type</Label>
                    <Switch defaultChecked={zones.queue.showVisitType} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Time</Label>
                    <Switch defaultChecked={zones.queue.showTime} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Status Badge</Label>
                    <Switch defaultChecked={zones.queue.showStatus} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value="footer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
                <CardDescription>Configure the footer section with scrolling messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Scrolling Message</Label>
                    <p className="text-sm text-muted-foreground">Show a scrolling text at the bottom</p>
                  </div>
                  <Switch defaultChecked={zones.footer.showScrollingMessage} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Message Text</Label>
                  <Textarea 
                    defaultValue={zones.footer.message}
                    rows={3}
                    placeholder="Enter the scrolling message..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scroll Speed</Label>
                  <Slider defaultValue={[50]} max={100} min={10} step={10} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Emergency Contact</Label>
                    <p className="text-sm text-muted-foreground">Display emergency helpline number</p>
                  </div>
                  <Switch defaultChecked={zones.footer.showEmergencyContact} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Theme & Colors
                </CardTitle>
                <CardDescription>Customize the visual appearance of the screen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      {["#1e40af", "#047857", "#7c3aed", "#dc2626", "#ea580c"].map((color) => (
                        <button
                          key={color}
                          className="w-10 h-10 rounded-lg border-2 border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex gap-2">
                      {["#14b8a6", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ec4899"].map((color) => (
                        <button
                          key={color}
                          className="w-10 h-10 rounded-lg border-2 border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    <Label className="text-base font-semibold">Typography</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Heading Font</Label>
                      <Select defaultValue="inter">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="poppins">Poppins</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="opensans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Token Font</Label>
                      <Select defaultValue="mono">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mono">SF Mono</SelectItem>
                          <SelectItem value="roboto-mono">Roboto Mono</SelectItem>
                          <SelectItem value="fira">Fira Code</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Background Style</Label>
                  <Select defaultValue="solid">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="image">Background Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset to Default
          </Button>
          <Button className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ScreenSettings;
