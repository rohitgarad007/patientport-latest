
// LaboratoryProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const LaboratoryProtectedRoute = () => {
  const token = Cookies.get("labToken");
  const labInfo = Cookies.get("labInfo");

  if (!token || !labInfo) {
    return <Navigate to="/lab-login" replace />;
  }

  try {
    const parsedInfo = JSON.parse(labInfo);

    // Basic check if it's a valid lab user
    if (!parsedInfo?.id || !parsedInfo?.role) {
      return <Navigate to="/lab-login" replace />;
    }
    
    // Optional: Add specific role checks if needed
    // const allowedRoles = ['admin', 'pathologist', 'lab-technician', 'receptionist', 'phlebotomist'];
    // if (!allowedRoles.includes(parsedInfo.role)) {
    //   return <Navigate to="/lab-login" replace />;
    // }

  } catch {
    return <Navigate to="/lab-login" replace />;
  }

  return <Outlet />;
};

export default LaboratoryProtectedRoute;
