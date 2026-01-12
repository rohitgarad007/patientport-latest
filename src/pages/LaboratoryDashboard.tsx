import { 
  ClipboardList, 
  TestTube, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { DataCard } from '@/components/ui/data-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { orders } from '@/data/dummyData';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchRecentOrders, fetchDashboardStats } from '@/services/LaboratoryService';
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    yesterdayOrders: 0,
    pendingSamples: 0,
    processingTests: 0,
    criticalAlerts: 0,
    pendingValidation: 0,
    completedToday: 0,
    revenue: { today: 0, pending: 0 },
    tat: { average: '0 hrs', breached: 0 }
  });

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    try {
      // Robust parsing for SQL datetime format YYYY-MM-DD HH:MM:SS
      const parts = dateString.split(/[- :]/);
      if (parts.length >= 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        const hour = parseInt(parts[3] || '0');
        const minute = parseInt(parts[4] || '0');
        const second = parseInt(parts[5] || '0');
        
        const date = new Date(year, month, day, hour, minute, second);
        
        if (!isNaN(date.getTime())) {
           return formatDistanceToNow(date, { addSuffix: true });
        }
      }

      // Fallback
      const date = new Date(dateString.replace(" ", "T")); 
      if (isNaN(date.getTime())) return dateString;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load recent orders
        const ordersData = await fetchRecentOrders();
        const mappedOrders = ordersData.map((item: any) => ({
          id: item.treatment_id,
          orderId: item.order_number || item.appointment_id || item.treatment_id,
          patient: {
            name: `${item.fname || ''} ${item.lname || ''}`.trim() || 'Unknown',
            age: item.dob ? Math.floor((new Date().getTime() - new Date(item.dob).getTime()) / 31557600000) : 'N/A',
            gender: item.gender || 'N/A'
          },
          tests: item.tests || [], 
          priority: 'Normal', 
          status: item.order_status || 'Ordered',
          createdAt: item.created_at
        }));
        setRecentOrders(mappedOrders);

        // Load dashboard stats
        const statsData = await fetchDashboardStats();
        if (statsData) {
          setStats(prev => ({
            ...prev,
            ...statsData,
            // Ensure nested objects are preserved or defaulted if not in statsData
            revenue: statsData.revenue || prev.revenue,
            tat: statsData.tat || prev.tat
          }));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    loadData();
  }, []);

  const calculateTrend = () => {
    if (stats.yesterdayOrders === 0) return { value: stats.todayOrders * 100, label: 'vs yesterday' };
    const diff = stats.todayOrders - stats.yesterdayOrders;
    const percentage = Math.round((diff / stats.yesterdayOrders) * 100);
    return { value: percentage, label: 'vs yesterday' };
  };

  return (
    <div className="min-h-screen">
      
      
      <div className="p-4 lg:p-6 space-y-6">
        {/* Quick Actions */}
       

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DataCard 
            title="Today's Orders" 
            value={stats.todayOrders}
            icon={ClipboardList}
            trend={calculateTrend()}
          />
          <DataCard 
            title="Pending Samples" 
            value={stats.pendingSamples}
            icon={TestTube}
            variant="warning"
          />
          <DataCard 
            title="Processing" 
            value={stats.processingTests}
            icon={Activity}
            variant="primary"
          />
          <DataCard 
            title="Critical Alerts" 
            value={stats.criticalAlerts}
            icon={AlertTriangle}
            variant="critical"
            subtitle="Require immediate attention"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DataCard 
            title="Pending Validation" 
            value={stats.pendingValidation}
            icon={Clock}
            variant="warning"
          />
          <DataCard 
            title="Completed Today" 
            value={stats.completedToday}
            icon={CheckCircle2}
            variant="success"
          />
          <DataCard 
            title="Revenue Today" 
            value={`₹${stats.revenue.today.toLocaleString()}`}
            icon={DollarSign}
            subtitle={`₹${stats.revenue.pending.toLocaleString()} pending`}
          />
          <DataCard 
            title="Avg TAT" 
            value={stats.tat.average}
            icon={TrendingUp}
            subtitle={`${stats.tat.breached} breached`}
          />
        </div>

        {/* Recent Orders & Workflow */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-card rounded-xl border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <h2 className="font-semibold">Today Orders</h2>
              <Link to="/laboratory-orders">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="data-table-header">
                    <th className="text-left px-4 py-3">Order ID</th>
                    <th className="text-left px-4 py-3">Patient</th>
                    <th className="text-left px-4 py-3">Tests</th>
                    <th className="text-left px-4 py-3">Priority</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="data-table-row">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-primary">{order.orderId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.patient.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.patient.age}y / {order.patient.gender}
                            <span className="mx-1">•</span>
                            {formatTimeAgo(order.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {order.tests.slice(0, 2).map((test: any, idx: number) => (
                            <span key={test.id || idx} className="text-xs bg-muted px-2 py-0.5 rounded" title={test.testName}>
                              {test.testName}
                            </span>
                          ))}
                          {order.tests.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{order.tests.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workflow Summary */}
          <div className="bg-card rounded-xl border p-4">
            <h2 className="font-semibold mb-4">Workflow Pipeline</h2>
            <div className="space-y-3">
              {[
                { label: 'Ordered', count: 8, color: 'bg-muted' },
                { label: 'Sample Collected', count: 12, color: 'bg-info' },
                { label: 'Received in Lab', count: 15, color: 'bg-info' },
                { label: 'Processing', count: 23, color: 'bg-processing' },
                { label: 'Validation Pending', count: 12, color: 'bg-warning' },
                { label: 'Approved', count: 34, color: 'bg-success' },
              ].map((stage) => (
                <div key={stage.label} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                  <span className="flex-1 text-sm">{stage.label}</span>
                  <span className="font-mono text-sm font-medium">{stage.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Samples Alert */}
        {stats.criticalAlerts > 0 && (
          <div className="bg-critical/5 border border-critical/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-critical/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-critical" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-critical">Critical Values Detected</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.criticalAlerts} samples have critical values requiring immediate pathologist review.
                </p>
              </div>
              <Link to="/lab-processing?filter=critical">
                <Button variant="destructive" size="sm">
                  Review Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
