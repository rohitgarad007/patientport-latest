import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LaboratoriesList from "@/components/laboratories/LaboratoriesList";
import LabStaffList from "@/components/laboratories/LabStaffList";

export default function SuperLaboratoriesPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Laboratory Management</h1>
      <Tabs defaultValue="laboratories" className="w-full">
        <TabsList>
          <TabsTrigger value="laboratories">Laboratories</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="laboratories">
          <LaboratoriesList />
        </TabsContent>
        <TabsContent value="staff">
          <LabStaffList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
