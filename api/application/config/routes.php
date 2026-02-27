<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
$route['default_controller'] = 'welcome';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

// Authentication Routes
$route['super-auth-login']					= 'AdmAdminAuthCtr/adminLogin';
$route['login_check'] 									= 'AuthController/loginCheck';
$route['user-auth-login'] 								= 'AdmAdminAuthCtr/userLogin';
$route['verify-login-otp'] 								= 'AdmAdminAuthCtr/verifyLoginOtp';
$route['lab-auth-login'] 								= 'LbAuthCtr/labLogin';
$route['signup_create'] 								= 'AuthController/signupCreate';
$route['verify_otp'] 									= 'AuthController/verifyOtp';
$route['forgot_password'] 								= 'AuthController/forgotPassword';
$route['reset_password'] 								= 'AuthController/resetPassword';
$route['check_auth_status'] 							= 'AuthController/checkAuthStatus';
$route['get_user_info'] 								= 'AuthController/getUserInfo';


$route['ms_statesList']					= 'AdmCommonController/getStateList';
$route['ms_citiesList']					= 'AdmCommonController/getCityList';
$route['ms_staff_roles']				= 'AdmCommonController/getStaffRoleList';
$route['ms_staff_departments']			= 'AdmCommonController/getDepartmentsList';


$route['master_hospitals_list']						= 'SAHospitalsController/ManageHospitalList';
$route['master_hospitals_add']						= 'SAHospitalsController/AddHospital';
$route['master_hospitals_update']					= 'SAHospitalsController/UpdateHospital';
$route['master_hospitals_change_status']			= 'SAHospitalsController/changeHospitalStatus';
$route['master_hospitals_delete']					= 'SAHospitalsController/DeleteHospital';



// Super Admin Laboratories Routes
$route['master_laboratories_list']					= 'SALaboratoriesController/ManageLaboratoryList';
$route['master_laboratories_add']					= 'SALaboratoriesController/AddLaboratory';
$route['master_laboratories_update']				= 'SALaboratoriesController/UpdateLaboratory';
$route['master_laboratories_change_status']			= 'SALaboratoriesController/changeLaboratoryStatus';
$route['master_laboratories_delete']				= 'SALaboratoriesController/DeleteLaboratory';


// Laboratory Staff Routes
$route['master_laboratories_staff_list']			= 'SALaboratoriesController/ManageLaboratoryStaffList';
$route['master_laboratories_staff_add']				= 'SALaboratoriesController/AddLaboratoryStaff';
$route['master_laboratories_staff_update']			= 'SALaboratoriesController/UpdateLaboratoryStaff';
$route['master_laboratories_staff_change_status']	= 'SALaboratoriesController/changeLaboratoryStaffStatus';
$route['master_laboratories_staff_delete']			= 'SALaboratoriesController/DeleteLaboratoryStaff';
$route['master_laboratories_active_list']			= 'SALaboratoriesController/GetActiveLaboratories';


$route['laboratories_collect_sample'] = 'LaboratoriesController/collectSample';
$route['laboratories_save_draft'] = 'LaboratoriesController/saveDraft';
$route['laboratories_get_drafts'] = 'LaboratoriesController/getDrafts';
$route['laboratories_submit_validation'] = 'LaboratoriesController/submitValidation';


// New Notification Routes
$route['lb_unseen_orders'] = 'LaboratoriesController/get_unseen_notifications';
$route['lb_mark_seen'] = 'LaboratoriesController/mark_notifications_seen';

$route['lb_unseen_queue'] = 'LaboratoriesController/get_unseen_queue_notifications';
$route['lb_mark_queue_seen'] = 'LaboratoriesController/mark_queue_seen';

$route['lb_unseen_processing'] = 'LaboratoriesController/get_unseen_processing_notifications';
$route['lb_mark_processing_seen'] = 'LaboratoriesController/mark_processing_seen';

$route['lb_unseen_completed'] = 'LaboratoriesController/get_unseen_completed_notifications';
$route['lb_mark_completed_seen'] = 'LaboratoriesController/mark_completed_seen';



// Lab Packages Routes
$route['lab_packages_list'] = 'LabPackagesController/listPackages';
$route['lab_packages_add'] = 'LabPackagesController/addPackage';
$route['lab_packages_update'] = 'LabPackagesController/updatePackage';
$route['lab_packages_delete'] = 'LabPackagesController/deletePackage';
$route['lab_packages_get'] = 'LabPackagesController/getPackage';

// Lab Payments Routes
$route['lb_payment_history'] = 'LabPaymentsController/getPayments';
$route['lb_add_payment'] = 'LabPaymentsController/addPayment';
$route['lb_billing_data'] = 'LabPaymentsController/getBillingData';


// Laboratory Operational Routes
$route['laboratories_lab_test_list'] = 'LaboratoriesController/MasterLabTestList';
$route['laboratories_recent_orders'] = 'LaboratoriesController/get_recent_orders';
$route['laboratories_all_orders'] = 'LaboratoriesController/get_all_orders';
$route['laboratories_dashboard_stats'] = 'LaboratoriesController/get_dashboard_stats';
$route['laboratories_upload_report'] = 'LaboratoriesController/uploadReport';
$route['laboratories_processing_queue'] = 'LaboratoriesController/GetProcessingQueue';
$route['laboratories_validation_queue'] = 'LaboratoriesController/GetValidationQueue';
$route['laboratories_reports_completed'] = 'LaboratoriesController/GetCompletedReports';
$route['laboratories_toggle_report_visibility'] = 'LaboratoriesController/ToggleReportVisibility';


