import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { PaIcons } from "@/components/icons/PaIcons";
import { formatDistanceToNow } from "date-fns";
import { getUnseenOrders, markOrdersSeen, getUnseenQueue, markQueueSeen, getUnseenCompleted, markCompletedSeen } from "../../services/labNotificationService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { requestOrderNotificationPermission, subscribeToOrderForegroundMessages } from "@/services/firebaseMessagingService";

// Static Data for Notifications
const notificationData = {
  queue: [
    { title: "OPD Queue - Cardiology", sub: "12 patients waiting", time: "Now", count: 12, color: "bg-blue-100 text-blue-600" },
    { title: "Pharmacy Queue", sub: "8 prescriptions pending", time: "Now", count: 8, color: "bg-blue-100 text-blue-600" },
    { title: "Lab Collection", sub: "5 samples pending", time: "Now", count: 5, color: "bg-blue-100 text-blue-600" },
    { title: "Radiology Queue", sub: "3 scans scheduled", time: "Now", count: 3, color: "bg-blue-100 text-blue-600" },
  ]
};

const NotificationPopover = ({ item, onMarkSeen, onItemClick, onViewAll }: { item: any, onMarkSeen?: () => void, onItemClick?: (data: any) => void, onViewAll?: () => void }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted">
          <img src={item.icon} alt={item.title} className="w-6 h-6" />
          {item.badge > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-red-500 hover:bg-red-600 text-[10px] text-white">
              {item.badge}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">{item.title}</h4>
          <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
            {item.badge} New
          </Badge>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="flex flex-col">
            {item.data && item.data.length > 0 ? (
                item.data.map((notification: any, index: number) => (
                <div
                    key={index}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0 cursor-pointer"
                    onClick={() => onItemClick && onItemClick(notification)}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.color ? notification.color.split(" ")[0] : 'bg-gray-100'}`}>
                    {notification.count !== undefined ? (
                        <span className={`font-bold ${notification.color ? notification.color.split(" ")[1] : 'text-gray-600'}`}>{notification.count}</span>
                    ) : (
                        <img src={notification.icon} className="w-5 h-5 opacity-80" alt="" />
                    )}
                    </div>
                    <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.sub}</p>
                    <p className="text-[10px] text-muted-foreground pt-1">{notification.time}</p>
                    </div>
                </div>
                ))
            ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
            )}
          </div>
        </ScrollArea>
        <div className="p-2 border-t bg-muted/20">
          <Button 
            variant="ghost" 
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs h-8"
            onClick={() => onViewAll && onViewAll()}
          >
            View All {item.title}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export function LaboratoryAppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [unseenOrders, setUnseenOrders] = useState<any[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);

  const [unseenQueue, setUnseenQueue] = useState<any[]>([]);
  const [unseenQueueCount, setUnseenQueueCount] = useState(0);

  const [unseenProcessing, setUnseenProcessing] = useState<any[]>([]);
  const [unseenProcessingCount, setUnseenProcessingCount] = useState(0);
  const [pushReady, setPushReady] = useState(false);
  const [hasLoadedOrders, setHasLoadedOrders] = useState(false);
  const [newOrderNotificationCount, setNewOrderNotificationCount] = useState(0);
  const [newOrderNotifications, setNewOrderNotifications] = useState<any[]>([]);

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    try {
      // Robust parsing for SQL datetime format YYYY-MM-DD HH:MM:SS
      // This handles cross-browser compatibility issues (Safari/Firefox)
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

      // Fallback to standard parsing
      const date = new Date(dateString.replace(" ", "T")); 
      if (isNaN(date.getTime())) return dateString;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      console.error("Error formatting time:", e);
      return dateString;
    }
  };

  const fetchUnseenOrders = async () => {
    try {
      const orders = await getUnseenOrders();
      const formatted = orders.map((o: any) => ({
        id: o.order_id,
        title: `New Order #${o.order_number || o.order_id}`,
        sub: `Patient: ${o.fname} ${o.lname}`,
        time: formatTimeAgo(o.created_at),
        icon: PaIcons.PurchaseIcon,
        color: "bg-blue-100 text-blue-600"
      }));
      const previousCount = unseenCount;
       const previousIds = unseenOrders.map((o: any) => o.id);
      setUnseenOrders(formatted);
      setUnseenCount(formatted.length);
      if (hasLoadedOrders && formatted.length > previousCount) {
        const newlyAdded = formatted.filter(
          (o: any) => !previousIds.includes(o.id)
        );
        if (newlyAdded.length > 0) {
          setNewOrderNotificationCount(newlyAdded.length);
          setNewOrderNotifications(newlyAdded);
        }
      }
      if (!hasLoadedOrders) {
        setHasLoadedOrders(true);
      }
    } catch (error) {
      console.error("Failed to fetch unseen orders", error);
    }
  };

  const fetchUnseenProcessing = async () => {
    try {
      const orders = await getUnseenCompleted();
      const formatted = orders.map((o: any) => ({
        id: o.order_id,
        title: `Completed Order #${o.order_number || o.order_id}`,
        sub: `Patient: ${o.fname} ${o.lname} (${o.status})`,
        time: formatTimeAgo(o.created_at),
        status: o.status,
        icon: PaIcons.ResultsIcon,
        color: "bg-green-100 text-green-600"
      }));
      setUnseenProcessing(formatted);
      setUnseenProcessingCount(formatted.length);
    } catch (error) {
      console.error("Failed to fetch unseen completed", error);
    }
  };

  const fetchUnseenQueue = async () => {
    try {
      const orders = await getUnseenQueue();
      const formatted = orders.map((o: any) => ({
        id: o.id,
        title: `Queue Item #${o.order_number || o.id}`,
        sub: `Patient: ${o.fname} ${o.lname} (${o.status})`,
        time: formatTimeAgo(o.created_at),
        status: o.status,
        icon: PaIcons.patients,
        color: "bg-yellow-100 text-yellow-600"
      }));
      setUnseenQueue(formatted);
      setUnseenQueueCount(formatted.length);
    } catch (error) {
      console.error("Failed to fetch unseen queue", error);
    }
  };

  const handleMarkSeen = async () => {
    if (unseenOrders.length === 0 || unseenCount === 0) return;
    const ids = unseenOrders.map((o: any) => o.id);
    try {
      await markOrdersSeen(ids);
      setUnseenCount(0);
      setUnseenOrders([]);
    } catch (error) {
      console.error("Failed to mark orders seen", error);
    }
  };

  const handleOrderClick = async (notification: any) => {
    if (!notification.id) return;
    try {
      // Mark only this order as seen
      await markOrdersSeen([notification.id]);
      
      // Update UI optimistically
      setUnseenOrders((prev) => prev.filter((o) => o.id !== notification.id));
      setUnseenCount((prev) => Math.max(0, prev - 1));
      
      // Navigate to orders page
      navigate("/laboratory-orders");
      setNewOrderNotificationCount(0);
      setNewOrderNotifications([]);
      setNewOrderNotificationCount(0);
    } catch (error) {
      console.error("Failed to mark order seen", error);
    }
  };

  const handleQueueItemClick = async (notification: any) => {
    if (!notification.id) return;
    try {
      // Mark only this item as seen
      await markQueueSeen([notification.id]);
      
      // Update UI optimistically
      setUnseenQueue((prev) => prev.filter((o) => o.id !== notification.id));
      setUnseenQueueCount((prev) => Math.max(0, prev - 1));
      
      // Navigate based on status
      if (notification.status === 'Registered') {
        navigate("/laboratory-orders"); // Go to collection
      } else {
        navigate("/laboratory-processing"); // Go to processing
      }
    } catch (error) {
      console.error("Failed to mark queue item seen", error);
    }
  };

  const handleProcessingItemClick = async (notification: any) => {
    if (!notification.id) return;
    try {
      await markCompletedSeen([notification.id]);
      setUnseenProcessing((prev) => prev.filter((o) => o.id !== notification.id));
      setUnseenProcessingCount((prev) => Math.max(0, prev - 1));
      navigate("/laboratory-report");
    } catch (error) {
      console.error("Failed to mark completed item seen", error);
    }
  };

  useEffect(() => {
    fetchUnseenOrders();
    fetchUnseenQueue();
    fetchUnseenProcessing();
    const interval = setInterval(() => {
      fetchUnseenOrders();
      fetchUnseenQueue();
      fetchUnseenProcessing();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    requestOrderNotificationPermission().then((token) => {
      if (token) {
        setPushReady(true);
      }
    });

    subscribeToOrderForegroundMessages((payload: any) => {
      const data: any = payload?.data || {};
      if (data.type === "lab_order") {
        fetchUnseenOrders();
      }
    });
  }, []);

  // Load lab info from cookie
  useEffect(() => {
    const labInfo = Cookies.get("labInfo");
    if (labInfo) {
      setCurrentUser(JSON.parse(labInfo));
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("labToken");
    Cookies.remove("labInfo");
    window.location.href = "/lab-login";
  };

  // Laboratory Menu Structure
  const menuData = [
    {
      title: "Dashboard",
      url: "/laboratory-dashboard",
      icon: PaIcons.dashboard,
    },
    {
      title: "Test Master",
      url: "/laboratory-test-master",
      icon: PaIcons.report,
    },
    {
      title: "Lab Process",
      icon: PaIcons.ResultsIcon,
      children: [
        { title: "Orders", url: "/laboratory-orders", icon: PaIcons.LaboratoryIcon },
        { title: "Packages", url: "/laboratory-packages", icon: PaIcons.setting },
        { title: "Processing", url: "/laboratory-processing", icon: PaIcons.ResultsIcon },
        { title: "Report", url: "/laboratory-report", icon: PaIcons.patientEditIcon },
        { title: "Billng", url: "/laboratory-billing", icon: PaIcons.AccountsIcon },
        { title: "Patients", url: "/laboratory-patients", icon: PaIcons.patient2 },
      ],
    },
    {
      title: "Orders",
      type: "notification",
      icon: PaIcons.PurchaseIcon,
      badge: unseenCount,
      data: unseenOrders,
      onItemClick: handleOrderClick,
      onViewAll: () => navigate("/laboratory-orders"),
    },
    
    {
      title: "Queue",
      type: "notification",
      icon: PaIcons.patients,
      badge: unseenQueueCount,
      data: unseenQueue,
      onItemClick: handleQueueItemClick,
      onViewAll: () => navigate("/laboratory-processing"),
    },
    {
      title: "Completed",
      type: "notification",
      icon: PaIcons.ResultsIcon,
      badge: unseenProcessingCount,
      data: unseenProcessing,
      onItemClick: handleProcessingItemClick,
      onViewAll: () => navigate("/laboratory-report"),
    },
    {
      title: "Profile",
      icon: PaIcons.user1,
      children: [
        { title: "My Profile", url: "/laboratory-profile", icon: PaIcons.user1 },
        { title: "Logout", action: "logout", icon: PaIcons.switch },
      ],
    },
  ];

  return (
    <>
      {/* 💻 Desktop Navbar */}
      <header className="hidden md:block fixed top-0 left-0 w-full bg-white border-b border-border shadow-sm z-50">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-3">
          
          {/* Logo + Lab Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <img src={PaIcons.LaboratoryIcon} alt="logo" className="w-5 h-5" />
            </div>

            {currentUser ? (
              <div>
                <h2 className="font-bold text-foreground">{currentUser.name || "Lab User"}</h2>
                <p className="text-xs text-muted-foreground">{currentUser.role || "Laboratory"}</p>
              </div>
            ) : (
              <div>
                <h2 className="font-bold text-foreground">Lab Portal</h2>
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="flex items-center gap-6">
            {menuData.map((item: any) =>
              item.type === "notification" ? (
                <NotificationPopover 
                  key={item.title} 
                  item={item} 
                  onMarkSeen={item.onMarkSeen}
                  onItemClick={item.onItemClick}
                  onViewAll={item.onViewAll}
                />
              ) : item.children ? (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <img src={item.icon} alt={item.title} className="w-6 h-6" />
                      <span>{item.title}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52">
                    {item.children.map((child: any) =>
                      child.action === "logout" ? (
                        <DropdownMenuItem
                          key={child.title}
                          onClick={handleLogout}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <img src={child.icon} className="w-4 h-4" />
                          {child.title}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem asChild key={child.title}>
                          <NavLink
                            to={child.url}
                            className={`flex items-center gap-2 ${
                              location.pathname === child.url
                                ? "text-primary font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            <img src={child.icon} alt={child.title} className="w-6 h-6" />
                            {child.title}
                          </NavLink>
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-2 px-2 py-1 ${
                    location.pathname === item.url
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <img src={item.icon} className="w-6 h-6" />
                  {item.title}
                </NavLink>
              )
            )}
          </nav>
        </div>
      </header>

      {/* 📱 Mobile Bottom Nav */}
      <div className="block md:hidden">
        <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 shadow-lg border-t border-gray-200 dark:border-gray-800 z-50">
          <ul className="flex justify-around items-center h-16">
            {menuData.filter((item: any) => item.type !== 'notification').map((item) => {
              const active = activeCategory === item.title;
              return (
                <li key={item.title}>
                  <button
                    onClick={() =>
                      item.children ? setActiveCategory(active ? null : item.title) : (window.location.href = item.url)
                    }
                    className={`flex flex-col items-center justify-center text-xs ${
                      active ? "text-violet-600 font-semibold" : "text-gray-500"
                    }`}
                  >
                    <img src={item.icon} alt={item.title} className="w-6 h-6 mb-1" />
                    {item.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {activeCategory && (
          <div className="fixed bottom-16 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-200 p-4 z-40">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">{activeCategory}</h3>
              <button onClick={() => setActiveCategory(null)} className="text-gray-400 text-sm">
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {menuData
                .find((m) => m.title === activeCategory)
                ?.children?.map((item: any) =>
                  item.action === "logout" ? (
                    <button
                      key={item.title}
                      onClick={handleLogout}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-red-300 text-red-600"
                    >
                      <img src={item.icon} className="w-6 h-6 mb-1" />
                      <span className="text-xs">{item.title}</span>
                    </button>
                  ) : (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      onClick={() => setActiveCategory(null)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                        location.pathname === item.url
                          ? "border-violet-600 text-violet-600"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      <img src={item.icon} alt={item.title} className="w-6 h-6 mb-1" />
                      <span className="text-xs">{item.title}</span>
                    </NavLink>
                  )
                )}
            </div>
          </div>
        )}

        {newOrderNotificationCount > 0 && newOrderNotifications.length > 0 && (
          <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 px-3">
            <div className="max-w-sm rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-xs font-semibold">
                  New lab orders ({newOrderNotificationCount})
                </span>
                <button
                  onClick={() => {
                    navigate("/laboratory-orders");
                    setNewOrderNotificationCount(0);
                    setNewOrderNotifications([]);
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-700"
                >
                  View all
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto px-3 py-2 space-y-1">
                {newOrderNotifications.slice(0, 3).map((notification: any) => (
                  <button
                    key={notification.id}
                    onClick={() => handleOrderClick(notification)}
                    className="flex w-full items-start gap-2 rounded-md px-1 py-1 text-left hover:bg-muted/60"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        notification.color ? notification.color.split(" ")[0] : "bg-blue-100"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-semibold ${
                          notification.color ? notification.color.split(" ")[1] : "text-blue-700"
                        }`}
                      >
                        {notification.order_number || notification.id}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium leading-tight">
                        {notification.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {notification.sub}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
