import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

const monthlyPatients = [
  { month: 'Jan', patients: 145, revenue: 28400 },
  { month: 'Feb', patients: 168, revenue: 32100 },
  { month: 'Mar', patients: 192, revenue: 38500 },
  { month: 'Apr', patients: 178, revenue: 35200 },
  { month: 'May', patients: 205, revenue: 41800 },
  { month: 'Jun', patients: 221, revenue: 44500 },
];

const departmentData = [
  { name: 'Cardiology', patients: 89, color: '#ef4444' },
  { name: 'Orthopedics', patients: 76, color: '#3b82f6' },
  { name: 'Pediatrics', patients: 65, color: '#22c55e' },
  { name: 'Neurology', patients: 54, color: '#f59e0b' },
  { name: 'Emergency', patients: 123, color: '#8b5cf6' },
  { name: 'General', patients: 98, color: '#06b6d4' },
];

const dailyAppointments = [
  { day: 'Mon', appointments: 28 },
  { day: 'Tue', appointments: 32 },
  { day: 'Wed', appointments: 25 },
  { day: 'Thu', appointments: 38 },
  { day: 'Fri', appointments: 42 },
  { day: 'Sat', appointments: 18 },
  { day: 'Sun', appointments: 12 },
];

export default function HospitalReports() {
  const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');

  const generateReport = () => {
    // Report generation logic would go here
    console.log('Generating report...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive insights and reports for hospital operations
            </p>
          </div>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateRange ? format(dateRange, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={generateReport}>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">$44,500</p>
                  <div className="flex items-center mt-1">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+12.5%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Patient Visits</p>
                  <p className="text-2xl font-bold text-foreground">221</p>
                  <div className="flex items-center mt-1">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+8.2%</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Wait Time</p>
                  <p className="text-2xl font-bold text-foreground">18 min</p>
                  <div className="flex items-center mt-1">
                    <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">-15%</span>
                  </div>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                  <p className="text-2xl font-bold text-foreground">4.8/5</p>
                  <div className="flex items-center mt-1">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+0.3</span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
              <TabsTrigger value="operational">Operations</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Patient Trends</CardTitle>
                  <CardDescription>Patient visits and revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyPatients}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="patients" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Patients"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Department Distribution</CardTitle>
                  <CardDescription>Patient distribution by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="patients"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Daily Appointments</CardTitle>
                <CardDescription>Weekly appointment distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyAppointments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Financial performance and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyPatients}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Total Revenue</h3>
                  <p className="text-2xl font-bold text-green-600">$220,500</p>
                  <p className="text-sm text-muted-foreground">This Quarter</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Growth Rate</h3>
                  <p className="text-2xl font-bold text-blue-600">+12.5%</p>
                  <p className="text-sm text-muted-foreground">vs Last Quarter</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Activity className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Avg. Revenue/Patient</h3>
                  <p className="text-2xl font-bold text-purple-600">$201</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="patients" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-semibold">New Patients</h3>
                    <p className="text-2xl font-bold">48</p>
                    <Badge variant="secondary" className="mt-2">This Month</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Return Patients</h3>
                    <p className="text-2xl font-bold">173</p>
                    <Badge variant="secondary" className="mt-2">This Month</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Avg. Visit Duration</h3>
                    <p className="text-2xl font-bold">45 min</p>
                    <Badge variant="secondary" className="mt-2">Overall</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Satisfaction Rate</h3>
                    <p className="text-2xl font-bold">96%</p>
                    <Badge variant="secondary" className="mt-2">Last 30 Days</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="operational" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Key metrics by department</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {departmentData.map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: dept.color }}
                        />
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      <Badge variant="outline">{dept.patients} patients</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Operational Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>Bed Occupancy Rate</span>
                    <Badge variant="default">87%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>Staff Utilization</span>
                    <Badge variant="default">92%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>Equipment Uptime</span>
                    <Badge variant="default">98%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>Emergency Response Time</span>
                    <Badge variant="default">3.2 min</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}