$route['laboratories_report_details'] = 'LaboratoriesController/GetReportDetails';
$route['laboratories_collected_samples'] = 'LaboratoriesController/getCollectedSamples';
$route['laboratories_update_order_status'] = 'LaboratoriesController/updateOrderStatus';
$route['laboratories_approve_generate_report'] = 'LaboratoriesController/ApproveAndGenerateReport';


// Reception Routes
$route['reception_dashboard_stats'] = 'ReceptionController/getDashboardStats';
$route['save_screen_settings'] = 'ReceptionController/save_screen_settings';
$route['get_screen_settings'] = 'ReceptionController/get_screen_settings';
$route['reception_screens_list'] = 'ReceptionController/getReceptionScreensList';
$route['get_screen_announcement'] = 'ReceptionController/get_screen_announcement';
$route['ms_doctor_specializations']					= 'SADoctorsController/GetSpecializationsList';
$route['ms_doctors_list']							= 'SADoctorsController/ManageDoctorList';
$route['ms_doctors_add']							= 'SADoctorsController/AddDoctorInformation';
$route['ms_doctors_update']							= 'SADoctorsController/UpdateDoctorInformation';
$route['ms_doctors_change_status']					= 'SADoctorsController/changeDoctorStatus';
$route['ms_doctors_delete']							= 'SADoctorsController/DeleteDoctorInformation';


// Master Lab Test Routes
$route['master_lab_test_list']					= 'SALaboratoriesController/MasterLabTestList';
$route['master_lab_test_get']						= 'SALaboratoriesController/GetMasterLabTest';
$route['master_lab_test_add']						= 'SALaboratoriesController/AddMasterLabTest';
$route['master_lab_test_update']					= 'SALaboratoriesController/UpdateMasterLabTest';
$route['master_lab_test_delete']					= 'SALaboratoriesController/DeleteMasterLabTest';


$route['ms_staff_list']								= 'SAStaffController/ManageStaffList';
$route['ms_staff_add']								= 'SAStaffController/AddStaffInformation';
$route['ms_staff_update']							= 'SAStaffController/UpdateStaffInformation';
$route['ms_staff_change_status']					= 'SAStaffController/changeStaffStatus';
$route['ms_staff_delete']							= 'SAStaffController/DeleteStaffInformation';

$route['hs_hospitals_list']							= 'HSHospitalsController/ManageHospitalList';

$route['hs_shift_time_list']						= 'HSHospitalsController/getShiftList';
$route['hs_shift_time_add']							= 'HSHospitalsController/AddShiftTime';
$route['hs_shift_time_update']						= 'HSHospitalsController/UpdateShiftTime';
$route['hs_shift_time_delete']						= 'HSHospitalsController/DeleteShiftTime';


$route['hs_specialization_list']					= 'HSHospitalsController/getSpecializationList';
$route['hs_specialization_add']						= 'HSHospitalsController/AddSpecializationInfo';
$route['hs_specialization_update']					= 'HSHospitalsController/UpdateSpecializationInfo';
$route['hs_specialization_delete']					= 'HSHospitalsController/DeleteSpecializationInfo';


$route['hs_event_type_list']						= 'HSHospitalsController/getEventTypeList';
$route['hs_event_type_add']							= 'HSHospitalsController/AddEventTypeInformation';
$route['hs_event_type_update']						= 'HSHospitalsController/UpdateEventTypeInformation';
$route['hs_event_type_delete']						= 'HSHospitalsController/DeleteEventTypeInformation';


$route['hs_department_list']						= 'HSHospitalsController/getDepartmentList';
$route['hs_department_add']							= 'HSHospitalsController/AddDepartmentInformation';
$route['hs_department_update']						= 'HSHospitalsController/UpdateDepartmentInformation';
$route['hs_department_delete']						= 'HSHospitalsController/DeleteDepartmentInformation';


$route['hs_role_list']								= 'HSHospitalsController/getRoleList';
$route['hs_role_add']								= 'HSHospitalsController/AddRoleInformation';
$route['hs_role_update']							= 'HSHospitalsController/UpdateRoleInformation';
$route['hs_role_delete']							= 'HSHospitalsController/DeleteRoleInformation';

$route['hs_amenity_list']							= 'HSHospitalsController/getAmenityList';
$route['hs_amenity_add']							= 'HSHospitalsController/AddAmenityInformation';
$route['hs_amenity_update']							= 'HSHospitalsController/UpdateAmenityInformation';
$route['hs_amenity_delete']							= 'HSHospitalsController/DeleteAmenityInformation';


// WhatsApp Integration Routes
$route['whatsapp/view_logs'] = 'WhatsAppController/view_logs';
$route['whatsapp/setup_db'] = 'WhatsAppController/setup_database';
$route['whatsapp/webhook'] = 'WhatsAppController/webhook';
$route['whatsapp/send'] = 'WhatsAppController/send_message';
$route['whatsapp/test'] = 'WhatsAppController/test';
$route['whatsapp_webhook'] = 'WhatsAppController/webhook'; // Keep for backward compatibility




// Admin Routes
$route['adm_users_list']								= 'AdmUsersController/ManageUserList';
$route['adm_users_add']									= 'AdmUsersController/AddUserInformation';
$route['adm_users_update']								= 'AdmUsersController/UpdateUserInformation';
$route['adm_users_change_status']						= 'AdmUsersController/changeUserStatus';
$route['adm_users_delete']								= 'AdmUsersController/DeleteUserInformation';
$route['adm_users_get_roles']							= 'AdmUsersController/GetUserRoles';

$route['adm_hospitals_list']							= 'AdmHospitalsController/ManageHospitalList';
$route['adm_hospitals_add']								= 'AdmHospitalsController/AddHospitalInformation';
$route['adm_hospitals_update']							= 'AdmHospitalsController/UpdateHospitalInformation';
$route['adm_hospitals_change_status']					= 'AdmHospitalsController/changeHospitalStatus';
$route['adm_hospitals_delete']							= 'AdmHospitalsController/DeleteHospitalInformation';

