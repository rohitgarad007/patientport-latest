<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class SALaboratoriesController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);
        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('AdmCommonModel');
        $this->load->helper('verifyAuthToken');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header('Content-Type: application/json');
    }

    public function ManageLaboratoryList() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode(["success" => false, "message" => "Invalid or missing payload"]);
                return;
            }

            $limitValue = isset($rawData['limit']) ? (int)$rawData['limit'] : 10;
            $page = isset($rawData['page']) ? (int)$rawData['page'] : 1;
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';
            $offsetValue = ($page - 1) * $limitValue;

            $total = $this->AdmCommonModel->get_laboratoryCount($search);
            $totalRows = $total['total'] ?? 0;
            $labList = $this->AdmCommonModel->get_laboratoryList($search, $limitValue, $offsetValue);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($labList['data']), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "total"   => $totalRows,
                "page"    => $page,
                "limit"   => $limitValue
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function AddLaboratory() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $decodedToken = verifyAuthToken($token);
            if (!$decodedToken) throw new Exception("Unauthorized");
            $tokenData = is_string($decodedToken) ? json_decode($decodedToken, true) : $decodedToken;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode(["success" => false, "message" => "Invalid or missing payload"]);
                return;
            }

            $required = ['name','registration_number','email','phone','state','city','address'];
            foreach ($required as $field) {
                if (empty($rawData[$field])) {
                    echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
                    return;
                }
            }

            $AES_KEY = "RohitGaradHos@173414";
            $decrypt = function($key) use ($rawData, $AES_KEY) {
                return isset($rawData[$key]) ? trim($this->decrypt_aes_from_js($rawData[$key], $AES_KEY)) : '';
            };

            $name                = $decrypt('name');
            $registration_number = $decrypt('registration_number');
            $email               = $decrypt('email');
            $password            = $decrypt('password') ?: "india@1234";
            $phone               = $decrypt('phone');
            $website_url         = $decrypt('website_url');
            $gst_number          = $decrypt('gst_number');
            $address             = $decrypt('address');
            $city                = $decrypt('city');
            $state               = $decrypt('state');

            // Unique email check
            $this->db->where("email", $email);
            $exists = $this->db->get("lb_laboratorys")->row();
            if ($exists) {
                echo json_encode(["success" => false, "message" => "Email ID already exists"]);
                return;
            }

            $labData = [
                'labuid'              => uniqid('LAB_'),
                'name'                => $name,
                'registration_number' => $registration_number,
                'email'               => $email,
                'password'            => md5($password),
                'phone'               => $phone,
                'website_url'         => $website_url,
                'gst_number'          => $gst_number,
                'address'             => $address,
                'city'                => $city,
                'state'               => $state,
                'status'              => 1,
                'isdelete'            => 0,
                'created_by'          => $muid,
                'created_at'          => date('Y-m-d H:i:s')
            ];

            $insertId = $this->AdmCommonModel->insertLaboratory($labData);
            if ($insertId) {
                echo json_encode(["success" => true, "message" => "Laboratory added successfully", "laboratory_id" => $insertId]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to add laboratory"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }

    public function UpdateLaboratory() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $decodedToken = verifyAuthToken($token);
            if (!$decodedToken) throw new Exception("Unauthorized");
            $tokenData = is_string($decodedToken) ? json_decode($decodedToken, true) : $decodedToken;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData) || empty($rawData['id'])) {
                echo json_encode(["success" => false, "message" => "Missing laboratory ID"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $decrypt = function($key) use ($rawData, $AES_KEY) {
                return isset($rawData[$key]) ? trim($this->decrypt_aes_from_js($rawData[$key], $AES_KEY)) : '';
            };

            $labData = [
                'name'                => $decrypt('name'),
                'registration_number' => $decrypt('registration_number'),
                'phone'               => $decrypt('phone'),
                'website_url'         => $decrypt('website_url'),
                'gst_number'          => $decrypt('gst_number'),
                'address'             => $decrypt('address'),
                'city'                => $decrypt('city'),
                'state'               => $decrypt('state'),
                'updated_by'          => $muid,
                'updated_at'          => date('Y-m-d H:i:s')
            ];

            $password = $decrypt('password');
            if (!empty($password)) {
                $labData['password'] = md5($password);
            }

            $update = $this->AdmCommonModel->updateLaboratory($rawData['id'], $labData);
            if ($update) {
                echo json_encode(["success" => true, "message" => "Laboratory updated successfully", "laboratory_id" => $rawData['id']]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update laboratory"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }

    public function changeLaboratoryStatus() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $tokenData = verifyAuthToken($token);
            if (!$tokenData) throw new Exception("Unauthorized");
            $tokenData = is_string($tokenData) ? json_decode($tokenData, true) : $tokenData;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!isset($rawData['id'], $rawData['status'])) {
                echo json_encode(["success" => false, "message" => "Missing laboratory ID or status"]);
                return;
            }

            $labuid = $rawData['id'];
            $status = $rawData['status'] === "active" ? "1" : "0";
            $update = $this->AdmCommonModel->updateLaboratoryStatus($labuid, $status);

            if ($update) {
                echo json_encode(["success" => true, "message" => "Laboratory status updated successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update laboratory status"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function DeleteLaboratory() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $decodedToken = verifyAuthToken($token);
            if (!$decodedToken) throw new Exception("Unauthorized");
            $tokenData = is_string($decodedToken) ? json_decode($decodedToken, true) : $decodedToken;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !isset($rawData['id'])) {
                echo json_encode(["success" => false, "message" => "Missing laboratory ID"]);
                return;
            }

            $labuid = $rawData['id'];
            $updateData = [
                'isdelete' => 1,
                'updated_by' => $muid,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            $update = $this->AdmCommonModel->updateLaboratory($labuid, $updateData);

            if ($update) {
                echo json_encode(["success" => true, "message" => "Laboratory deleted successfully", "laboratory_id" => $labuid]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to delete laboratory"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }

    // --- Laboratory Staff Management ---

    public function ManageLaboratoryStaffList() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode(["success" => false, "message" => "Invalid or missing payload"]);
                return;
            }

            $limitValue = isset($rawData['limit']) ? (int)$rawData['limit'] : 10;
            $page = isset($rawData['page']) ? (int)$rawData['page'] : 1;
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';
            $offsetValue = ($page - 1) * $limitValue;

            $total = $this->AdmCommonModel->get_laboratoryStaffCount($search);
            $totalRows = $total['total'] ?? 0;
            $staffList = $this->AdmCommonModel->get_laboratoryStaffList($search, $limitValue, $offsetValue);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($staffList['data']), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "total"   => $totalRows,
                "page"    => $page,
                "limit"   => $limitValue
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function AddLaboratoryStaff() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $decodedToken = verifyAuthToken($token);
            if (!$decodedToken) throw new Exception("Unauthorized");
            $tokenData = is_string($decodedToken) ? json_decode($decodedToken, true) : $decodedToken;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode(["success" => false, "message" => "Invalid or missing payload"]);
                return;
            }

            $required = ['lab_id', 'name', 'email', 'phone', 'role'];
            foreach ($required as $field) {
                if (empty($rawData[$field])) {
                    echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
                    return;
                }
            }

            $AES_KEY = "RohitGaradHos@173414";
            $decrypt = function($key) use ($rawData, $AES_KEY) {
                return isset($rawData[$key]) ? trim($this->decrypt_aes_from_js($rawData[$key], $AES_KEY)) : '';
            };

            $lab_id   = $decrypt('lab_id');
            $name     = $decrypt('name');
            $email    = $decrypt('email');
            $password = $decrypt('password') ?: "staff@1234";
            $phone    = $decrypt('phone');
            $role     = $decrypt('role');

            // Unique email check
            $this->db->where("email", $email);
            $exists = $this->db->get("lb_laboratory_staff")->row();
            if ($exists) {
                echo json_encode(["success" => false, "message" => "Email ID already exists"]);
                return;
            }

            $staffData = [
                'staff_uid'  => uniqid('STF_'),
                'lab_id'     => $lab_id,
                'name'       => $name,
                'email'      => $email,
                'password'   => md5($password),
                'phone'      => $phone,
                'role'       => $role,
                'status'     => 'active',
                'isdelete'   => 0,
                'created_by' => $muid,
                'created_at' => date('Y-m-d H:i:s')
            ];

            $insertId = $this->AdmCommonModel->insertLaboratoryStaff($staffData);
            if ($insertId) {
                echo json_encode(["success" => true, "message" => "Staff added successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to add staff"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }

    public function UpdateLaboratoryStaff() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $decodedToken = verifyAuthToken($token);
            if (!$decodedToken) throw new Exception("Unauthorized");
            $tokenData = is_string($decodedToken) ? json_decode($decodedToken, true) : $decodedToken;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData) || empty($rawData['id'])) {
                echo json_encode(["success" => false, "message" => "Missing staff ID"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $decrypt = function($key) use ($rawData, $AES_KEY) {
                return isset($rawData[$key]) ? trim($this->decrypt_aes_from_js($rawData[$key], $AES_KEY)) : '';
            };

            $staffData = [
                'lab_id'     => $decrypt('lab_id'),
                'name'       => $decrypt('name'),
                'phone'      => $decrypt('phone'),
                'role'       => $decrypt('role'),
                'updated_by' => $muid,
                'updated_at' => date('Y-m-d H:i:s')
            ];

            $password = $decrypt('password');
            if (!empty($password)) {
                $staffData['password'] = md5($password);
            }

            $update = $this->AdmCommonModel->updateLaboratoryStaff($rawData['id'], $staffData); // id is staff_uid here
            if ($update) {
                echo json_encode(["success" => true, "message" => "Staff updated successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update staff"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }

    public function changeLaboratoryStaffStatus() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $tokenData = verifyAuthToken($token);
            if (!$tokenData) throw new Exception("Unauthorized");
            $tokenData = is_string($tokenData) ? json_decode($tokenData, true) : $tokenData;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!isset($rawData['id'], $rawData['status'])) {
                echo json_encode(["success" => false, "message" => "Missing staff ID or status"]);
                return;
            }

            $staffuid = $rawData['id'];
            $status = $rawData['status'] === "active" ? "active" : "inactive";
            $update = $this->AdmCommonModel->updateLaboratoryStaffStatus($staffuid, $status);

            if ($update) {
                echo json_encode(["success" => true, "message" => "Staff status updated successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update staff status"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function DeleteLaboratoryStaff() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $decodedToken = verifyAuthToken($token);
            if (!$decodedToken) throw new Exception("Unauthorized");
            $tokenData = is_string($decodedToken) ? json_decode($decodedToken, true) : $decodedToken;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !isset($rawData['id'])) {
                echo json_encode(["success" => false, "message" => "Missing staff ID"]);
                return;
            }

            $staffuid = $rawData['id'];
            $updateData = [
                'isdelete' => 1,
                'updated_by' => $muid,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            $update = $this->AdmCommonModel->updateLaboratoryStaff($staffuid, $updateData);

            if ($update) {
                echo json_encode(["success" => true, "message" => "Staff deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to delete staff"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }

    public function GetActiveLaboratories() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $tokenData = verifyAuthToken($token);
            if (!$tokenData) throw new Exception("Unauthorized");
            
            $labs = $this->AdmCommonModel->getActiveLaboratories();
            echo json_encode(["success" => true, "data" => $labs]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }

    // ==========================================
    // Master Lab Tests Management
    // ==========================================

    public function MasterLabTestList() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            $limitValue = isset($rawData['limit']) ? (int)$rawData['limit'] : 10;
            $page = isset($rawData['page']) ? (int)$rawData['page'] : 1;
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';
            $department = isset($rawData['department']) ? $rawData['department'] : 'all';
            $status = isset($rawData['status']) ? $rawData['status'] : 'all';
            $offsetValue = ($page - 1) * $limitValue;

            $total = $this->AdmCommonModel->get_masterLabTestCount($search, $department, $status);
            $totalRows = $total['total'] ?? 0;
            $list = $this->AdmCommonModel->get_masterLabTestList($search, $limitValue, $offsetValue, $department, $status);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($list['data']), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "total"   => $totalRows,
                "page"    => $page,
                "limit"   => $limitValue
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function GetMasterLabTest() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            $id = $rawData['id'] ?? null;
            if (!$id) {
                echo json_encode(["success" => false, "message" => "Missing ID"]);
                return;
            }

            $data = $this->AdmCommonModel->getMasterLabTestById($id);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($data), $AES_KEY);

            echo json_encode(["success" => true, "data" => $encryptedData]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function AddMasterLabTest() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!isset($rawData['encrypted_payload'])) {
                echo json_encode(["success" => false, "message" => "Missing payload"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $decryptedJson = $this->decrypt_aes_from_js($rawData['encrypted_payload'], $AES_KEY);
            $data = json_decode($decryptedJson, true);

            if (!$data) {
                echo json_encode(["success" => false, "message" => "Invalid encrypted payload"]);
                return;
            }

            $result = $this->AdmCommonModel->insertMasterLabTestFull($data);
            if ($result) {
                echo json_encode(["success" => true, "message" => "Test added successfully", "id" => $result]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to add test"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function UpdateMasterLabTest() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!isset($rawData['encrypted_payload'])) {
                echo json_encode(["success" => false, "message" => "Missing payload"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $decryptedJson = $this->decrypt_aes_from_js($rawData['encrypted_payload'], $AES_KEY);
            $data = json_decode($decryptedJson, true);

            if (!$data || !isset($data['id'])) {
                echo json_encode(["success" => false, "message" => "Invalid payload or missing ID"]);
                return;
            }

            $result = $this->AdmCommonModel->updateMasterLabTestFull($data['id'], $data);
            if ($result) {
                echo json_encode(["success" => true, "message" => "Test updated successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update test"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function DeleteMasterLabTest() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;
            if (!$muid || $mrole !== "super_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!isset($rawData['id'])) {
                echo json_encode(["success" => false, "message" => "Missing ID"]);
                return;
            }

            $result = $this->AdmCommonModel->deleteMasterLabTest($rawData['id']);
            if ($result) {
                echo json_encode(["success" => true, "message" => "Test deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to delete test"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function encrypt_aes_for_js($plainText, $passphrase) {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = 'Salted__' . $salt;
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $encrypted = openssl_encrypt($plainText, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        return base64_encode($salted . $encrypted);
    }

    public function openssl_EVP_BytesToKey($passphrase, $salt, $keyLen, $ivLen) {
        $dtot = '';
        $d = '';
        while (strlen($dtot) < ($keyLen + $ivLen)) {
            $d = md5($d . $passphrase . $salt, true);
            $dtot .= $d;
        }
        return ['key' => substr($dtot, 0, $keyLen), 'iv' => substr($dtot, $keyLen, $ivLen)];
    }

    public function decrypt_aes_from_js($cipherTextBase64, $passphrase) {
        $cipherText = base64_decode($cipherTextBase64);
        if (!$cipherText || strlen($cipherText) < 16) {
            return "Base64 decode failed or too short";
        }
        $saltHeader = substr($cipherText, 0, 8);
        if (strncmp($saltHeader, "Salted__", 8) !== 0) {
            return "Invalid salt header";
        }
        $salt = substr($cipherText, 8, 8);
        $cipherRaw = substr($cipherText, 16);
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $decrypted = openssl_decrypt($cipherRaw, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        if ($decrypted === false) {
            return "Decryption failed";
        }
        return $decrypted;
    }
}
