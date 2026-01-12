// SuperAdminProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const SuperAdminProtectedRoute = () => {
  const token = Cookies.get("token");
  const adminInfo = Cookies.get("adminInfo");

  if (!token || !adminInfo) {
    return <Navigate to="/sa-login" replace />;
  }

  try {
    const parsedInfo = JSON.parse(adminInfo);

    // ✅ Ensure role matches your Dashboard.tsx usage
    if (parsedInfo?.role !== "super_admin") {
      return <Navigate to="/sa-login" replace />;
    }
  } catch {
    return <Navigate to="/sa-login" replace />;
  }

  return <Outlet />; // ✅ Allowed → render child routes
};

export default SuperAdminProtectedRoute;