$route['adm_laboratories_list']							= 'AdmLaboratoriesController/ManageLaboratoriesList';
$route['adm_laboratories_add']							= 'AdmLaboratoriesController/AddLaboratoriesInformation';
$route['adm_laboratories_update']						= 'AdmLaboratoriesController/UpdateLaboratoriesInformation';
$route['adm_laboratories_change_status']				= 'AdmLaboratoriesController/changeLaboratoriesStatus';
$route['adm_laboratories_delete']						= 'AdmLaboratoriesController/DeleteLaboratoriesInformation';

$route['adm_pharmacies_list']							= 'AdmPharmaciesController/ManagePharmaciesList';
$route['adm_pharmacies_add']							= 'AdmPharmaciesController/AddPharmaciesInformation';
$route['adm_pharmacies_update']							= 'AdmPharmaciesController/UpdatePharmaciesInformation';
$route['adm_pharmacies_change_status']					= 'AdmPharmaciesController/changePharmaciesStatus';
$route['adm_pharmacies_delete']							= 'AdmPharmaciesController/DeletePharmaciesInformation';


$route['adm_specializations_list']						= 'AdmSpecializationsController/ManageSpecializationsList';
$route['adm_specializations_add']						= 'AdmSpecializationsController/AddSpecializationsInformation';
$route['adm_specializations_update']					= 'AdmSpecializationsController/UpdateSpecializationsInformation';
// Location Routes
$route['locations/states'] = 'LocationController/get_states';
$route['locations/cities/(:num)'] = 'LocationController/get_cities/$1';

// Hospital Profile Routes
$route['hospital/profile/change_password'] = 'HospitalProfileController/change_password';
$route['hospital/profile/update'] = 'HospitalProfileController/update_profile';
$route['hospital/profile/(:any)'] = 'HospitalProfileController/get_profile/$1';

$route['doctor_profile_get'] = 'DoctorProfileController/get_profile';
$route['doctor_profile_update'] = 'DoctorProfileController/update_profile';
$route['doctor_status_update'] = 'DoctorProfileController/update_status';

$route['adm_specializations_change_status']				= 'AdmSpecializationsController/changeSpecializationsStatus';
$route['adm_specializations_delete']					= 'AdmSpecializationsController/DeleteSpecializationsInformation';

$route['adm_amenities_list']							= 'AdmAmenitiesController/ManageAmenitiesList';
$route['adm_amenities_add']								= 'AdmAmenitiesController/AddAmenitiesInformation';
$route['adm_amenities_update']							= 'AdmAmenitiesController/UpdateAmenitiesInformation';
$route['adm_amenities_change_status']					= 'AdmAmenitiesController/changeAmenitiesStatus';
$route['adm_amenities_delete']							= 'AdmAmenitiesController/DeleteAmenitiesInformation';


// Hospital Routes
$route['hs_specializations_list']						= 'HSHospitalsController/getSpecializationList';
$route['hs_specializations_add']						= 'HSHospitalsController/AddSpecializationInfo';
$route['hs_specializations_update']						= 'HSHospitalsController/UpdateSpecializationInfo';
$route['hs_specializations_delete']						= 'HSHospitalsController/DeleteSpecializationInfo';
$route['get_specializations_list']						= 'HSDoctorsController/GetSpecializationsList';

$route['hs_doctors_list'] = 'HSHospitalsController/getDoctorsList';
$route['hs_employee_otp_list'] = 'HSHospitalsController/getEmployeeOTPList';
$route['hs_employee_otp_reset'] = 'HSHospitalsController/resetEmployeeOTP';
$route['hs_employee_otp_2fa_toggle'] = 'HSHospitalsController/toggleEmployee2FA';
$route['hs_save_screen'] = 'HSHospitalsController/saveScreen';
$route['hs_screens_list'] = 'HSHospitalsController/getScreensList';
$route['hs_screens_appointments'] = 'HSHospitalsController/getScreenPreviewAppointments';
$route['hs_token_dashboard_stats'] = 'HSHospitalsController/getTokenDashboardStats';

$route['save_screen_settings'] = 'ReceptionController/save_screen_settings';
$route['get_screen_settings'] = 'ReceptionController/get_screen_settings';


$route['hs_amenities_list']								= 'HSHospitalsController/getAmenityList';
$route['hs_amenities_add']								= 'HSHospitalsController/AddAmenityInfo';
$route['hs_amenities_update']							= 'HSHospitalsController/UpdateAmenityInfo';
$route['hs_amenities_delete']							= 'HSHospitalsController/DeleteAmenityInfo';

$route['hs_room_types_list']							= 'HSHospitalsController/getRoomTypeList';
$route['hs_room_types_add']								= 'HSHospitalsController/AddRoomTypeInfo';
$route['hs_room_types_update']							= 'HSHospitalsController/UpdateRoomTypeInfo';
$route['hs_room_types_delete']							= 'HSHospitalsController/DeleteRoomTypeInfo';

$route['hs_departments_list']							= 'HSHospitalsController/getDepartmentList';
$route['hs_departments_add']							= 'HSHospitalsController/AddDepartmentInfo';
$route['hs_departments_update']							= 'HSHospitalsController/UpdateDepartmentInfo';
$route['hs_departments_delete']							= 'HSHospitalsController/DeleteDepartmentInfo';

$route['hs_roles_list']									= 'HSHospitalsController/getRoleList';
$route['hs_roles_add']									= 'HSHospitalsController/AddRoleInfo';
$route['hs_roles_update']								= 'HSHospitalsController/UpdateRoleInfo';
$route['hs_roles_delete']								= 'HSHospitalsController/DeleteRoleInfo';

