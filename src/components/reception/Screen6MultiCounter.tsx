import { counters, hospitalStats } from "@/data/hospitalData";
import { CounterDisplay } from "@/components/token/CounterDisplay";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Activity, Pill, CreditCard, ClipboardList } from "lucide-react";

export const Screen6MultiCounter = () => {
  const registrationCounters = counters.filter(c => c.type === 'registration');
  const billingCounters = counters.filter(c => c.type === 'billing');
  const pharmacyCounters = counters.filter(c => c.type === 'pharmacy');
  const labCounters = counters.filter(c => c.type === 'lab');

  const CategorySection = ({ 
    title, 
    icon: Icon, 
    counters: sectionCounters, 
    color 
  }: { 
    title: string; 
    icon: React.ElementType; 
    counters: typeof counters; 
    color: string;
  }) => (
    <div className="bg-card rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <Badge variant="secondary" className="ml-auto">
          {sectionCounters.filter(c => c.status === 'active').length} Active
        </Badge>
      </div>
      <div className="grid gap-3">
        {sectionCounters.map(counter => (
          <CounterDisplay key={counter.id} counter={counter} variant="compact" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted p-6">
      {/* Header */}
      <header className="bg-gradient-header rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <Activity className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="text-primary-foreground">
              <h1 className="text-2xl font-bold">Central Hospital</h1>
              <p className="text-primary-foreground/70">Token Display System</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center text-primary-foreground">
              <div className="flex items-center gap-2 justify-center">
                <Users className="w-5 h-5" />
                <span className="text-2xl font-bold">{hospitalStats.totalPatients}</span>
              </div>
              <p className="text-xs text-primary-foreground/70">Total Today</p>
            </div>
            <div className="text-center text-primary-foreground">
              <div className="flex items-center gap-2 justify-center">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-bold">{hospitalStats.avgWaitTime}m</span>
              </div>
              <p className="text-xs text-primary-foreground/70">Avg Wait</p>
            </div>
            <div className="text-right text-primary-foreground">
              <p className="text-3xl font-bold font-display">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
              <p className="text-sm text-primary-foreground/70">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <CategorySection 
          title="Registration" 
          icon={ClipboardList} 
          counters={registrationCounters}
          color="bg-primary/10 text-primary"
        />
        <CategorySection 
          title="Billing" 
          icon={CreditCard} 
          counters={billingCounters}
          color="bg-success/10 text-success"
        />
        <CategorySection 
          title="Pharmacy" 
          icon={Pill} 
          counters={pharmacyCounters}
          color="bg-warning/10 text-warning"
        />
        <CategorySection 
          title="Laboratory" 
          icon={Activity} 
          counters={labCounters}
          color="bg-accent/10 text-accent"
        />
      </div>

      {/* Featured Counters */}
      <div className="grid grid-cols-3 gap-6">
        {counters.filter(c => c.status === 'active').slice(0, 3).map(counter => (
          <CounterDisplay key={counter.id} counter={counter} variant="large" />
        ))}
      </div>

      {/* Footer Notice */}
      <footer className="mt-6 bg-card rounded-xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm">System Active</span>
        </div>
        <p className="text-sm text-muted-foreground">Please proceed to the counter when your token is displayed</p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Help Desk: Counter 5</span>
          <Badge variant="destructive">Emergency: 911</Badge>
        </div>
      </footer>
    </div>
  );
};
