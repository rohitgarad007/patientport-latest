<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class HSHospitalMedicalSController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('AdmCommonModel');
        $this->load->model('HospitalCommonModel');
        $this->load->helper('verifyAuthToken');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header('Content-Type: application/json');
    }

    // AES Encryption function compatible with JS decryption
    public function encrypt_aes_for_js($plainText, $passphrase) {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = 'Salted__' . $salt;
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $encrypted = openssl_encrypt($plainText, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        return base64_encode($salted . $encrypted);
    }

    // Derivation helper
    public function openssl_EVP_BytesToKey($passphrase, $salt, $keyLen, $ivLen) {
        $dtot = '';
        $d = '';
        while (strlen($dtot) < ($keyLen + $ivLen)) {
            $d = md5($d . $passphrase . $salt, true);
            $dtot .= $d;
        }
        return [
            'key' => substr($dtot, 0, $keyLen),
            'iv'  => substr($dtot, $keyLen, $ivLen)
        ];
    }

    // AES Decryption function
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

    private function requireHospitalAuth(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $tokenStr = isset($splitToken[1]) ? $splitToken[1] : '';
        // Validate and decode token
        $token = verifyAuthToken($tokenStr);
        if (!$token) throw new Exception("Unauthorized");
        $tokenData = is_string($token) ? json_decode($token, true) : $token;
        $hrole = $tokenData['role'] ?? null;
        $loguid = $tokenData['loguid'] ?? null;
        if (!$loguid || $hrole !== "hospital_admin") {
            throw new Exception("Invalid user token or insufficient privileges");
        }
        $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
        if (!$hosInfo || empty($hosInfo['id'])) {
            throw new Exception("Hospital information not found");
        }
        return $hosInfo; // includes ['id']
    }

    // ================================
    // Medical Store: List
    // ================================
    public function GetMedicalStoreList(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];

            $raw = json_decode(file_get_contents("php://input"), true);
            $page  = isset($raw['page']) ? intval($raw['page']) : 1;
            $limit = isset($raw['limit']) ? intval($raw['limit']) : 10;
            $search = isset($raw['search']) ? trim($raw['search']) : '';
            if ($page < 1) $page = 1;
            if ($limit < 1) $limit = 10;
            $offset = ($page - 1) * $limit;

            $this->db->from('ms_medical_stores');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);
            if ($search !== '') {
                $this->db->group_start()
                    ->like('name', $search)
                    ->or_like('store_name', $search)
                    ->or_like('email', $search)
                    ->or_like('phone', $search)
                    ->or_like('license_no', $search)
                    ->group_end();
            }
            $this->db->order_by('created_at', 'DESC');
            $this->db->limit($limit, $offset);
            $query = $this->db->get();
            $rows = $query->result_array();

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($rows), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    // ================================
    // Medical Store: Add
    // ================================
    public function AddMedicalStoreInfo(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode(["success" => false, "message" => "Invalid payload"]);
                return;
            }
            $AES_KEY = "RohitGaradHos@173414";
            $name       = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
            $email      = isset($rawData['email']) ? trim($this->decrypt_aes_from_js($rawData['email'], $AES_KEY)) : '';
            $phone      = isset($rawData['phone']) ? preg_replace('/[^0-9]/', '', $this->decrypt_aes_from_js($rawData['phone'], $AES_KEY)) : '';
            $license_no = isset($rawData['license_no']) ? trim($this->decrypt_aes_from_js($rawData['license_no'], $AES_KEY)) : '';
            $address    = isset($rawData['address']) ? trim($this->decrypt_aes_from_js($rawData['address'], $AES_KEY)) : '';
            $statusRaw  = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

            if (!$name) {
                echo json_encode(["success" => false, "message" => "Missing required fields"]);
                return;
            }
            $status = ($statusRaw === 'active' || $statusRaw === '1') ? 1 : 0;

            $storeuid = uniqid('MS_');
            $insertData = [
                'storeuid'   => $storeuid,
                'hospital_id'=> $hospital_id,
                'name'       => $name,
                'email'      => $email,
                'phone'      => $phone,
                'license_no' => $license_no,
                'address'    => $address,
                'status'     => $status,
                'isdelete'   => 0,
                'created_by' => $hospital_id,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ];

            $result = $this->db->insert('ms_medical_stores', $insertData);
            if ($result) {
                echo json_encode(["success" => true, "message" => "medical store added successfully", "id" => $storeuid]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to add medical store"]);
            }
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    // ================================
    // Medical Store: Update
    // ================================
    public function UpdateMedicalStoreInfo(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode(["success" => false, "message" => "Invalid payload"]);
                return;
            }
            $AES_KEY = "RohitGaradHos@173414";
            $idEnc = $rawData['id'] ?? '';
            $id = $idEnc ? trim($this->decrypt_aes_from_js($idEnc, $AES_KEY)) : '';
            if (!$id) {
                echo json_encode(["success" => false, "message" => "Missing store id"]);
                return;
            }
            $name       = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
            $email      = isset($rawData['email']) ? trim($this->decrypt_aes_from_js($rawData['email'], $AES_KEY)) : '';
            $phone      = isset($rawData['phone']) ? preg_replace('/[^0-9]/', '', $this->decrypt_aes_from_js($rawData['phone'], $AES_KEY)) : '';
            $license_no = isset($rawData['license_no']) ? trim($this->decrypt_aes_from_js($rawData['license_no'], $AES_KEY)) : '';
            $address    = isset($rawData['address']) ? trim($this->decrypt_aes_from_js($rawData['address'], $AES_KEY)) : '';
            $statusRaw  = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
            $status = ($statusRaw === 'active' || $statusRaw === '1') ? 1 : 0;

            $updateData = [
                'name'       => $name,
                'email'      => $email,
                'phone'      => $phone,
                'license_no' => $license_no,
                'address'    => $address,
                'status'     => $status,
                'updated_at' => date('Y-m-d H:i:s'),
            ];

            $this->db->where('hospital_id', $hospital_id);
            $this->db->group_start();
                $this->db->where('storeuid', $id);
                $this->db->or_where('id', $id);
            $this->db->group_end();

            $result = $this->db->update('ms_medical_stores', $updateData);
            if ($result) {
                echo json_encode(["success" => true, "message" => "medical store updated successfully", "id" => $id]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update medical store"]);
            }
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    // ================================
    // Medical Store: Change Status
    // ================================
    public function ChangeMedicalStoreStatus(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode(["success" => false, "message" => "Invalid payload"]);
                return;
            }
            $AES_KEY = "RohitGaradHos@173414";
            $idEnc = $rawData['id'] ?? '';
            $statusEnc = $rawData['status'] ?? '';
            $id = $idEnc ? trim($this->decrypt_aes_from_js($idEnc, $AES_KEY)) : '';
            $statusRaw = $statusEnc ? trim($this->decrypt_aes_from_js($statusEnc, $AES_KEY)) : '0';

            if (!$id) {
                echo json_encode(["success" => false, "message" => "Missing store id"]);
                return;
            }
            $status = ($statusRaw === 'active' || $statusRaw === '1') ? 1 : 0;

            $updateData = [
                'status'     => $status,
                'updated_at' => date('Y-m-d H:i:s'),
            ];

            $this->db->where('hospital_id', $hospital_id);
            $this->db->group_start();
                $this->db->where('storeuid', $id);
                $this->db->or_where('id', $id);
            $this->db->group_end();

            $result = $this->db->update('ms_medical_stores', $updateData);
            if ($result) {
                echo json_encode(["success" => true, "message" => "medical store status updated", "id" => $id]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update status"]);
            }
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    // ================================
    // Medical Store: Delete (soft)
    // ================================
    public function DeleteMedicalStoreInfo(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode(["success" => false, "message" => "Invalid payload"]);
                return;
            }
            $AES_KEY = "RohitGaradHos@173414";
            $idEnc = $rawData['id'] ?? '';
            $id = $idEnc ? trim($this->decrypt_aes_from_js($idEnc, $AES_KEY)) : '';
            if (!$id) {
                echo json_encode(["success" => false, "message" => "Missing store id"]);
                return;
            }

            $updateData = [
                'isdelete'   => 1,
                'updated_at' => date('Y-m-d H:i:s'),
            ];

            $this->db->where('hospital_id', $hospital_id);
            $this->db->group_start();
                $this->db->where('storeuid', $id);
                $this->db->or_where('id', $id);
            $this->db->group_end();

            $result = $this->db->update('ms_medical_stores', $updateData);
            if ($result) {
                echo json_encode(["success" => true, "message" => "medical store deleted", "id" => $id]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to delete medical store"]);
            }
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    // ================================
    // Medical Inventory: Simple List with Available Count
    // ================================
    public function GetMedicalInventoryList(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];

            $raw = json_decode(file_get_contents("php://input"), true);
            $search = isset($raw['search']) ? trim($raw['search']) : '';
            $onlyAvailable = isset($raw['only_available']) ? intval($raw['only_available']) : 1;
            $page  = isset($raw['page']) ? intval($raw['page']) : 1;
            $limit = isset($raw['limit']) ? intval($raw['limit']) : 50;
            if ($page < 1) $page = 1;
            if ($limit < 1) $limit = 50;
            $offset = ($page - 1) * $limit;

            // Base product query
            $this->db->from('ms_hospitals_inventory_products');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);
            if ($this->db->field_exists('status', 'ms_hospitals_inventory_products')) {
                $this->db->where('status', 1);
            }
            if ($search !== '') {
                $this->db->group_start()
                    ->like('name', $search)
                    ->or_like('sku', $search)
                    ->group_end();
            }
            $this->db->order_by('name', 'ASC');
            $this->db->limit($limit, $offset);
            $pq = $this->db->get();
            $products = $pq->result_array();

            $list = [];

            foreach ($products as $p) {
                $pid = $p['id'] ?? null;
                if (!$pid) { continue; }

                // Determine batch reference key/value for this product
                $productRefKey = 'product_id';
                $productRefValue = $pid;
                if (!$this->db->field_exists('product_id', 'ms_hospitals_inventory_batches') && $this->db->field_exists('productuid', 'ms_hospitals_inventory_batches')) {
                    $productRefKey = 'productuid';
                    if (!empty($p['productuid'])) {
                        $productRefValue = $p['productuid'];
                    } else {
                        $pq1 = $this->db->select('productuid')->from('ms_hospitals_inventory_products')->where('id', $pid)->get();
                        $prow1 = $pq1->row_array();
                        if (!empty($prow1['productuid'])) {
                            $productRefValue = $prow1['productuid'];
                        }
                    }
                }

                // Sum available quantity from batches
                $bq = $this->db->from('ms_hospitals_inventory_batches')
                    ->where('hospital_id', $hospital_id)
                    ->where($productRefKey, $productRefValue)
                    ->where('isdelete', 0)
                    ->get();
                $batchesRows = $bq->result_array();
                $available = 0;
                foreach ($batchesRows as $br) {
                    $qty = isset($br['quantity']) ? (int)$br['quantity'] : 0;
                    $available += $qty;
                }

                if ($onlyAvailable === 1 && $available <= 0) {
                    continue;
                }

                // Unit of measure (symbol or name)
                $unit = '';
                $uomId = $p['uom_id'] ?? null;
                if (!empty($uomId)) {
                    $uq = $this->db->select('name, symbol')->from('ms_hospitals_unitofmeasure')->where('id', $uomId)->get();
                    $urow = $uq->row_array();
                    if (!empty($urow['symbol'])) {
                        $unit = $urow['symbol'];
                    } elseif (!empty($urow['name'])) {
                        $unit = $urow['name'];
                    }
                }

                $list[] = [
                    'id'        => (string)$pid,
                    'code'      => $p['sku'] ?? '',
                    'name'      => $p['name'] ?? '',
                    'unit'      => $unit,
                    'available' => (int)$available,
                ];
            }

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }
}

?>