$route['hs_shifts_list']								= 'HSHospitalsController/getShiftList';
$route['hs_shifts_add']									= 'HSHospitalsController/AddShiftInfo';
$route['hs_shifts_update']								= 'HSHospitalsController/UpdateShiftInfo';
$route['hs_shifts_delete']								= 'HSHospitalsController/DeleteShiftInfo';

$route['hs_event_types_list']							= 'HSHospitalsController/getEventTypeList';
$route['hs_event_types_add']							= 'HSHospitalsController/AddEventTypeInfo';
$route['hs_event_types_update']							= 'HSHospitalsController/UpdateEventTypeInfo';
$route['hs_event_types_delete']							= 'HSHospitalsController/DeleteEventTypeInfo';


$route['hs_inventory_category_list']					= 'HSHospitalsInventoryController/getInventoryCategoryList';
$route['hs_inventory_category_add']						= 'HSHospitalsInventoryController/AddInventoryCategoryInfo';
$route['hs_inventory_category_update']					= 'HSHospitalsInventoryController/UpdateInventoryCategoryInfo';
$route['hs_inventory_category_delete']					= 'HSHospitalsInventoryController/DeleteInventoryCategoryInfo';

$route['hs_inventory_subcategory_list']				= 'HSHospitalsInventoryController/getIvSubCategoryList';
$route['hs_inventory_subcategory_add']				= 'HSHospitalsInventoryController/AddIvSubCategoryInfo';
$route['hs_inventory_subcategory_update']			= 'HSHospitalsInventoryController/UpdateIvSubCategoryInfo';

$route['hs_inventory_subcategory_delete']				= 'HSHospitalsController/DeleteInventorySubCategoryInfo';

$route['hs_inventory_manufacturer_list']			= 'HSHospitalsInventoryController/GetIvManufacturerList';
$route['hs_inventory_manufacturer_add']				= 'HSHospitalsInventoryController/AddIvManufacturerInfo';
$route['hs_inventory_manufacturer_update']			= 'HSHospitalsInventoryController/UpdateIvManufacturerInfo';
$route['hs_inventory_manufacturer_delete']				= 'HSHospitalsController/DeleteInventoryManufacturerInfo';


$route['hs_inventory_brand_list']					= 'HSHospitalsInventoryController/GetIvBrandList';
$route['hs_inventory_brand_add']					= 'HSHospitalsInventoryController/AddIvBrandInformation';
$route['hs_inventory_brand_update']					= 'HSHospitalsInventoryController/UpdateIvBrandInformation';


$route['hs_inventory_item_list']						= 'HSHospitalsController/getInventoryItemList';
$route['hs_inventory_item_add']							= 'HSHospitalsController/AddInventoryItemInfo';
$route['hs_inventory_item_update']						= 'HSHospitalsController/UpdateInventoryItemInfo';
$route['hs_inventory_item_delete']						= 'HSHospitalsController/DeleteInventoryItemInfo';
$route['hs_inventory_item_get']							= 'HSHospitalsController/getInventoryItemInfo';


$route['hs_inventory_uom_list']						= 'HSHospitalsInventoryController/GetIvUnitOfMeasureList';
$route['hs_inventory_uom_add']						= 'HSHospitalsInventoryController/AddIvUnitOfMeasureList';
$route['hs_inventory_uom_update']					= 'HSHospitalsInventoryController/UpdateIvUnitOfMeasureList';

$route['hs_inventory_tax_list']						= 'HSHospitalsInventoryController/GetIvTaxList';
$route['hs_inventory_tax_add']						= 'HSHospitalsInventoryController/AddIvTaxInfo';
$route['hs_inventory_tax_update']					= 'HSHospitalsInventoryController/UpdateIvTaxInfo';



$route['hs_room_type_list']							= 'MasterRoomController/getRoomTypeList';
$route['hs_room_type_add']							= 'MasterRoomController/AddRoomTypeInfo';
$route['hs_room_type_update']						= 'MasterRoomController/UpdateRoomTypeInfo';
$route['hs_room_type_delete']						= 'MasterRoomController/DeleteRoomTypeInfo';


$route['hs_inventory_stock_list']						= 'HSHospitalsController/getInventoryStockList';
$route['hs_inventory_stock_add']						= 'HSHospitalsController/AddInventoryStockInfo';
$route['hs_inventory_stock_update']						= 'HSHospitalsController/UpdateInventoryStockInfo';
$route['hs_inventory_stock_delete']						= 'HSHospitalsController/DeleteInventoryStockInfo';

$route['hs_inventory_vendor_list']						= 'HSHospitalsController/getInventoryVendorList';
$route['hs_inventory_vendor_add']						= 'HSHospitalsController/AddInventoryVendorInfo';
$route['hs_inventory_vendor_update']					= 'HSHospitalsController/UpdateInventoryVendorInfo';
$route['hs_inventory_vendor_delete']					= 'HSHospitalsController/DeleteInventoryVendorInfo';

$route['patient_treatment_lab_report']                  = 'PatientTreatmentController/get_lab_report_view';

$route['hs_inventory_purchase_list']					= 'HSHospitalsController/getInventoryPurchaseList';
$route['hs_inventory_purchase_add']						= 'HSHospitalsController/AddInventoryPurchaseInfo';
$route['hs_inventory_purchase_update']					= 'HSHospitalsController/UpdateInventoryPurchaseInfo';
$route['hs_inventory_purchase_delete']					= 'HSHospitalsController/DeleteInventoryPurchaseInfo';
$route['hs_inventory_purchase_details']					= 'HSHospitalsController/getInventoryPurchaseDetails';


