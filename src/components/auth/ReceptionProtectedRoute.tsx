// ReceptionProtectedRoute.tsx
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const ReceptionProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      try {
        const token = Cookies.get("token");
        const userInfo = Cookies.get("userInfo");

        // 🔐 Not logged in
        if (!token || !userInfo) {
          setRedirectToLogin(true);
          return;
        }

        const parsedInfo = JSON.parse(userInfo);

        // 🎯 Only Receptionist allowed
        if (parsedInfo.role === "Receptionist") {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("ReceptionProtectedRoute error:", error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-blue-600 font-semibold">
        Loading...
      </div>
    );
  }

  if (redirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess) {
    return (
      <div className="p-6 text-red-600 font-semibold">
       You cannot access this page. Please contact admin.
      </div>
    );
  }

  return <Outlet />;
};

export default ReceptionProtectedRoute;
