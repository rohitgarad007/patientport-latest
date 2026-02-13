import { Counter } from "@/data/hospitalData-2";
import { Badge } from "@/components/ui/badge";

interface CounterDisplayProps {
  counter: Counter;
  variant?: "default" | "large" | "compact";
}

export const CounterDisplay = ({ counter, variant = "default" }: CounterDisplayProps) => {
  const typeIcons = {
    registration: '📋',
    billing: '💳',
    pharmacy: '💊',
    lab: '🔬',
    consultation: '👨‍⚕️',
  };

  const typeColors = {
    registration: 'bg-primary/10 text-primary',
    billing: 'bg-success/10 text-success',
    pharmacy: 'bg-warning/10 text-warning',
    lab: 'bg-accent/10 text-accent',
    consultation: 'bg-destructive/10 text-destructive',
  };

  if (variant === "large") {
    return (
      <div className={`p-6 rounded-2xl shadow-lg ${counter.status === 'active' ? 'bg-card' : 'bg-muted opacity-60'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{typeIcons[counter.type]}</span>
            <div>
              <h3 className="text-xl font-bold text-foreground">{counter.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{counter.type}</p>
            </div>
          </div>
          <Badge variant={counter.status === 'active' ? 'default' : 'secondary'}>
            {counter.status === 'active' ? 'OPEN' : 'CLOSED'}
          </Badge>
        </div>
        {counter.status === 'active' && (
          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Now Serving</p>
            <div className="token-number text-5xl font-bold text-token-active">{counter.currentToken}</div>
            <p className="text-sm text-muted-foreground mt-2">Staff: {counter.staff}</p>
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg ${counter.status === 'active' ? 'bg-card' : 'bg-muted opacity-60'}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeIcons[counter.type]}</span>
          <span className="font-medium text-sm">{counter.name}</span>
        </div>
        {counter.status === 'active' ? (
          <span className="token-number font-bold text-token-active">{counter.currentToken}</span>
        ) : (
          <Badge variant="secondary" className="text-xs">CLOSED</Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl shadow-md ${counter.status === 'active' ? 'bg-card' : 'bg-muted opacity-60'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`p-2 rounded-lg ${typeColors[counter.type]}`}>{typeIcons[counter.type]}</span>
          <span className="font-semibold text-foreground">{counter.name}</span>
        </div>
        {counter.status === 'closed' && (
          <Badge variant="secondary" className="text-xs">CLOSED</Badge>
        )}
      </div>
      {counter.status === 'active' && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Now Serving</p>
          <div className="token-number text-3xl font-bold text-token-active">{counter.currentToken}</div>
        </div>
      )}
    </div>
  );
};