// Master Room Routes
$route['hs_block_list']									= 'MasterRoomController/getBlockList';
$route['hs_block_add']									= 'MasterRoomController/AddBlockInformation';
$route['hs_block_update']								= 'MasterRoomController/UpdateBlockInformation';
$route['hs_block_delete']								= 'MasterRoomController/DeleteBlockInformation';

$route['hs_floor_list']									= 'MasterRoomController/getFloorList';
$route['hs_floor_add']									= 'MasterRoomController/AddFloorInformation';
$route['hs_floor_update']								= 'MasterRoomController/UpdateFloorInformation';
$route['hs_floor_delete']								= 'MasterRoomController/DeleteFloorInformation';


$route['hs_room_list']									= 'MasterRoomController/getRoomFullList';
$route['hs_room_add']									= 'MasterRoomController/AddRoomInformation';
$route['hs_room_update']								= 'MasterRoomController/UpdateRoomInformation';
$route['hs_room_delete']								= 'MasterRoomController/DeleteRoomInformation';

$route['hs_bed_list']									= 'MasterRoomController/getBedFullList';
$route['hs_bed_add']								= 'MasterRoomController/AddBedInformation';
$route['hs_bed_update']								= 'MasterRoomController/UpdateBedInformation';
$route['hs_bed_delete']								= 'MasterRoomController/DeleteBedInformation';


$route['hs_ward_type_list']							= 'HSHospitalsController/getWardTypeList';
$route['hs_ward_type_add']							= 'HSHospitalsController/AddWardTypeInfo';
$route['hs_ward_type_update']						= 'HSHospitalsController/UpdateWardTypeInfo';
$route['hs_ward_type_delete']						= 'HSHospitalsController/DeleteWardTypeInfo';

	

$route['hs_ward_list']								= 'HSHospitalsController/getWardList';
$route['hs_ward_add']								= 'HSHospitalsController/AddWardInformation';
$route['hs_ward_update']							= 'HSHospitalsController/UpdateWardInformation';
$route['hs_ward_delete']							= 'HSHospitalsController/DeleteWardInformation';







// $route['hs_doctors_list']							= 'HSDoctorsController/ManageDoctorList';
$route['hs_doctorsopt_list']						= 'HSDoctorsController/GetDoctorOptionList';
$route['hs_doctors_add']							= 'HSDoctorsController/AddDoctorInformation';
$route['hs_doctors_update']							= 'HSDoctorsController/UpdateDoctorInformation';
$route['hs_doctors_change_status']					= 'HSDoctorsController/changeDoctorStatus';
$route['hs_doctors_delete']							= 'HSDoctorsController/DeleteDoctorInformation';
$route['hs_doctor_access_get']						= 'HSDoctorsController/GetDoctorAccess';
$route['hs_doctor_access_update']					= 'HSDoctorsController/UpdateDoctorAccess';

$route['hs_staff_list']								= 'HSStaffController/ManageStaffList';
$route['hs_staffopt_list']							= 'HSStaffController/GetStaffOptionList';
$route['hs_staff_add']								= 'HSStaffController/AddStaffInformation';
$route['hs_staff_update']							= 'HSStaffController/UpdateStaffInformation';
$route['hs_staff_change_status']					= 'SAStaffController/changeStaffStatus';
$route['hs_staff_delete']							= 'SAStaffController/DeleteStaffInformation';
$route['hs_staff_access_get']						= 'HSStaffController/GetStaffAccess';
$route['hs_staff_access_update']					= 'HSStaffController/UpdateStaffAccess';

$route['hs_patients_list']					 = 'HSPatientController/ManagePatientList';
$route['hs_patients_add']					 = 'HSPatientController/AddPatientInformation';
$route['hs_patients_update']				 = 'HSPatientController/UpdatePatientInformation';
$route['hs_patients_details']				 = 'HSPatientController/getPatientDetails';
$route['hs_patients_visit_history'] = 'HSPatientController/getPatientVisitHistory';
$route['hs_patients_treatment_details'] = 'HSPatientController/getTreatment';
$route['ms_patients_change_status']		 = 'HSPatientController/changePatientStatus';
$route['hs_patients_change_status']		 = 'HSPatientController/DeletePatientInformation';

$route['hs_patient_info_share_create']      = 'HSPatientController/hs_patient_info_share_create';
$route['hs_patient_info_share_list']        = 'HSPatientController/hs_patient_info_share_list';
$route['hs_patient_info_share_revoke']      = 'HSPatientController/hs_patient_info_share_revoke';
$route['hs_patient_info_content_get']       = 'HSPatientController/hs_patient_info_content_get';
$route['hs_patient_info_content_update']    = 'HSPatientController/hs_patient_info_content_update';

// ------------------------------
// Hospital Medical Stores Routes
// ------------------------------
$route['hs_medical_store_list']           = 'HSHospitalMedicalSController/GetMedicalStoreList';
$route['hs_medical_store_add']            = 'HSHospitalMedicalSController/AddMedicalStoreInfo';
$route['hs_medical_store_update']         = 'HSHospitalMedicalSController/UpdateMedicalStoreInfo';
$route['hs_medical_store_change_status']  = 'HSHospitalMedicalSController/ChangeMedicalStoreStatus';
$route['hs_medical_store_delete']         = 'HSHospitalMedicalSController/DeleteMedicalStoreInfo';

// Medical inventory listing with available counts
$route['hs_medical_inventory_list']       = 'HSHospitalMedicalSController/GetMedicalInventoryList';


