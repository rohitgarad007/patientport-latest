<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class LaboratoriesController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors', 0);
        
        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        
        try {
            $this->load->model('LabCommonModel');
        } catch (Throwable $e) {
            // Error loading model
        }
        
        $this->load->helper(array('verifyAuthToken', 'jwt'));

        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
        header("Access-Control-Allow-Origin: " . $origin);
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header("Vary: Origin");
        header('Content-Type: application/json');

        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header("HTTP/1.1 200 OK");
            exit();
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


    public function MasterLabTestList() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $staffid = $tokenData['id'] ?? null;
            $labid = $tokenData['lab_id'] ?? null;
            if (!$staffid || !$labid) {
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

            $total = $this->LabCommonModel->get_labTestCount($search, $department, $status, $labid);
            $totalRows = $total['total'] ?? 0;
            $list = $this->LabCommonModel->get_labTestList($search, $limitValue, $offsetValue, $department, $status, $labid);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($list['data']), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "Rowdata"    => $list['data'],
                "total"   => $totalRows,
                "page"    => $page,
                "limit"   => $limitValue
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }


    public function GetLabTestInformation() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $staffid = $tokenData['id'] ?? null;
            $labid = $tokenData['lab_id'] ?? null;


            if (!$staffid || !$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            $id = $rawData['id'] ?? null;
            $ids = isset($rawData['ids']) && is_array($rawData['ids']) ? $rawData['ids'] : null;
            if (!$id && !$ids) {
                echo json_encode(["success" => false, "message" => "Missing ID or IDs"]);
                return;
            }

            if ($ids) {
                $data = $this->LabCommonModel->getLabTestsInfoByIds($ids);
            } else {
                $data = $this->LabCommonModel->getLabTestInfoById($id);
            }
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($data), $AES_KEY);

            echo json_encode(["success" => true, "data" => $encryptedData]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }


    public function AddLabTestInformation() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $staffid = $tokenData['id'] ?? null;
            $labid = $tokenData['lab_id'] ?? null;
            if (!$staffid || !$labid) {
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

            $result = $this->LabCommonModel->insertLabTestFull($data, $labid);
            if ($result) {
                echo json_encode(["success" => true, "message" => "Test added successfully", "id" => $result]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to add test"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function UpdateLabTestInformation() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $staffid = $tokenData['id'] ?? null;
            $labid = $tokenData['lab_id'] ?? null;
            if (!$staffid || !$labid) {
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

            $result = $this->LabCommonModel->updateLabTestFull($data['id'], $data, $labid);
            if ($result) {
                echo json_encode(["success" => true, "message" => "Test updated successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update test"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function DeleteLabTestInfo() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $staffid = $tokenData['id'] ?? null;
            $labid = $tokenData['lab_id'] ?? null;
            if (!$staffid || !$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!isset($rawData['id'])) {
                echo json_encode(["success" => false, "message" => "Missing ID"]);
                return;
            }

            $result = $this->LabCommonModel->deleteLabTestInfo($rawData['id'], $labid);
            if ($result) {
                echo json_encode(["success" => true, "message" => "Test deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to delete test"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function getDrafts() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            $orderId = isset($rawData['order_id']) ? $rawData['order_id'] : null;
            $testId = isset($rawData['test_id']) ? $rawData['test_id'] : null;
            $testIds = isset($rawData['test_ids']) && is_array($rawData['test_ids']) ? $rawData['test_ids'] : null;

            if (!$orderId) {
                echo json_encode(["success" => false, "message" => "Missing order ID"]);
                return;
            }

            if ($testIds) {
                $drafts = $this->LabCommonModel->get_draft_results_multi($orderId, $testIds);
            } else {
                $drafts = $this->LabCommonModel->get_draft_results($orderId, $testId);
            }

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($drafts), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function _unused_saveDraft() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            
            if (!is_array($rawData) || empty($rawData)) {
                echo json_encode(["success" => false, "message" => "No data provided"]);
                return;
            }

            // Check if it's an array of drafts (check first item)
            if (!isset($rawData[0]['order_id']) || !isset($rawData[0]['parameter_id'])) {
                 echo json_encode(["success" => false, "message" => "Invalid data format"]);
                 return;
            }

            $result = $this->LabCommonModel->save_draft_results($rawData);

            if ($result) {
                echo json_encode(["success" => true, "message" => "Draft saved successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to save draft"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function submitValidation() {
            $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            $orderId = isset($rawData['order_id']) ? $rawData['order_id'] : null;
            $testId = isset($rawData['test_id']) ? $rawData['test_id'] : null;
            $testIds = isset($rawData['test_ids']) && is_array($rawData['test_ids']) ? $rawData['test_ids'] : null;

            if (!$orderId) {
                echo json_encode(["success" => false, "message" => "Missing order ID"]);
                return;
            }

            $result = true;
            if ($testIds && is_array($testIds)) {
                foreach ($testIds as $tid) {
                    $ok = $this->LabCommonModel->submit_for_validation($orderId, $tid);
                    if (!$ok) { $result = false; break; }
                }
            } else {
                $result = $this->LabCommonModel->submit_for_validation($orderId, $testId);
            }

            if ($result) {
                $this->LabCommonModel->updateLabOrderStatus($orderId, 'Validation Pending', $labid, ['is_processing_seen' => 0]);
                echo json_encode(["success" => true, "message" => "Submitted for validation successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to submit for validation"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function ApproveAndGenerateReport() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            $orderId = isset($rawData['order_id']) ? $rawData['order_id'] : null;
            $testId = isset($rawData['test_id']) ? $rawData['test_id'] : null;
            $testIds = isset($rawData['test_ids']) && is_array($rawData['test_ids']) ? $rawData['test_ids'] : null;
            $comments = isset($rawData['comments']) ? $rawData['comments'] : '';

            if (!$orderId) {
                echo json_encode(["success" => false, "message" => "Missing order ID"]);
                return;
            }

            $ok = $this->LabCommonModel->approve_and_generate_report($orderId, $testIds ?: ($testId ? [$testId] : []), $labid, $comments);
            if ($ok) {
                echo json_encode(["success" => true, "message" => "Approved and report generated"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to approve and generate report"]);
            }
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function GetMasterCatalog() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $staffid = $tokenData['id'] ?? null;
            $labid = $tokenData['lab_id'] ?? null;
            if (!$staffid || !$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';
            $department = isset($rawData['department']) ? $rawData['department'] : 'all';

            $list = $this->LabCommonModel->get_master_catalog_list($search, $department, $labid);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function CloneMasterTests() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $staffid = $tokenData['id'] ?? null;
            $labid = $tokenData['lab_id'] ?? null;
            if (!$staffid || !$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            $ids = isset($rawData['ids']) ? $rawData['ids'] : [];

            if (empty($ids) || !is_array($ids)) {
                echo json_encode(["success" => false, "message" => "No tests selected"]);
                return;
            }

            $count = $this->LabCommonModel->clone_master_tests($ids, $labid);

            if ($count !== false) {
                echo json_encode(["success" => true, "message" => "Successfully cloned $count tests", "count" => $count]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to clone tests"]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function get_recent_orders() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            // Pass 5 as limit
            $orders = $this->LabCommonModel->get_recent_orders_by_lab($labid, 5);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($orders), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function get_all_orders() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            // Pass 0 as limit to fetch all
            $orders = $this->LabCommonModel->get_recent_orders_by_lab($labid, 0);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($orders), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "rowData" => $orders
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function get_dashboard_stats() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $stats = $this->LabCommonModel->get_dashboard_stats($labid);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($stats), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function GetProcessingQueue() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $queue = $this->LabCommonModel->get_processing_queue($labid);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($queue), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function GetValidationQueue() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $queue = $this->LabCommonModel->get_validation_queue($labid);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($queue), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "rowData" => $queue
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function GetCompletedReports() {
        // Handle CORS preflight
        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return;
        }

        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $list = $this->LabCommonModel->get_completed_reports($labid);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "rowData" => $list
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function ToggleReportVisibility() {
        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return;
        }
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }
            $raw = json_decode(file_get_contents("php://input"), true);
            $treatment_id = isset($raw['treatment_id']) ? intval($raw['treatment_id']) : 0;
            $visible = isset($raw['visible']) ? (intval($raw['visible']) ? 1 : 0) : null;
            if (empty($treatment_id) || $visible === null) {
                echo json_encode(["success" => false, "message" => "Missing treatment_id or visible value"]);
                return;
            }
            $this->db->where('treatment_id', $treatment_id);
            $updated = $this->db->update('ms_patient_treatment_lab_reports', ['is_viewlab_report' => $visible]);
            echo json_encode([
                "success" => $updated ? true : false,
                "message" => $updated ? "Report visibility updated" : "Failed to update visibility",
                "treatment_id" => $treatment_id,
                "visible" => $visible
            ]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function GetReportDetails() {
        // Handle CORS preflight
        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return;
        }

        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $orderId = $this->input->get('order_id');
            if (empty($orderId)) {
                echo json_encode(["success" => false, "message" => "Missing Order ID"]);
                return;
            }

            $data = $this->LabCommonModel->get_report_details($orderId, $labid);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($data), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function collectSample() {
        // Handle CORS preflight
        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return;
        }

        $logFile = 'debug_controller.txt';
        file_put_contents($logFile, "collectSample called at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
        
        // Enable error reporting for debugging but don't output to browser
        error_reporting(E_ALL);
        ini_set('display_errors', 0);

        try {
            file_put_contents($logFile, "Attempting to get auth header\n", FILE_APPEND);
            $userToken = $this->input->get_request_header('Authorization');
            file_put_contents($logFile, "Token received: " . (empty($userToken) ? "NO" : "YES") . "\n", FILE_APPEND);
            
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            
            file_put_contents($logFile, "Verifying token...\n", FILE_APPEND);
            $token = verifyAuthToken($token);
            if (!$token) {
                file_put_contents($logFile, "Token verification failed\n", FILE_APPEND);
                throw new Exception("Unauthorized - Invalid Token");
            }
            
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $staffid = $tokenData['id'] ?? null;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$staffid || !$labid) {
                file_put_contents($logFile, "Missing staff/lab ID in token\n", FILE_APPEND);
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawInput = file_get_contents("php://input");
            file_put_contents($logFile, "Raw input length: " . strlen($rawInput) . "\n", FILE_APPEND);
            
            $input = json_decode($rawInput, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                 file_put_contents($logFile, "JSON decode error: " . json_last_error_msg() . "\n", FILE_APPEND);
                 echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
                 return;
            }

            $encryptedPayload = $input['encrypted_payload'] ?? '';
            
            if (empty($encryptedPayload)) {
                file_put_contents($logFile, "Empty encrypted payload\n", FILE_APPEND);
                echo json_encode(["success" => false, "message" => "No data provided"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $decryptedJson = $this->decrypt_aes_from_js($encryptedPayload, $AES_KEY);
            
            // decrypt_aes_from_js returns error string if failed
            if ($decryptedJson === "Base64 decode failed or too short" || 
                $decryptedJson === "Invalid salt header" || 
                $decryptedJson === "Decryption failed") {
                
                file_put_contents($logFile, "Decryption error: $decryptedJson\n", FILE_APPEND);
                echo json_encode(["success" => false, "message" => "Decryption failed: " . $decryptedJson]);
                return;
            }

            $data = json_decode($decryptedJson, true);

            if (!$data) {
                file_put_contents($logFile, "Decrypted JSON decode failed\n", FILE_APPEND);
                echo json_encode(["success" => false, "message" => "Decryption failed or invalid JSON structure"]);
                return;
            }
            
            file_put_contents($logFile, "Data decrypted successfully. OrderID: " . ($data['orderId'] ?? 'MISSING') . "\n", FILE_APPEND);

            // Prepare data for insertion
            $insertData = [
                'order_id' => $data['orderId'] ?? '',
                'test_id' => $data['testId'] ?? '',
                'sample_name' => $data['sampleInfo']['name'] ?? null,
                'sample_type' => $data['sampleInfo']['type'] ?? null,
                'volume' => $data['sampleInfo']['volume'] ?? null,
                'tubes' => $data['sampleInfo']['tubes'] ?? null,
                'anticoagulant' => $data['sampleInfo']['anticoagulant'] ?? null,
                'storage' => $data['sampleInfo']['storage'] ?? null,
                'method' => $data['sampleInfo']['method'] ?? null,
                'tat' => $data['sampleInfo']['tat'] ?? null,
                'collected_by' => $staffid,
                'lab_id' => $labid,
                'status' => 'Collected'
            ];
            
            if (empty($insertData['order_id'])) {
                 file_put_contents($logFile, "Order ID missing in payload\n", FILE_APPEND);
                 echo json_encode(["success" => false, "message" => "Missing Order ID"]);
                 return;
            }

            // Upsert: if sample exists for order+test+lab, update; else insert
            $existing = null;
            if (!empty($insertData['test_id'])) {
                $existing = $this->LabCommonModel->getCollectedSampleByOrderTest($insertData['order_id'], $insertData['test_id'], $labid);
            }

            if ($existing && !empty($existing['id'])) {
                $updated = $this->LabCommonModel->updateCollectedSample($existing['id'], $insertData);
                if ($updated) {
                    $this->LabCommonModel->updatePatientTestStatus($insertData['order_id'], $insertData['test_id'], 'Collected');
                    file_put_contents($logFile, "Update success. Existing ID: {$existing['id']}\n", FILE_APPEND);
                    echo json_encode(["success" => true, "message" => "Sample updated successfully", "id" => $existing['id']]);
                } else {
                    $db_error = $this->db->error();
                    file_put_contents($logFile, "Update failed. DB Error: " . json_encode($db_error) . "\n", FILE_APPEND);
                    echo json_encode(["success" => false, "message" => "Failed to update sample. DB Error: " . $db_error['message']]);
                }
            } else {
                $insertId = $this->LabCommonModel->insertCollectedSample($insertData);
                if ($insertId) {
                    if (!empty($insertData['test_id'])) {
                        $this->LabCommonModel->updatePatientTestStatus($insertData['order_id'], $insertData['test_id'], 'Collected');
                    }
                    file_put_contents($logFile, "Insert success. ID: $insertId\n", FILE_APPEND);
                    echo json_encode(["success" => true, "message" => "Sample collected successfully", "id" => $insertId]);
                } else {
                    $db_error = $this->db->error();
                    file_put_contents($logFile, "Insert failed. DB Error: " . json_encode($db_error) . "\n", FILE_APPEND);
                    echo json_encode(["success" => false, "message" => "Failed to collect sample. DB Error: " . $db_error['message']]);
                }
            }

        } catch (Throwable $e) {
            file_put_contents($logFile, "Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", FILE_APPEND);
            echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
        }
    }

    public function getCollectedSamples() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $staffid = $tokenData['id'] ?? null;
            $labid = $tokenData['lab_id'] ?? null;
            if (!$staffid || !$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }
            $raw = json_decode(file_get_contents("php://input"), true);
            $orderId = isset($raw['order_id']) ? $raw['order_id'] : '';
            $testId = isset($raw['test_id']) ? $raw['test_id'] : '';
            if (empty($orderId)) {
                echo json_encode(["success" => false, "message" => "Missing order_id"]);
                return;
            }
            $rows = $this->LabCommonModel->get_collected_samples($orderId, $testId, $labid);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($rows), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function updateOrderStatus() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $token = verifyAuthToken($token);
            if (!$token) {
                echo json_encode(["success" => false, "message" => "Unauthorized"]);
                return;
            }
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            if (empty($labid)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }
            $raw = json_decode(file_get_contents("php://input"), true);
            $orderId = isset($raw['order_id']) ? $raw['order_id'] : '';
            $status = isset($raw['status']) ? $raw['status'] : '';
            if (empty($orderId) || empty($status)) {
                echo json_encode(["success" => false, "message" => "Missing parameters"]);
                return;
            }
            $ok = $this->LabCommonModel->updateLabOrderStatus($orderId, $status, $labid);
            if ($ok) {
                echo json_encode(["success" => true, "message" => "Order status updated"]);
            } else {
                $db_error = $this->db->error();
                echo json_encode(["success" => false, "message" => "Failed to update status: " . ($db_error['message'] ?? 'Unknown')]);
            }
        } catch (Throwable $e) {
            echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
        }
    }

    public function uploadReport() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            // Check if file is uploaded
            if (!isset($_FILES['report_file'])) {
                throw new Exception("No file uploaded");
            }

            $patient_id = $this->input->post('patient_id');
            $treatment_id = $this->input->post('treatment_id');
            $covered_tests = $this->input->post('covered_tests');
            $lab_test_id = $this->input->post('lab_test_id');
            
            if (!$patient_id) {
                throw new Exception("Patient ID is required");
            }

            // Create directory: api/uploads/reports/{patient_id}
            $upload_path = FCPATH . 'uploads/reports/' . $patient_id;
            if (!is_dir($upload_path)) {
                if (!mkdir($upload_path, 0777, true)) {
                    throw new Exception("Failed to create upload directory");
                }
            }

            // File configuration
            $config['upload_path'] = $upload_path;
            $config['allowed_types'] = 'pdf';
            $config['max_size'] = 10240; // 10MB
            $config['file_name'] = 'report_' . time() . '.pdf';

            $this->load->library('upload', $config);
            $this->upload->initialize($config);

            if (!$this->upload->do_upload('report_file')) {
                throw new Exception($this->upload->display_errors('', ''));
            }

            $upload_data = $this->upload->data();
            $file_name = $upload_data['file_name'];
            $file_url = base_url() . 'uploads/reports/' . $patient_id . '/' . $file_name;

            // Database insertion
            $db_data = [
                'treatment_id' => $treatment_id,
                'file_name' => $file_name,
                'file_url' => $file_url,
                'file_type' => 'pdf',
                'covered_tests' => $covered_tests,
                'lab_test_id' => $lab_test_id,
                'is_combined' => 0,
                'is_owner' => 3
            ];

            $insert_id = $this->LabCommonModel->save_generated_report($db_data);

            echo json_encode([
                "success" => true,
                "message" => "Report uploaded successfully",
                "data" => ["id" => $insert_id, "url" => $file_url]
            ]);

        } catch (Throwable $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // --- Draft / Validation ---

    public function saveDraft() {
        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return;
        }
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $token = verifyAuthToken($token);
            if (!$token) {
                echo json_encode(["success" => false, "message" => "Unauthorized"]);
                return;
            }
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            if (empty($labid)) {
                echo json_encode(["success" => false, "message" => "Invalid user token"]);
                return;
            }

            $raw = json_decode(file_get_contents("php://input"), true);
            if (empty($raw) || !is_array($raw)) {
                echo json_encode(["success" => false, "message" => "Invalid payload"]);
                return;
            }

            // We expect raw data to be a list of draft objects
            // Validate minimal fields
            foreach ($raw as $item) {
                if (!isset($item['order_id'], $item['test_id'], $item['parameter_id'])) {
                    echo json_encode(["success" => false, "message" => "Missing required fields in draft data"]);
                    return;
                }
            }

            $ok = $this->LabCommonModel->save_draft_results($raw);
            if ($ok) {
                echo json_encode(["success" => true, "message" => "Draft saved successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to save draft"]);
            }

        } catch (Throwable $e) {
            echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
        }
    }

    public function getDrafts_GET() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $token = verifyAuthToken($token);
            if (!$token) {
                echo json_encode(["success" => false, "message" => "Unauthorized"]);
                return;
            }
            
            $orderId = $this->input->get('order_id');
            $testId = $this->input->get('test_id');
            $testIdsParam = $this->input->get('test_ids');
            $testIds = null;
            if (!empty($testIdsParam)) {
                $arr = explode(',', $testIdsParam);
                $clean = [];
                foreach ($arr as $v) {
                    $v = trim($v);
                    if ($v !== '') {
                        $clean[] = $v;
                    }
                }
                if (!empty($clean)) {
                    $testIds = $clean;
                }
            }

            if (empty($orderId)) {
                echo json_encode(["success" => false, "message" => "Missing parameters"]);
                return;
            }

            if ($testIds) {
                $data = $this->LabCommonModel->get_draft_results_multi($orderId, $testIds);
            } else {
                $data = $this->LabCommonModel->get_draft_results($orderId, $testId);
            }
            
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($data), $AES_KEY);

            echo json_encode(["success" => true, "data" => $encryptedData]);

        } catch (Throwable $e) {
            echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
        }
    }


    public function get_unseen_notifications() {
        // Debug Log
        $logFile = APPPATH . 'logs/lab_notifications.log';
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - get_unseen_notifications called\n", FILE_APPEND);

        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Lab ID: " . $labid . "\n", FILE_APPEND);

            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $orders = $this->LabCommonModel->get_unseen_orders($labid);
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Orders Found: " . count($orders) . "\n", FILE_APPEND);
            
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($orders), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);

        } catch (Exception $e) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . "\n", FILE_APPEND);
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function mark_notifications_seen() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawInput = file_get_contents("php://input");
            $input = json_decode($rawInput, true);
            $encryptedPayload = $input['encrypted_payload'] ?? '';

            if (empty($encryptedPayload)) {
                echo json_encode(["success" => false, "message" => "No data provided"]);
                return;
            }
            
            $AES_KEY = "RohitGaradHos@173414";
            $decryptedJson = $this->decrypt_aes_from_js($encryptedPayload, $AES_KEY);
            $data = json_decode($decryptedJson, true);
            
            $orderIds = $data['orderIds'] ?? [];

            if (empty($orderIds)) {
                 echo json_encode(["success" => false, "message" => "No order IDs provided"]);
                 return;
            }

            $result = $this->LabCommonModel->mark_orders_seen($labid, $orderIds);

            echo json_encode([
                "success" => $result,
                "message" => $result ? "Notifications marked as seen" : "Failed to mark notifications"
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function get_unseen_queue_notifications() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $orders = $this->LabCommonModel->get_unseen_queue_notifications($labid);
            
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($orders), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function mark_queue_seen() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawInput = file_get_contents("php://input");
            $input = json_decode($rawInput, true);
            $encryptedPayload = $input['encrypted_payload'] ?? '';

            if (empty($encryptedPayload)) {
                echo json_encode(["success" => false, "message" => "No data provided"]);
                return;
            }
            
            $AES_KEY = "RohitGaradHos@173414";
            $decryptedJson = $this->decrypt_aes_from_js($encryptedPayload, $AES_KEY);
            $data = json_decode($decryptedJson, true);
            
            $orderIds = $data['orderIds'] ?? [];

            if (empty($orderIds)) {
                 echo json_encode(["success" => false, "message" => "No order IDs provided"]);
                 return;
            }

            $result = $this->LabCommonModel->mark_queue_seen($orderIds);

            echo json_encode([
                "success" => $result,
                "message" => $result ? "Queue marked as seen" : "Failed to mark queue"
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function get_unseen_processing_notifications() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $orders = $this->LabCommonModel->get_unseen_processing_notifications($labid);
            
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($orders), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function mark_processing_seen() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawInput = file_get_contents("php://input");
            $input = json_decode($rawInput, true);
            $encryptedPayload = $input['encrypted_payload'] ?? '';

            if (empty($encryptedPayload)) {
                echo json_encode(["success" => false, "message" => "No data provided"]);
                return;
            }
            
            $AES_KEY = "RohitGaradHos@173414";
            $decryptedJson = $this->decrypt_aes_from_js($encryptedPayload, $AES_KEY);
            $data = json_decode($decryptedJson, true);
            
            $orderIds = $data['orderIds'] ?? [];

            if (empty($orderIds)) {
                 echo json_encode(["success" => false, "message" => "No order IDs provided"]);
                 return;
            }

            $result = $this->LabCommonModel->mark_processing_seen($labid, $orderIds);

            echo json_encode([
                "success" => $result,
                "message" => $result ? "Processing marked as seen" : "Failed to mark processing"
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function get_unseen_completed_notifications() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $orders = $this->LabCommonModel->get_unseen_completed_notifications($labid);
            
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($orders), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

    public function mark_completed_seen() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $labid = $tokenData['lab_id'] ?? null;
            
            if (!$labid) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $rawInput = file_get_contents("php://input");
            $input = json_decode($rawInput, true);
            $encryptedPayload = $input['encrypted_payload'] ?? '';

            if (empty($encryptedPayload)) {
                echo json_encode(["success" => false, "message" => "No data provided"]);
                return;
            }
            
            $AES_KEY = "RohitGaradHos@173414";
            $decryptedJson = $this->decrypt_aes_from_js($encryptedPayload, $AES_KEY);
            $data = json_decode($decryptedJson, true);
            
            $orderIds = $data['orderIds'] ?? [];

            if (empty($orderIds)) {
                 echo json_encode(["success" => false, "message" => "No order IDs provided"]);
                 return;
            }

            $result = $this->LabCommonModel->mark_completed_seen($labid, $orderIds);

            echo json_encode([
                "success" => $result,
                "message" => $result ? "Completed marked as seen" : "Failed to mark completed"
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Authorization failed: " . $e->getMessage()]);
        }
    }

}
