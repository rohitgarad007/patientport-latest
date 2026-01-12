import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Search,
  Bell,
  BellRing,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Send,
  Filter,
} from 'lucide-react';
import { mockNotifications, mockUsers } from '@/data/mockData';
import { StatCard } from '@/components/dashboard/StatCard';

// Extended mock notifications with more variety
const extendedNotifications = [
  ...mockNotifications,
  {
    id: 'n3',
    userId: '2',
    title: 'System Maintenance Scheduled',
    message: 'System maintenance is scheduled for tonight from 12 AM to 2 AM',
    type: 'warning' as const,
    read: true,
    createdAt: '2024-01-13T09:00:00Z',
  },
  {
    id: 'n4',
    userId: '1',
    title: 'New Hospital Registration',
    message: 'Valley Medical Center has requested to join the network',
    type: 'info' as const,
    read: false,
    createdAt: '2024-01-12T14:30:00Z',
  },
  {
    id: 'n5',
    userId: '3',
    title: 'Patient Record Updated',
    message: 'Patient Lisa Thompson medical record has been updated',
    type: 'success' as const,
    read: true,
    createdAt: '2024-01-11T16:45:00Z',
  },
];

export default function SuperNotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const notificationTypes = ['info', 'warning', 'success', 'error'];

  const filteredNotifications = extendedNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || notification.type === selectedType;
    const matchesStatus = !selectedStatus || 
                         (selectedStatus === 'read' ? notification.read : !notification.read);
    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = extendedNotifications.filter(n => !n.read).length;
  const todayCount = extendedNotifications.filter(n => {
    const today = new Date().toDateString();
    const notificationDate = new Date(n.createdAt).toDateString();
    return today === notificationDate;
  }).length;

  const typeColors = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
  };

  const typeIcons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: AlertTriangle,
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const selectAllNotifications = () => {
    setSelectedNotifications(
      selectedNotifications.length === filteredNotifications.length 
        ? [] 
        : filteredNotifications.map(n => n.id)
    );
  };

  return (
    
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Manage system notifications and communications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Mark All Read
          </Button>
          <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Compose Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Compose Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to users in the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="admins">Hospital Admins</SelectItem>
                      <SelectItem value="doctors">Doctors</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="patients">Patients</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Notification title" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Enter notification message..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Notification
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsComposeDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Notifications"
          value={extendedNotifications.length.toString()}
          description="All notifications"
          icon={Bell}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Unread"
          value={unreadCount.toString()}
          description="Pending notifications"
          icon={BellRing}
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          title="Today"
          value={todayCount.toString()}
          description="Sent today"
          icon={Clock}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Users"
          value={mockUsers.length.toString()}
          description="Notification recipients"
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notification Center</CardTitle>
              <CardDescription>
                View and manage all system notifications
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedStatus || 'all'} onValueChange={(v) => setSelectedStatus(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType || 'all'} onValueChange={(v) => setSelectedType(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {notificationTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedNotifications.length} notification(s) selected
              </span>
              <Button size="sm" variant="outline">
                Mark as Read
              </Button>
              <Button size="sm" variant="outline">
                Delete
              </Button>
            </div>
          )}

          {/* Select All */}
          <div className="flex items-center gap-2 mb-4">
            <Checkbox 
              checked={selectedNotifications.length === filteredNotifications.length}
              onCheckedChange={selectAllNotifications}
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const user = mockUsers.find(u => u.id === notification.userId);
              const TypeIcon = typeIcons[notification.type];
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    !notification.read ? 'bg-muted/30 border-primary/20' : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selectedNotifications.includes(notification.id)}
                      onCheckedChange={() => toggleSelectNotification(notification.id)}
                    />
                    <div className={`p-2 rounded-full ${typeColors[notification.type]}`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>To: {user?.name || 'Unknown User'}</span>
                            <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${typeColors[notification.type]}`}
                            >
                              {notification.type}
                            </Badge>
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
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as {notification.read ? 'Unread' : 'Read'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    
  );
}