// HS Bed Permission & Patient Stays APIs
$route['hs_bed_permission_requests_list']           = 'HSHospitalsBedPermissionController/BedPermissionRequestsList';
$route['hs_bed_permission_approval_steps_list']     = 'HSHospitalsBedPermissionController/BedPermissionApprovalStepsList';
$route['hs_bed_permission_audit_logs_list']         = 'HSHospitalsBedPermissionController/BedPermissionAuditLogsList';
$route['hs_patient_stays_overview']                 = 'HSHospitalsBedPermissionController/PatientStaysOverview';
$route['hs_bed_permission_request_approve']         = 'HSHospitalsBedPermissionController/BedPermissionRequestApprove';
$route['hs_bed_permission_request_decline']         = 'HSHospitalsBedPermissionController/BedPermissionRequestDecline';



// Inventory products
$route['hs_inventory_product_list']                 = 'HSHospitalsInventoryController/GetIvProductList';
$route['hs_inventory_product_add']                  = 'HSHospitalsInventoryController/AddIvProductInformation';
// Inventory batches
$route['hs_inventory_batch_add']                    = 'HSHospitalsInventoryController/AddIvBatchInformation';
// Inventory overview (products with stock totals and batch details)
$route['hs_hospital_laboratory_preferred_list'] = 'HSHospitalsController/getPreferredLaboratories';
$route['hs_hospital_laboratory_available_list'] = 'HSHospitalsController/getAvailableLaboratories';
$route['hs_hospital_laboratory_add']            = 'HSHospitalsController/addPreferredLaboratory';
$route['hs_hospital_laboratory_remove']         = 'HSHospitalsController/removePreferredLaboratory';

$route['hs_inventory_overview_list']                = 'HSHospitalsInventoryController/GetIvInventoryOverview';


// ------------------------------
// Hospital Medical Requests & Receipts Routes
// ------------------------------
// Requests: list, create, details
$route['hs_medical_requests_list']                  = 'HSHospitalsInventoryController/GetMedicalRequestsList';
$route['hs_medical_request_create']                 = 'HSHospitalsInventoryController/CreateMedicalRequest';
$route['hs_medical_request_details']                = 'HSHospitalsInventoryController/GetMedicalRequestDetails';
// Approvals & allocations
$route['hs_medical_request_items_with_batches']     = 'HSHospitalsInventoryController/GetMedicalRequestItemsWithBatches';
$route['hs_medical_request_allocate_items']         = 'HSHospitalsInventoryController/AllocateMedicalRequestItems';
$route['hs_medical_request_approve']                = 'HSHospitalsInventoryController/ApproveMedicalRequest';
$route['hs_medical_request_decline']                = 'HSHospitalsInventoryController/DeclineMedicalRequest';
// Receipts: list & verification
$route['hs_medical_receipts_list']                  = 'HSHospitalsInventoryController/GetPendingReceiptsList';
$route['hs_medical_receipt_verify']                 = 'HSHospitalsInventoryController/ConfirmMedicalReceiptVerification';



// ------------------------------
// Public Home APIs (no auth)
// ------------------------------
$route['home_doctors_list']                         = 'PublicHomeController/GetHomeDoctorsList';
$route['check_user']                                = 'PublicHomeController/CheckUser';
$route['home_hospital_info']                        = 'PublicHomeController/GetHomeHospitalInfo';
$route['public_home_hospital_info']                 = 'PublicHomeController/GetHospitalByHosuid';
$route['home_submit_appointment']                   = 'PublicHomeController/SubmitAppointment';
$route['home_submit_patient']                       = 'PublicHomeController/SubmitPatientRegistration';
$route['home_chat']                                  = 'PublicHomeController/ChatAssistant';

// Add GET doctors API for frontend calls
$route['get_available_slots']                       = 'PublicHomeController/GetAvailableSlots';
$route['book_patient_appointment']                  = 'PublicHomeController/BookPatientAppointment';
$route['setup_patient_appointment']                 = 'PublicHomeController/InitPatientAppointmentSchema';
$route['get_doctors']                               = 'PublicHomeController/GetDoctors';
$route['get_appointment_details']                   = 'PublicHomeController/GetAppointmentDetails';
$route['cancel_appointment']                        = 'PublicHomeController/CancelAppointment';



// Staff-facing patient management routes (sf_staff)
$route['sf_staff_patients_list']			 = 'SFStaffPatientController/ManagePatientList';
$route['sf_staff_patients_add']			 = 'SFStaffPatientController/AddPatientInformation';
$route['sf_staff_patients_update']		 = 'SFStaffPatientController/UpdatePatientInformation';
$route['sf_staff_patients_change_status'] = 'SFStaffPatientController/changePatientStatus';
$route['sf_staff_patients_delete']		 = 'SFStaffPatientController/DeletePatientInformation';




$route['sf_staff_permissions']						= 'SFStaffController/getStaffPermissions';
$route['sf_staff_doctorList']						= 'SFStaffController/getDoctorList';
$route['sf_staff_saveDoctorSchedule']				= 'SFStaffController/saveDoctorSchedule';

$route['sf_staff_getDoctorSchedule']				= 'SFStaffController/getDoctorSchedule';
$route['sf_staff_getDoctorEventSchedule']			= 'SFStaffController/getDoctorEventSchedule';

$route['sf_staff_getShiftList']						= 'SFStaffController/getShiftList';
$route['sf_staff_getEventTypeList']					= 'SFStaffController/getEventTypeList';

$route['sf_staff_saveDoctorEventSchedule']			= 'SFStaffController/saveDoctorEventSchedule';

// Staff Patients List (encrypted)
$route['sf_staff_getPatientList']                  = 'SFStaffController/getPatientList';

// Staff Appointments by date (encrypted)
$route['sf_staff_getAppointmentsByDate']           = 'SFStaffController/getDoctorAppointmentsByDate';

