<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class SFStaffController  extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('AdmCommonModel');
        $this->load->model('DoctorCommonModel');
        $this->load->model('StaffCommonModel');
        $this->load->model('ActivityLogModel');
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


    // Staff: Get Patient List (encrypted payload + response)
    public function getPatientList(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Validate token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414"; // must match frontend key
            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) $rawData = [];

            // Decrypt incoming filters/pagination
            $pageEnc   = $rawData['page'] ?? null;
            $limitEnc  = $rawData['limit'] ?? null;
            $searchEnc = $rawData['search'] ?? null;

            $page   = $pageEnc ? intval($this->decrypt_aes_from_js($pageEnc, $AES_KEY)) : 1;
            $limit  = $limitEnc ? intval($this->decrypt_aes_from_js($limitEnc, $AES_KEY)) : 10;
            $search = $searchEnc ? trim($this->decrypt_aes_from_js($searchEnc, $AES_KEY)) : '';

            if ($page < 1) $page = 1;
            if ($limit < 1) $limit = 10;
            $offset = ($page - 1) * $limit;

            // Load models
            $this->load->model('PatientCommonModel');
            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo || empty($staffInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Staff hospital not found"
                ]);
                return;
            }

            // Fetch patient list and count scoped to staff's hospital
            $hosuid = $staffInfo['hosuid'];
            $totalCount = $this->PatientCommonModel->get_PatientCountByHospital($search, $hosuid);
            $list = $this->PatientCommonModel->get_PatientListByHospital($search, $hosuid, $limit, $offset);

            // Encrypt response data
            $payload = json_encode([
                'items' => $list,
                'total' => $totalCount,
                'page'  => $page,
                'limit' => $limit
            ]);
            $encryptedData = $this->encrypt_aes_for_js($payload, $AES_KEY);

            echo json_encode([
                "success" => true,
                "data" => $encryptedData
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    }


    public function getStaffPermissions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            
            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $staffAccess = $this->StaffCommonModel->get_StaffAccessById($loguid);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($staffAccess), $AES_KEY);


            echo json_encode([
                "success" => true,
                //"data"    => $staffAccess,
                "data"    => $encryptedData,
            ]);



        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function getDoctorList(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if($staffInfo){

                $doctorList = $this->DoctorCommonModel->get_DoctorListByHospitalUid($staffInfo['hosuid']);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($doctorList), $AES_KEY);


                echo json_encode([
                    "success" => true,
                    //"data"    => $doctorList,
                    "data"    => $encryptedData,
                ]);


            }else{
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user"
                ]);
                return;
            }


            



        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function saveDoctorSchedule() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Validate token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // Decrypt AES payload
            $AES_KEY = "RohitGaradHos@173414";
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            $doctorIdEnc = $body['doctorId'] ?? null;
            $weekdaysEnc = $body['weekdays'] ?? null;
            $slotsEnc    = $body['slots'] ?? null;

            $doctorId = $this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);
            $weekdays = json_decode($this->decrypt_aes_from_js($weekdaysEnc, $AES_KEY), true);
            $slots    = json_decode($this->decrypt_aes_from_js($slotsEnc, $AES_KEY), true);

            if (!$doctorId || empty($weekdays) || empty($slots)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid or incomplete payload"
                ]);
                return;
            }



            // Get hospital info from logged staff
            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid staff user"
                ]);
                return;
            }

            // --- Core Logic ---
            $this->db->trans_start();

            $insertCount = 0;
            $updateCount = 0;
            $deleteCount = 0;

            foreach ($weekdays as $day) {
                // Check if schedule already exists for this doctor and day
                $existing = $this->db->get_where('ms_doctor_schedules', [
                    'docuid' => $doctorId,
                    'weekday' => $day
                ])->row_array();

                if ($existing) {
                    $schedule_id = $existing['id'];

                    // Update existing schedule
                    $this->db->where('id', $schedule_id)->update('ms_doctor_schedules', [
                        'is_available' => 1,
                        'updated_by'   => $loguid,
                        'updated_at'   => date('Y-m-d H:i:s')
                    ]);
                    $updateCount++;

                    // Delete old slots for this schedule
                    $this->db->where('schedule_id', $schedule_id)->delete('ms_doctor_time_slots');
                    $deleteCount++;
                } else {
                    // Insert new schedule
                    $this->db->insert('ms_doctor_schedules', [
                        'docuid'       => $doctorId,
                        'repeat_type'  => 'Weekly',
                        'weekday'      => $day,
                        'is_available' => 1,
                        'created_by'   => $loguid,
                        'created_at'   => date('Y-m-d H:i:s')
                    ]);
                    $schedule_id = $this->db->insert_id();
                    $insertCount++;
                }

                // Insert slots
                foreach ($slots as $slot) {
                    $this->db->insert('ms_doctor_time_slots', [
                        'schedule_id'      => $schedule_id,
                        'title'            => $slot['title'] ?? 'Custom',
                        'start_time'       => $slot['start_time'],
                        'notes'             => $slot['notes'] ?? '',
                        'type'              => $slot['event_type_id'] ?? '',
                        'end_time'         => $slot['end_time'],
                        'max_appointments' => $slot['max_appointments'] ?? 0,
                        'created_by'       => $loguid,
                        'created_at'       => date('Y-m-d H:i:s')
                    ]);
                    $insertCount++;
                }
            }

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                // ❌ Log failure
                $this->ActivityLogModel->logActivity([
                    'loguid' => $loguid,
                    'role' => 'staff',
                    'hosuid' => $staffInfo['hosuid'] ?? null,
                    'action_type' => 'ERROR',
                    'api_name' => 'sf_staff_saveDoctorSchedule',
                    'description' => "Database error while saving schedule for doctor {$doctorId}",
                    'request_payload' => compact('doctorId', 'weekdays', 'slots')
                ]);

                echo json_encode([
                    "success" => false,
                    "message" => "Database error while saving schedule"
                ]);
            } else {
                // ✅ Log success
                $this->ActivityLogModel->logActivity([
                    'loguid' => $loguid,
                    'role' => 'staff',
                    'hosuid' => $staffInfo['hosuid'] ?? null,
                    'action_type' => 'UPDATE',
                    'api_name' => 'sf_staff_saveDoctorSchedule',
                    'description' => "Staff updated schedule for doctor {$doctorId} — Inserted {$insertCount}, Updated {$updateCount}, Deleted {$deleteCount}",
                    'request_payload' => compact('doctorId', 'weekdays', 'slots')
                ]);

                echo json_encode([
                    "success" => true,
                    "message" => "Doctor schedule saved successfully"
                ]);
            }

        } catch (Exception $e) {
            // ❌ Log unexpected error
            $this->ActivityLogModel->logActivity([
                'loguid' => $loguid ?? 'unknown',
                'role' => $srole ?? 'unknown',
                'action_type' => 'ERROR',
                'api_name' => 'sf_staff_saveDoctorSchedule',
                'description' => "Exception: " . $e->getMessage()
            ]);

            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
    }


    /*public function getDoctorSchedule() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Validate token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // Decrypt payload
            $AES_KEY = "RohitGaradHos@173414";
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            $doctorIdEnc = $body['doctorId'] ?? null;
            if (!$doctorIdEnc) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing doctorId"
                ]);
                return;
            }

            $doctorId = $this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);

            // Get hospital info from logged staff
            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid staff user"
                ]);
                return;
            }

            // Fetch schedules for this doctor in this hospital
            $schedules = $this->db->get_where('ms_doctor_schedules', [
                'docuid' => $doctorId
            ])->result_array();

            $result = [];
            foreach ($schedules as $sched) {
                $slots = $this->db->get_where('ms_doctor_time_slots', [
                    'schedule_id' => $sched['id']
                ])->result_array();

                $result[] = [
                    'weekday' => $sched['weekday'],
                    'slots'   => array_map(function($s) {
                        return [
                            'title'            => $s['title'],
                            'type'             => $s['type'],
                            'start_time'       => $s['start_time'],
                            'end_time'         => $s['end_time'],
                            'max_appointments' => $s['max_appointments']
                        ];
                    }, $slots)
                ];
            }

            // Encrypt response
            $encryptedData = $this->encrypt_aes_for_js(json_encode($result), $AES_KEY);

            echo json_encode([
                "success" => true,
                //"data"    => $result
                "data"    => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
    }*/


    public function getDoctorSchedule(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Validate token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // Decrypt payload
            $AES_KEY = "RohitGaradHos@173414";
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            $doctorIdEnc = $body['doctorId'] ?? null;
            if (!$doctorIdEnc) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing doctorId"
                ]);
                return;
            }

            $doctorId = $this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);

            // Get hospital info from logged staff
            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid staff user"
                ]);
                return;
            }

            $hosuid = $staffInfo['hosuid'];

            // Fetch all event types for hospital (to avoid multiple DB calls)
            $eventTypes = $this->db
                ->get_where('ms_hospitals_event_type', [
                    'hosuid' => $hosuid,
                    'isdelete' => 0,
                    'status' => 1
                ])
                ->result_array();

            // Map event types by eventuid
            $eventMap = [];
            foreach ($eventTypes as $ev) {
                $eventMap[$ev['eventuid']] = [
                    'name' => $ev['name'],
                    'color' => $ev['color']
                ];
            }

            // Fetch schedules for this doctor in this hospital
            $schedules = $this->db->get_where('ms_doctor_schedules', [
                'docuid' => $doctorId
            ])->result_array();

            $result = [];
            foreach ($schedules as $sched) {
                $slots = $this->db->get_where('ms_doctor_time_slots', [
                    'schedule_id' => $sched['id']
                ])->result_array();

                $mappedSlots = array_map(function ($s) use ($eventMap) {
                    $etype = $eventMap[$s['type']] ?? ['name' => null, 'color' => null];

                    return [
                        'title'            => $s['title'],
                        'type'             => $s['type'],
                        'type_name'        => !empty($etype['name']) ? $etype['name'] : '',
                        'type_color'       => !empty($etype['color']) ? $etype['color'] : '#ccc',
                        'start_time'       => $s['start_time'],
                        'end_time'         => $s['end_time'],
                        'max_appointments' => $s['max_appointments'],
                        'notes'            => $s['notes']
                    ];
                }, $slots);

                $result[] = [
                    'weekday' => $sched['weekday'],
                    'slots'   => $mappedSlots
                ];
            }

            // Encrypt response
            $encryptedData = $this->encrypt_aes_for_js(json_encode($result), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
                //"data"    => $result
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
    }



    /*public function getDoctorEventSchedule() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Validate token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // Decrypt payload
            $AES_KEY = "RohitGaradHos@173414";
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            $doctorIdEnc = $body['doctorId'] ?? null;
            if (!$doctorIdEnc) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing doctorId"
                ]);
                return;
            }

            $doctorId = $this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);

            // Get hospital info from logged staff
            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid staff user"
                ]);
                return;
            }

            // Step 1: Fetch master schedules
            $masterSchedules = $this->db
                ->where('docuid', $doctorId)
                ->get('ms_doctor_schedules')
                ->result_array();

            $masterData = [];
            foreach ($masterSchedules as $sched) {
                $slots = $this->db
                    ->where('schedule_id', $sched['id'])
                    ->get('ms_doctor_time_slots')
                    ->result_array();

                $masterData[$sched['weekday']] = [
                    'weekday' => $sched['weekday'],
                    'is_available' => (int)$sched['is_available'],
                    'slots' => array_map(function ($s) {
                        return [
                            'title' => $s['title'],
                            'type' => $s['type'],
                            'notes' => $s['notes'],
                            'start_time' => $s['start_time'],
                            'end_time' => $s['end_time'],
                            'max_appointments' => $s['max_appointments']
                        ];
                    }, $slots)
                ];
            }

            // Step 2: Define date range (current month + next 2 months)
            $startDate = date('Y-m-01');
            $endDate = date('Y-m-t', strtotime('+2 months'));

            // Step 3: Fetch event-based schedules in this range
            $eventSchedules = $this->db
                ->where('docuid', $doctorId)
                ->where('date >=', $startDate)
                ->where('date <=', $endDate)
                ->get('ms_doctor_event_schedules')
                ->result_array();

            $eventData = [];
            foreach ($eventSchedules as $event) {
                $eventSlots = $this->db
                    ->where('event_id', $event['id'])
                    ->get('ms_doctor_event_slots')
                    ->result_array();

                $eventData[$event['date']] = [
                    'date' => $event['date'],
                    'is_available' => (int)$event['is_available'],
                    'slots' => array_map(function ($s) {
                        return [
                            'title' => $s['title'],
                            'type' => $s['type'],
                            'notes' => $s['notes'],
                            'start_time' => $s['start_time'],
                            'end_time' => $s['end_time'],
                            'max_appointments' => $s['max_appointments'],
                            'notes' => $s['notes']
                        ];
                    }, $eventSlots)
                ];
            }

            // Step 4: Build full calendar data (day-by-day)
            $finalData = [];
            $period = new DatePeriod(
                new DateTime($startDate),
                new DateInterval('P1D'),
                (new DateTime($endDate))->modify('+1 day')
            );

            foreach ($period as $dateObj) {
                $date = $dateObj->format('Y-m-d');
                $weekday = $dateObj->format('D'); // Mon, Tue, etc.

                // Check if event override exists
                if (isset($eventData[$date])) {
                    $finalData[] = [
                        'date' => $date,
                        'weekday' => $weekday,
                        'is_available' => $eventData[$date]['is_available'],
                        'slots' => $eventData[$date]['slots'],
                        'source' => 'event'
                    ];
                } else {
                    // Use master schedule (if any)
                    $finalData[] = [
                        'date' => $date,
                        'weekday' => $weekday,
                        'is_available' => $masterData[$weekday]['is_available'] ?? 0,
                        'slots' => $masterData[$weekday]['slots'] ?? [],
                        'source' => 'master'
                    ];
                }
            }

            // Step 5: Encrypt and return
            $encryptedData = $this->encrypt_aes_for_js(json_encode($finalData), $AES_KEY);

            echo json_encode([
                "success" => true,
                //"data" => $finalData
                "data" => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
    }*/


    public function getDoctorEventSchedule() { 
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Validate token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // Decrypt payload
            $AES_KEY = "RohitGaradHos@173414";
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            $doctorIdEnc = $body['doctorId'] ?? null;
            if (!$doctorIdEnc) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing doctorId"
                ]);
                return;
            }

            $doctorId = $this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);

            // Get hospital info from logged staff
            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid staff user"
                ]);
                return;
            }

            $hosuid = $staffInfo['hosuid'];

            // ✅ Preload all event types using eventuid
            $eventTypes = $this->db->where('hosuid', $hosuid)
                                   ->get('ms_hospitals_event_type')
                                   ->result_array();
            $eventTypeMap = [];
            foreach ($eventTypes as $et) {
                /*$eventTypeMap[(int)$et['eventuid']] = [
                    'name' => $et['name'],
                    'color' => $et['color']
                ];*/

                $eventTypeMap[$et['eventuid']] = [
                    'name' => $et['name'],
                    'color' => $et['color']
                ];

            }

            


            // ✅ Fetch master schedules
            $masterSchedules = $this->db
                ->where('docuid', $doctorId)
                ->get('ms_doctor_schedules')
                ->result_array();

            $masterData = [];
            foreach ($masterSchedules as $sched) {
                $slots = $this->db
                    ->where('schedule_id', $sched['id'])
                    ->get('ms_doctor_time_slots')
                    ->result_array();

                $masterData[$sched['weekday']] = [
                    'weekday' => $sched['weekday'],
                    'is_available' => (int)$sched['is_available'],
                    'slots' => array_map(function ($s) use ($eventTypeMap) {
                        $etype = $eventTypeMap[$s['type']] ?? ['name' => '', 'color' => '#ccc'];
                        return [
                            'title' => $s['title'],
                            'type' => $s['type'],
                            'type_name' => $etype['name'],
                            'type_color' => $etype['color'],
                            'notes' => $s['notes'],
                            'start_time' => $s['start_time'],
                            'end_time' => $s['end_time'],
                            'max_appointments' => $s['max_appointments']
                        ];
                    }, $slots)
                ];
            }

            // ✅ Define date range (current month + next 2 months)
            $startDate = date('Y-m-01');
            $endDate = date('Y-m-t', strtotime('+2 months'));

            // ✅ Fetch event-based schedules
            $eventSchedules = $this->db
                ->where('docuid', $doctorId)
                ->where('date >=', $startDate)
                ->where('date <=', $endDate)
                ->get('ms_doctor_event_schedules')
                ->result_array();

            $eventData = [];
            foreach ($eventSchedules as $event) {
                $eventSlots = $this->db
                    ->where('event_id', $event['id'])
                    ->get('ms_doctor_event_slots')
                    ->result_array();

                $eventData[$event['date']] = [
                    'date' => $event['date'],
                    'is_available' => (int)$event['is_available'],
                    'slots' => array_map(function ($s) use ($eventTypeMap) {
                        $etype = $eventTypeMap[$s['type']] ?? ['name' => '', 'color' => '#ccc'];
                        return [
                            'title' => $s['title'],
                            'type' => $s['type'],
                            'type_name' => $etype['name'],
                            'type_color' => $etype['color'],
                            'notes' => $s['notes'],
                            'start_time' => $s['start_time'],
                            'end_time' => $s['end_time'],
                            'max_appointments' => $s['max_appointments']
                        ];
                    }, $eventSlots)
                ];
            }

            // ✅ Build full calendar data
            $finalData = [];
            $period = new DatePeriod(
                new DateTime($startDate),
                new DateInterval('P1D'),
                (new DateTime($endDate))->modify('+1 day')
            );

            foreach ($period as $dateObj) {
                $date = $dateObj->format('Y-m-d');
                $weekday = $dateObj->format('D');

                if (isset($eventData[$date])) {
                    $finalData[] = [
                        'date' => $date,
                        'weekday' => $weekday,
                        'is_available' => $eventData[$date]['is_available'],
                        'slots' => $eventData[$date]['slots'],
                        'source' => 'event'
                    ];
                } else {
                    $finalData[] = [
                        'date' => $date,
                        'weekday' => $weekday,
                        'is_available' => $masterData[$weekday]['is_available'] ?? 0,
                        'slots' => $masterData[$weekday]['slots'] ?? [],
                        'source' => 'master'
                    ];
                }
            }

            // ✅ Encrypt and return
            $encryptedData = $this->encrypt_aes_for_js(json_encode($finalData), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data" => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
    }




    public function getShiftList(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if($staffInfo){

                $AES_KEY = "RohitGaradHos@173414";
                $shifts = $this->db
                    ->select('shiftuid, shift_name, start_time, end_time, status')
                    ->from('ms_hospitals_shift_time')
                    ->where('hosuid', $staffInfo['hosuid'])
                    ->where('isdelete', 0)
                    ->get()
                    ->result_array();

                $encryptedData = $this->encrypt_aes_for_js(json_encode($shifts), $AES_KEY);


                echo json_encode([
                    "success" => true,
                    //"data"    => $shifts,
                    "data"    => $encryptedData,
                ]);

            }else{
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user"
                ]);
                return;
            }


            



        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function getEventTypeList(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if($staffInfo){
                
                $AES_KEY = "RohitGaradHos@173414";
                $events = $this->db
                    ->select('eventuid, name, description, status')
                    ->from('ms_hospitals_event_type')
                    ->where('hosuid', $staffInfo['hosuid'])
                    ->where('isdelete', 0)
                    ->get()
                    ->result_array();

                $encryptedData = $this->encrypt_aes_for_js(json_encode($events), $AES_KEY);


                echo json_encode([
                    "success" => true,
                    //"data"    => $events,
                    "data"    => $encryptedData,
                ]);

            }else{
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user"
                ]);
                return;
            }


            



        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function getDoctorAppointmentsByDate(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            $doctorIdEnc = $body['doctorId'] ?? null;
            $dateEnc     = $body['date'] ?? null;

            if (!$doctorIdEnc || !$dateEnc) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing doctorId or date"
                ]);
                return;
            }

            $doctorId = $this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);
            $date     = $this->decrypt_aes_from_js($dateEnc, $AES_KEY);


            // Ensure staff belongs to a hospital; we may scope if needed later
            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid staff user"
                ]);
                return;
            }

            // Build query for today's appointments for selected doctor
            $this->db
                ->select('a.id, a.appointment_uid, a.patient_id, a.doctor_id, a.date, a.token_no, a.start_time, a.end_time, a.status, a.queue_position, a.arrival_time, a.consultation_start_time, a.completed_time, a.patient_name, a.phone, p.fname, p.lname')
                ->from('ms_patient_appointment a')
                ->join('ms_patient p', 'p.id = a.patient_id', 'left')
                ->where('a.doctor_id', $doctorId)
                ->where('a.date', $date)
                ->where('(a.status <> "cancelled" OR a.status IS NULL)', null, false);

            $rows = $this->db->get()->result_array();

            // Map to a UI-friendly structure using stored status
            $list = array_map(function($r){
                $statusRaw = isset($r['status']) ? strtolower(trim($r['status'])) : 'booked';
                // Normalize legacy statuses to new set: booked | arrived | waiting | active | completed
                if ($statusRaw === 'in-consultation') {
                    $status = 'active';
                } elseif (in_array($statusRaw, ['booked','arrived','waiting','active','completed'])) {
                    $status = $statusRaw;
                } else {
                    $status = 'booked';
                }

                $patientName = trim(($r['fname'] ?? '') . ' ' . ($r['lname'] ?? ''));
                if ($patientName === '') {
                    $patientName = $r['patient_name'] ?? '';
                }

                return [
                    'id' => (string)$r['appointment_uid'],
                    'tokenNumber' => (int)($r['token_no'] ?? 0),
                    'patient' => [
                        'id' => (string)($r['patient_id'] ?? ''),
                        'name' => $patientName,
                        'phone' => (string)($r['phone'] ?? ''),
                        'age' => 0
                    ],
                    'doctor' => [ 'id' => (string)($r['doctor_id'] ?? '') ],
                    'date' => $r['date'],
                    'timeSlot' => [
                        'id' => '',
                        'startTime' => $r['start_time'] ?? '',
                        'endTime' => $r['end_time'] ?? '',
                        'totalTokens' => 0,
                        'bookedTokens' => 0
                    ],
                    'status' => $status,
                    'queuePosition' => isset($r['queue_position']) ? (int)$r['queue_position'] : null,
                    'arrivalTime' => $r['arrival_time'] ?? null,
                    'consultationStartTime' => $r['consultation_start_time'] ?? null,
                    'completedTime' => $r['completed_time'] ?? null,
                ];
            }, $rows);

            $payload = json_encode(['items' => $list]);
            $encryptedData = $this->encrypt_aes_for_js($payload, $AES_KEY);

            echo json_encode([
                'success' => true,
                'data' => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    // Update appointment status and queue info (encrypted request)
   /* public function updateAppointmentStatus(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || !in_array($srole, ['staff', 'doctor'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }


            $AES_KEY = "RohitGaradHos@173414";
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            $appointmentIdEnc = $body['appointmentId'] ?? null; // appointment_uid
            $doctorIdEnc      = $body['doctorId'] ?? null;
            $dateEnc          = $body['date'] ?? null; // YYYY-MM-DD
            $statusEnc        = $body['status'] ?? null; // booked/waiting/active/completed
            $queuePosEnc      = $body['queuePosition'] ?? null; // optional

            if (!$appointmentIdEnc || !$doctorIdEnc || !$dateEnc || !$statusEnc) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing required fields"
                ]);
                return;
            }

            $appointmentUid = $this->decrypt_aes_from_js($appointmentIdEnc, $AES_KEY);
            $doctorId       = (int)$this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);
            $date           = $this->decrypt_aes_from_js($dateEnc, $AES_KEY);
            $statusRaw      = strtolower(trim($this->decrypt_aes_from_js($statusEnc, $AES_KEY)));
            $queuePosition  = $queuePosEnc ? (int)$this->decrypt_aes_from_js($queuePosEnc, $AES_KEY) : null;

            // Accept legacy and new statuses
            $allowed = ['booked','arrived','waiting','in-consultation','active','completed'];
            if (!in_array($statusRaw, $allowed)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid status value"
                ]);
                return;
            }

            // Ensure optional tracking columns exist
            $this->ensureAppointmentColumns();


            $apt = $this->db
                ->select('id, appointment_uid, doctor_id, patient_id, date, token_no, start_time, end_time, status, queue_position, arrival_time')
                ->from('ms_patient_appointment')
                ->group_start()
                    ->where('appointment_uid', $appointmentUid)
                    ->or_where('id', $appointmentUid)
                ->group_end()
                ->limit(1)
                ->get()
                ->row_array();


            if (!$apt) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Appointment not found'
                ]);
                return;
            }

            // Slot and current queue position context (used across status changes)
            $slotStart = isset($apt['start_time']) ? $apt['start_time'] : null;
            $slotEnd   = isset($apt['end_time']) ? $apt['end_time'] : null;
            $oldPos    = (isset($apt['queue_position']) && is_numeric($apt['queue_position'])) ? (int)$apt['queue_position'] : null;

            // Compute queue position for arrival if not provided
            $now = date('Y-m-d H:i:s');
            $updateData = ['status' => $statusRaw, 'updated_at' => $now];

            // Normalize legacy 'in-consultation' to 'active' when storing
            if ($statusRaw === 'in-consultation') { $statusRaw = 'active'; $updateData['status'] = 'active'; }

            if ($statusRaw === 'waiting') {
                // Preserve prior arrival_time if already set; else set now
                if (empty($apt['arrival_time'])) {
                    $updateData['arrival_time'] = $now;
                }
                // Always compute next position per doctor, date, and slot (ignore incoming queuePosition)
                $qbMax = $this->db->select('MAX(queue_position) AS maxpos')
                                  ->from('ms_patient_appointment')
                                  ->where('doctor_id', $doctorId)
                                  ->where('date', $date)
                                  ->where('status', 'waiting');
                if (!empty($slotStart)) { $qbMax->where('start_time', $slotStart); }
                if (!empty($slotEnd))   { $qbMax->where('end_time', $slotEnd); }
                $resMax = $qbMax->get()->row_array();
                $maxPos = (isset($resMax['maxpos']) && is_numeric($resMax['maxpos'])) ? (int)$resMax['maxpos'] : null;

                $qbCnt = $this->db->select('COUNT(*) AS cnt')
                                  ->from('ms_patient_appointment')
                                  ->where('doctor_id', $doctorId)
                                  ->where('date', $date)
                                  ->where('status', 'waiting');
                if (!empty($slotStart)) { $qbCnt->where('start_time', $slotStart); }
                if (!empty($slotEnd))   { $qbCnt->where('end_time', $slotEnd); }
                $resCnt = $qbCnt->get()->row_array();
                $cnt = (isset($resCnt['cnt']) && is_numeric($resCnt['cnt'])) ? (int)$resCnt['cnt'] : 0;

                $updateData['queue_position'] = ($maxPos === null) ? $cnt : ($maxPos + 1);
            } elseif ($statusRaw === 'arrived') {
                // Mark arrival without assigning queue position
                $updateData['arrival_time'] = $now;
                $updateData['queue_position'] = null;
            } elseif ($statusRaw === 'active') {
                $updateData['consultation_start_time'] = $now;
                $updateData['queue_position'] = null; // remove from waiting queue
            } elseif ($statusRaw === 'completed') {
                $updateData['completed_time'] = $now;
                $updateData['queue_position'] = null;
            }

            // Use a transaction to keep queue updates consistent
            $this->db->trans_start();
            $this->db->where('appointment_uid', $appointmentUid)
                     ->update('ms_patient_appointment', $updateData);

            // If starting consultation, compact the waiting queue by shifting positions down
            if ($statusRaw === 'active' && $oldPos !== null) {
                $qbDec = $this->db->set('queue_position', 'queue_position - 1', false)
                                  ->where('doctor_id', $doctorId)
                                  ->where('date', $date)
                                  ->where('status', 'waiting')
                                  ->where('queue_position >', $oldPos);
                if (!empty($slotStart)) { $qbDec->where('start_time', $slotStart); }
                if (!empty($slotEnd))   { $qbDec->where('end_time', $slotEnd); }
                $qbDec->update('ms_patient_appointment');
            }
            $this->db->trans_complete();

            // Return updated record
            $row = $this->db
                ->select('a.appointment_uid, a.patient_id, a.doctor_id, a.date, a.token_no, a.start_time, a.end_time, a.status, a.queue_position, a.arrival_time, a.consultation_start_time, a.completed_time, p.fname, p.lname, p.phone, a.patient_name')
                ->from('ms_patient_appointment a')
                ->join('ms_patient p', 'p.id = a.patient_id', 'left')
                ->where('a.appointment_uid', $appointmentUid)
                ->limit(1)
                ->get()->row_array();

            $patientName = trim(($row['fname'] ?? '') . ' ' . ($row['lname'] ?? ''));
            if ($patientName === '') {
                $patientName = $row['patient_name'] ?? '';
            }

            $payload = json_encode([
                'item' => [
                    'id' => (string)$row['appointment_uid'],
                    'tokenNumber' => (int)($row['token_no'] ?? 0),
                    'patient' => [
                        'id' => (string)($row['patient_id'] ?? ''),
                        'name' => $patientName,
                        'phone' => (string)($row['phone'] ?? ''),
                        'age' => 0
                    ],
                    'doctor' => [ 'id' => (string)($row['doctor_id'] ?? '') ],
                    'date' => $row['date'],
                    'timeSlot' => [
                        'id' => '',
                        'startTime' => $row['start_time'] ?? '',
                        'endTime' => $row['end_time'] ?? '',
                        'totalTokens' => 0,
                        'bookedTokens' => 0
                    ],
                    'status' => strtolower(trim($row['status'] ?? 'booked')),
                    'queuePosition' => isset($row['queue_position']) ? (int)$row['queue_position'] : null,
                    'arrivalTime' => $row['arrival_time'] ?? null,
                    'consultationStartTime' => $row['consultation_start_time'] ?? null,
                    'completedTime' => $row['completed_time'] ?? null,
                ]
            ]);
            $encrypted = $this->encrypt_aes_for_js($payload, $AES_KEY);

            echo json_encode(['success' => true, 'data' => $encrypted]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }*/

    public function updateAppointmentStatus()
    {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $tokenStr = $splitToken[1] ?? '';

        try {
            $token = verifyAuthToken($tokenStr);
            if (!$token) {
                throw new Exception("Unauthorized");
            }

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $srole  = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            // ✅ Allow staff & doctor only
            if (!$loguid || !in_array($srole, ['staff', 'doctor'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $body = json_decode(file_get_contents("php://input"), true);

            $appointmentIdEnc = $body['appointmentId'] ?? null;
            $doctorIdEnc      = $body['doctorId'] ?? null;
            $dateEnc          = $body['date'] ?? null;
            $statusEnc        = $body['status'] ?? null;
            $queuePosEnc      = $body['queuePosition'] ?? null;

            if (!$appointmentIdEnc || !$doctorIdEnc || !$dateEnc || !$statusEnc) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing required fields"
                ]);
                return;
            }

            $appointmentUid = $this->decrypt_aes_from_js($appointmentIdEnc, $AES_KEY);
            $doctorId       = (int)$this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);
            $date           = $this->decrypt_aes_from_js($dateEnc, $AES_KEY);
            $statusRaw      = strtolower(trim($this->decrypt_aes_from_js($statusEnc, $AES_KEY)));
            $queuePosition  = $queuePosEnc ? (int)$this->decrypt_aes_from_js($queuePosEnc, $AES_KEY) : null;

            $allowed = ['booked','arrived','waiting','in-consultation','active','completed'];
            if (!in_array($statusRaw, $allowed)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid status value"
                ]);
                return;
            }

            $this->ensureAppointmentColumns();

            /* ===============================
               FETCH appointment (id OR uid)
            =============================== */
            $apt = $this->db
                ->select('id, appointment_uid, doctor_id, patient_id, date, token_no, start_time, end_time, status, queue_position, arrival_time')
                ->from('ms_patient_appointment')
                ->group_start()
                    ->where('appointment_uid', $appointmentUid)
                    ->or_where('id', $appointmentUid)
                ->group_end()
                ->limit(1)
                ->get()
                ->row_array();

            if (!$apt) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Appointment not found'
                ]);
                return;
            }

            $slotStart = $apt['start_time'] ?? null;
            $slotEnd   = $apt['end_time'] ?? null;
            $oldPos    = is_numeric($apt['queue_position']) ? (int)$apt['queue_position'] : null;

            $now = date('Y-m-d H:i:s');
            $updateData = [
                'status'     => $statusRaw,
                'updated_at' => $now
            ];

            if ($statusRaw === 'in-consultation') {
                $statusRaw = 'active';
                $updateData['status'] = 'active';
            }

            if ($statusRaw === 'waiting') {
                if (empty($apt['arrival_time'])) {
                    $updateData['arrival_time'] = $now;
                }

                $qbMax = $this->db->select('MAX(queue_position) AS maxpos')
                    ->from('ms_patient_appointment')
                    ->where('doctor_id', $doctorId)
                    ->where('date', $date)
                    ->where('status', 'waiting');

                if ($slotStart) $qbMax->where('start_time', $slotStart);
                if ($slotEnd)   $qbMax->where('end_time', $slotEnd);

                $maxPos = (int)($qbMax->get()->row('maxpos') ?? 0);
                $updateData['queue_position'] = $maxPos + 1;

            } elseif ($statusRaw === 'arrived') {
                $updateData['arrival_time'] = $now;
                $updateData['queue_position'] = null;

            } elseif ($statusRaw === 'active') {
                $updateData['consultation_start_time'] = $now;
                $updateData['queue_position'] = null;

            } elseif ($statusRaw === 'completed') {
                $updateData['completed_time'] = $now;
                $updateData['queue_position'] = null;
            }

            /* ===============================
               TRANSACTION
            =============================== */
            $this->db->trans_start();

            // ✅ UPDATE using id OR appointment_uid
            $this->db
                ->group_start()
                    ->where('appointment_uid', $appointmentUid)
                    ->or_where('id', $appointmentUid)
                ->group_end()
                ->update('ms_patient_appointment', $updateData);

            if ($statusRaw === 'active' && $oldPos !== null) {
                $qbDec = $this->db
                    ->set('queue_position', 'queue_position - 1', false)
                    ->where('doctor_id', $doctorId)
                    ->where('date', $date)
                    ->where('status', 'waiting')
                    ->where('queue_position >', $oldPos);

                if ($slotStart) $qbDec->where('start_time', $slotStart);
                if ($slotEnd)   $qbDec->where('end_time', $slotEnd);

                $qbDec->update('ms_patient_appointment');
            }

            $this->db->trans_complete();

            /* ===============================
               FETCH UPDATED RECORD (id OR uid)
            =============================== */
            $row = $this->db
                ->select('a.appointment_uid, a.patient_id, a.doctor_id, a.date, a.token_no, a.start_time, a.end_time,
                          a.status, a.queue_position, a.arrival_time, a.consultation_start_time, a.completed_time,
                          p.fname, p.lname, p.phone, a.patient_name')
                ->from('ms_patient_appointment a')
                ->join('ms_patient p', 'p.id = a.patient_id', 'left')
                ->group_start()
                    ->where('a.appointment_uid', $appointmentUid)
                    ->or_where('a.id', $appointmentUid)
                ->group_end()
                ->limit(1)
                ->get()
                ->row_array();

            $patientName = trim(($row['fname'] ?? '') . ' ' . ($row['lname'] ?? ''));
            if ($patientName === '') {
                $patientName = $row['patient_name'] ?? '';
            }

            $payload = json_encode([
                'item' => [
                    'id' => (string)$row['appointment_uid'],
                    'tokenNumber' => (int)($row['token_no'] ?? 0),
                    'patient' => [
                        'id' => (string)($row['patient_id'] ?? ''),
                        'name' => $patientName,
                        'phone' => (string)($row['phone'] ?? ''),
                        'age' => 0
                    ],
                    'doctor' => ['id' => (string)$row['doctor_id']],
                    'date' => $row['date'],
                    'timeSlot' => [
                        'startTime' => $row['start_time'] ?? '',
                        'endTime' => $row['end_time'] ?? ''
                    ],
                    'status' => strtolower($row['status']),
                    'queuePosition' => $row['queue_position'],
                    'arrivalTime' => $row['arrival_time'],
                    'consultationStartTime' => $row['consultation_start_time'],
                    'completedTime' => $row['completed_time']
                ]
            ]);

            echo json_encode([
                'success' => true,
                'data' => $this->encrypt_aes_for_js($payload, $AES_KEY)
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }


    private function ensureAppointmentColumns(){
        // Adds optional tracking columns if missing
        $table = 'ms_patient_appointment';
        if (!$this->db->field_exists('queue_position', $table)) {
            $this->db->query("ALTER TABLE `ms_patient_appointment` ADD COLUMN `queue_position` INT(11) NULL DEFAULT NULL AFTER `status`");
        }
        if (!$this->db->field_exists('arrival_time', $table)) {
            $this->db->query("ALTER TABLE `ms_patient_appointment` ADD COLUMN `arrival_time` DATETIME NULL DEFAULT NULL AFTER `cancel_time`");
        }
        if (!$this->db->field_exists('consultation_start_time', $table)) {
            $this->db->query("ALTER TABLE `ms_patient_appointment` ADD COLUMN `consultation_start_time` DATETIME NULL DEFAULT NULL AFTER `arrival_time`");
        }
        if (!$this->db->field_exists('completed_time', $table)) {
            $this->db->query("ALTER TABLE `ms_patient_appointment` ADD COLUMN `completed_time` DATETIME NULL DEFAULT NULL AFTER `consultation_start_time`");
        }
    }

    // Persist queue order for waiting patients
   /* public function updateQueuePositions(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || !in_array($srole, ['staff', 'doctor'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }


            $AES_KEY = "RohitGaradHos@173414";
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            $doctorIdEnc = $body['doctorId'] ?? null;
            $dateEnc     = $body['date'] ?? null; // YYYY-MM-DD
            $orderedEnc  = $body['orderedIds'] ?? null; // JSON string of appointment_uids

            if (!$doctorIdEnc || !$dateEnc || !$orderedEnc) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                return;
            }

            $doctorId = (int)$this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);
            $date     = $this->decrypt_aes_from_js($dateEnc, $AES_KEY);
            $ordered  = json_decode($this->decrypt_aes_from_js($orderedEnc, $AES_KEY), true);

            if (!is_array($ordered)) $ordered = [];
            if (empty($ordered)) {
                echo json_encode(['success' => false, 'message' => 'orderedIds cannot be empty']);
                return;
            }

            $this->ensureAppointmentColumns();

            $now = date('Y-m-d H:i:s');
            $this->db->trans_start();

            foreach ($ordered as $idx => $aptUid) {
                $this->db->where('appointment_uid', $aptUid)
                         ->where('doctor_id', $doctorId)
                         ->where('date', $date)
                         ->update('ms_patient_appointment', [
                             'status' => 'waiting',
                             'queue_position' => $idx,
                             'updated_at' => $now,
                         ]);
            }

            $this->db->trans_complete();
            if ($this->db->trans_status() === FALSE) {
                echo json_encode(['success' => false, 'message' => 'Database error while updating queue']);
                return;
            }

            // Return updated waiting list for given doctor/date
            $rows = $this->db
                ->select('a.appointment_uid, a.patient_id, a.doctor_id, a.date, a.token_no, a.start_time, a.end_time, a.status, a.queue_position, a.arrival_time, a.consultation_start_time, a.completed_time, p.fname, p.lname, p.phone, a.patient_name')
                ->from('ms_patient_appointment a')
                ->join('ms_patient p', 'p.id = a.patient_id', 'left')
                ->where('a.doctor_id', $doctorId)
                ->where('a.date', $date)
                ->where('(a.status <> "cancelled" OR a.status IS NULL)', null, false)
                ->get()->result_array();

            $list = array_map(function($row){
                $patientName = trim(($row['fname'] ?? '') . ' ' . ($row['lname'] ?? ''));
                if ($patientName === '') { $patientName = $row['patient_name'] ?? ''; }
                // Normalize status for frontend
                $statusRaw = strtolower(trim($row['status'] ?? 'booked'));
                if ($statusRaw === 'in-consultation') $statusRaw = 'active';
                if (!in_array($statusRaw, ['booked','arrived','waiting','active','completed'])) $statusRaw = 'booked';
                return [
                    'id' => (string)$row['appointment_uid'],
                    'tokenNumber' => (int)($row['token_no'] ?? 0),
                    'patient' => [
                        'id' => (string)($row['patient_id'] ?? ''),
                        'name' => $patientName,
                        'phone' => (string)($row['phone'] ?? ''),
                        'age' => 0,
                    ],
                    'doctor' => [ 'id' => (string)($row['doctor_id'] ?? '') ],
                    'date' => $row['date'],
                    'timeSlot' => [
                        'id' => '',
                        'startTime' => $row['start_time'] ?? '',
                        'endTime' => $row['end_time'] ?? '',
                        'totalTokens' => 0,
                        'bookedTokens' => 0,
                    ],
                    'status' => $statusRaw,
                    'queuePosition' => isset($row['queue_position']) ? (int)$row['queue_position'] : null,
                    'arrivalTime' => $row['arrival_time'] ?? null,
                    'consultationStartTime' => $row['consultation_start_time'] ?? null,
                    'completedTime' => $row['completed_time'] ?? null,
                ];
            }, $rows);

            $payload = json_encode(['items' => $list]);
            $encryptedData = $this->encrypt_aes_for_js($payload, $AES_KEY);

            echo json_encode(['success' => true, 'data' => $encryptedData]);

        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }*/

    public function updateQueuePositions(){
        $userToken  = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $tokenStr   = $splitToken[1] ?? '';

        try {
            $token = verifyAuthToken($tokenStr);
            if (!$token) {
                throw new Exception("Unauthorized");
            }

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $srole  = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            // ✅ Allow staff & doctor
            if (!$loguid || !in_array($srole, ['staff', 'doctor'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $body = json_decode(file_get_contents("php://input"), true);

            $doctorIdEnc = $body['doctorId'] ?? null;
            $dateEnc     = $body['date'] ?? null;
            $orderedEnc  = $body['orderedIds'] ?? null; // encrypted JSON array

            if (!$doctorIdEnc || !$dateEnc || !$orderedEnc) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                return;
            }

            $doctorId = (int)$this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);
            $date     = $this->decrypt_aes_from_js($dateEnc, $AES_KEY);
            $ordered  = json_decode(
                $this->decrypt_aes_from_js($orderedEnc, $AES_KEY),
                true
            );

            if (!is_array($ordered) || empty($ordered)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'orderedIds cannot be empty'
                ]);
                return;
            }

            $this->ensureAppointmentColumns();

            $now = date('Y-m-d H:i:s');
            $this->db->trans_start();

            /* ===============================
               UPDATE QUEUE POSITIONS
               (appointment_uid OR id)
            =============================== */
            foreach ($ordered as $idx => $aptId) {
                $this->db
                    ->group_start()
                        ->where('appointment_uid', $aptId)
                        ->or_where('id', $aptId)
                    ->group_end()
                    ->where('doctor_id', $doctorId)
                    ->where('date', $date)
                    ->update('ms_patient_appointment', [
                        'status'         => 'waiting',
                        'queue_position' => $idx + 1, // start from 1
                        'updated_at'     => $now,
                    ]);
            }

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Database error while updating queue'
                ]);
                return;
            }

            /* ===============================
               FETCH UPDATED LIST
            =============================== */
            $rows = $this->db
                ->select('a.appointment_uid, a.patient_id, a.doctor_id, a.date, a.token_no,
                          a.start_time, a.end_time, a.status, a.queue_position,
                          a.arrival_time, a.consultation_start_time, a.completed_time,
                          p.fname, p.lname, p.phone, a.patient_name')
                ->from('ms_patient_appointment a')
                ->join('ms_patient p', 'p.id = a.patient_id', 'left')
                ->where('a.doctor_id', $doctorId)
                ->where('a.date', $date)
                ->where('(a.status <> "cancelled" OR a.status IS NULL)', null, false)
                ->order_by('a.queue_position', 'ASC')
                ->get()
                ->result_array();

            $list = array_map(function ($row) {
                $patientName = trim(($row['fname'] ?? '') . ' ' . ($row['lname'] ?? ''));
                if ($patientName === '') {
                    $patientName = $row['patient_name'] ?? '';
                }

                $statusRaw = strtolower(trim($row['status'] ?? 'booked'));
                if ($statusRaw === 'in-consultation') $statusRaw = 'active';
                if (!in_array($statusRaw, ['booked','arrived','waiting','active','completed'])) {
                    $statusRaw = 'booked';
                }

                return [
                    'id' => (string)$row['appointment_uid'],
                    'tokenNumber' => (int)($row['token_no'] ?? 0),
                    'patient' => [
                        'id' => (string)($row['patient_id'] ?? ''),
                        'name' => $patientName,
                        'phone' => (string)($row['phone'] ?? ''),
                        'age' => 0,
                    ],
                    'doctor' => [
                        'id' => (string)($row['doctor_id'] ?? '')
                    ],
                    'date' => $row['date'],
                    'timeSlot' => [
                        'startTime' => $row['start_time'] ?? '',
                        'endTime' => $row['end_time'] ?? '',
                    ],
                    'status' => $statusRaw,
                    'queuePosition' => isset($row['queue_position']) ? (int)$row['queue_position'] : null,
                    'arrivalTime' => $row['arrival_time'] ?? null,
                    'consultationStartTime' => $row['consultation_start_time'] ?? null,
                    'completedTime' => $row['completed_time'] ?? null,
                ];
            }, $rows);

            $payload = json_encode(['items' => $list]);
            $encryptedData = $this->encrypt_aes_for_js($payload, $AES_KEY);

            echo json_encode([
                'success' => true,
                'data' => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }



    /*public function saveDoctorEventSchedule() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414"; // must match frontend key
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            // ✅ Encrypted values coming from frontend
            $doctorIdEnc = $body['doctorId'] ?? null;
            $dateEnc     = $body['selDate'] ?? null;
            $slotsEnc    = $body['events'] ?? null;

            if (!$doctorIdEnc || !$dateEnc || !$slotsEnc) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing encrypted payload fields"
                ]);
                return;
            }

            // ✅ Decrypt all fields
            $doctorId = $this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);
            $selDate  = $this->decrypt_aes_from_js($dateEnc, $AES_KEY);
            $slotsRaw = $this->decrypt_aes_from_js($slotsEnc, $AES_KEY);
            $slots    = json_decode($slotsRaw, true);

            $rowdata = [
                'doctorId' => $doctorId,
                'selDate'  => $selDate,
                'slots'    => $slots,
            ];

            echo json_encode([
                "success" => true,
                "data" => $rowdata
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }*/

    public function saveDoctorEventSchedule() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            // Encrypted payload
            $doctorIdEnc = $body['doctorId'] ?? null;
            $dateEnc     = $body['selDate'] ?? null;
            $slotsEnc    = $body['events'] ?? null;

            if (!$doctorIdEnc || !$dateEnc || !$slotsEnc) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing encrypted payload fields"
                ]);
                return;
            }

            // Decrypt values
            $doctorId = $this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY);
            $selDate  = $this->decrypt_aes_from_js($dateEnc, $AES_KEY);
            $slotsRaw = $this->decrypt_aes_from_js($slotsEnc, $AES_KEY);
            $slots    = json_decode($slotsRaw, true);

            if (!$doctorId || !$selDate) {
                throw new Exception("Decryption failed or invalid data");
            }

            // Load DB
            $this->load->database();

            // Step 1: Check if schedule exists
            $schedule = $this->db
                ->where('docuid', $doctorId)
                ->where('date', $selDate)
                ->get('ms_doctor_event_schedules')
                ->row();

            // Step 2: Insert or update ms_doctor_event_schedules
            if (!$schedule) {
                // Insert new
                $this->db->insert('ms_doctor_event_schedules', [
                    'docuid'       => $doctorId,
                    'date'         => $selDate,
                    'is_available' => 1,
                    'created_by'   => $loguid,
                    'updated_by'   => $loguid
                ]);
                $scheduleId = $this->db->insert_id();
            } else {
                // Update existing
                $this->db->where('id', $schedule->id)
                         ->update('ms_doctor_event_schedules', [
                             'is_available' => 1,
                             'updated_by'   => $loguid
                         ]);
                $scheduleId = $schedule->id;
            }

            // Step 3: Sync slots
            $existingSlots = $this->db
                ->select('id, title, start_time, end_time')
                ->where('event_id', $scheduleId)
                ->get('ms_doctor_event_slots')
                ->result_array();

            $existingMap = [];
            foreach ($existingSlots as $s) {
                $key = "{$s['title']}_{$s['start_time']}_{$s['end_time']}";
                $existingMap[$key] = $s['id'];
            }

            $newKeys = [];

            foreach ($slots as $slot) {
                $key = "{$slot['title']}_{$slot['start_time']}_{$slot['end_time']}";
                $newKeys[] = $key;

                $slotData = [
                    'event_id'         => $scheduleId,
                    'title'            => $slot['title'],
                    'type'             => $slot['eventuid'],
                    'start_time'       => $slot['start_time'],
                    'end_time'         => $slot['end_time'],
                    'max_appointments' => $slot['max_appointments'],
                    'notes'            => $slot['notes'],
                    'updated_by'       => $loguid
                ];

                if (isset($existingMap[$key])) {
                    // Update existing
                    $this->db->where('id', $existingMap[$key])
                             ->update('ms_doctor_event_slots', $slotData);
                } else {
                    // Insert new
                    $slotData['created_by'] = $loguid;
                    $this->db->insert('ms_doctor_event_slots', $slotData);
                }
            }

            // Step 4: Delete slots not in new list
            foreach ($existingMap as $key => $id) {
                if (!in_array($key, $newKeys)) {
                    $this->db->where('id', $id)->delete('ms_doctor_event_slots');
                }
            }

            echo json_encode([
                "success" => true,
                "message" => "Doctor schedule saved successfully",
                "data" => [
                    "schedule_id" => $scheduleId,
                    "slots_count" => count($slots)
                ]
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Failed to save: " . $e->getMessage()
            ]);
        }
    }



}


