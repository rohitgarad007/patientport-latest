import { useState, useEffect } from "react";
import { receptionService, ReceptionDashboardData } from "@/services/ReceptionService";
import Screen1ClassicBlue from "@/components/reception/Screen1ClassicBlue";
import Screen2SplitView from "@/components/reception/Screen2SplitView";
import Screen3DarkTheme from "@/components/reception/Screen3DarkTheme";
import Screen4CardLayout from "@/components/reception/Screen4CardLayout";
import Screen7FullScreenToken from "@/components/reception/Screen7FullScreenToken";
import Screen8TimelineView from "@/components/reception/Screen8TimelineView";
import Screen10GradientModern from "@/components/reception/Screen10GradientModern";

const LiveScreenContainer = () => {
  const [settings, setSettings] = useState<any>(null);
  const [data, setData] = useState<ReceptionDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const response = await receptionService.fetchScreenSettings();
      if (response && response.success && response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const fetchData = async () => {
    try {
      const result = await receptionService.fetchDashboardStats();
      setData(result);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch dashboard data", err);
      setError(err.message || "Failed to load data");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSettings();
      await fetchData();
      setLoading(false);
    };

    init();

    // Poll for data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">
        {error}
      </div>
    );
  }

  const layoutId = settings?.screen_layout_id ? parseInt(settings.screen_layout_id.toString()) : 1;

  // Map layoutId to component
  const renderScreen = () => {
    const props = {
      data: data,
      settings: settings
    };

    switch (layoutId) {
      case 1: return <Screen1ClassicBlue {...props} />;
      case 2: return <Screen2SplitView {...props} />;
      case 3: return <Screen3DarkTheme {...props} />;
      case 4: return <Screen4CardLayout {...props} />;
      case 7: return <Screen7FullScreenToken {...props} />;
      case 8: return <Screen8TimelineView {...props} />;
      case 10: return <Screen10GradientModern {...props} />;
      default: return <Screen1ClassicBlue {...props} />;
    }
  };

  return (
    <div className="live-screen-container">
      {renderScreen()}
    </div>
  );
};

export default LiveScreenContainer;
