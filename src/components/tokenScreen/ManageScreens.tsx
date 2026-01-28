import { DashboardLayout } from "@/components/DashboardLayout";
import { screens as initialScreens } from "@/data/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { ScreenPreviewDialog } from "@/components/ScreenPreviewDialog";
import { EditScreenDialog } from "@/components/EditScreenDialog";
import { DeleteScreenDialog } from "@/components/DeleteScreenDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Monitor, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Settings, 
  Eye,
  MapPin,
  RefreshCw,
  PlusCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

// Define Screen type
interface Screen {
  id: string;
  name: string;
  location: string;
  doctor: any;
  currentPatient: any;
  queue: any[];
  status: string;
  resolution: string;
  lastUpdated: string;
  layout: string;
}

const ManageScreens = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [screens, setScreens] = useState<Screen[]>(initialScreens);
  
  // Dialog states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);

  const filteredScreens = screens.filter(screen => {
    const matchesSearch = screen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          screen.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || screen.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action handlers
  const handlePreview = (screen: Screen) => {
    setSelectedScreen(screen);
    setPreviewOpen(true);
  };

  const handleSettings = (screen: Screen) => {
    // Navigate to screen settings with screen id as query param
    navigate(`/screen-settings?screen=${screen.id}`);
  };

  const handleEdit = (screen: Screen) => {
    setSelectedScreen(screen);
    setEditOpen(true);
  };

  const handleDelete = (screen: Screen) => {
    setSelectedScreen(screen);
    setDeleteOpen(true);
  };

  const handleEditSave = (updatedScreen: Screen) => {
    setScreens(prevScreens => 
      prevScreens.map(s => s.id === updatedScreen.id ? updatedScreen : s)
    );
    toast.success("Screen updated successfully", {
      description: `${updatedScreen.name} has been updated.`,
    });
  };

  const handleDeleteConfirm = (screenId: string) => {
    const screenToDelete = screens.find(s => s.id === screenId);
    setScreens(prevScreens => prevScreens.filter(s => s.id !== screenId));
    toast.success("Screen deleted", {
      description: `${screenToDelete?.name} has been removed.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Screens</h1>
            <p className="text-muted-foreground">View and manage all display screens</p>
          </div>
          <Button asChild>
            <Link to="/add-screen" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Add New Screen
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search screens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Screens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredScreens.map((screen) => (
            <Card key={screen.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
              <CardContent className="p-0">
                {/* Screen Preview Thumbnail */}
                <div 
                  className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center cursor-pointer hover:from-primary/15 hover:to-primary/10 transition-colors"
                  onClick={() => handlePreview(screen)}
                >
                  <div className="text-center">
                    <Monitor className="w-12 h-12 text-primary/40 mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">{screen.resolution}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={screen.status as any} />
                  </div>
                  <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                    {screen.layout}
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/0 hover:bg-primary/5 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Click to preview
                    </div>
                  </div>
                </div>

                {/* Screen Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{screen.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {screen.location}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(screen)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSettings(screen)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(screen)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(screen)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Doctor Assignment */}
                  <div className="flex items-center gap-3 py-2 border-t border-border">
                    <img 
                      src={screen.doctor.avatar} 
                      alt={screen.doctor.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{screen.doctor.name}</p>
                      <p className="text-xs text-muted-foreground">{screen.doctor.specialty}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Updated {screen.lastUpdated}
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      {screen.currentPatient ? (
                        <span className="font-mono font-semibold text-token">
                          {screen.currentPatient.token}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No active token</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredScreens.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No screens found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first screen"}
            </p>
            <Button asChild className="mt-4">
              <Link to="/add-screen">Add Screen</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ScreenPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        screen={selectedScreen}
      />

      <EditScreenDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        screen={selectedScreen}
        onSave={handleEditSave}
      />

      <DeleteScreenDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        screen={selectedScreen}
        onConfirm={handleDeleteConfirm}
      />
    </DashboardLayout>
  );
};

export default ManageScreens;