// Staff Appointment Status updates (encrypted)
$route['sf_staff_updateAppointmentStatus']         = 'SFStaffController/updateAppointmentStatus';

// Staff Queue Positions update (encrypted)
$route['sf_staff_updateQueuePositions']            = 'SFStaffController/updateQueuePositions';

$route['sf_staff_getWardList']                      = 'MasterRoomDataController/getWardList';
$route['sf_staff_getRoomList']                      = 'MasterRoomDataController/getRoomList';
$route['sf_staff_getBedList']                       = 'MasterRoomDataController/getBedList';

$route['sf_doctors_option_list']                    = 'StaffMasterHelpController/getDoctorOptionList';
$route['sf_activity_option_list']                   = 'StaffMasterHelpController/getActivityOptionList';
$route['sf_patient_current_status_option_list']     = 'StaffMasterHelpController/getPatientCurrentStatusOptionList';
$route['sf_patients_list_search']     				= 'StaffMasterHelpController/getPatientsListSearch';

$route['sf_staff_bookBedForPatient']                = 'MasterRoomDataController/staffBookBedForPatient';
$route['sf_staff_changePatientBed']                 = 'MasterRoomDataController/staffBookBedTransferForPatient';

// ------------------------------
// Doctor Self Routes (encrypted)
// ------------------------------
$route['dc_doctor_getLoggedInProfile']          = 'SFDoctorController/getLoggedInDoctorProfile';
$route['dc_doctor_getEventSchedule']            = 'SFDoctorController/getMyEventSchedule';
$route['dc_doctor_getAppointmentsByDate']           = 'SFDoctorController/getMyAppointmentsByDate';
 $route['dc_doctor_getTodaysAppointmentsGrouped']    = 'SFDoctorController/getMyTodaysAppointmentsGrouped';
 $route['dc_doctor_getUpcomingAppointments']         = 'SFDoctorController/getMyUpcomingAppointments';
$route['dc_doctor_getDiagnosisSuggestions']         = 'SFDoctorController/getDiagnosisSuggestions';
$route['dc_doctor_getDiagnosisAISuggestions']       = 'SFDoctorController/getDiagnosisAISuggestions';

$route['dc_doctor_getMedicationAISuggestions']      = 'SFDoctorController/getMedicationAISuggestions';


$route['dc_doctor_getMedicationSuggestions']        = 'SFDoctorController/getMedicationSuggestions';
$route['dc_doctor_getLabTestAISuggestions']         = 'SFDoctorController/getLabTestAISuggestions';
$route['dc_doctor_getLabTestSuggestions']           = 'SFDoctorController/getLabTestSuggestions';
$route['dc_doctor_getProcedureAISuggestions']       = 'SFDoctorController/getProcedureAISuggestions';
$route['dc_doctor_getProcedureSuggestions']         = 'SFDoctorController/getProcedureSuggestions';

$route['dc_doctor_getPatientHistoryCategories']     = 'SFDoctorController/getPatientHistoryCategories';

// Doctor Profile Routes
$route['doctor_profile_get'] = 'DoctorProfileController/get_profile';
$route['doctor_profile_update'] = 'DoctorProfileController/update_profile';
$route['dc_doctor_getCommonComplaintsGrouped']      = 'SFDoctorController/getCommonComplaintsGrouped';
$route['dc_doctor_getMedicationUnitSuggestions']    = 'SFDoctorController/getMedicationUnitSuggestions';

// Patient view endpoints
$route['dc_doctor_getPatientDetails']               = 'SFDoctorController/getPatientDetails';
$route['dc_doctor_getPatientVisitHistory']          = 'SFDoctorController/getPatientVisitHistory';
$route['dc_doctor_getMedicationFrequencySuggestions'] = 'SFDoctorController/getMedicationFrequencySuggestions';
$route['dc_doctor_getMedicationDurationSuggestions']  = 'SFDoctorController/getMedicationDurationSuggestions';

// Combined suggestions by diagnosis (lab tests + medications)
$route['dc_doctor_getTreatmentSuggestionsByDiagnosis'] = 'SFDoctorController/getTreatmentSuggestionsByDiagnosis';


$route['dc_doctor_getReceiptTemplates'] = 'SFDoctorController/getReceiptTemplates';
$route['dc_doctor_set_defaultReceipt'] = 'SFDoctorController/setDefaultReceipt';

//$route['dc_doctor_getAppointmentsByDate']           = 'SFDoctorController/getDoctorAppointmentsByDate';
$route['dc_doctor_updateAppointmentStatus']         = 'SFDoctorController/updateAppointmentStatus';
$route['dc_doctor_updateQueuePositions']            = 'SFDoctorController/updateQueuePositions';
$route['dc_doctor_getPatientList']                  = 'SFDoctorController/getPatientList';
$route['dc_doctor_getAppointmentDetails']           = 'SFDoctorController/GetAppointmentDetails';

// ------------------------------
// Hospital Treatment Masters Routes (encrypted)
// ------------------------------
$route['hs_treatment_diagnosis_list']               = 'MasterTreatmentController/getDiagnosisList';
$route['hs_treatment_diagnosis_add']                = 'MasterTreatmentController/AddDiagnosisInfo';
$route['hs_treatment_diagnosis_update']             = 'MasterTreatmentController/UpdateDiagnosisInfo';
$route['hs_treatment_diagnosis_delete']             = 'MasterTreatmentController/DeleteDiagnosisInfo';

$route['hs_treatment_medication_name_list']         = 'MasterTreatmentController/getMedicationNameList';
$route['hs_treatment_medication_name_add']          = 'MasterTreatmentController/AddMedicationNameInfo';
$route['hs_treatment_medication_name_update']       = 'MasterTreatmentController/UpdateMedicationNameInfo';
$route['hs_treatment_medication_name_delete']       = 'MasterTreatmentController/DeleteMedicationNameInfo';

