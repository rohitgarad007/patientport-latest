import { useState } from 'react';
import { Bed, BedStatus } from '@/types/bedManagement';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Eye, ArrowRightLeft, Edit, BookOpen, MoreVertical, CheckCircle, AlertCircle } from 'lucide-react';
import { BedDetailsDialog } from './BedDetailsDialog';
import { BookBedDialog } from './BookBedDialog';
import { MovePatientDialog } from './MovePatientDialog';
import { EditBedDialog } from './EditBedDialog';
import { PaIcons } from "@/components/icons/PaIcons";
interface BedCardProps {
  bed: Bed & { patientId?: string | null; permissionStatus?: string | number | null };
  onAction?: (action: string, bed: Bed) => void;
  variant?: 'default' | 'light';
}

const statusStyles: Record<BedStatus, string> = {
  available: 'bg-available border-available text-available-foreground',
  occupied: 'bg-occupied border-occupied text-occupied-foreground',
  reserved: 'bg-reserved border-reserved text-reserved-foreground',
  maintenance: 'bg-maintenance border-maintenance text-maintenance-foreground',
};

const lightStatusStyles: Record<BedStatus, string> = {
  available: 'bg-available/10 border-available text-available',
  occupied: 'bg-occupied/10 border-occupied text-occupied',
  reserved: 'bg-reserved/10 border-reserved text-reserved',
  maintenance: 'bg-maintenance/10 border-maintenance text-maintenance',
};

export const BedCard = ({ bed, onAction, variant = 'default' }: BedCardProps) => {
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [bookBedOpen, setBookBedOpen] = useState(false);
  const [movePatientOpen, setMovePatientOpen] = useState(false);
  const [editBedOpen, setEditBedOpen] = useState(false);

  const handleAction = (action: string) => {
    // If a parent handler is provided, delegate and do not open internal dialogs
    if (onAction) {
      onAction(action, bed);
      return;
    }
    switch (action) {
      case 'View':
        setViewDetailsOpen(true);
        break;
      case 'Book':
        setBookBedOpen(true);
        break;
      case 'Move':
        setMovePatientOpen(true);
        break;
      case 'Edit':
        setEditBedOpen(true);
        break;
    }
  };

  const styles = variant === 'light' ? lightStatusStyles : statusStyles;
  const borderStyle = variant === 'light' ? 'border-dashed' : '';
  const patientAssigned = !!(bed as any).patientId && String((bed as any).patientId) !== '0';
  const permissionStatus = String((bed as any).permissionStatus ?? '');
  const verificationPending = patientAssigned && permissionStatus === '0';
  const verificationVerified = patientAssigned && permissionStatus === '1';
  // NEW: declined handling
  const verificationDeclined = patientAssigned && permissionStatus === '2';

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center font-medium text-sm transition-all hover:shadow-md group',
              styles[bed.status],
              borderStyle
            )}
          >
            <span
              className="text-[11px]  font-bold truncate block max-w-[75px]"
              title={bed.number} // optional: shows full text on hover
            >
              {bed.number}
            </span>
            {/* Verification indicator */}
            {patientAssigned && (
            <div className="absolute top-1 left-1 flex items-center gap-1 text-[10px]">
              {verificationVerified ? (
                <span className="flex items-center text-green-600">
                  {/* Verified indicator intentionally minimal */}
                </span>
              ) : verificationPending ? (
                <span className="flex items-center text-amber-600">
                  <img
                    src={PaIcons.RestrictedIcon}
                    alt="Pending"
                    className="h-6 w-6"
                  />
                </span>
              ) : verificationDeclined ? (
                <span className="flex items-center text-rose-600">
                  <img
                    src={PaIcons.CancelAppointmentIcon}
                    alt="Declined"
                    className="h-6 w-6"
                  />
                </span>
              ) : null}
            </div>
          )}


            
            {bed.patientName && (
              <span className="text-[9px] mt-0.5 truncate max-w-full px-1 opacity-80">
                {bed.patientName.split(' ')[0]}
              </span>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 rounded p-0.5 hover:bg-card">
                <MoreVertical className="h-3 w-3 text-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover z-50">
                <DropdownMenuItem onClick={() => handleAction('View')} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {!verificationPending && !verificationDeclined && (
                  <DropdownMenuItem 
                    onClick={() => handleAction('Book')} 
                    className="cursor-pointer"
                    disabled={bed.status !== 'available'}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Book Bed
                  </DropdownMenuItem>
                )}
                {!verificationPending && (
                  <DropdownMenuItem 
                    onClick={() => handleAction('Move')} 
                    className="cursor-pointer"
                    disabled={bed.status !== 'occupied'}
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Move Patient
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent
              >
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        {bed.patientName && (
          <TooltipContent>
            <p className="font-medium">{bed.patientName}</p>
            {bed.patientId && <p className="text-xs text-muted-foreground">ID: {bed.patientId}</p>}
            <p
              className={cn(
                "font-medium",
                verificationVerified ? "text-green-600" : verificationDeclined ? "text-rose-600" : "text-amber-600"
              )}
            >
              {verificationVerified ? "" : verificationDeclined ? "Declined" : "Pending"}
            </p>
          </TooltipContent>
        )}
      </Tooltip>

      {/* Dialogs only active when no external handler is provided */}
      {!onAction && (
        <>
          <BedDetailsDialog bed={bed} open={viewDetailsOpen} onOpenChange={setViewDetailsOpen} />
          <BookBedDialog bed={bed} open={bookBedOpen} onOpenChange={setBookBedOpen} />
          <MovePatientDialog bed={bed} open={movePatientOpen} onOpenChange={setMovePatientOpen} />
        </>
      )}
      
    </>
  );
};
