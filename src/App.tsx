import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./components/auth/LoginForm";
import  HomePage  from "./components/home/HomePage";
import  TrackAppintment   from "./components/user/TrackAppintment";
import  AppointmentCancelled   from "./components/user/AppointmentCancelled";
import  AppointmentExpired   from "./components/user/AppointmentExpired";
import HospitalChat from "./components/hospitalchat/HospitalChat";


import Dashboard from "./pages/Dashboard";
import HospitalsPage from "./pages/Hospitals";
import DoctorsPage from "./pages/Doctors";
import StaffPage from "./pages/Staff";
import NotificationsPage from "./pages/Notifications";
import SettingsPage from "./pages/Settings";
import { HospitalDoctors } from "./pages/hospital-admin/HospitalDoctors";
import { HospitalStaff } from "./pages/hospital-admin/HospitalStaff";
//import { HospitalAppointments } from "./pages/hospital-admin/HospitalAppointments";
import { HospitalBilling } from "./pages/hospital-admin/HospitalBilling";
import { HospitalNotifications } from "./pages/hospital-admin/HospitalNotifications";
import { HospitalSettings } from "./pages/hospital-admin/HospitalSettings";
import { RoleAccess } from "./pages/hospital-admin/RoleAccess";
import { HospitalPatients } from "./pages/hospital-admin/HospitalPatients";
//import { HospitalReports } from "./pages/hospital-admin/HospitalReports";
import NotFound from "./pages/NotFound";
import { getCurrentUser } from "./data/mockData";
import Config from "./components/ConfigManager"; // ✅ your secure config manager



import { SuperAdminLoginForm } from "./components/auth/SuperAdminLoginForm";
import SuperAdminProtectedRoute from "./components/auth/SuperAdminProtectedRoute";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import SuperDashboard from "./pages/SuperDashboard";
import SuperHospitalsPage from "./pages/SuperHospitalsPage";
import SuperDoctorsPage from "./pages/SuperDoctorsPage";
import SuperStaffPage from "./pages/SuperStaffPage";
import SuperNotificationsPage from "./pages/SuperNotificationsPage";
import SuperSettingsPage from "./pages/SuperSettingsPage";
import SuperLaboratoriesPage from "./pages/SuperLaboratoriesPage";
import SuperLaboratoryPage from "./pages/SuperLaboratoryPage";
import SuperLabStaffPage from "./pages/SuperLabStaffPage";
import SuperLabTestMaster from "@/components/superLab/SuperLabTestMaster";
import SuperLabStaffForLab from "./pages/SuperLabStaffForLab";

import { LaboratoryLoginForm } from "./components/auth/LaboratoryLoginForm";
import LaboratoryProtectedRoute from "./components/auth/LaboratoryProtectedRoute";
import { LaboratoryLayout } from "@/components/layout/LaboratoryLayout";
import LaboratoryDashboard from "./pages/LaboratoryDashboard";
import LaboratoryOrders from "@/components/laboratories/LaboratoryOrders";
import LaboratoryTestMaster from "@/components/laboratories/LaboratoryTestMaster";
import LaboratoryPackages from "@/components/laboratories/LaboratoryPackages";
import LaboratoryLabProcessing from "@/components/laboratories/LaboratoryLabProcessing";
import LaboratoryReports from "@/components/laboratories/LaboratoryReports";
import LaboratoryBilling from "@/components/laboratories/LaboratoryBilling";
import LaboratoryPatients from "@/components/laboratories/LaboratoryPatients";
import LaboratorySettings from "@/components/laboratories/LaboratorySettings";


import HospitalProtectedRoute from "./components/auth/HospitalProtectedRoute";
import { HospitalLayout } from "@/components/layout/HospitalLayout";
import HospitalDashboard from "./pages/HospitalDashboard";
import HospitalDoctorsPage from "./pages/HSDoctorsPage";
import HospitalStaffPage from "./pages/HSStaffPage";
//import HospitalStaffPage from "./pages/HospitalPatientsList";
import HospitalPatientsList from "./pages/HSPatientsList";
import HSPatientView from "./pages/HSPatientView";
import HospitalAppointments from "./pages/HospitalAppointments";
import HospitalRoleAccess from "./pages/HospitalRoleAccess";
import HospitalOTPAccess from "./pages/otp/HospitalOTPAccess";
import HospitalLaboratoryPryority from "@/components/laboratory/HospitalLaboratoryPryority";
import HospitalReports from "./pages/HospitalReports";