$route['hs_treatment_medication_unit_list']         = 'MasterTreatmentController/getMedicationUnitList';
$route['hs_treatment_medication_unit_add']          = 'MasterTreatmentController/AddMedicationUnitInfo';
$route['hs_treatment_medication_unit_update']       = 'MasterTreatmentController/UpdateMedicationUnitInfo';
$route['hs_treatment_medication_unit_delete']       = 'MasterTreatmentController/DeleteMedicationUnitInfo';

$route['hs_treatment_medication_frequency_list']    = 'MasterTreatmentController/getMedicationFrequencyList';        
$route['hs_treatment_medication_frequency_add']     = 'MasterTreatmentController/AddMedicationFrequencyInfo';        
$route['hs_treatment_medication_frequency_update']  = 'MasterTreatmentController/UpdateMedicationFrequencyInfo';     
$route['hs_treatment_medication_frequency_delete']  = 'MasterTreatmentController/DeleteMedicationFrequencyInfo';     

$route['hs_treatment_medication_duration_list']     = 'MasterTreatmentController/getMedicationDurationList';
$route['hs_treatment_medication_duration_add']      = 'MasterTreatmentController/AddMedicationDurationInfo';
$route['hs_treatment_medication_duration_update']   = 'MasterTreatmentController/UpdateMedicationDurationInfo';      
$route['hs_treatment_medication_duration_delete']   = 'MasterTreatmentController/DeleteMedicationDurationInfo';      

$route['hs_treatment_lab_tests_list']               = 'MasterTreatmentController/getLabTestsList';
$route['hs_treatment_lab_tests_clone']              = 'MasterTreatmentController/cloneLabTests';
$route['hs_treatment_master_catalog']               = 'MasterTreatmentController/getMasterCatalog';
$route['hs_treatment_lab_tests_add']                = 'MasterTreatmentController/AddLabTestsInfo';
$route['hs_treatment_lab_tests_update']             = 'MasterTreatmentController/UpdateLabTestsInfo';
$route['hs_treatment_lab_tests_delete']             = 'MasterTreatmentController/DeleteLabTestsInfo';

$route['dc_doctor_uploadSharedReceipt']                 = 'SFDoctorController/upload_shared_receipt';
$route['shared/receipt/file/(:any)']                    = 'SharedReceiptController/view_file/$1';
$route['shared/receipt/verify']                         = 'SharedReceiptController/verify_password';
$route['shared/receipt/(:any)']                         = 'SharedReceiptController/view/$1';

$route['hs_treatment_procedure_list']               = 'MasterTreatmentController/getProcedureList';
$route['hs_treatment_procedure_add']                = 'MasterTreatmentController/AddProcedureInfo';
$route['hs_treatment_procedure_update']             = 'MasterTreatmentController/UpdateProcedureInfo';
$route['hs_treatment_procedure_delete']             = 'MasterTreatmentController/DeleteProcedureInfo';

$route['patient_treatment_save'] = 'PatientTreatmentController/save_treatment';
$route['patient_treatment_get'] = 'PatientTreatmentController/get_treatment';
$route['patient_treatment_lab_report'] = 'PatientTreatmentController/get_lab_report_view';
$route['patient_treatment_upload_report'] = 'PatientTreatmentController/upload_report';
$route['patient_treatment_delete_report'] = 'PatientTreatmentController/delete_report';


$route['dc_doctor_getReceiptContent'] = 'SFDoctorController/get_receipt_content';
$route['dc_doctor_updateReceiptContent'] = 'SFDoctorController/update_receipt_content';




// Master Lab Test Routes
$route['laboratories_lab_test_list']                            = 'LaboratoriesController/MasterLabTestList';
$route['laboratories_testinfo_get']                             = 'LaboratoriesController/GetLabTestInformation';
$route['laboratories_testInfo_add']                             = 'LaboratoriesController/AddLabTestInformation';
$route['laboratories_testInfo_update']                          = 'LaboratoriesController/UpdateLabTestInformation';
$route['laboratories_testInfo_delete']                          = 'LaboratoriesController/DeleteLabTestInfo';
$route['laboratories_master_catalog']                           = 'LaboratoriesController/GetMasterCatalog'; 
$route['laboratories_clone_master']                             = 'LaboratoriesController/CloneMasterTests';
$route['laboratories_recent_orders']                            = 'LaboratoriesController/get_recent_orders';
$route['laboratories_all_orders']                               = 'LaboratoriesController/get_all_orders';
$route['laboratories_dashboard_stats']                          = 'LaboratoriesController/get_dashboard_stats';

// Hospital Preferred Laboratory Routes
$route['hs_hospital_laboratory_preferred_list'] = 'HSHospitalLaboratoryController/GetPreferredLaboratories';
$route['hs_hospital_laboratory_available_list'] = 'HSHospitalLaboratoryController/GetAvailableLaboratories';
$route['hs_hospital_laboratory_add']            = 'HSHospitalLaboratoryController/AddPreferredLaboratory';
$route['hs_hospital_laboratory_remove']         = 'HSHospitalLaboratoryController/RemovePreferredLaboratory';

// Lab Packages Routes
$route['lab_packages_list'] = 'LabPackagesController/listPackages';
$route['lab_packages_add'] = 'LabPackagesController/addPackage';
$route['lab_packages_update'] = 'LabPackagesController/updatePackage';
$route['lab_packages_delete'] = 'LabPackagesController/deletePackage';
$route['lab_packages_get'] = 'LabPackagesController/getPackage';
