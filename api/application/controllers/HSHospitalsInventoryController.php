<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class HSHospitalsInventoryController  extends CI_Controller {

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

    // Reuse your existing key/iv derivation function
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

    // Helper: require hospital auth and return hospital info
    private function requireHospitalAuth(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $tokenStr = isset($splitToken[1]) ? $splitToken[1] : '';
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
    // Medical Inventory Requests: List
    // ================================
    public function GetMedicalRequestsList(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];

            $raw = json_decode(file_get_contents("php://input"), true);
            $page  = isset($raw['page']) ? intval($raw['page']) : 1;
            $limit = isset($raw['limit']) ? intval($raw['limit']) : 10;
            $search = isset($raw['search']) ? trim($raw['search']) : '';
            $status = isset($raw['status']) ? trim($raw['status']) : '';
            if ($page < 1) $page = 1;
            if ($limit < 1) $limit = 10;
            $offset = ($page - 1) * $limit;

            $this->db->from('ms_medical_requests');
            $this->db->where('hospital_id', $hospital_id);
            if ($this->db->field_exists('isdelete', 'ms_medical_requests')) {
                $this->db->where('isdelete', 0);
            }
            if ($search !== '') {
                $this->db->group_start()
                    ->like('request_code', $search)
                    ->or_like('requested_by', $search)
                    ->or_like('remarks', $search)
                    ->group_end();
            }
            if ($status !== '') {
                $this->db->where('status', $status);
            }
            $this->db->order_by('created_at', 'DESC');
            // Count total
            $totalQuery = clone $this->db;
            $total = $totalQuery->count_all_results('', false);

            $this->db->limit($limit, $offset);
            $q = $this->db->get();
            $rows = $q->result_array();

            // Enrich with store name and items count
            $list = [];
            foreach ($rows as $r) {
                $rid = $r['id'] ?? null;
                if (!$rid) continue;
                $storeName = '';
                if (!empty($r['store_id'])) {
                    $sq = $this->db->select('name, name')->from('ms_medical_stores')->where('id', $r['store_id'])->get();
                    $srow = $sq->row_array();
                    if (!empty($srow)) {
                        $storeName = $srow['name'] ?? ($srow['store_name'] ?? '');
                    }
                }
                $itemsCount = 0;
                $cq = $this->db->select('COUNT(*) AS cnt')->from('ms_medical_request_items')->where('request_id', $rid)->get();
                $crow = $cq->row_array();
                if (!empty($crow['cnt'])) $itemsCount = intval($crow['cnt']);

                $list[] = [
                    'id'          => (string)($r['id'] ?? ''),
                    'code'        => $r['request_code'] ?? ($r['code'] ?? ''),
                    'store'       => $storeName,
                    'items'       => $itemsCount,
                    'status'      => $r['status'] ?? 'Pending',
                    'date'        => $r['created_at'] ?? $r['request_date'] ?? '',
                    'requestedBy' => $r['requested_by'] ?? '',
                    'priority'    => $r['priority'] ?? 'Normal',
                    'remarks'     => $r['remarks'] ?? '',
                ];
            }

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode([
                'success' => true,
                'data'    => $encryptedData,
                'total'   => $total,
                'page'    => $page,
                'limit'   => $limit,
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Authorization failed: ' . $e->getMessage()]);
        }
    }

    // ================================
    // Medical Inventory Requests: Create
    // ================================
    public function CreateMedicalRequest(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];
            $raw = json_decode(file_get_contents("php://input"), true);

            $store_id     = isset($raw['store_id']) ? intval($raw['store_id']) : 0;
            $requested_by = isset($raw['requested_by']) ? trim($raw['requested_by']) : '';
            $priority     = isset($raw['priority']) ? trim($raw['priority']) : 'Normal';
            $remarks      = isset($raw['remarks']) ? trim($raw['remarks']) : '';
            $items        = isset($raw['items']) && is_array($raw['items']) ? $raw['items'] : [];

            if ($store_id <= 0 || $requested_by === '' || empty($items)) {
                echo json_encode(['success' => false, 'message' => 'Invalid input']);
                return;
            }

            // Validate dependencies and schema to avoid 500s on missing tables/fields
            if (!$this->db->table_exists('ms_medical_requests') || !$this->db->table_exists('ms_medical_request_items')) {
                echo json_encode(['success' => false, 'message' => 'Database tables missing: ms_medical_requests or ms_medical_request_items']);
                return;
            }
            // Validate store
            $sq = $this->db->select('id')->from('ms_medical_stores')->where('id', $store_id)->get();
            if (!$sq->row_array()) {
                echo json_encode(['success' => false, 'message' => 'Invalid store selected']);
                return;
            }

            $request_code = uniqid('REQ');
            $insertReq = [
                'request_code' => $request_code,
                'hospital_id'  => $hospital_id,
                'store_id'     => $store_id,
                'requested_name' => $requested_by,
                'requested_by' => $store_id,
                'priority'     => $priority,
                'status'       => 'Pending',
                'remarks'      => $remarks,
                'created_at'   => date('Y-m-d H:i:s'),
            ];
            // Conditionally include optional fields if exist in schema
            if ($this->db->field_exists('isdelete', 'ms_medical_requests')) {
                $insertReq['isdelete'] = 0;
            }
            if ($this->db->field_exists('created_by', 'ms_medical_requests')) {
                $insertReq['created_by'] = $hospital_id;
            }
            if ($this->db->field_exists('updated_at', 'ms_medical_requests')) {
                $insertReq['updated_at'] = date('Y-m-d H:i:s');
            }

            $this->db->insert('ms_medical_requests', $insertReq);
            $reqId = $this->db->insert_id();

            foreach ($items as $it) {
                $product_id   = isset($it['product_id']) ? intval($it['product_id']) : 0;
                $requestedQty = isset($it['requested_qty']) ? intval($it['requested_qty']) : 0;
                $unit         = isset($it['unit']) ? trim($it['unit']) : '';
                if ($product_id <= 0 || $requestedQty <= 0) { continue; }
                $insertItem = [
                    'request_id'    => $reqId,
                    'product_id'    => $product_id,
                    'requested_qty' => $requestedQty,
                ];
                if ($this->db->field_exists('unit', 'ms_medical_request_items')) {
                    $insertItem['unit'] = $unit;
                }
                if ($this->db->field_exists('remarks', 'ms_medical_request_items')) {
                    $insertItem['remarks'] = '';
                }
                $this->db->insert('ms_medical_request_items', $insertItem);
            }

            echo json_encode(['success' => true, 'request_id' => $reqId, 'code' => $request_code]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Authorization failed: ' . $e->getMessage()]);
        }
    }

    // ================================
    // Medical Inventory Requests: Details
    // ================================
    public function GetMedicalRequestDetails(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];
            $raw = json_decode(file_get_contents("php://input"), true);
            $request_id = isset($raw['request_id']) ? intval($raw['request_id']) : 0;
            if ($request_id <= 0) { echo json_encode(['success' => false, 'message' => 'Invalid request id']); return; }

            $rq = $this->db->from('ms_medical_requests')->where('id', $request_id)->where('hospital_id', $hospital_id)->get();
            $req = $rq->row_array();
            if (!$req) { echo json_encode(['success' => false, 'message' => 'Request not found']); return; }

            $itemsOut = [];
            $iq = $this->db->from('ms_medical_request_items')->where('request_id', $request_id)->get();
            $items = $iq->result_array();
            foreach ($items as $it) {
                $pid = $it['product_id'] ?? 0;
                $pname = '';
                $psku = '';
                $uom  = $it['unit'] ?? '';
                if ($pid) {
                    $pq = $this->db->select('name, sku')->from('ms_hospitals_inventory_products')->where('id', $pid)->get();
                    $prow = $pq->row_array();
                    if (!empty($prow)) { $pname = $prow['name'] ?? ''; $psku = $prow['sku'] ?? ''; }
                }
                $itemsOut[] = [
                    'code'          => $psku,
                    'name'          => $pname,
                    'requestedQty'  => intval($it['requested_qty'] ?? 0),
                    'unit'          => $uom,
                    'approvedQty'   => null,
                    'dispatchedQty' => null,
                    'batchNo'       => null,
                ];
            }

            $out = [
                'id'          => (string)($req['id'] ?? ''),
                'code'        => $req['request_code'] ?? ($req['code'] ?? ''),
                'store'       => '',
                'items'       => count($itemsOut),
                'status'      => $req['status'] ?? 'Pending',
                'date'        => $req['created_at'] ?? '',
                'requestedBy' => $req['requested_by'] ?? '',
                'priority'    => $req['priority'] ?? 'Normal',
                'remarks'     => $req['remarks'] ?? '',
                'itemDetails' => $itemsOut,
            ];

            // Attach store name
            if (!empty($req['store_id'])) {
                $sq = $this->db->select('name')->from('ms_medical_stores')->where('id', $req['store_id'])->get();
                $srow = $sq->row_array();
                if (!empty($srow)) { $out['store'] = $srow['name'] ?? ($srow['store_name'] ?? ''); }
            }

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode([$out]), $AES_KEY);
            echo json_encode(['success' => true, 'data' => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Authorization failed: ' . $e->getMessage()]);
        }
    }

    // ==========================================
    // Approvals: Items with FEFO batch options
    // ==========================================
    public function GetMedicalRequestItemsWithBatches(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];
            $raw = json_decode(file_get_contents("php://input"), true);
            $request_id = isset($raw['request_id']) ? intval($raw['request_id']) : 0;
            if ($request_id <= 0) { echo json_encode(['success' => false, 'message' => 'Invalid request id']); return; }

            $iq = $this->db->from('ms_medical_request_items')->where('request_id', $request_id)->get();
            $items = $iq->result_array();
            $list = [];
            foreach ($items as $it) {
                $pid = $it['product_id'] ?? 0;
                $pname = '';
                $psku = '';
                $availableQty = 0;
                if ($pid) {
                    $pq = $this->db->select('name, sku')->from('ms_hospitals_inventory_products')->where('id', $pid)->get();
                    $prow = $pq->row_array();
                    if (!empty($prow)) { $pname = $prow['name'] ?? ''; $psku = $prow['sku'] ?? ''; }

                    // total available from batches
                    $bq = $this->db->select('quantity')->from('ms_hospitals_inventory_batches')->where('product_id', $pid)->where('isdelete', 0)->get();
                    $brows = $bq->result_array();
                    foreach ($brows as $br) { $availableQty += intval($br['quantity'] ?? 0); }
                }

                // FEFO: order by exp_date asc
                $this->db->from('ms_hospitals_inventory_batches');
                $this->db->where('product_id', $pid);
                $this->db->where('isdelete', 0);
                if ($this->db->field_exists('status', 'ms_hospitals_inventory_batches')) {
                    $this->db->where('status', 1);
                }
                $this->db->order_by('exp_date', 'ASC');
                $bq2 = $this->db->get();
                $batches = [];
                foreach ($bq2->result_array() as $br) {
                    $batches[] = [
                        'batchNo'   => $br['batch_no'] ?? ($br['batch_number'] ?? ''),
                        'expDate'   => $br['exp_date'] ?? '',
                        'mfgDate'   => $br['manufacture_date'] ?? ($br['mfg_date'] ?? ''),
                        'qty'       => intval($br['quantity'] ?? 0),
                        'location'  => $br['storage_location'] ?? ($br['rack_position'] ?? ''),
                        'supplier'  => '',
                    ];
                }

                $list[] = [
                    'id'           => (string)($it['id'] ?? ''),
                    'code'         => $psku,
                    'name'         => $pname,
                    'requestedQty' => intval($it['requested_qty'] ?? 0),
                    'unit'         => $it['unit'] ?? '',
                    'availableQty' => $availableQty,
                    'batches'      => $batches,
                ];
            }

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(['success' => true, 'data' => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Authorization failed: ' . $e->getMessage()]);
        }
    }

    // ==========================================
    // Approvals: Allocate selected batches & dispatch
    // ==========================================
    public function AllocateMedicalRequestItems(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];
            $raw = json_decode(file_get_contents("php://input"), true);
            $request_id = isset($raw['request_id']) ? intval($raw['request_id']) : 0;
            $items = isset($raw['items']) && is_array($raw['items']) ? $raw['items'] : [];
            $courier = isset($raw['courier']) ? trim($raw['courier']) : '';
            $tracking = isset($raw['trackingNumber']) ? trim($raw['trackingNumber']) : '';
            if ($request_id <= 0 || empty($items)) { echo json_encode(['success' => false, 'message' => 'Invalid input']); return; }

            // Insert allocations
            foreach ($items as $it) {
                $item_id = isset($it['item_id']) ? intval($it['item_id']) : 0;
                $approved = isset($it['approved']) ? intval($it['approved']) : 0;
                $batches = isset($it['selectedBatches']) && is_array($it['selectedBatches']) ? $it['selectedBatches'] : [];
                if ($item_id <= 0 || $approved <= 0) continue;
                foreach ($batches as $b) {
                    $batchNo = isset($b['batchNo']) ? trim($b['batchNo']) : '';
                    $qty     = isset($b['qty']) ? intval($b['qty']) : 0;
                    if ($batchNo === '' || $qty <= 0) continue;
                    $ins = [
                        'request_id' => $request_id,
                        'item_id'    => $item_id,
                        'batch_id'   => $batchNo,
                        'allocated_qty' => $qty,
                        'created_at' => date('Y-m-d H:i:s'),
                    ];
                    $this->db->insert('ms_medical_request_item_allocations', $ins);
                    // Reduce batch quantity
                    $this->db->set('quantity', 'quantity - ' . intval($qty), false);
                    $this->db->where('batch_no', $batchNo);
                    $this->db->update('ms_hospitals_inventory_batches');
                }
            }

            // Mark request as Dispatched
            $this->db->where('id', $request_id);
            $this->db->update('ms_medical_requests', [ 'status' => 'Dispatched', 'updated_at' => date('Y-m-d H:i:s') ]);

            // Create a receipt record (In Transit)
            $dispatchId = uniqid('DISP');
            $receipt = [
                'dispatch_id'   => $dispatchId,
                'request_id'    => $request_id,
                'hospital_id'   => $hospital_id,
                'status'        => 'In Transit',
                'courier'       => $courier,
                'tracking_no'   => $tracking,
                'updated_at' => date('Y-m-d H:i:s'),
            ];
            $this->db->insert('ms_medical_receipts', $receipt);

            echo json_encode(['success' => true, 'dispatch_id' => $dispatchId]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Authorization failed: ' . $e->getMessage()]);
        }
    }

    // ==========================================
    // Approvals: Mark request approved (status only)
    // ==========================================
    public function ApproveMedicalRequest(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $raw = json_decode(file_get_contents("php://input"), true);
            $request_id = isset($raw['request_id']) ? intval($raw['request_id']) : 0;
            if ($request_id <= 0) { echo json_encode(['success' => false, 'message' => 'Invalid request id']); return; }
            $this->db->where('id', $request_id);
            $this->db->update('ms_medical_requests', [ 'status' => 'Approved', 'updated_at' => date('Y-m-d H:i:s') ]);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Authorization failed: ' . $e->getMessage()]);
        }
    }

    // ==========================================
    // Approvals: Mark request declined (status only)
    // ==========================================
    public function DeclineMedicalRequest(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $raw = json_decode(file_get_contents("php://input"), true);
            $request_id = isset($raw['request_id']) ? intval($raw['request_id']) : 0;
            // Optional decline reason, if you want to persist later
            $reason = isset($raw['reason']) ? trim($raw['reason']) : '';
            if ($request_id <= 0) { echo json_encode(['success' => false, 'message' => 'Invalid request id']); return; }

            // Update status to Declined
            $this->db->where('id', $request_id);
            $updateData = [ 'status' => 'Declined', 'updated_at' => date('Y-m-d H:i:s') ];
            $this->db->update('ms_medical_requests', $updateData);

            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Authorization failed: ' . $e->getMessage()]);
        }
    }

    // ==========================================
    // Receipts: Pending list (In Transit / Delivered)
    // ==========================================
    public function GetPendingReceiptsList(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];
            $raw = json_decode(file_get_contents("php://input"), true);
            $page  = isset($raw['page']) ? intval($raw['page']) : 1;
            $limit = isset($raw['limit']) ? intval($raw['limit']) : 10;
            if ($page < 1) $page = 1; if ($limit < 1) $limit = 10; $offset = ($page - 1) * $limit;

            $this->db->from('ms_medical_receipts');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->group_start();
            $this->db->where('status', 'In Transit');
            $this->db->or_where('status', 'Delivered');
            $this->db->group_end();
            $this->db->order_by('updated_at', 'DESC');
            $totalQuery = clone $this->db; $total = $totalQuery->count_all_results('', false);
            $this->db->limit($limit, $offset);
            $rq = $this->db->get();
            $receipts = $rq->result_array();

            $list = [];
            foreach ($receipts as $rc) {
                $dispatchId = $rc['dispatch_id'] ?? '';
                $items = [];
                // Build items from allocations
                $aq = $this->db->from('ms_medical_request_item_allocations')->where('request_id', $rc['request_id'])->get();
                foreach ($aq->result_array() as $al) {
                    $itemId = $al['item_id'] ?? 0;
                    $batchNo = $al['batch_no'] ?? '';
                    $qty = intval($al['allocated_qty'] ?? 0);
                    // Product & batch info
                    $iq = $this->db->from('ms_medical_request_items')->where('id', $itemId)->get();
                    $irow = $iq->row_array();
                    $pid = $irow['product_id'] ?? 0;
                    $pname = ''; $cat = ''; $exp = ''; $unit = $irow['unit'] ?? '';
                    if ($pid) {
                        $pq = $this->db->select('name, category_id')->from('ms_hospitals_inventory_products')->where('id', $pid)->get();
                        $prow = $pq->row_array();
                        if (!empty($prow)) { $pname = $prow['name'] ?? ''; $catId = $prow['category_id'] ?? null; if ($catId) { $cq = $this->db->select('name')->from('ms_hospitals_category')->where('id', $catId)->get(); $crow = $cq->row_array(); if (!empty($crow)) $cat = $crow['name'] ?? ''; } }
                    }
                    $bq = $this->db->from('ms_hospitals_inventory_batches')->where('batch_no', $batchNo)->get();
                    $brow = $bq->row_array();
                    if (!empty($brow)) { $exp = $brow['expiry_date'] ?? ''; }

                    $items[] = [
                        'id'            => (string)($al['id'] ?? ''),
                        'name'          => $pname,
                        'category'      => $cat,
                        'batchNumber'   => $batchNo,
                        'dispatchedQty' => $qty,
                        'unit'          => $unit,
                        'expiryDate'    => $exp,
                    ];
                }

                // Store name
                $store = '';
                $rq1 = $this->db->from('ms_medical_requests')->where('id', $rc['request_id'])->get();
                $rrow = $rq1->row_array();
                if (!empty($rrow['store_id'])) { $sq = $this->db->select('name, store_name')->from('ms_medical_stores')->where('id', $rrow['store_id'])->get(); $srow = $sq->row_array(); if (!empty($srow)) { $store = $srow['name'] ?? ($srow['store_name'] ?? ''); } }

                $list[] = [
                    'id'            => $dispatchId,
                    'status'        => $rc['status'] ?? 'In Transit',
                    'requestId'     => $rrow['request_code'] ?? (string)$rc['request_id'],
                    'store'         => $store,
                    'dispatchDate'  => $rc['updated_at'] ?? '',
                    'courier'       => $rc['courier'] ?? '',
                    'trackingNumber'=> $rc['tracking_no'] ?? '',
                    'items'         => $items,
                ];
            }

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(['success' => true, 'data' => $encryptedData, 'total' => $total, 'page' => $page, 'limit' => $limit]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Authorization failed: ' . $e->getMessage()]);
        }
    }

    // ==========================================
    // Receipts: Confirm verification
    // ==========================================
    public function ConfirmMedicalReceiptVerification(){
        try {
            $hosInfo = $this->requireHospitalAuth();
            $hospital_id = $hosInfo['id'];
            $raw = json_decode(file_get_contents("php://input"), true);
            $dispatch_id = isset($raw['dispatch_id']) ? trim($raw['dispatch_id']) : '';
            $received_by = isset($raw['received_by']) ? trim($raw['received_by']) : '';
            $remarks     = isset($raw['remarks']) ? trim($raw['remarks']) : '';
            $items       = isset($raw['items']) && is_array($raw['items']) ? $raw['items'] : [];
            if ($dispatch_id === '' || $received_by === '') { echo json_encode(['success' => false, 'message' => 'Invalid input']); return; }

            // Update receipt status
            $this->db->where('dispatch_id', $dispatch_id);
            $this->db->where('hospital_id', $hospital_id);
            $this->db->update('ms_medical_receipts', [ 'status' => 'Verified', 'received_by' => $received_by, 'received_at' => date('Y-m-d H:i:s'), 'remarks' => $remarks ]);

            // Optionally persist item-level verification
            foreach ($items as $it) {
                $allocation_id = isset($it['allocation_id']) ? intval($it['allocation_id']) : 0;
                $received_qty  = isset($it['received_qty']) ? intval($it['received_qty']) : 0;
                $has_issue     = isset($it['has_issue']) ? intval($it['has_issue']) : 0;
                $issue_desc    = isset($it['issue_description']) ? trim($it['issue_description']) : '';
                $ins = [
                    'dispatch_id'   => $dispatch_id,
                    'allocation_id' => $allocation_id,
                    'received_qty'  => $received_qty,
                    'has_issue'     => $has_issue,
                    'issue_desc'    => $issue_desc,
                    'created_at'    => date('Y-m-d H:i:s'),
                ];
                $this->db->insert('ms_medical_receipt_items', $ins);
            }

            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Authorization failed: ' . $e->getMessage()]);
        }
    }


    // ===== Inventory Category Code Start here ===== //
        public function getInventoryCategoryList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                $hospital_id = $hosInfo['id'];

                

                $categoryList = $this->HospitalCommonModel->get_HospitalInventoryCategoryList($hospital_id);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($categoryList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"rowData" => $categoryList,
                ]);

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddInventoryCategoryInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $description = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $categoryuid = uniqid('HC_');

                // 5️ Insert into database
                $insertData = [
                    'categoryuid'       => $categoryuid,
                    'hospital_id'       => $hosInfo['id'],
                    'name'              => $name,
                    'description'       => $description,
                    'status'            => $status,
                    'isdelete'          => 0,
                    'created_by'        => $hosInfo['id'],
                    'created_at'        => date('Y-m-d H:i:s'),
                    'updated_at'        => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_category', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "category added successfully",
                        "id" => $categoryuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add category"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateInventoryCategoryInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $catid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $description = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $updateData = [
                    'name'          => $name,
                    'description'   => $description,
                    'status'        => $status,
                    'updated_by'    => $hosInfo['id'],
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $this->db->where('id', $catid);

                $result = $this->db->update('ms_hospitals_category', $updateData);

                


                
                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "category updated successfully",
                        "id" => $catid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update category"
                    ]);
                }
                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    // ===== Inventory Category Code End here ===== //

    // ===== Inventory Category -> Sub Category Code Start here ===== //
        public function getIvSubCategoryList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                $hospital_id = $hosInfo['id'];

                

                $subCatList = $this->HospitalCommonModel->get_HospitalIvSubCategoryList($hospital_id);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($subCatList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    "rowData" => $subCatList,
                ]);

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddIvSubCategoryInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $categoryId = isset($rawData['category_id']) ? trim($this->decrypt_aes_from_js($rawData['category_id'], $AES_KEY)) : '';
                $description = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $subcategoryuid = uniqid('HCS_');

                // 5️ Insert into database
                $insertData = [
                    'subcategoryuid'    => $subcategoryuid,
                    'hospital_id'       => $hosInfo['id'],
                    'category_id'       => $categoryId,
                    'name'              => $name,
                    'description'       => $description,
                    'status'            => $status,
                    'isdelete'          => 0,
                    'created_by'        => $hosInfo['id'],
                    'created_at'        => date('Y-m-d H:i:s'),
                    'updated_at'        => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_subcategory', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "sub category added successfully",
                        "id" => $subcategoryuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add sub category"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateIvSubCategoryInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $catid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $categoryId = isset($rawData['category_id']) ? trim($this->decrypt_aes_from_js($rawData['category_id'], $AES_KEY)) : '';
                $description = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $updateData = [
                    'category_id'   => $categoryId,
                    'name'          => $name,
                    'description'   => $description,
                    'status'        => $status,
                    'updated_by'    => $hosInfo['id'],
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $this->db->where('id', $catid);

                $result = $this->db->update('ms_hospitals_subcategory', $updateData);

                


                
                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "sub category updated successfully",
                        "id" => $catid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update sub category"
                    ]);
                }
                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    // ===== Inventory Category -> Sub Category Code End here ===== //

    // ===== Inventory Manufacturer Code Start here ===== //

        public function GetIvManufacturerList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                $hospital_id = $hosInfo['id'];

                

                $manufacturerList = $this->HospitalCommonModel->get_HospitalIvManufacturerList($hospital_id);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($manufacturerList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"rowData" => $manufacturerList,
                ]);

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddIvManufacturerInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $contactPerson = isset($rawData['contact_person']) ? trim($this->decrypt_aes_from_js($rawData['contact_person'], $AES_KEY)) : '';
                $address = isset($rawData['address']) ? trim($this->decrypt_aes_from_js($rawData['address'], $AES_KEY)) : '';
                $phone = isset($rawData['phone']) ? trim($this->decrypt_aes_from_js($rawData['phone'], $AES_KEY)) : '';
                $email = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['email'], $AES_KEY)) : '';
                $licenseNo = isset($rawData['license_no']) ? trim($this->decrypt_aes_from_js($rawData['license_no'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $manufactureruid = uniqid('HIM_');

                // 5️ Insert into database
                $insertData = [
                    'manufactureruid'   => $manufactureruid,
                    'hospital_id'       => $hosInfo['id'],
                    'name'              => $name,
                    'contact_person'    => $contactPerson,
                    'address'           => $address,
                    'phone'             => $phone,
                    'email'             => $email,
                    'license_no'        => $licenseNo,
                    'status'            => $status,
                    'isdelete'          => 0,
                    'created_by'        => $hosInfo['id'],
                    'created_at'        => date('Y-m-d H:i:s'),
                    'updated_at'        => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_manufacturer', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "manufacturer added successfully",
                        "id" => $manufactureruid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add manufacturer"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateIvManufacturerInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $manufid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $contactPerson = isset($rawData['contact_person']) ? trim($this->decrypt_aes_from_js($rawData['contact_person'], $AES_KEY)) : '';
                $address = isset($rawData['address']) ? trim($this->decrypt_aes_from_js($rawData['address'], $AES_KEY)) : '';
                $phone = isset($rawData['phone']) ? trim($this->decrypt_aes_from_js($rawData['phone'], $AES_KEY)) : '';
                $email = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['email'], $AES_KEY)) : '';
                $licenseNo = isset($rawData['license_no']) ? trim($this->decrypt_aes_from_js($rawData['license_no'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;
                
                $updateData = [
                    'name'              => $name,
                    'contact_person'    => $contactPerson,
                    'address'           => $address,
                    'phone'             => $phone,
                    'email'             => $email,
                    'license_no'        => $licenseNo,
                    'status'            => $status,
                    'updated_by'        => $hosInfo['id'],
                    'updated_at'        => date('Y-m-d H:i:s')
                ];

                $this->db->where('id', $manufid);

                $result = $this->db->update('ms_hospitals_manufacturer', $updateData);

                
                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "manufacturer updated successfully",
                        "id" => $manufid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update manufacturer"
                    ]);
                }
                

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    // ===== Inventory Manufacturer Code End here ===== //


    // ===== Inventory Brand Code Start here ===== //
        
        public function GetIvBrandList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                $hospital_id = $hosInfo['id'];

                

                $subCatList = $this->HospitalCommonModel->get_HospitalIvBrandList($hospital_id);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($subCatList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    "rowData" => $subCatList,
                ]);

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddIvBrandInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $manufId = isset($rawData['manufacturer_id']) ? trim($this->decrypt_aes_from_js($rawData['manufacturer_id'], $AES_KEY)) : '';
                $description = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $branduid = uniqid('HMB_');

                // 5️ Insert into database
                $insertData = [
                    'branduid'          => $branduid,
                    'hospital_id'       => $hosInfo['id'],
                    'manufacturer_id'   => $manufId,
                    'name'              => $name,
                    'description'       => $description,
                    'status'            => $status,
                    'isdelete'          => 0,
                    'created_by'        => $hosInfo['id'],
                    'created_at'        => date('Y-m-d H:i:s'),
                    'updated_at'        => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_brand', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "brand added successfully",
                        "id" => $branduid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add brand"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateIvBrandInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $brandid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $manufId = isset($rawData['manufacturer_id']) ? trim($this->decrypt_aes_from_js($rawData['manufacturer_id'], $AES_KEY)) : '';
                $description = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $updateData = [
                    'manufacturer_id'   => $manufId,
                    'name'              => $name,
                    'description'       => $description,
                    'status'            => $status,
                    'updated_by'        => $hosInfo['id'],
                    'updated_at'        => date('Y-m-d H:i:s')
                ];

                $this->db->where('id', $brandid);

                $result = $this->db->update('ms_hospitals_brand', $updateData);

                


                
                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "brand updated successfully",
                        "id" => $brandid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update brand"
                    ]);
                }
                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    // ===== Inventory Brand Code End here ===== //


    // ===== Inventory Unit of Measure Code Start here ===== //

        public function GetIvUnitOfMeasureList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                $hospital_id = $hosInfo['id'];

                

                $unitOfMeasureList = $this->HospitalCommonModel->get_HospitalIvUnitOfMeasureList($hospital_id);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($unitOfMeasureList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"rowData" => $unitOfMeasureList,
                ]);

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddIvUnitOfMeasureList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $symbol = isset($rawData['symbol']) ? trim($this->decrypt_aes_from_js($rawData['symbol'], $AES_KEY)) : '';
                $conversionRate = isset($rawData['conversion_rate']) ? trim($this->decrypt_aes_from_js($rawData['conversion_rate'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $uomuid = uniqid('HIU_');

                // 5️ Insert into database
                $insertData = [
                    'uomuid'            => $uomuid,
                    'hospital_id'       => $hosInfo['id'],
                    'name'              => $name,
                    'symbol'            => $symbol,
                    'conversion_rate'   => $conversionRate,
                    'status'            => $status,
                    'isdelete'          => 0,
                    'created_by'        => $hosInfo['id'],
                    'created_at'        => date('Y-m-d H:i:s'),
                    'updated_at'        => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_unitofmeasure', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Unit of Measure added successfully",
                        "id" => $uomuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add Unit of Measure"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateIvUnitOfMeasureList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $uomuid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                
                $symbol = isset($rawData['symbol']) ? trim($this->decrypt_aes_from_js($rawData['symbol'], $AES_KEY)) : '';
                $conversionRate = isset($rawData['conversion_rate']) ? trim($this->decrypt_aes_from_js($rawData['conversion_rate'], $AES_KEY)) : '';

                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;
                
                $updateData = [
                    'name'              => $name,
                    'symbol'            => $symbol,
                    'conversion_rate'   => $conversionRate,
                    'status'            => $status,
                    'updated_by'        => $hosInfo['id'],
                    'updated_at'        => date('Y-m-d H:i:s')
                ];

                $this->db->where('id', $uomuid);

                $result = $this->db->update('ms_hospitals_unitofmeasure', $updateData);

                
                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Unit of Measure updated successfully",
                        "id" => $uomuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update Unit of Measure"
                    ]);
                }
                

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    // ===== Inventory Unit of Measure Code End here ===== //


    // ===== Inventory Tax (GST / VAT) Code Start here ===== //

        public function GetIvTaxList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                $hospital_id = $hosInfo['id'];

                

                $taxList = $this->HospitalCommonModel->get_HospitalIvTaxList($hospital_id);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($taxList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    "rowData" => $taxList,
                ]);

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddIvTaxInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $percentage = isset($rawData['percentage']) ? trim($this->decrypt_aes_from_js($rawData['percentage'], $AES_KEY)) : '';
                $type = isset($rawData['type']) ? trim($this->decrypt_aes_from_js($rawData['type'], $AES_KEY)) : '';
                $region = isset($rawData['region']) ? trim($this->decrypt_aes_from_js($rawData['region'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $taxuid = uniqid('HIT_');

                // 5️ Insert into database
                $insertData = [
                    'taxuid'            => $taxuid,
                    'hospital_id'       => $hosInfo['id'],
                    'name'              => $name,
                    'percentage'        => $percentage,
                    'type'              => $type,
                    'region'            => $region,
                    'status'            => $status,
                    'isdelete'          => 0,
                    'created_by'        => $hosInfo['id'],
                    'created_at'        => date('Y-m-d H:i:s'),
                    'updated_at'        => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_tax', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Tax added successfully",
                        "id" => $taxuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add Tax"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateIvTaxInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
               
                $taxid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $percentage = isset($rawData['percentage']) ? trim($this->decrypt_aes_from_js($rawData['percentage'], $AES_KEY)) : '';
                $type = isset($rawData['type']) ? trim($this->decrypt_aes_from_js($rawData['type'], $AES_KEY)) : '';
                $region = isset($rawData['region']) ? trim($this->decrypt_aes_from_js($rawData['region'], $AES_KEY)) : '';

                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;
                
                $updateData = [
                    'name'              => $name,
                    'percentage'        => $percentage,
                    'type'              => $type,
                    'region'            => $region,
                    'status'            => $status,
                    'updated_by'        => $hosInfo['id'],
                    'updated_at'        => date('Y-m-d H:i:s')
                ];

                $this->db->where('id', $taxid);

                $result = $this->db->update('ms_hospitals_tax', $updateData);

                
                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Tax updated successfully",
                        "id" => $taxid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update Tax"
                    ]);
                }
                

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    // ===== Inventory Tax (GST / VAT) Code End here ===== //

    // ===== Inventory Product Code Start here ===== //
        public function GetIvProductList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                $hospital_id = $hosInfo['id'];

                $productList = $this->HospitalCommonModel->get_HospitalIvProductList($hospital_id);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($productList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"rowData" => $productList,
                ]);

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        // ===== Inventory Overview (Products + Stock + Batches) ===== //
        public function GetIvInventoryOverview(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                $hospital_id = $hosInfo['id'];

                // Optional search + pagination (plain JSON payload)
                $raw = json_decode(file_get_contents("php://input"), true);
                $search = isset($raw['search']) ? trim($raw['search']) : '';
                $page  = isset($raw['page']) ? intval($raw['page']) : 1;
                $limit = isset($raw['limit']) ? intval($raw['limit']) : 10;
                if ($page < 1) $page = 1;
                if ($limit < 1) $limit = 10;
                $offset = ($page - 1) * $limit;

                // Build base product query for filters
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

                // Count total with the same filters
                $totalQuery = clone $this->db;
                $totalCount = $totalQuery->count_all_results('', false);

                // Apply ordering and pagination
                $this->db->order_by('name', 'ASC');
                $this->db->limit($limit, $offset);
                $pq = $this->db->get();
                $products = $pq->result_array();

                $overview = [];
                $today = date('Y-m-d');

                foreach ($products as $p) {
                    $pid = $p['id'] ?? null;
                    if (!$pid) { continue; }

                    // Determine product reference key/value in batch table
                    $productRefKey = 'product_id';
                    $productRefValue = $pid;
                    if (!$this->db->field_exists('product_id', 'ms_hospitals_inventory_batches') && $this->db->field_exists('productuid', 'ms_hospitals_inventory_batches')) {
                        $productRefKey = 'productuid';
                        // try productuid from product
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

                    // Sum total stock from batches
                    $bq = $this->db->from('ms_hospitals_inventory_batches')
                        ->where('hospital_id', $hospital_id)
                        ->where($productRefKey, $productRefValue)
                        ->where('isdelete', 0)
                        ->get();
                    $batchesRows = $bq->result_array();

                    $totalStock = 0;
                    foreach ($batchesRows as $br) {
                        $qty = isset($br['quantity']) ? (int)$br['quantity'] : 0;
                        $totalStock += $qty;
                    }

                    // Min/Max levels (support multiple column names)
                    $minLevel = 0;
                    $maxLevel = 0;
                    if (isset($p['min_stock_level'])) $minLevel = (int)$p['min_stock_level'];
                    elseif (isset($p['min_stock'])) $minLevel = (int)$p['min_stock'];

                    if (isset($p['max_stock_capacity'])) $maxLevel = (int)($p['max_stock_capacity'] ?? 0);
                    elseif (isset($p['max_stock'])) $maxLevel = (int)($p['max_stock'] ?? 0);

                    // Product status based on thresholds
                    $status = 'in-stock';
                    if ($totalStock <= 0) {
                        $status = 'out-of-stock';
                    } elseif ($minLevel > 0 && $totalStock < $minLevel) {
                        $status = 'low-stock';
                    } elseif ($maxLevel > 0 && $totalStock > $maxLevel) {
                        $status = 'overstocked';
                    }

                    // Category name lookup if available
                    $categoryName = '';
                    $catId = $p['category_id'] ?? null;
                    if (!empty($catId)) {
                        $cq = $this->db->select('name')->from('ms_hospitals_category')->where('id', $catId)->get();
                        $crow = $cq->row_array();
                        if (!empty($crow['name'])) $categoryName = $crow['name'];
                    }

                    // Brand name may not be present in product schema; leave blank
                    $brandName = '';

                    // Product image if available
                    $productImage = '/placeholder.svg';
                    if (!empty($p['image_url'])) $productImage = $p['image_url'];
                    elseif (!empty($p['product_image'])) $productImage = $p['product_image'];
                    elseif (!empty($p['image'])) $productImage = $p['image'];

                    // Map batch details for modal
                    $batches = [];
                    foreach ($batchesRows as $br) {
                        $expDate = '';
                        if (!empty($br['exp_date'])) $expDate = $br['exp_date'];
                        elseif (!empty($br['expiry_date'])) $expDate = $br['expiry_date'];

                        $mfgDate = '';
                        if (!empty($br['mfg_date'])) $mfgDate = $br['mfg_date'];
                        elseif (!empty($br['manufacture_date'])) $mfgDate = $br['manufacture_date'];

                        // Batch status derived from expiry
                        $bStatus = 'fresh';
                        if (!empty($expDate)) {
                            if ($expDate < $today) {
                                $bStatus = 'expired';
                            } else {
                                // within 90 days considered expiring-soon
                                $tsExp = strtotime($expDate);
                                $tsToday = strtotime($today);
                                if (($tsExp - $tsToday) <= (90 * 86400)) {
                                    $bStatus = 'expiring-soon';
                                }
                            }
                        }

                        // Warehouse / rack position if exists
                        $warehouse = '';
                        if (isset($br['warehouse'])) $warehouse = $br['warehouse'];
                        $rackPosition = '';
                        if (isset($br['rack_position'])) $rackPosition = $br['rack_position'];
                        elseif (isset($br['storage_location'])) $rackPosition = $br['storage_location'];

                        // Unit cost / supplier mapping
                        $unitCost = null;
                        if (isset($br['purchase_price'])) $unitCost = (float)$br['purchase_price'];
                        elseif (isset($br['unit_cost'])) $unitCost = (float)$br['unit_cost'];

                        $supplierName = '';
                        $supplierId = null;
                        if (isset($br['manufacturer_id'])) $supplierId = $br['manufacturer_id'];
                        elseif (isset($br['supplier_id'])) $supplierId = $br['supplier_id'];
                        elseif (isset($br['supplier'])) $supplierName = $br['supplier'];

                        if (!empty($supplierId)) {
                            $sq = $this->db->select('name')->from('ms_hospitals_manufacturer')->where('id', $supplierId)->get();
                            $srow = $sq->row_array();
                            if (!empty($srow['name'])) $supplierName = $srow['name'];
                        }

                        $batches[] = [
                            'batchNumber'    => $br['batch_no'] ?? ($br['batch_number'] ?? ''),
                            'manufactureDate'=> $mfgDate,
                            'expiryDate'     => $expDate,
                            'quantity'       => isset($br['quantity']) ? (int)$br['quantity'] : 0,
                            'warehouse'      => $warehouse,
                            'rackPosition'   => $rackPosition,
                            'unitCost'       => $unitCost ?? 0,
                            'supplier'       => $supplierName,
                            'lastUpdated'    => $br['updated_at'] ?? '',
                            'status'         => $bStatus,
                        ];
                    }

                    $overview[] = [
                        'id'            => (string)$pid,
                        'productImage'  => $productImage,
                        'productName'   => $p['name'] ?? '',
                        'sku'           => $p['sku'] ?? '',
                        'category'      => $categoryName,
                        'brand'         => $brandName,
                        'totalStock'    => $totalStock,
                        'minLevel'      => $minLevel,
                        'maxLevel'      => $maxLevel,
                        'status'        => $status,
                        'batches'       => $batches,
                    ];
                }

                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($overview), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    "total"   => $totalCount,
                    "page"    => $page,
                    "limit"   => $limit,
                ]);

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }
        // ===== Inventory Overview Code End ===== //

        public function AddIvProductInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
               
                if (!$hosInfo || empty($hosInfo['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital information not found"
                    ]);
                    return;
                }

                // Get payload: support both JSON and multipart/form-data
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    // Fallback to standard POST for multipart/form-data
                    $rawData = $_POST;
                }
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $sku = isset($rawData['sku']) ? trim($this->decrypt_aes_from_js($rawData['sku'], $AES_KEY)) : '';
                $categoryId = isset($rawData['category_id']) ? trim($this->decrypt_aes_from_js($rawData['category_id'], $AES_KEY)) : '';
                $subcategoryId = isset($rawData['subcategory_id']) ? trim($this->decrypt_aes_from_js($rawData['subcategory_id'], $AES_KEY)) : '';
                $modelNumber = isset($rawData['model_number']) ? trim($this->decrypt_aes_from_js($rawData['model_number'], $AES_KEY)) : '';
                $uomId = isset($rawData['uom_id']) ? trim($this->decrypt_aes_from_js($rawData['uom_id'], $AES_KEY)) : '';
                $licenseNo = isset($rawData['license_no']) ? trim($this->decrypt_aes_from_js($rawData['license_no'], $AES_KEY)) : '';
                $barcode = isset($rawData['barcode']) ? trim($this->decrypt_aes_from_js($rawData['barcode'], $AES_KEY)) : '';
                $purchasePrice = isset($rawData['purchase_price']) ? trim($this->decrypt_aes_from_js($rawData['purchase_price'], $AES_KEY)) : '';
                $sellingPrice = isset($rawData['selling_price']) ? trim($this->decrypt_aes_from_js($rawData['selling_price'], $AES_KEY)) : '';
                $mrpPrice = isset($rawData['mrp_price']) ? trim($this->decrypt_aes_from_js($rawData['mrp_price'], $AES_KEY)) : '';
                $taxId = isset($rawData['tax_id']) ? trim($this->decrypt_aes_from_js($rawData['tax_id'], $AES_KEY)) : '';
                $minStock = isset($rawData['min_stock']) ? trim($this->decrypt_aes_from_js($rawData['min_stock'], $AES_KEY)) : '';
                $maxStock = isset($rawData['max_stock']) ? trim($this->decrypt_aes_from_js($rawData['max_stock'], $AES_KEY)) : '';
                $description = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

                // Validate required fields
                if (!$name || !$sku || !$categoryId || !$uomId || $purchasePrice === '' || $sellingPrice === '' || $minStock === '') {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $productuid = uniqid('HIP_');

                // Handle optional product image upload (multipart)
                $imageRelPath = null;
                $imageUploadError = null;
                if (!empty($_FILES['product_image']) && !empty($_FILES['product_image']['name'])) {
                    $uploadDir = FCPATH . 'assets/images/products/';
                    if (!is_dir($uploadDir)) {
                        // Attempt to create directory recursively
                        @mkdir($uploadDir, 0777, true);
                    }
                    $config = [
                        'upload_path'   => $uploadDir,
                        'allowed_types' => 'jpg|jpeg|png|gif|webp',
                        'max_size'      => 5120, // ~5MB
                        'encrypt_name'  => TRUE,
                    ];
                    $this->load->library('upload', $config);
                    if (!$this->upload->do_upload('product_image')) {
                        $imageUploadError = $this->upload->display_errors('', '');
                    } else {
                        $ud = $this->upload->data();
                        $imageRelPath = 'assets/images/products/' . $ud['file_name'];
                    }
                }

                $insertData = [
                    'productuid'       => $productuid,
                    'hospital_id'      => $hosInfo['id'],
                    'name'             => $name,
                    'sku'              => $sku,
                    'category_id'      => $categoryId,
                    'subcategory_id'   => $subcategoryId,
                    'model_number'     => $modelNumber,
                    'uom_id'           => $uomId,
                    'barcode'          => $barcode,
                    'purchase_price'   => (float)$purchasePrice,
                    'selling_price'    => (float)$sellingPrice,
                    'mrp_price'        => (float)$mrpPrice,
                    'tax_id'           => $taxId,
                    'min_stock_level'      => (int)$minStock,
                    'max_stock_capacity'   => ($maxStock === '' ? null : (int)$maxStock),
                    'description'      => $description,
                    'drug_license_no'  => $licenseNo,
                    'status'           => $status,
                    'isdelete'         => 0,
                    'created_by'       => $hosInfo['id'],
                    'created_at'       => date('Y-m-d H:i:s'),
                    'updated_at'       => date('Y-m-d H:i:s')
                ];

                // Store image path in DB if a suitable column exists
                if (!empty($imageRelPath)) {
                    if ($this->db->field_exists('image_url', 'ms_hospitals_inventory_products')) {
                        $insertData['image_url'] = $imageRelPath;
                    } elseif ($this->db->field_exists('product_image', 'ms_hospitals_inventory_products')) {
                        $insertData['product_image'] = $imageRelPath;
                    } elseif ($this->db->field_exists('image', 'ms_hospitals_inventory_products')) {
                        $insertData['image'] = $imageRelPath;
                    }
                }

                $result = $this->db->insert('ms_hospitals_inventory_products', $insertData);

                if ($result) {
                    $resp = [
                        "success" => true,
                        "message" => "product added successfully",
                        "id" => $productuid
                    ];
                    if (!empty($imageRelPath)) {
                        $resp['image_path'] = $imageRelPath;
                    }
                    if (!empty($imageUploadError)) {
                        $resp['image_error'] = $imageUploadError;
                    }
                    echo json_encode($resp);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add product"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }
    // ===== Inventory Product Code End here ===== //

    // ===== Inventory Batch Code Start here ===== //
    public function AddIvBatchInformation(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $hosInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            
            if (!$hosInfo || empty($hosInfo['id'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Hospital information not found"
                ]);
                return;
            }

            // Get payload (JSON expected)
            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Decrypt fields
            $productId = isset($rawData['product_id']) ? trim($this->decrypt_aes_from_js($rawData['product_id'], $AES_KEY)) : '';
            $batchesEnc = isset($rawData['batches']) ? $rawData['batches'] : '';
            $batchesJson = $batchesEnc ? $this->decrypt_aes_from_js($batchesEnc, $AES_KEY) : '';
            $batchItems = [];
            if (!empty($batchesJson)) {
                $tmp = json_decode($batchesJson, true);
                if (is_array($tmp)) $batchItems = $tmp;
            }

            if (!$productId || empty($batchItems)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing required fields"
                ]);
                return;
            }

            // Determine product reference key for batches table
            $productRefKey = 'product_id';
            $productRefValue = $productId;
            if (!$this->db->field_exists('product_id', 'ms_hospitals_inventory_batches') && $this->db->field_exists('productuid', 'ms_hospitals_inventory_batches')) {
                $productRefKey = 'productuid';
                // Attempt to map numeric product id to productuid
                $pq = $this->db->select('productuid')->from('ms_hospitals_inventory_products')->where('id', $productId)->get();
                $prow = $pq->row_array();
                if (!empty($prow['productuid'])) {
                    $productRefValue = $prow['productuid'];
                }
            }

            $added = 0;
            $errors = [];

            foreach ($batchItems as $idx => $item) {
                $batchNumber = trim($item['batchNumber'] ?? '');
                $mfgDate = trim($item['mfgDate'] ?? '');
                $expiryDate = trim($item['expiryDate'] ?? '');
                $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 0;
                $supplierId = trim($item['supplierId'] ?? ($item['supplier'] ?? ''));
                $purchaseRate = isset($item['purchaseRate']) && $item['purchaseRate'] !== '' ? (float)$item['purchaseRate'] : null;
                $mrp = isset($item['mrp']) && $item['mrp'] !== '' ? (float)$item['mrp'] : null;
                $rackPosition = trim($item['rackPosition'] ?? '');
                $notes = trim($item['notes'] ?? '');

                if (!$batchNumber || !$mfgDate || !$expiryDate || $quantity <= 0) {
                    $errors[] = "Row " . ($idx + 1) . " has incomplete required fields";
                    continue;
                }

                $insertData = [
                    'batchuid'      => uniqid('HIB_'),
                    'hospital_id'   => $hosInfo['id'],
                    $productRefKey  => $productRefValue,
                    'batch_no'      => $batchNumber,
                    'mfg_date'      => $mfgDate,
                    'exp_date'      => $expiryDate,
                    'quantity'      => $quantity,
                    'status'        => 1,
                    'isdelete'      => 0,
                    'created_by'    => $hosInfo['id'],
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                // Conditional optional fields based on table schema
                if (!empty($supplierId)) {
                    if ($this->db->field_exists('manufacturer_id', 'ms_hospitals_inventory_batches')) {
                        $insertData['manufacturer_id'] = $supplierId;
                    } elseif ($this->db->field_exists('supplier_id', 'ms_hospitals_inventory_batches')) {
                        $insertData['supplier_id'] = $supplierId;
                    } elseif ($this->db->field_exists('supplier', 'ms_hospitals_inventory_batches')) {
                        $insertData['supplier'] = $supplierId;
                    }
                }

                if ($purchaseRate !== null && $this->db->field_exists('purchase_price', 'ms_hospitals_inventory_batches')) {
                    $insertData['purchase_price'] = $purchaseRate;
                }
                if ($mrp !== null) {
                    if ($this->db->field_exists('mrp', 'ms_hospitals_inventory_batches')) {
                        $insertData['mrp'] = $mrp;
                    } elseif ($this->db->field_exists('mrp_price', 'ms_hospitals_inventory_batches')) {
                        $insertData['mrp_price'] = $mrp;
                    }
                }
                if (!empty($rackPosition) && $this->db->field_exists('rack_position', 'ms_hospitals_inventory_batches')) {
                    $insertData['rack_position'] = $rackPosition;
                } elseif (!empty($rackPosition) && $this->db->field_exists('storage_location', 'ms_hospitals_inventory_batches')) {
                    $insertData['storage_location'] = $rackPosition;
                }

                // Notes (optional) mapped to compatible column names
                if (!empty($notes)) {
                    if ($this->db->field_exists('notes', 'ms_hospitals_inventory_batches')) {
                        $insertData['notes'] = $notes;
                    } elseif ($this->db->field_exists('note', 'ms_hospitals_inventory_batches')) {
                        $insertData['note'] = $notes;
                    } elseif ($this->db->field_exists('remarks', 'ms_hospitals_inventory_batches')) {
                        $insertData['remarks'] = $notes;
                    } elseif ($this->db->field_exists('remark', 'ms_hospitals_inventory_batches')) {
                        $insertData['remark'] = $notes;
                    } elseif ($this->db->field_exists('description', 'ms_hospitals_inventory_batches')) {
                        $insertData['description'] = $notes;
                    }
                }

                // Attach product UOM to batch if schema supports it
                if ($this->db->field_exists('uom_id', 'ms_hospitals_inventory_batches') || $this->db->field_exists('uomuid', 'ms_hospitals_inventory_batches')) {
                    $pq2 = $this->db->select('uom_id, uomuid')->from('ms_hospitals_inventory_products')->where('id', $productId)->get();
                    $prow2 = $pq2->row_array();
                    $uomVal = '';
                    if (!empty($prow2['uom_id'])) {
                        $uomVal = $prow2['uom_id'];
                    } elseif (!empty($prow2['uomuid'])) {
                        $uomVal = $prow2['uomuid'];
                    }
                    if (!empty($uomVal)) {
                        if ($this->db->field_exists('uom_id', 'ms_hospitals_inventory_batches')) {
                            $insertData['uom_id'] = $uomVal;
                        } elseif ($this->db->field_exists('uomuid', 'ms_hospitals_inventory_batches')) {
                            $insertData['uomuid'] = $uomVal;
                        }
                    }
                }

                $result = $this->db->insert('ms_hospitals_inventory_batches', $insertData);
                if ($result) {
                    $added++;
                } else {
                    $errors[] = "Row " . ($idx + 1) . " failed to insert";
                }
            }

            echo json_encode([
                "success" => $added > 0,
                "message" => $added > 0 ? "Batch(es) added successfully" : "No batches added",
                "added_count" => $added,
                "errors" => $errors,
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }
    // ===== Inventory Batch Code End here ===== //
}