import HospitalShiftTime from "./pages/HospitalShiftTime";
import HospitalSpecializationList from "./pages/HospitalSpecializationList";
import HospitalEventTypeList from "./pages/HospitalEventTypeList";
import HospitalhDepartmentList from "./pages/HospitalhDepartmentList";
import HospitalhRoleList from "./pages/HospitalhRoleList";
import HospitalAmenities from "./pages/HospitalAmenities";
import HospitalRoomTypeList from "./pages/HospitalRoomTypeList";
import HospitalWardTypeList from "./pages/HospitalWardTypeList";
import DoctorTreatmentMasters from "./pages/DoctorTreatmentMasters";


import HospitalManageWardInfo from "./pages/ward/HospitalManageWardInfo";
import HospitalManageBedPermission from "./pages/ward/HospitalManageBedPermission";

import HospitalInventoryList from "./pages/inventory/HospitalInventoryList";
import HospitalInventoryMasters from "./pages/inventory/HospitalInventoryMasters";
import HospitalInventoryAddMedicine from "./pages/inventory/HospitalInventoryAddMedicine";
import HospitalInventoryAddBatch from "./pages/inventory/HospitalInventoryAddBatch";
import HSMedicalPage from "./pages/medical/HSMedicalPage";
import HSMedicalRequests from "./pages/medical/HSMedicalRequests";
import HSMedicalCreateRequest from "./pages/medical/HSMedicalCreateRequest";
import HSMedicalRequestsApprovals from "./pages/medical/HSMedicalRequestsApprovals";
import HSMedicalReceiptVerification from "./pages/medical/HSMedicalReceiptVerification";
import HSMedicalApprovedRequests from "./pages/medical/HSMedicalApprovedRequests";
import HSMedicalDeclinedRequests from "./pages/medical/HSMedicalDeclinedRequests";

import DoctorProtectedRoute from "./components/auth/DoctorProtectedRoute";
import { DoctorLayout } from "@/components/layout/DoctorLayout";
import DoctorMedicationEditSugg from "@/pages/DoctorMedicationEditSugg";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorCalendar from "@/components/doctors/calendar/DoctorCalendar";
import DoctorTodayPatientVisit from "@/components/doctors/patient/DoctorTodayPatientVisit";
import DoctorPatientView from "@/components/doctors/patient/DoctorPatientView";
import CompletedPatientsList from "@/components/doctors/patient/CompletedPatientsList";


import DoctorPatientTreatment from "@/components/doctors/patient/DoctorPatientTreatment";
import DoctorMedicationSuggList from "@/pages/DoctorMedicationSuggList";
import DoctorMedicationAddSugg from "@/pages/DoctorMedicationAddSugg";
import DoctorTreatmentSuggestionEdit from "@/components/doctors/consultation/DoctorTreatmentSuggestionEdit";
import DoctorManageReceipts from "@/components/doctors/receipt/DoctorManageReceipts";
import DoctorManageReceiptsContent from "@/components/doctors/receipt/DoctorManageReceiptsContent";
import SharedReceipt from "./pages/SharedReceipt";
/*import HospitalProtectedRoute from "./components/auth/HospitalProtectedRoute";
import { HospitalLayout } from "@/components/layout/HospitalLayout";
import HospitalDashboard from "./pages/HospitalDashboard";*/

import StaffProtectedRoute from "./components/auth/StaffProtectedRoute";
import { StaffLayout } from "@/components/layout/StaffLayout";
import StaffDashboard from "./pages/StaffDashboard";
import StaffPatientList from "./pages/StaffPatientList";
//import StaffaAppointmentList from "./pages/StaffaAppointmentList";

import StaffaAppointmentList from "@/components/appointment/AppointmentList";

import StaffaAppointmentScheduler from "./pages/StaffaAppointmentScheduler";
import StaffasMasterScheduler from "./pages/StaffaAppointmentScheduler";
import StaffasDoctorCalendar from "./pages/StaffasDoctorCalendar";

