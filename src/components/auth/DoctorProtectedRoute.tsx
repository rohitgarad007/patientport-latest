// DoctorProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const DoctorProtectedRoute = () => {
  const token = Cookies.get("token");
  const userInfo = Cookies.get("userInfo");

  if (!token || !userInfo) {
    return <Navigate to="/login" replace />;
  }

  try {
    const parsedInfo = JSON.parse(userInfo);

    if (parsedInfo?.role !== "doctor") {
      return <Navigate to="/login" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // ✅ Allowed → render child routes
};

export default DoctorProtectedRoute;
