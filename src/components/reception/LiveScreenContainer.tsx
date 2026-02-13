import React, { useMemo, useState, useEffect } from 'react';
import { ReceptionDashboardData } from '@/services/ReceptionService';
import Screen1ClassicBlue from './Screen1ClassicBlue';
import Screen2SplitView from './Screen2SplitView';
import Screen3DarkTheme from './Screen3DarkTheme';
import Screen4CardLayout from './Screen4CardLayout';
import Screen5MinimalWhite from './Screen5MinimalWhite';
import Screen6MultiCounter from './Screen6MultiCounter';
import Screen7FullScreenToken from './Screen7FullScreenToken';
import Screen8TimelineView from './Screen8TimelineView';
import Screen9Dashboard from './Screen9Dashboard';
import Screen10GradientModern from './Screen10GradientModern';

interface LiveScreenContainerProps {
  screen: any; // Using any for the screen object from fetchScreensList
  data: ReceptionDashboardData | null;
}

const LiveScreenContainer: React.FC<LiveScreenContainerProps> = ({ screen, data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Extract settings
  const displayView = screen.display_view || 'single';
  const displayTimer = (parseInt(screen.display_timer) || 30) * 1000; // Convert to ms
  const doctors = screen.doctors || [];

  // Rotation Logic
  useEffect(() => {
    if (displayView === 'single' && doctors.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % doctors.length);
      }, displayTimer);
      return () => clearInterval(interval);
    } else {
      // Reset index if switching views
      setCurrentIndex(0);
    }
  }, [displayView, displayTimer, doctors.length]);

  // Helper to filter data for a specific doctor
  const getDoctorData = (doctorId: string) => {
    if (!data) return null;
    return {
        ...data,
        doctors: data.doctors.filter(d => d.id === doctorId),
        activeConsultations: data.activeConsultations.filter(c => c.doctor_id === doctorId),
        waitingQueue: data.waitingQueue.filter(q => q.doctor_id === doctorId)
    };
  };

  // Map layout string to component
  const renderScreenComponent = (layout: string, props: any) => {
    switch (layout) {
      case '1':
      case 'standard':
      case 'classic':
        return <Screen1ClassicBlue {...props} />;
      case '2':
      case 'split':
      case 'split-view':
        return <Screen2SplitView {...props} />;
      case '3':
      case 'dark':
      case 'dark-theme':
        return <Screen3DarkTheme {...props} />;
      case '4':
      case 'card':
      case 'card-layout':
        return <Screen4CardLayout {...props} />;
      case '5':
      case 'minimal':
      case 'minimal-white':
        return <Screen5MinimalWhite {...props} />;
      case '6':
      case 'counter':
      case 'multi-counter':
        return <Screen6MultiCounter {...props} />;
      case '7':
      case 'fullscreen':
      case 'fullscreen-token':
        return <Screen7FullScreenToken {...props} />;
      case '8':
      case 'timeline':
      case 'timeline-view':
        return <Screen8TimelineView {...props} />;
      case '9':
      case 'dashboard':
        return <Screen9Dashboard {...props} />;
      case '10':
      case 'modern':
      case 'gradient':
      case 'gradient-modern':
      case 'emergency': 
        return <Screen10GradientModern {...props} />;
      default:
        return <Screen1ClassicBlue {...props} />;
    }
  };

  const renderContent = () => {
    const layout = screen.layout?.toString().toLowerCase() || '1';

    // If no doctors or empty data, just render with passed data (fallback)
    if (!doctors.length) {
       return renderScreenComponent(layout, { data, settings: screen });
    }

    if (displayView === 'single') {
        const currentDoctor = doctors[currentIndex];
        // If current doctor is invalid (e.g. removed), fallback to first or null
        const targetDoctor = currentDoctor || doctors[0];
        if (!targetDoctor) return null;

        const singleData = getDoctorData(targetDoctor.id);
        return renderScreenComponent(layout, { data: singleData, settings: screen });
    } else {
        // Split View
        let gridClass = "grid h-full w-full gap-4 p-4 bg-muted/20";
        // Logic: 2 doctors -> 2 cols (50% each)
        // > 2 doctors -> 2x2 grid (25% area each)
        if (doctors.length === 2) {
            gridClass += " grid-cols-2"; 
        } else if (doctors.length > 2) {
             gridClass += " grid-cols-2 grid-rows-2";
        } else {
             gridClass += " grid-cols-1";
        }

        // Limit to 4 doctors for grid view to prevent overcrowding
        const visibleDoctors = doctors.slice(0, 4);

        return (
            <div className={gridClass}>
                <style>{`
                  .split-cell > div { 
                    height: 100% !important; 
                    width: 100% !important;
                    border-radius: 0 !important;
                  }
                  /* Scale down content slightly if needed, or rely on responsive design */
                  .split-cell header {
                    padding: 0.5rem 1rem !important;
                  }
                  .split-cell main {
                    padding: 1rem !important;
                  }
                `}</style>
                {visibleDoctors.map((doc: any) => (
                    <div key={doc.id} className="w-full h-full overflow-hidden relative split-cell bg-background rounded-xl border shadow-sm">
                        {renderScreenComponent(layout, { 
                          data: getDoctorData(doc.id), 
                          settings: screen 
                        })}
                    </div>
                ))}
            </div>
        );
    }
  };

  return (
    <div className="w-full h-full overflow-hidden border rounded-lg shadow-sm bg-background relative group">
      {/* Overlay for screen name - only show on hover and if not in clean mode */}
      <div className="absolute top-2 left-2 z-50 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {screen.name} ({displayView === 'split' ? 'Split View' : 'Single View'})
      </div>
      
      {/* The actual screen component */}
      <div className="w-full h-full origin-top-left transform scale-[1] overflow-hidden">
         {renderContent()}
      </div>
    </div>
  );
};

export default LiveScreenContainer;
