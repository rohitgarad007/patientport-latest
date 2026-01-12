import { useState } from 'react';
import { Bell, Search, Filter, MoreHorizontal, Eye, Trash2, Send, Users, Calendar, AlertCircle, CheckCircle, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/dashboard/StatCard';
import { Checkbox } from '@/components/ui/checkbox';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipient: 'all' | 'doctors' | 'staff' | 'patients' | 'specific';
  recipientCount: number;
  status: 'sent' | 'scheduled' | 'draft';
  createdAt: string;
  scheduledFor?: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'appointment' | 'billing' | 'system' | 'emergency' | 'general';
}

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'System Maintenance Scheduled',
    message: 'The hospital management system will undergo maintenance on Jan 20, 2024 from 2 AM to 4 AM. Please save your work before this time.',
    type: 'warning',
    recipient: 'all',
    recipientCount: 150,
    status: 'sent',
    createdAt: '2024-01-15T10:30:00Z',
    read: false,
    priority: 'high',
    category: 'system',
  },
  {
    id: 'n2',
    title: 'New Doctor Orientation',
    message: 'Welcome Dr. Sarah Johnson to our cardiology department. Please join us for the orientation session on Jan 18, 2024 at 10 AM.',
    type: 'info',
    recipient: 'doctors',
    recipientCount: 45,
    status: 'sent',
    createdAt: '2024-01-16T09:00:00Z',
    read: true,
    priority: 'medium',
    category: 'general',
  },
  {
    id: 'n3',
    title: 'Payment Reminder',
    message: 'Your invoice #INV-2024-001 is due on Jan 25, 2024. Please ensure timely payment to avoid late fees.',
    type: 'warning',
    recipient: 'patients',
    recipientCount: 25,
    status: 'scheduled',
    createdAt: '2024-01-16T14:00:00Z',
    scheduledFor: '2024-01-24T09:00:00Z',
    read: false,
    priority: 'medium',
    category: 'billing',
  },
  {
    id: 'n4',
    title: 'Emergency Protocol Update',
    message: 'Updated emergency response protocols are now available. All staff must review and acknowledge the new procedures by Jan 30, 2024.',
    type: 'error',
    recipient: 'staff',
    recipientCount: 120,
    status: 'sent',
    createdAt: '2024-01-14T16:00:00Z',
    read: false,
    priority: 'high',
    category: 'emergency',
  },
];

export function HospitalNotifications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const filteredNotifications = mockNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || notification.type === filterType;
    const matchesStatus = !filterStatus || notification.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'warning': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'success': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Bell className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const totalNotifications = mockNotifications.length;
  const sentNotifications = mockNotifications.filter(n => n.status === 'sent').length;
  const scheduledNotifications = mockNotifications.filter(n => n.status === 'scheduled').length;
  const unreadNotifications = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Notifications"
          value={totalNotifications}
          trend={{ value: 8, isPositive: true }}
          icon={Bell}
        />
        <StatCard
          title="Sent Today"
          value={sentNotifications}
          trend={{ value: 3, isPositive: true }}
          icon={Send}
        />
        <StatCard
          title="Scheduled"
          value={scheduledNotifications}
          trend={{ value: 2, isPositive: true }}
          icon={Clock}
        />
        <StatCard
          title="Unread"
          value={unreadNotifications}
          trend={{ value: 1, isPositive: false }}
          icon={Mail}
        />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications Management</h1>
          <p className="text-muted-foreground">Send and manage notifications to doctors, staff, and patients</p>
        </div>
        <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Send className="w-4 h-4" />
              Compose Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose New Notification</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Notification title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipients</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="doctors">Doctors Only</SelectItem>
                      <SelectItem value="staff">Staff Only</SelectItem>
                      <SelectItem value="patients">Patients Only</SelectItem>
                      <SelectItem value="specific">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Type your notification message here..." 
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (Optional)</Label>
                <Input id="schedule" type="datetime-local" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                  Save as Draft
                </Button>
                <Button type="submit">Send Now</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType || 'all'} onValueChange={(v) => setFilterType(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus || 'all'} onValueChange={(v) => setFilterStatus(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id} className={`${!notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Checkbox
                    checked={selectedNotifications.includes(notification.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedNotifications([...selectedNotifications, notification.id]);
                      } else {
                        setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    {getTypeIcon(notification.type)}
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(notification.status)}>
                        {notification.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{notification.recipientCount} recipients</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                      </div>
                      {notification.scheduledFor && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Scheduled: {new Date(notification.scheduledFor).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Send className="w-4 h-4 mr-2" />
                      Resend
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Appointment Reminder
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Payment Due Notice
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                System Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Delivered:</span>
                <span className="font-medium text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span>Opened:</span>
                <span className="font-medium text-blue-600">76.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Clicked:</span>
                <span className="font-medium text-purple-600">23.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>5 notifications sent today</p>
              <p>2 scheduled for tomorrow</p>
              <p>1 draft saved</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}