import StaffasRoomAvailable from "./pages/StaffasRoomAvailable";
import StaffasManageRoomAvailable from "./pages/staff-ward/StaffasManageRoomAvailable";


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = getCurrentUser();
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
}

const queryClient = new QueryClient();

const App = () => {
  const [configInitialized, setConfigInitialized] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Config.initialize();
        console.log("App configuration initialized successfully");

        // Ensure AES_SECRET_KEY exists
        const secretKey = Config.get("AES_SECRET_KEY");
        if (!secretKey) {
          throw new Error(
            "AES_SECRET_KEY is missing. Application cannot start."
          );
        }

        console.log("AES_SECRET_KEY verified successfully");
        setConfigInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setConfigError(
          error instanceof Error
            ? error.message
            : "Application initialization failed"
        );
      }
    };

    initializeApp();
  }, []);

  // Show loading screen while configuration is initializing
  if (!configInitialized && !configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Initializing Application
          </h2>
          <p className="text-gray-500">Loading secure configuration...</p>
        </div>
      </div>
    );
  }

  // Show error screen if configuration failed
  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Configuration Error
          </h2>
          <p className="text-gray-600 mb-4">{configError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ Render main app only when config is initialized
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/appointment_cancelled" element={<AppointmentCancelled />} />
            <Route path="/appointment_expired" element={<AppointmentExpired />} />
            <Route path="/track-appointment/:appointmentId" element={<TrackAppintment />} />
            <Route path="/hospital-chat/:hospitalId/:hospitalName" element={<HospitalChat />} />

            <Route path="/login" element={<LoginForm />} />
            <Route path="/sa-login" element={<SuperAdminLoginForm />} />
            <Route path="/lab-login" element={<LaboratoryLoginForm />} />
            
            {/* Public Shared Receipt Route */}
            <Route path="/shared/receipt/:token" element={<SharedReceipt />} />


            {/* Super Admin protected routes */}
            <Route element={<SuperAdminProtectedRoute />}>

              <Route path="/super-dashboard" element={<SuperAdminLayout><SuperDashboard /></SuperAdminLayout>} />
              <Route path="/super-hospitals" element={<SuperAdminLayout><SuperHospitalsPage /></SuperAdminLayout>} />
              <Route path="/super-doctors"   element={<SuperAdminLayout><SuperDoctorsPage /></SuperAdminLayout>} />
              <Route path="/super-staff"   element={<SuperAdminLayout><SuperStaffPage /></SuperAdminLayout>} />
              <Route path="/super-notifications"   element={<SuperAdminLayout><SuperNotificationsPage /></SuperAdminLayout>} />
              <Route path="/super-settings"   element={<SuperAdminLayout><SuperSettingsPage /></SuperAdminLayout>} />
             
              <Route path="/super-laboratories" element={<SuperAdminLayout><SuperLaboratoryPage /></SuperAdminLayout>} />
              <Route path="/super-lab-staff" element={<SuperAdminLayout><SuperLabStaffPage /></SuperAdminLayout>} />
              <Route path="/super-laboratory/:labId/staff" element={<SuperAdminLayout><SuperLabStaffForLab /></SuperAdminLayout>} />
              <Route path="/super-lab-test-master" element={<SuperAdminLayout><SuperLabTestMaster /></SuperAdminLayout>} />

            </Route>

            {/* Laboratory protected routes */}
            <Route element={<LaboratoryProtectedRoute />}>
              <Route path="/laboratory-dashboard" element={<LaboratoryLayout><LaboratoryDashboard /></LaboratoryLayout>} />
              <Route path="/laboratory-orders" element={<LaboratoryLayout><LaboratoryOrders /></LaboratoryLayout>} />
              <Route path="/laboratory-test-master" element={<LaboratoryLayout><LaboratoryTestMaster /></LaboratoryLayout>} />
              <Route path="/laboratory-packages" element={<LaboratoryLayout><LaboratoryPackages /></LaboratoryLayout>} />
              <Route path="/laboratory-processing" element={<LaboratoryLayout><LaboratoryLabProcessing /></LaboratoryLayout>} />
              <Route path="/laboratory-report" element={<LaboratoryLayout><LaboratoryReports /></LaboratoryLayout>} />
              <Route path="/laboratory-report" element={<LaboratoryLayout><LaboratoryReports /></LaboratoryLayout>} />
              <Route path="/laboratory-billing" element={<LaboratoryLayout><LaboratoryBilling /></LaboratoryLayout>} />
              <Route path="/laboratory-patients" element={<LaboratoryLayout><LaboratoryPatients /></LaboratoryLayout>} />
              <Route path="/laboratory-profile" element={<LaboratoryLayout><LaboratorySettings /></LaboratoryLayout>} />
              {/* Add other laboratory routes here */}
            </Route>

            <Route element={<HospitalProtectedRoute />}>
              <Route path="/hospital-dashboard" element={<HospitalLayout><HospitalDashboard /></HospitalLayout>} />
              <Route path="/hs-doctors" element={<HospitalLayout><HospitalDoctorsPage /></HospitalLayout>} />
              <Route path="/hs-staff" element={<HospitalLayout><HospitalStaffPage /></HospitalLayout>} />
              

              <Route path="/hs-patients-list" element={<HospitalLayout><HospitalPatientsList /></HospitalLayout>} />
              <Route path="/hs-patient-view-details/:patientId" element={<HospitalLayout><HSPatientView /></HospitalLayout>} />
              <Route path="/hs-patients-appointments" element={<HospitalLayout><HospitalAppointments /></HospitalLayout>} />
              <Route path="/hs-role-access" element={<HospitalLayout><HospitalRoleAccess /></HospitalLayout>} />
              <Route path="/hs-employee-opt-access" element={<HospitalLayout><HospitalOTPAccess /></HospitalLayout>} />
              <Route path="/hs-laboratory-pryority" element={<HospitalLayout><HospitalLaboratoryPryority /></HospitalLayout>} />
              <Route path="/hs-reports" element={<HospitalLayout><HospitalReports /></HospitalLayout>} />


              <Route path="/hs-manage-ward-info" element={<HospitalLayout><HospitalManageWardInfo /></HospitalLayout>} />
              <Route path="/hs-manage-bed-permission" element={<HospitalLayout><HospitalManageBedPermission /></HospitalLayout>} />


              <Route path="/hs-inventory-list" element={<HospitalLayout><HospitalInventoryList /></HospitalLayout>} />
              <Route path="/hs-inventory-masters" element={<HospitalLayout><HospitalInventoryMasters /></HospitalLayout>} />
              <Route path="/hs-inventory-add-medicine" element={<HospitalLayout><HospitalInventoryAddMedicine /></HospitalLayout>} />
              <Route path="/hs-inventory-add-batch" element={<HospitalLayout><HospitalInventoryAddBatch /></HospitalLayout>} />
              <Route path="/hs-medical" element={<HospitalLayout><HSMedicalPage /></HospitalLayout>} />
              <Route path="/hs-medical-inventory-requests" element={<HospitalLayout><HSMedicalRequests /></HospitalLayout>} />
              <Route path="/hs-medical-inventory-requests/new" element={<HospitalLayout><HSMedicalCreateRequest /></HospitalLayout>} />
              <Route path="/hs-medical-inv-request-approvals" element={<HospitalLayout><HSMedicalRequestsApprovals /></HospitalLayout>} />
              <Route path="/hs-medical-inv-request-approved" element={<HospitalLayout><HSMedicalApprovedRequests /></HospitalLayout>} />
              <Route path="/hs-medical-inv-request-declined" element={<HospitalLayout><HSMedicalDeclinedRequests /></HospitalLayout>} />
              <Route path="//hs-medical-inv-receipt-verification" element={<HospitalLayout><HSMedicalReceiptVerification /></HospitalLayout>} />




              
              <Route path="/hs-shift-time-list" element={<HospitalLayout><HospitalShiftTime /></HospitalLayout>} />
              <Route path="/hs-specialization-list" element={<HospitalLayout><HospitalSpecializationList /></HospitalLayout>} />
              <Route path="/hs-event-type-list" element={<HospitalLayout><HospitalEventTypeList /></HospitalLayout>} />
              <Route path="/hs-department-list" element={<HospitalLayout><HospitalhDepartmentList /></HospitalLayout>} />
              <Route path="/hs-role-list" element={<HospitalLayout><HospitalhRoleList /></HospitalLayout>} />
              
              <Route path="/hs-amenities-list" element={<HospitalLayout><HospitalAmenities /></HospitalLayout>} />
              <Route path="/hs-room-type-list" element={<HospitalLayout><HospitalRoomTypeList /></HospitalLayout>} />
              <Route path="/hs-ward-type-list" element={<HospitalLayout><HospitalWardTypeList /></HospitalLayout>} />
              <Route path="/hs-doctor-treatment" element={<HospitalLayout><DoctorTreatmentMasters /></HospitalLayout>} />




            </Route>

            <Route element={<DoctorProtectedRoute />}>
              <Route path="/doctor-dashboard" element={<DoctorLayout><DoctorDashboard /></DoctorLayout>} />
              <Route path="/doctor-calendar" element={<DoctorLayout><DoctorCalendar /></DoctorLayout>} />
              <Route path="/doctor-today-visit" element={<DoctorLayout><DoctorTodayPatientVisit /></DoctorLayout>} />
              <Route path="/doctor-view-patient/:patientId" element={<DoctorLayout><DoctorPatientView /></DoctorLayout>} />
              <Route path="/doctor-completed-list" element={<DoctorLayout><CompletedPatientsList /></DoctorLayout>} />
              

              <Route path="/doctor-treatment" element={<DoctorLayout><DoctorPatientTreatment /></DoctorLayout>} />
              <Route path="/doctor-medication-sugg" element={<DoctorLayout><DoctorMedicationSuggList /></DoctorLayout>} />
              <Route path="/doctor-manage-receipts" element={<DoctorLayout><DoctorManageReceipts /></DoctorLayout>} />
              <Route path="/doctor-receipts-content" element={<DoctorLayout><DoctorManageReceiptsContent /></DoctorLayout>} />
        <Route path="/doctor-medication-add-sugg" element={<DoctorLayout><DoctorMedicationAddSugg /></DoctorLayout>} />
        <Route path="/doctor-medication-edit-sugg/:uid" element={<DoctorLayout><DoctorMedicationEditSugg /></DoctorLayout>} />
        <Route path="/doctor-medication-edit-sugg-2/:uid" element={<DoctorLayout><DoctorTreatmentSuggestionEdit /></DoctorLayout>} />
            </Route>


            <Route element={<StaffProtectedRoute />}>
              <Route path="/staff-dashboard" element={<StaffLayout><StaffDashboard /></StaffLayout>} />
              <Route path="/sf-patient-list" element={<StaffLayout><StaffPatientList /></StaffLayout>} />
              <Route path="/sf-appointment-list" element={<StaffLayout><StaffaAppointmentList /></StaffLayout>} />
              <Route path="/sf-book-appointment" element={<StaffLayout><StaffaAppointmentScheduler /></StaffLayout>} />
              <Route path="/sf-master-scheduler" element={<StaffLayout><StaffasMasterScheduler /></StaffLayout>} />
              <Route path="/sf-doctor-calendar" element={<StaffLayout><StaffasDoctorCalendar /></StaffLayout>} />

              <Route path="/sf-icu-access" element={<StaffLayout><StaffasRoomAvailable /></StaffLayout>} />
              <Route path="/sf-assign-rooms" element={<StaffLayout><StaffasManageRoomAvailable /></StaffLayout>} />
            </Route>


            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospitals"
              element={
                <ProtectedRoute>
                  <HospitalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  

                  <HospitalPatients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctors"
              element={
                <ProtectedRoute>
                  {getCurrentUser()?.role === "hospital_admin" ? (
                    <HospitalDoctors />
                  ) : (
                    <DoctorsPage />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  {getCurrentUser()?.role === "hospital_admin" ? (
                    <HospitalStaff />
                  ) : (
                    <StaffPage />
                  )}
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/medical-records"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  {getCurrentUser()?.role === "hospital_admin" ? (
                    <HospitalBilling />
                  ) : (
                    <Dashboard />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/role-access"
              element={
                <ProtectedRoute>
                  <RoleAccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <HospitalReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  {getCurrentUser()?.role === "hospital_admin" ? (
                    <HospitalNotifications />
                  ) : (
                    <NotificationsPage />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  {getCurrentUser()?.role === "hospital_admin" ? (
                    <HospitalSettings />
                  ) : (
                    <SettingsPage />
                  )}
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
