import { useState } from 'react';
import { Save, Edit, Upload, Trash2, Building, Users, Clock, DollarSign, Bell, Shield, Database, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function HospitalSettings() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hospital Settings</h1>
          <p className="text-muted-foreground">Manage hospital configuration and preferences</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className="gap-2"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              Edit Settings
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Hospital Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name</Label>
                  <Input 
                    id="hospitalName" 
                    defaultValue="City General Hospital"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    defaultValue="123 Healthcare Ave, Medical District, State 12345"
                    disabled={!isEditing}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      defaultValue="+1-555-1000"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      defaultValue="info@cityhospital.com"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    defaultValue="www.cityhospital.com"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number</Label>
                  <Input 
                    id="license" 
                    defaultValue="HL-2024-001"
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hospital Logo & Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload Hospital Logo</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Hospital Tagline</Label>
                  <Input 
                    id="tagline" 
                    placeholder="Your trusted healthcare partner"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Brief description of your hospital..."
                    disabled={!isEditing}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operational Settings */}
        <TabsContent value="operational">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex items-center justify-between">
                      <Label className="w-20">{day}</Label>
                      <div className="flex items-center gap-2 flex-1">
                        <Input 
                          type="time" 
                          defaultValue="08:00"
                          disabled={!isEditing}
                          className="w-24"
                        />
                        <span>to</span>
                        <Input 
                          type="time" 
                          defaultValue="18:00"
                          disabled={!isEditing}
                          className="w-24"
                        />
                        <Switch defaultChecked disabled={!isEditing} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Department Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { name: 'Emergency', status: 'active', hours: '24/7' },
                    { name: 'Cardiology', status: 'active', hours: '8 AM - 6 PM' },
                    { name: 'Pediatrics', status: 'active', hours: '9 AM - 5 PM' },
                    { name: 'Orthopedics', status: 'maintenance', hours: '8 AM - 4 PM' },
                    { name: 'Radiology', status: 'active', hours: '7 AM - 7 PM' },
                  ].map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-sm text-muted-foreground">{dept.hours}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={dept.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                          }
                        >
                          {dept.status}
                        </Badge>
                        <Switch 
                          defaultChecked={dept.status === 'active'} 
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue placeholder="USD ($)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input 
                    id="taxRate" 
                    type="number" 
                    defaultValue="10"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                  <Input 
                    id="paymentTerms" 
                    type="number" 
                    defaultValue="30"
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoReminder">Auto Payment Reminders</Label>
                  <Switch id="autoReminder" defaultChecked disabled={!isEditing} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lateFeesEnabled">Late Fees Enabled</Label>
                  <Switch id="lateFeesEnabled" defaultChecked disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFeeAmount">Late Fee Amount</Label>
                  <Input 
                    id="lateFeeAmount" 
                    type="number" 
                    defaultValue="25"
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { method: 'Credit/Debit Cards', enabled: true },
                    { method: 'Bank Transfer', enabled: true },
                    { method: 'Cash', enabled: true },
                    { method: 'Insurance', enabled: true },
                    { method: 'Digital Wallets', enabled: false },
                    { method: 'Cryptocurrency', enabled: false },
                  ].map((payment) => (
                    <div key={payment.method} className="flex items-center justify-between">
                      <Label>{payment.method}</Label>
                      <Switch 
                        defaultChecked={payment.enabled} 
                        disabled={!isEditing}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { type: 'Appointment Confirmations', enabled: true },
                    { type: 'Payment Reminders', enabled: true },
                    { type: 'Lab Results', enabled: true },
                    { type: 'Prescription Ready', enabled: true },
                    { type: 'System Updates', enabled: false },
                    { type: 'Marketing Emails', enabled: false },
                  ].map((notification) => (
                    <div key={notification.type} className="flex items-center justify-between">
                      <Label>{notification.type}</Label>
                      <Switch 
                        defaultChecked={notification.enabled} 
                        disabled={!isEditing}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  SMTP Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input 
                    id="smtpHost" 
                    placeholder="smtp.gmail.com"
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Port</Label>
                    <Input 
                      id="smtpPort" 
                      placeholder="587"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpEncryption">Encryption</Label>
                    <Select disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="TLS" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">Username</Label>
                  <Input 
                    id="smtpUsername" 
                    placeholder="your-email@domain.com"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Password</Label>
                  <Input 
                    id="smtpPassword" 
                    type="password"
                    placeholder="••••••••"
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Two-Factor Authentication</Label>
                  <Switch defaultChecked disabled={!isEditing} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Password Complexity Requirements</Label>
                  <Switch defaultChecked disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input 
                    id="sessionTimeout" 
                    type="number" 
                    defaultValue="30"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input 
                    id="maxLoginAttempts" 
                    type="number" 
                    defaultValue="5"
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>IP Whitelist Enabled</Label>
                  <Switch disabled={!isEditing} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>HIPAA Compliance Mode</Label>
                  <Switch defaultChecked disabled={!isEditing} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Data Encryption at Rest</Label>
                  <Switch defaultChecked disabled={!isEditing} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Audit Logging</Label>
                  <Switch defaultChecked disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention Period (years)</Label>
                  <Input 
                    id="dataRetention" 
                    type="number" 
                    defaultValue="7"
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Automatic Data Purging</Label>
                  <Switch defaultChecked disabled={!isEditing} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Backup Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Automatic Backups</Label>
                  <Switch defaultChecked disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Daily" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupTime">Backup Time</Label>
                  <Input 
                    id="backupTime" 
                    type="time" 
                    defaultValue="02:00"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                  <Input 
                    id="retentionPeriod" 
                    type="number" 
                    defaultValue="30"
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Last Backup:</span>
                    <span className="font-medium">Jan 16, 2024 02:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Backup Size:</span>
                    <span className="font-medium">2.4 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                      Successful
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Next Backup:</span>
                    <span className="font-medium">Jan 17, 2024 02:00 AM</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Manual Backup Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    Restore from Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}