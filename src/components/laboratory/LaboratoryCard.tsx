import { Laboratory } from '@/types/laboratory';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Eye, Trash2, Mail, FlaskConical } from 'lucide-react';

interface LaboratoryCardProps {
  laboratory: Laboratory;
  onView: (lab: Laboratory) => void;
  onRemove: (lab: Laboratory) => void;
}

export const LaboratoryCard = ({ laboratory, onView, onRemove }: LaboratoryCardProps) => {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Pathology: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      Diagnostic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Imaging: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      Clinical: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      Research: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">{laboratory.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{laboratory.city}</span>
              </div>
            </div>
          </div>
          <Badge 
            variant={laboratory.status === 'Active' ? 'default' : 'secondary'}
            className={laboratory.status === 'Active' 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }
          >
            {laboratory.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{laboratory.contactNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{laboratory.email}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Badge variant="outline" className={getTypeColor(laboratory.type)}>
            {laboratory.type}
          </Badge>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onView(laboratory)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(laboratory)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
