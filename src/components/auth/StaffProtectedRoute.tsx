// StaffProtectedRoute.tsx
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchStaffPermissions } from "@/services/staffService";
import Cookies from "js-cookie";

interface StaffProtectedRouteProps {
  permissionId?: string;
}

const StaffProtectedRoute = ({ permissionId }: StaffProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      setLoading(true);

      try {
        // ✅ Read cookies inside the effect
        const token = Cookies.get("token");
        const userInfo = Cookies.get("userInfo");

        if (!token || !userInfo) {
          setRedirectToLogin(true); // redirect to login
          return;
        }

        const parsedInfo = JSON.parse(userInfo);
        if (parsedInfo.role !== "staff") {
          setHasAccess(false);
          return;
        }

        // ✅ Fetch permissions (cached internally)
        const permissions = await fetchStaffPermissions();

        if (!permissionId) {
          setHasAccess(true);
        } else {
          setHasAccess(permissions.includes(permissionId));
        }
      } catch (err) {
        console.error("StaffProtectedRoute error:", err);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [permissionId]);

  if (loading)
    return <div className="p-6 text-blue-600 font-semibold">Loading...</div>;

  if (redirectToLogin) return <Navigate to="/login" replace />;

  if (!hasAccess)
    return (
      <div className="p-6 text-red-600 font-semibold">
        You cannot access this page, contact admin
      </div>
    );

  return <Outlet />;
};

export default StaffProtectedRoute;
