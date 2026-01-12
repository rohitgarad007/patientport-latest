import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { PaIcons } from "@/components/icons/PaIcons";
import { getUnseenOrders, markOrdersSeen, getUnseenQueue, markQueueSeen } from "../../services/labNotificationService";
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

// Static Data for Notifications
const notificationData = {
  processing: [
    { title: "Lab Report Processing", sub: "Blood test for Patient #P-1234", time: "5 mins ago", icon: PaIcons.clock, color: "bg-blue-100 text-blue-600" },
    { title: "Prescription Verification", sub: "Dr. Mehta prescription review", time: "10 mins ago", icon: PaIcons.approveIcon, color: "bg-yellow-100 text-yellow-600" },
    { title: "Insurance Claim", sub: "Claim #INS-2024-089 verification", time: "30 mins ago", icon: PaIcons.approve3Icon, color: "bg-green-100 text-green-600" },
    { title: "Discharge Process", sub: "Patient #P-5678 discharge papers", time: "45 mins ago", icon: PaIcons.dischargeIcon, color: "bg-gray-100 text-gray-600" },
  ],
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

  const fetchUnseenOrders = async () => {
    try {
      const orders = await getUnseenOrders();
      const formatted = orders.map((o: any) => ({
        id: o.order_id,
        title: `New Order #${o.order_number || o.order_id}`,
        sub: `Patient: ${o.fname} ${o.lname}`,
        time: o.created_at,
        icon: PaIcons.PurchaseIcon,
        color: "bg-blue-100 text-blue-600"
      }));
      setUnseenOrders(formatted);
      setUnseenCount(formatted.length);
    } catch (error) {
      console.error("Failed to fetch unseen orders", error);
    }
  };

  const fetchUnseenQueue = async () => {
    try {
      const orders = await getUnseenQueue();
      const formatted = orders.map((o: any) => ({
        id: o.id,
        title: `Queue Item #${o.order_number || o.id}`,
        sub: `Patient: ${o.fname} ${o.lname} (${o.status})`,
        time: o.created_at,
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

  useEffect(() => {
    fetchUnseenOrders();
    fetchUnseenQueue();
    const interval = setInterval(() => {
      fetchUnseenOrders();
      fetchUnseenQueue();
    }, 60000);
    return () => clearInterval(interval);
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
      title: "Processing",
      type: "notification",
      icon: PaIcons.settings2Icon,
      badge: 4,
      data: notificationData.processing,
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

        {/* Mobile Sub-Menu */}
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
      </div>
    </>
  );
}
