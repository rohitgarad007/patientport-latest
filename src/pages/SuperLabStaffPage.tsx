import { Button } from "@/components/ui/button";
import LabStaffList from "@/components/laboratories/LabStaffList";
import { Link } from "react-router-dom";

export default function SuperLabStaffPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Laboratory Staff Management</h1>
        <div className="flex gap-2">
          <Link to="/super-laboratories">
            <Button variant="outline">Labs</Button>
          </Link>
          <Link to="/super-lab-staff">
            <Button>Labs Staff</Button>
          </Link>
        </div>
      </div>
      <LabStaffList />
    </div>
  );
}
