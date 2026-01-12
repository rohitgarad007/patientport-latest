<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class MasterTreatmentController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('HospitalCommonModel');
        $this->load->helper('verifyAuthToken');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header('Content-Type: application/json');
    }

    // AES helpers (same as other controllers)
    public function encrypt_aes_for_js($plainText, $passphrase) {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = '';
        $dx = '';
        while (strlen($salted) < 48) { // 32 for key, 16 for iv
            $dx = md5($dx . $passphrase . $salt, true);
            $salted .= $dx;
        }
        $key = substr($salted, 0, 32);
        $iv  = substr($salted, 32, 16);
        $encryptedData = openssl_encrypt($plainText, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
        return base64_encode('Salted__' . $salt . $encryptedData);
    }
    public function decrypt_aes_from_js($cipherTextBase64, $passphrase) {
        $data = base64_decode($cipherTextBase64);
        $saltHeader = substr($data, 0, 8);
        if ($saltHeader !== 'Salted__') return '';
        $salt = substr($data, 8, 8);
        $ct = substr($data, 16);
        $salted = '';
        $dx = '';
        while (strlen($salted) < 48) {
            $dx = md5($dx . $passphrase . $salt, true);
            $salted .= $dx;
        }
        $key = substr($salted, 0, 32);
        $iv  = substr($salted, 32, 16);
        $decrypted = openssl_decrypt($ct, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
        return $decrypted !== false ? $decrypted : '';
    }

    // Generic list handler
    private function handleList($table){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            // Resolve login hospital info (hospital_id integer)
            $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$hosInfo || empty($hosInfo['id'])) {
                echo json_encode(["success"=>false, "message"=>"Hospital information not found"]);
                return;
            }
            $hospital_id = intval($hosInfo['id']);
            $raw = json_decode(file_get_contents("php://input"), true);
            if (!$raw || !is_array($raw)) { $raw = []; }
            $pageEnc = $raw['page'] ?? '';
            $limitEnc = $raw['limit'] ?? '';
            $searchEnc = $raw['search'] ?? '';
            $page = $pageEnc ? intval($this->decrypt_aes_from_js($pageEnc, $AES_KEY)) : 1;
            $limit = $limitEnc ? intval($this->decrypt_aes_from_js($limitEnc, $AES_KEY)) : 10;
            $search = $searchEnc ? trim($this->decrypt_aes_from_js($searchEnc, $AES_KEY)) : '';
            if ($page < 1) $page = 1;
            if ($limit < 1) $limit = 10;
            $offset = ($page - 1) * $limit;

            $this->db->from($table);
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);
            if ($search !== '') {
                $this->db->group_start();
                $this->db->like('name', $search);
                $this->db->or_like('description', $search);
                $this->db->group_end();
            }
            $total = $this->db->count_all_results('', false);
            $this->db->order_by('updated_at', 'DESC');
            $this->db->limit($limit, $offset);
            $rows = $this->db->get()->result_array();

            $payload = json_encode([
                'items' => $rows,
                'total' => $total,
                'page'  => $page,
                'limit' => $limit,
            ]);
            $encryptedData = $this->encrypt_aes_for_js($payload, $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // Generic add handler
    private function handleAdd($table){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }
            $AES_KEY = "RohitGaradHos@173414";
            // Resolve login hospital info (hospital_id integer)
            $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$hosInfo || empty($hosInfo['id'])) {
                echo json_encode(["success"=>false, "message"=>"Hospital information not found"]);
                return;
            }
            $hospital_id = intval($hosInfo['id']);
            $raw = json_decode(file_get_contents("php://input"), true);
            if (!$raw || !is_array($raw)) { echo json_encode(["success"=>false, "message"=>"Invalid payload"]); return; }
            $name = isset($raw['name']) ? trim($this->decrypt_aes_from_js($raw['name'], $AES_KEY)) : '';
            $description = isset($raw['description']) ? trim($this->decrypt_aes_from_js($raw['description'], $AES_KEY)) : '';
            $statusRaw = isset($raw['status']) ? trim($this->decrypt_aes_from_js($raw['status'], $AES_KEY)) : '1';
            if ($name === '') { echo json_encode(["success"=>false, "message"=>"Missing name"]); return; }
            $status = ($statusRaw === 'active' || $statusRaw === '1') ? 1 : 0;
            $insert = [
                'hospital_id' => $hospital_id,
                'name'        => $name,
                'description' => $description,
                'status'      => $status,
                'isdelete'    => 0,
                'created_by'  => $hospital_id,
                'updated_by'  => $hospital_id,
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ];
            $ok = $this->db->insert($table, $insert);
            echo json_encode(["success" => $ok ? true : false, "message" => $ok ? "Added successfully" : "Failed to add"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // Generic update handler
    private function handleUpdate($table){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }
            $AES_KEY = "RohitGaradHos@173414";
            // Resolve login hospital info (hospital_id integer)
            $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$hosInfo || empty($hosInfo['id'])) {
                echo json_encode(["success"=>false, "message"=>"Hospital information not found"]);
                return;
            }
            $hospital_id = intval($hosInfo['id']);
            $raw = json_decode(file_get_contents("php://input"), true);
            if (!$raw || !is_array($raw)) { echo json_encode(["success"=>false, "message"=>"Invalid payload"]); return; }
            $idEnc = $raw['id'] ?? '';
            $id = $idEnc ? intval($this->decrypt_aes_from_js($idEnc, $AES_KEY)) : 0;
            if ($id <= 0) { echo json_encode(["success"=>false, "message"=>"Invalid id"]); return; }
            $name = isset($raw['name']) ? trim($this->decrypt_aes_from_js($raw['name'], $AES_KEY)) : '';
            $description = isset($raw['description']) ? trim($this->decrypt_aes_from_js($raw['description'], $AES_KEY)) : '';
            $statusRaw = isset($raw['status']) ? trim($this->decrypt_aes_from_js($raw['status'], $AES_KEY)) : '1';
            $status = ($statusRaw === 'active' || $statusRaw === '1') ? 1 : 0;
            $update = [
                'name'        => $name,
                'description' => $description,
                'status'      => $status,
                'updated_by'  => $hospital_id,
                'updated_at'  => date('Y-m-d H:i:s'),
            ];
            $this->db->where('id', $id);
            $this->db->where('hospital_id', $hospital_id);
            $ok = $this->db->update($table, $update);
            echo json_encode(["success" => $ok ? true : false, "message" => $ok ? "Updated successfully" : "Failed to update"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // Generic delete handler (soft delete)
    private function handleDelete($table){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }
            $AES_KEY = "RohitGaradHos@173414";
            // Resolve login hospital info (hospital_id integer)
            $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$hosInfo || empty($hosInfo['id'])) {
                echo json_encode(["success"=>false, "message"=>"Hospital information not found"]);
                return;
            }
            $hospital_id = intval($hosInfo['id']);
            $raw = json_decode(file_get_contents("php://input"), true);
            if (!$raw || !is_array($raw)) { echo json_encode(["success"=>false, "message"=>"Invalid payload"]); return; }
            $idEnc = $raw['id'] ?? '';
            $id = $idEnc ? intval($this->decrypt_aes_from_js($idEnc, $AES_KEY)) : 0;
            if ($id <= 0) { echo json_encode(["success"=>false, "message"=>"Invalid id"]); return; }
            $this->db->where('id', $id);
            $this->db->where('hospital_id', $hospital_id);
            $ok = $this->db->update($table, [ 'isdelete' => 1, 'updated_by' => $hospital_id, 'updated_at' => date('Y-m-d H:i:s') ]);
            echo json_encode(["success" => $ok ? true : false, "message" => $ok ? "Deleted successfully" : "Failed to delete"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // ===== Entity endpoints (Diagnosis, Medication Name, Unit, Frequency, Duration, Lab Tests, Procedure)
    public function getDiagnosisList(){ $this->handleList('ms_hospitals_treatment_diagnosis'); }
    public function AddDiagnosisInfo(){ $this->handleAdd('ms_hospitals_treatment_diagnosis'); }
    public function UpdateDiagnosisInfo(){ $this->handleUpdate('ms_hospitals_treatment_diagnosis'); }
    public function DeleteDiagnosisInfo(){ $this->handleDelete('ms_hospitals_treatment_diagnosis'); }

    public function getMedicationNameList(){ $this->handleList('ms_hospitals_medication_name'); }
    public function AddMedicationNameInfo(){ $this->handleAdd('ms_hospitals_medication_name'); }
    public function UpdateMedicationNameInfo(){ $this->handleUpdate('ms_hospitals_medication_name'); }
    public function DeleteMedicationNameInfo(){ $this->handleDelete('ms_hospitals_medication_name'); }

    public function getMedicationUnitList(){ $this->handleList('ms_hospitals_medication_unit'); }
    public function AddMedicationUnitInfo(){ $this->handleAdd('ms_hospitals_medication_unit'); }
    public function UpdateMedicationUnitInfo(){ $this->handleUpdate('ms_hospitals_medication_unit'); }
    public function DeleteMedicationUnitInfo(){ $this->handleDelete('ms_hospitals_medication_unit'); }

    public function getMedicationFrequencyList(){ $this->handleList('ms_hospitals_medication_frequency'); }
    public function AddMedicationFrequencyInfo(){ $this->handleAdd('ms_hospitals_medication_frequency'); }
    public function UpdateMedicationFrequencyInfo(){ $this->handleUpdate('ms_hospitals_medication_frequency'); }
    public function DeleteMedicationFrequencyInfo(){ $this->handleDelete('ms_hospitals_medication_frequency'); }

    public function getMedicationDurationList(){ $this->handleList('ms_hospitals_medication_duration'); }
    public function AddMedicationDurationInfo(){ $this->handleAdd('ms_hospitals_medication_duration'); }
    public function UpdateMedicationDurationInfo(){ $this->handleUpdate('ms_hospitals_medication_duration'); }
    public function DeleteMedicationDurationInfo(){ $this->handleDelete('ms_hospitals_medication_duration'); }

    public function getLabTestsList(){ $this->handleList('ms_hospitals_lab_tests'); }
    public function AddLabTestsInfo(){ $this->handleAdd('ms_hospitals_lab_tests'); }
    public function UpdateLabTestsInfo(){ $this->handleUpdate('ms_hospitals_lab_tests'); }
    public function DeleteLabTestsInfo(){ $this->handleDelete('ms_hospitals_lab_tests'); }

    public function cloneLabTests() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }
            $AES_KEY = "RohitGaradHos@173414";
            $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$hosInfo || empty($hosInfo['id'])) {
                echo json_encode(["success"=>false, "message"=>"Hospital information not found"]);
                return;
            }
            $hospital_id = intval($hosInfo['id']);

            $raw = json_decode(file_get_contents("php://input"), true);
            if (!$raw || !is_array($raw)) { echo json_encode(["success"=>false, "message"=>"Invalid payload"]); return; }
            
            $idsEnc = $raw['ids'] ?? '';
            $idsJson = $idsEnc ? $this->decrypt_aes_from_js($idsEnc, $AES_KEY) : '[]';
            $ids = json_decode($idsJson, true);
            
            if (empty($ids) || !is_array($ids)) {
                 echo json_encode(["success"=>false, "message"=>"No tests selected"]);
                 return;
            }
            
            $this->db->where_in('id', $ids);
            $masterTests = $this->db->get('lb_master_lab_tests')->result_array();
            
            $count = 0;
            foreach ($masterTests as $test) {
                $descParts = [];
                if (!empty($test['department'])) $descParts[] = $test['department'];
                if (!empty($test['sample_type'])) $descParts[] = $test['sample_type'];
                if (!empty($test['method'])) $descParts[] = $test['method'];
                $desc = implode(' ', $descParts);
                
                $insert = [
                    'hospital_id' => $hospital_id,
                    'master_test_id' => $test['id'],
                    'name' => $test['test_name'],
                    'description' => $desc,
                    'status' => 1,
                    'isdelete' => 0,
                    'created_by' => $hospital_id,
                    'updated_by' => $hospital_id,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                ];
                
                $this->db->insert('ms_hospitals_lab_tests', $insert);
                $count++;
            }
            
            echo json_encode(["success" => true, "message" => "Cloned $count tests successfully", "count" => $count]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function getMasterCatalog() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }
            
            $AES_KEY = "RohitGaradHos@173414";
            
            $raw = json_decode(file_get_contents("php://input"), true);
            $searchEnc = $raw['search'] ?? '';
            $search = $searchEnc ? trim($this->decrypt_aes_from_js($searchEnc, $AES_KEY)) : '';
            
            $this->db->from('lb_master_lab_tests');
            $this->db->where('status', 1);
            $this->db->where('isdelete', 0);
            if ($search !== '') {
                $this->db->group_start();
                $this->db->like('test_name', $search);
                $this->db->or_like('department', $search);
                $this->db->group_end();
            }
            $this->db->order_by('test_name', 'ASC');
            $rows = $this->db->get()->result_array();
            
            $payload = json_encode($rows);
            $encryptedData = $this->encrypt_aes_for_js($payload, $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
            
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function getProcedureList(){ $this->handleList('ms_hospitals_procedure'); }
    public function AddProcedureInfo(){ $this->handleAdd('ms_hospitals_procedure'); }
    public function UpdateProcedureInfo(){ $this->handleUpdate('ms_hospitals_procedure'); }
    public function DeleteProcedureInfo(){ $this->handleDelete('ms_hospitals_procedure'); }
}
