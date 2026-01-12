<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class AdmCommonController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);
        date_default_timezone_set('Asia/Kolkata');

        $this->load->model('AdmAuthAdmModel');
        $this->load->helper('verifyAuthToken');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
    }

    // ✅ Get States List
    public function getStateList() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            // Verify token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            // Fetch from DB
            $query = $this->db->select("stateId, stateName, stateCode, shortCode, countryId, countryName")
                              ->from("ms_state")
                              ->order_by("stateName", "ASC")
                              ->get();

            $states = $query->result_array();

            echo json_encode([
                "success" => true,
                "data" => $states
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    // ✅ Get Cities by State
    public function getCityList() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            // Verify token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            // Read body
            $rawInput = file_get_contents("php://input");
            $data = json_decode($rawInput, true);
            $stateId = isset($data['state_id']) ? intval($data['state_id']) : 0;

            if ($stateId <= 0) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid state_id"
                ]);
                return;
            }

            // Fetch from DB
            $query = $this->db->select("cityId, cityName, cityCode, pincode, phoneCode, stateId")
                              ->from("ms_city")
                              ->where("stateId", $stateId)
                              ->order_by("cityName", "ASC")
                              ->get();

            $cities = $query->result_array();

            echo json_encode([
                "success" => true,
                "data" => $cities
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }



    // ✅ Get Staff Role List
    public function getStaffRoleList() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            // Verify token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            // Fetch from DB
            $query = $this->db->select("roleId, roleName, roleDescription, status")
                              ->from("ms_staff_role")
                              ->order_by("roleName", "ASC")
                              ->get();

            $roles = $query->result_array();

            echo json_encode([
                "success" => true,
                "data" => $roles
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    // ✅ Get Departments List
    public function getDepartmentsList() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            // Verify token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            // Fetch from DB
            $query = $this->db->select("departmentId, departmentName, departmentDescription, status")
                              ->from("ms_staff_department")
                              ->order_by("departmentName", "ASC")
                              ->get();

            $departments = $query->result_array();

            echo json_encode([
                "success" => true,
                "data" => $departments
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }


}
