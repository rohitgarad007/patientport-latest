import { Button } from "@/components/ui/button";
import LaboratoriesList from "@/components/laboratories/LaboratoriesList";
import { Link } from "react-router-dom";

export default function SuperLaboratoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Laboratory Management</h1>
        <div className="flex gap-2">
          <Link to="/super-laboratories">
            <Button>Labs</Button>
          </Link>
          <Link to="/super-lab-staff">
            <Button variant="outline">Labs Staff</Button>
          </Link>
        </div>
      </div>
      <LaboratoriesList />
    </div>
  );
}
