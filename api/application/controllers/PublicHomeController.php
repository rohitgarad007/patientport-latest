<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class PublicHomeController extends CI_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->helper(array('form', 'url','date'));
        // Basic CORS for public endpoint
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
    }

    // Public: Fetch hospital info by hosuid (returns id and name)
    public function GetHospitalByHosuid() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }

        // Accept GET or POST; reject others
        if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        try {
            // Read payload from JSON, POST, or GET
            $raw = $this->input->raw_input_stream;
            $body = json_decode($raw, true);
            $hosuid = trim($body['hosuid'] ?? $this->input->post('hosuid') ?? $this->input->get('hosuid') ?? '');

            if ($hosuid === '') {
                echo json_encode([
                    'success' => false,
                    'message' => 'hosuid is required',
                ]);
                return;
            }

            // Lookup hospital by hosuid
            $row = $this->db->get_where('ms_hospitals', ['hosuid' => $hosuid])->row_array();
            if (!$row || !isset($row['id'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Hospital not found for given hosuid',
                ]);
                return;
            }

            $hospitalId = intval($row['id']);
            $hospitalName = isset($row['name']) ? $row['name'] : (isset($row['hospital_name']) ? $row['hospital_name'] : null);
            $phone = isset($row['phone']) ? $row['phone'] : null;
            $address = isset($row['address']) ? $row['address'] : null;

            echo json_encode([
                'success' => true,
                'data' => [
                    'hospital_id' => $hospitalId,
                    'hospital_name' => $hospitalName,
                    'hosuid' => $hosuid,
                    'phone' => $phone,
                    'address' => $address,
                ],
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // --- New: Count booked appointments for a given slot/date ---
    private function _countBookedAppointments($source, $slotId, $doctorId, $dateStr) {
        if (!$slotId || !$doctorId || !$dateStr) return 0;
        if (!$this->db->table_exists('ms_patient_appointment')) return 0;
        $this->db->from('ms_patient_appointment')
            ->where('slot_id', intval($slotId))
            ->where('doctor_id', intval($doctorId))
            ->where('date', $dateStr)
            ->where('source', $source)
            ->where('status <>', 'cancelled');
        return intval($this->db->count_all_results());
    }

    // --- New: Ensure schema for appointments and book_slot columns ---
    private function _ensureAppointmentSchema() {
        $this->load->dbforge();

        // Create ms_patient_appointment if missing
        if (!$this->db->table_exists('ms_patient_appointment')) {
            $fields = [
                'id' => [ 'type' => 'INT', 'constraint' => 11, 'unsigned' => TRUE, 'auto_increment' => TRUE ],
                'appointment_uid' => [ 'type' => 'VARCHAR', 'constraint' => 32 ],
                'hospital_id' => [ 'type' => 'INT', 'constraint' => 11, 'null' => TRUE ],
                'doctor_id' => [ 'type' => 'INT', 'constraint' => 11 ],
                'patient_id' => [ 'type' => 'INT', 'constraint' => 11, 'null' => TRUE ],
                'patient_name' => [ 'type' => 'VARCHAR', 'constraint' => 255 ],
                'phone' => [ 'type' => 'VARCHAR', 'constraint' => 20 ],
                'token_no' => [ 'type' => 'INT', 'constraint' => 11, 'null' => TRUE ],
                'date' => [ 'type' => 'DATE' ],
                'slot_id' => [ 'type' => 'INT', 'constraint' => 11 ],
                'source' => [ 'type' => 'ENUM("event","master")' ],
                'start_time' => [ 'type' => 'VARCHAR', 'constraint' => 16, 'null' => TRUE ],
                'end_time' => [ 'type' => 'VARCHAR', 'constraint' => 16, 'null' => TRUE ],
                'status' => [ 'type' => 'VARCHAR', 'constraint' => 32, 'default' => 'booked' ],
                'created_at' => [ 'type' => 'DATETIME' ],
                'updated_at' => [ 'type' => 'DATETIME', 'null' => TRUE ],
            ];
            $this->dbforge->add_field($fields);
            $this->dbforge->add_key('id', TRUE);
            $this->dbforge->create_table('ms_patient_appointment', TRUE);
        } else {
            // Add token_no if missing
            if (!$this->db->field_exists('token_no', 'ms_patient_appointment')) {
                $this->dbforge->add_column('ms_patient_appointment', [ 'token_no' => [ 'type' => 'INT', 'constraint' => 11, 'null' => TRUE ] ]);
            }
        }

        // Add book_slot column to master slots
        if ($this->db->table_exists('ms_doctor_time_slots') && !$this->db->field_exists('book_slot', 'ms_doctor_time_slots')) {
            $this->dbforge->add_column('ms_doctor_time_slots', [ 'book_slot' => [ 'type' => 'INT', 'constraint' => 11, 'default' => 0 ] ]);
        }
        // Add book_slot column to event slots
        if ($this->db->table_exists('ms_doctor_event_slots') && !$this->db->field_exists('book_slot', 'ms_doctor_event_slots')) {
            $this->dbforge->add_column('ms_doctor_event_slots', [ 'book_slot' => [ 'type' => 'INT', 'constraint' => 11, 'default' => 0 ] ]);
        }
    }

    // --- New: One-time initializer to create the ms_patient_appointment table and book_slot columns ---
    public function InitPatientAppointmentSchema() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }

        try {
            $this->_ensureAppointmentSchema();

            $exists = $this->db->table_exists('ms_patient_appointment');
            $fields = [];
            if ($exists) {
                $fields = $this->db->field_data('ms_patient_appointment');
            }

            echo json_encode([
                'success' => true,
                'message' => 'Schema ensured',
                'table_exists' => $exists,
                'book_slot_event_exists' => $this->db->field_exists('book_slot', 'ms_doctor_event_slots'),
                'book_slot_master_exists' => $this->db->field_exists('book_slot', 'ms_doctor_time_slots'),
                'fields' => array_map(function($f){ return $f->name; }, $fields)
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error ensuring schema: ' . $e->getMessage()]);
        }
    }

    // --- New: Book patient appointment and increment slot usage ---
    public function BookPatientAppointment() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        try {
            $raw = $this->input->raw_input_stream;
            $payload = json_decode($raw, true);
            if (!is_array($payload) || empty($payload)) {
                $payload = $_POST; // fallback for form-data
            }

            $hospitalId = intval($payload['hospital_id'] ?? 0);
            $doctorId = intval($payload['doctor_id'] ?? 0);
            $dateStr = trim($payload['date'] ?? '');
            $slotId = intval($payload['slot_id'] ?? 0);
            $name = trim($payload['patient_name'] ?? ($payload['name'] ?? ''));
            $phone = trim($payload['phone'] ?? ($payload['mobile'] ?? ''));
            $patientId = isset($payload['patient_id']) ? intval($payload['patient_id']) : null;
            $payloadSource = strtolower(trim($payload['source'] ?? ''));
            $payloadSource = in_array($payloadSource, ['event','master']) ? $payloadSource : null;

            if ($hospitalId <= 0 || $doctorId <= 0 || $slotId <= 0 || $dateStr === '' || $phone === '') {
                echo json_encode(['success' => false, 'message' => 'hospital_id, doctor_id, slot_id, date and phone are required']);
                return;
            }

            // Validate date format
            $dateObj = DateTime::createFromFormat('Y-m-d', $dateStr);
            if (!$dateObj || $dateObj->format('Y-m-d') !== $dateStr) {
                echo json_encode(['success' => false, 'message' => 'Invalid date format, expected YYYY-MM-DD']);
                return;
            }
            $weekday = $dateObj->format('D');

            // Ensure schema exists
            $this->_ensureAppointmentSchema();

            // Validate hospital exists
            $hRow = $this->db->get_where('ms_hospitals', ['id' => $hospitalId])->row_array();
            if (!$hRow || !isset($hRow['id'])) {
                echo json_encode(['success' => false, 'message' => 'Hospital not found']);
                return;
            }

            // If patient info not provided, try to resolve by phone within hospital
            if (!$patientId) {
                // Fetch all patients with this phone
                $candidates = $this->db->get_where('ms_patient', ['phone' => $phone, 'hospital_id' => $hospitalId])->result_array();
                
                $pRow = null;
                if ($name !== '' && $name !== null) {
                    // Try to match by name
                    foreach ($candidates as $cand) {
                        $candName = trim(($cand['fname'] ?? '') . ' ' . ($cand['lname'] ?? ''));
                        // Check exact match or if name is contained
                        if (strcasecmp($candName, $name) === 0 || stripos($candName, $name) !== false || stripos($name, $candName) !== false) {
                            $pRow = $cand;
                            break;
                        }
                    }
                }

                // If no name match found, fallback to first record (legacy behavior)
                if (!$pRow && count($candidates) > 0) {
                    $pRow = $candidates[0];
                }

                if ($pRow && isset($pRow['id'])) {
                    $patientId = intval($pRow['id']);
                    if ($name === '' || $name === null) {
                        $derivedName = trim(($pRow['fname'] ?? '') . ' ' . ($pRow['lname'] ?? ''));
                        if ($derivedName !== '') { $name = $derivedName; }
                    }
                }
            }

            // If still no patient name, block booking to prevent anonymous records
            if ($name === '' || $name === null) {
                echo json_encode(['success' => false, 'message' => 'Patient not found for given phone; please register or provide patient_name']);
                return;
            }

            // Resolve docuid
            $docRow = $this->db->get_where('ms_doctors', [
                'id' => $doctorId,
                'hospital_id' => $hospitalId,
                'status' => 1,
                'isdelete' => 0
            ])->row_array();
            if (!$docRow || !isset($docRow['docuid'])) {
                echo json_encode(['success' => false, 'message' => 'Doctor not found or inactive for this hospital']);
                return;
            }
            $docuid = $docRow['docuid'];

            // Find slot guided by payload proxy source when provided
            $source = null; $slotRow = null; $scheduleId = null;
            if ($payloadSource === 'event' || $payloadSource === null) {
                $event = $this->db->get_where('ms_doctor_event_schedules', [
                    'docuid' => $docuid,
                    'date' => $dateStr,
                    'is_available' => 1,
                ])->row_array();
                if ($event && isset($event['id'])) {
                    $slotRow = $this->db->get_where('ms_doctor_event_slots', ['id' => $slotId, 'event_id' => intval($event['id'])])->row_array();
                    if ($slotRow) { $source = 'event'; }
                }
                // If explicit payloadSource=event but not found, error early
                if ($payloadSource === 'event' && !$slotRow) {
                    echo json_encode(['success' => false, 'message' => 'Slot not found in event schedule for given date']);
                    return;
                }
            }
            if (!$slotRow && ($payloadSource === 'master' || $payloadSource === null)) {
                $schedule = $this->db->get_where('ms_doctor_schedules', [
                    'docuid' => $docuid,
                    'weekday' => $weekday,
                    'is_available' => 1,
                ])->row_array();
                if ($schedule && isset($schedule['id'])) {
                    $slotRow = $this->db->get_where('ms_doctor_time_slots', ['id' => $slotId, 'schedule_id' => intval($schedule['id'])])->row_array();
                    if ($slotRow) { $source = 'master'; $scheduleId = $schedule['id']; }
                }
                if ($payloadSource === 'master' && !$slotRow) {
                    echo json_encode(['success' => false, 'message' => 'Slot not found in master schedule for given weekday']);
                    return;
                }
            }

            if (!$slotRow) {
                echo json_encode(['success' => false, 'message' => 'Slot not found for given date']);
                return;
            }

            $max = isset($slotRow['max_appointments']) ? intval($slotRow['max_appointments']) : 0;
            $bookSlotCol = isset($slotRow['book_slot']) ? intval($slotRow['book_slot']) : $this->_countBookedAppointments($source, $slotId, $doctorId, $dateStr);
            $availableCount = max(0, $max - $bookSlotCol);
            $tokenNo = $bookSlotCol + 1; // next token number for this slot/date

            if ($availableCount <= 0) {
                echo json_encode(['success' => false, 'message' => 'Slot is full', 'max_appointments' => $max, 'book_slot' => $bookSlotCol, 'available_count' => 0]);
                return;
            }

            // Insert appointment record
            $appointmentUid = 'APT-' . strtoupper(substr(md5(uniqid('', true)), 0, 10));
            // Check hospital booking status preference
            // 0 = Normal (booked), 1 = Waiting
            $initialStatus = 'booked';
            if (isset($hRow['book_appointment_status']) && intval($hRow['book_appointment_status']) == 1) {
                $initialStatus = 'waiting';
            }

            // Set timezone to Asia/Kolkata for correct timestamp
            $tz = new DateTimeZone('Asia/Kolkata');
            $now = new DateTime('now', $tz);
            $createdAt = $now->format('Y-m-d H:i:s');

            $data = [
                'appointment_uid' => $appointmentUid,
                'hospital_id' => $hospitalId,
                'doctor_id' => $doctorId,
                'patient_id' => $patientId,
                'patient_name' => $name,
                'phone' => $phone,
                'token_no' => $tokenNo,
                'date' => $dateStr,
                'slot_id' => $slotId,
                'source' => $source,
                'start_time' => $slotRow['start_time'] ?? null,
                'end_time' => $slotRow['end_time'] ?? null,
                'status' => $initialStatus,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
            $this->db->insert('ms_patient_appointment', $data);
            $insertId = $this->db->insert_id();

            // Increment book_slot atomically
            if ($source === 'event') {
                // ensure column exists
                if (!$this->db->field_exists('book_slot', 'ms_doctor_event_slots')) {
                    $this->load->dbforge();
                    $this->dbforge->add_column('ms_doctor_event_slots', [ 'book_slot' => [ 'type' => 'INT', 'constraint' => 11, 'default' => 0 ] ]);
                }
                $this->db->set('book_slot', 'COALESCE(book_slot,0) + 1', FALSE)
                         ->where('id', $slotId)
                         ->update('ms_doctor_event_slots');
            } else {
                if (!$this->db->field_exists('book_slot', 'ms_doctor_time_slots')) {
                    $this->load->dbforge();
                    $this->dbforge->add_column('ms_doctor_time_slots', [ 'book_slot' => [ 'type' => 'INT', 'constraint' => 11, 'default' => 0 ] ]);
                }
                $this->db->set('book_slot', 'COALESCE(book_slot,0) + 1', FALSE)
                         ->where('id', $slotId)
                         ->update('ms_doctor_time_slots');
            }

            echo json_encode([
                'success' => true,
                'appointment_id' => intval($insertId),
                'appointment_uid' => $appointmentUid,
                'token_no' => $tokenNo,
                'max_appointments' => $max,
                'book_slot' => $bookSlotCol + 1,
                'available_count' => max(0, $max - ($bookSlotCol + 1)),
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error booking appointment: ' . $e->getMessage()]);
        }
    }

    // Unified Chat Assistant endpoint: routes all chat selections/intents
    public function ChatAssistant() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!is_array($input)) { $input = []; }

            $intent = strtolower(trim($input['intent'] ?? ($input['selection'] ?? '')));
            $payload = isset($input['payload']) && is_array($input['payload']) ? $input['payload'] : [];
            $hospitalId = intval($input['hospital_id'] ?? ($payload['hospital_id'] ?? 2));

            switch ($intent) {
                case 'find_doctor':
                    $department = trim($payload['department'] ?? '');
                    $items = $this->_getDoctorsList($hospitalId, $department);
                    echo json_encode([
                        'success' => true,
                        'intent' => 'find_doctor',
                        'hospital_id' => $hospitalId,
                        'count' => count($items),
                        'items' => $items,
                    ]);
                    return;

                case 'appointment_slots':
                    $doctorId = isset($input['doctor_id']) ? intval($input['doctor_id']) : (isset($payload['doctor_id']) ? intval($payload['doctor_id']) : 0);
                    $days = isset($payload['days']) ? intval($payload['days']) : 3;
                    $selectedDate = trim($payload['date'] ?? '');
                    if ($doctorId <= 0) {
                        echo json_encode(['success' => false, 'message' => 'doctor_id is required']);
                        return;
                    }
                    $slotsData = $this->_getDoctorUpcomingSlots($doctorId, $days);
                    // Optional: filter to a specific date if provided
                    if ($selectedDate !== '') {
                        $slotsData['days'] = array_values(array_filter($slotsData['days'], function($d) use ($selectedDate) {
                            return isset($d['date']) && $d['date'] === $selectedDate;
                        }));
                    }
                    echo json_encode(array_merge([
                        'success' => true,
                        'intent' => 'appointment_slots',
                        'doctor_id' => $doctorId,
                        'hospital_id' => $hospitalId,
                    ], $slotsData));
                    return;

                case 'appointment':
                    $result = $this->_submitAppointmentUnified($input, $hospitalId);
                    echo json_encode($result);
                    return;

                case 'register_patient':
                    $result = $this->_registerPatientUnified($input, $hospitalId);
                    echo json_encode($result);
                    return;

                case 'hospital_info':
                    $topic = strtolower(trim($payload['topic'] ?? ($input['topic'] ?? 'general')));
                    $message = $this->_getHospitalInfoMessage($hospitalId, $topic);
                    echo json_encode([
                        'success' => true,
                        'intent' => 'hospital_info',
                        'hospital_id' => $hospitalId,
                        'topic' => $topic,
                        'message' => $message,
                    ]);
                    return;

                case 'emergency':
                    $message = $this->_getEmergencyMessage($hospitalId);
                    echo json_encode([
                        'success' => true,
                        'intent' => 'emergency',
                        'hospital_id' => $hospitalId,
                        'message' => $message,
                    ]);
                    return;

                default:
                    echo json_encode([
                        'success' => true,
                        'intent' => 'general',
                        'message' => "I'm here to help! You can ask me about booking appointments, finding doctors, emergency services, or hospital information.",
                    ]);
                    return;
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // --- New: Get comprehensive appointment details for confirmation ---
    public function GetAppointmentDetails() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }
        if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        try {
            // Accept JSON body or query params
            $input = [];
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $raw = file_get_contents('php://input');
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) { $input = $decoded; }
                if (empty($input)) { $input = $_POST; }
            } else {
                $input = $_GET;
            }

            $appointmentUid = trim($input['appointment_uid'] ?? '');
            $appointmentId = isset($input['appointment_id']) ? intval($input['appointment_id']) : 0;

            if ($appointmentUid === '' && $appointmentId <= 0) {
                echo json_encode(['success' => false, 'message' => 'appointment_uid or appointment_id is required']);
                return;
            }

            // Ensure schema exists
            $this->_ensureAppointmentSchema();

            // Lookup appointment
            $where = [];
            if ($appointmentUid !== '') { $where['appointment_uid'] = $appointmentUid; }
            if ($appointmentId > 0) { $where['id'] = $appointmentId; }
            $app = $this->db->get_where('ms_patient_appointment', $where)->row_array();
            if (!$app || !isset($app['id'])) {
                echo json_encode(['success' => false, 'message' => 'Appointment not found']);
                return;
            }

            $hospitalId = isset($app['hospital_id']) ? intval($app['hospital_id']) : null;
            $doctorId = isset($app['doctor_id']) ? intval($app['doctor_id']) : null;
            $patientId = isset($app['patient_id']) ? intval($app['patient_id']) : null;

            // Fetch hospital
            $hRow = $hospitalId ? $this->db->get_where('ms_hospitals', ['id' => $hospitalId])->row_array() : null;
            $hospitalName = $hRow['hospital_name'] ?? ($hRow['name'] ?? 'Hospital');
            $hospitalPhone = $hRow['phone'] ?? ($hRow['contact_number'] ?? null);
            $hospitalAddress = $hRow['address'] ?? ($hRow['address'] ?? null);

            // Fetch doctor
            $dRow = $doctorId ? $this->db->get_where('ms_doctors', ['id' => $doctorId])->row_array() : null;
            $doctorName = $dRow['name'] ?? 'Doctor';
            $doctorSpecialization = $dRow['specialization_id'] ?? null;

            // Prefer patient record for name/phone if available
            $patientName = trim($app['patient_name'] ?? '');
            $patientPhone = trim($app['phone'] ?? '');
            if ($patientId) {
                $pRow = $this->db->get_where('ms_patient', ['id' => $patientId])->row_array();
                if ($pRow) {
                    $pname = trim(($pRow['fname'] ?? '') . ' ' . ($pRow['lname'] ?? ''));
                    if ($pname !== '') { $patientName = $pname; }
                    if (isset($pRow['phone']) && $pRow['phone'] !== '') { $patientPhone = $pRow['phone']; }
                }
            }

            $startTime = $app['start_time'] ?? null;
            $endTime = $app['end_time'] ?? null;
            $timeLabel = ($startTime && $endTime) ? ($startTime . ' - ' . $endTime) : ($startTime ?? null);

            // --- Queue and wait-time calculation based on slot info ---
            $tokenNo = isset($app['token_no']) ? intval($app['token_no']) : null;
            $slotId = isset($app['slot_id']) ? intval($app['slot_id']) : null;
            $source = $app['source'] ?? null; // 'master' => ms_doctor_time_slots, else ms_doctor_event_slots

            $slotStart = null;
            $slotEnd = null;
            $slotMaxAppointments = null;
            $slotBookSlot = null;
            $slotWaitSlot = null;

            if ($slotId && $source) {
                if ($source === 'master') {
                    $slotRow = $this->db->get_where('ms_doctor_time_slots', ['id' => $slotId])->row_array();
                } else {
                    $slotRow = $this->db->get_where('ms_doctor_event_slots', ['id' => $slotId])->row_array();
                }
                if (is_array($slotRow) && !empty($slotRow)) {
                    $slotStart = $slotRow['start_time'] ?? null;
                    $slotEnd = $slotRow['end_time'] ?? null;
                    $slotMaxAppointments = isset($slotRow['max_appointments']) ? intval($slotRow['max_appointments']) : null;
                    $slotBookSlot = isset($slotRow['book_slot']) ? intval($slotRow['book_slot']) : null;
                    $slotWaitSlot = isset($slotRow['wait_slot']) ? intval($slotRow['wait_slot']) : null;
                }
            }

            $slotTimeWindow = ($slotStart && $slotEnd) ? ($slotStart . ' - ' . $slotEnd) : null;

            // Compute total slot duration in minutes
            $totalMinutes = null;
            if ($slotStart && $slotEnd) {
                $startTs = strtotime('1970-01-01 ' . $slotStart);
                $endTs = strtotime('1970-01-01 ' . $slotEnd);
                if ($startTs !== false && $endTs !== false && $endTs > $startTs) {
                    $totalMinutes = intval(round(($endTs - $startTs) / 60));
                }
            } elseif ($startTime && $endTime) {
                // Fallback to appointment times
                $startTs = strtotime('1970-01-01 ' . $startTime);
                $endTs = strtotime('1970-01-01 ' . $endTime);
                if ($startTs !== false && $endTs !== false && $endTs > $startTs) {
                    $totalMinutes = intval(round(($endTs - $startTs) / 60));
                }
            }

            // Duration per patient = total slot duration / max_appointments
            $durationPerPatientMinutes = null;
            if ($totalMinutes !== null && $slotMaxAppointments && $slotMaxAppointments > 0) {
                $durationPerPatientMinutes = $totalMinutes / $slotMaxAppointments;
            }

            // Queue position = token_no - 1
            $queuePosition = null;
            if ($tokenNo && $tokenNo > 0) { $queuePosition = $tokenNo - 1; }

            // Estimated wait time = queue_position * duration_per_patient
            $estimatedWaitMinutes = null;
            if ($queuePosition !== null && $durationPerPatientMinutes !== null) {
                $estimatedWaitMinutes = intval(round($queuePosition * $durationPerPatientMinutes));
            }

            $data = [
                'appointment_id' => intval($app['id']),
                'appointment_uid' => $app['appointment_uid'] ?? null,
                'status' => $app['status'] ?? null,
                'cancelled' => isset($app['cancelled']) ? intval($app['cancelled']) : 0,
                'cancel_time' => $app['cancel_time'] ?? null,
                'cancel_reason' => $app['cancel_reason'] ?? null,
                'hospital_id' => $hospitalId,
                'hospital_name' => $hospitalName,
                'hospital_phone' => $hospitalPhone,
                'hospital_address' => $hospitalAddress,
                'doctor_id' => $doctorId,
                'doctor_name' => $doctorName,
                'patient_id' => $patientId,
                'patient_name' => $patientName,
                'phone' => $patientPhone,
                'date' => $app['date'] ?? null,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'time_label' => $timeLabel,
                'token_no' => isset($app['token_no']) ? intval($app['token_no']) : null,
                'slot_id' => isset($app['slot_id']) ? intval($app['slot_id']) : null,
                'source' => $app['source'] ?? null,
                // Slot info and queue metrics
                'slot_start_time' => $slotStart,
                'slot_end_time' => $slotEnd,
                'slot_time_window' => $slotTimeWindow,
                'slot_max_appointments' => $slotMaxAppointments,
                'slot_book_slot' => $slotBookSlot,
                'slot_wait_slot' => $slotWaitSlot,
                'queue_position' => $queuePosition,
                'duration_per_patient_minutes' => $durationPerPatientMinutes !== null ? intval(round($durationPerPatientMinutes)) : null,
                'estimated_wait_minutes' => $estimatedWaitMinutes,
            ];

            echo json_encode(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error fetching appointment details: ' . $e->getMessage()]);
        }
    }

    // --- New: Cancel appointment and persist cancellation metadata ---
    /*public function CancelAppointment() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }
        if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        try {
            // Accept JSON body or query params
            $input = [];
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $raw = file_get_contents('php://input');
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) { $input = $decoded; }
                if (empty($input)) { $input = $_POST; }
            } else {
                $input = $_GET;
            }

            $appointmentUid = trim($input['appointment_uid'] ?? '');
            $appointmentId = isset($input['appointment_id']) ? intval($input['appointment_id']) : 0;
            $reason = trim($input['reason'] ?? '');

            if ($appointmentUid === '' && $appointmentId <= 0) {
                echo json_encode(['success' => false, 'message' => 'appointment_uid or appointment_id is required']);
                return;
            }

            // Ensure columns for cancellation exist
            if (!$this->db->field_exists('cancelled', 'ms_patient_appointment')) {
                $this->dbforge->add_column('ms_patient_appointment', [ 'cancelled' => [ 'type' => 'TINYINT', 'constraint' => 1, 'default' => 0 ] ]);
            }
            if (!$this->db->field_exists('cancel_reason', 'ms_patient_appointment')) {
                $this->dbforge->add_column('ms_patient_appointment', [ 'cancel_reason' => [ 'type' => 'VARCHAR', 'constraint' => 255, 'null' => TRUE ] ]);
            }
            if (!$this->db->field_exists('cancel_time', 'ms_patient_appointment')) {
                $this->dbforge->add_column('ms_patient_appointment', [ 'cancel_time' => [ 'type' => 'DATETIME', 'null' => TRUE ] ]);
            }

            // Locate appointment
            $where = [];
            if ($appointmentUid !== '') { $where['appointment_uid'] = $appointmentUid; }
            if ($appointmentId > 0) { $where['id'] = $appointmentId; }
            $app = $this->db->get_where('ms_patient_appointment', $where)->row_array();
            if (!$app || !isset($app['id'])) {
                echo json_encode(['success' => false, 'message' => 'Appointment not found']);
                return;
            }

            // Update cancellation fields
            $now = date('Y-m-d H:i:s');
            $this->db->where('id', intval($app['id']))
                     ->update('ms_patient_appointment', [
                         'cancelled' => 1,
                         'cancel_reason' => $reason !== '' ? $reason : NULL,
                         'cancel_time' => $now,
                     ]);

            // Optionally, could decrement booked slots; skip unless explicitly required

            // Return updated details
            $_GET = ['appointment_id' => intval($app['id'])];
            $this->GetAppointmentDetails();
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error cancelling appointment: ' . $e->getMessage()]);
        }
    }*/

    public function CancelAppointment() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        try {
            // Read input JSON or POST/GET
            $input = [];
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $raw = file_get_contents('php://input');
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) { $input = $decoded; }
                if (empty($input)) { $input = $_POST; }
            } else {
                $input = $_GET;
            }

            $appointmentUid = trim($input['appointment_uid'] ?? '');
            $appointmentId = isset($input['appointment_id']) ? intval($input['appointment_id']) : 0;
            $reason = trim($input['reason'] ?? '');

            if ($appointmentUid === '' && $appointmentId <= 0) {
                echo json_encode(['success' => false, 'message' => 'appointment_uid or appointment_id is required']);
                return;
            }

            // Check appointment
            $where = [];
            if ($appointmentUid !== '') { $where['appointment_uid'] = $appointmentUid; }
            if ($appointmentId > 0) { $where['id'] = $appointmentId; }

            $app = $this->db->get_where('ms_patient_appointment', $where)->row_array();
            if (!$app || !isset($app['id'])) {
                echo json_encode(['success' => false, 'message' => 'Appointment not found']);
                return;
            }

            // Avoid cancelling an already cancelled or completed appointment
            if (in_array($app['status'], ['cancelled', 'completed', 'no_show'])) {
                echo json_encode(['success' => false, 'message' => "Appointment already {$app['status']}"]);
                return;
            }

            // Ensure cancel_reason and cancel_time columns exist
            if (!$this->db->field_exists('cancel_reason', 'ms_patient_appointment')) {
                $this->dbforge->add_column('ms_patient_appointment', [
                    'cancel_reason' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => TRUE]
                ]);
            }
            if (!$this->db->field_exists('cancel_time', 'ms_patient_appointment')) {
                $this->dbforge->add_column('ms_patient_appointment', [
                    'cancel_time' => ['type' => 'DATETIME', 'null' => TRUE]
                ]);
            }

            // Update appointment status to cancelled
            $this->db->where('id', intval($app['id']))
                     ->update('ms_patient_appointment', [
                         'status' => 'cancelled',
                         'cancel_reason' => $reason !== '' ? $reason : NULL,
                         'cancel_time' => date('Y-m-d H:i:s'),
                         'updated_at' => date('Y-m-d H:i:s')
                     ]);

            // Optionally adjust doctor slot counts here if required

            // Return updated appointment details
            echo json_encode([
                'success' => true,
                'message' => 'Appointment cancelled successfully',
                'appointment_id' => $app['id'],
                'appointment_uid' => $app['appointment_uid'],
                'cancel_reason' => $reason,
                'status' => 'cancelled'
            ]);

        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error cancelling appointment: ' . $e->getMessage()]);
        }
    }


    // --- Helper: fetch doctors, optional department filter ---
    private function _getDoctorsList($hospitalId, $department = '') {
        $this->db->select('
                d.id,
                d.docuid,
                d.name,
                d.email,
                d.phone,
                d.profile_image,
                d.gender,
                d.specialization_id,
                s.specialization_name,
                d.experience_year,
                d.experience_month,
                d.consultation_fee
            ');
        $this->db->from('ms_doctors d');
        $this->db->join('ms_doctor_specializations s', 's.id = d.specialization_id', 'left');
        $this->db->where('d.hospital_id', intval($hospitalId));
        $this->db->where('d.status', 1);
        $this->db->where('d.isdelete', 0);
        if ($department !== '') {
            $this->db->group_start();
            $this->db->like('LOWER(s.specialization_name)', strtolower($department));
            $this->db->group_end();
        }
        $this->db->order_by('d.name', 'ASC');
        $query = $this->db->get();
        $rows = $query->result_array();
        return array_map(function ($row) {
            return [
                'id' => isset($row['id']) ? intval($row['id']) : null,
                'docuid' => $row['docuid'] ?? null,
                'name' => $row['name'] ?? 'Doctor',
                'email' => $row['email'] ?? null,
                'phone' => $row['phone'] ?? null,
                'profile_image' => $row['profile_image'] ?? '',
                'gender' => $row['gender'] ?? '',
                'specialization_id' => isset($row['specialization_id']) ? intval($row['specialization_id']) : null,
                'specialization' => $row['specialization_name'] ?? '',
                'experience' => trim(($row['experience_year'] ?: '0') . ' years ' . ($row['experience_month'] ?: '0') . ' months'),
                'consultation_fee' => $row['consultation_fee'] ?? null,
            ];
        }, $rows);
    }

    // --- Helper: upcoming slots for next N days (event schedules override master) ---
    private function _getDoctorUpcomingSlots($doctorId, $days = 3) {
        $days = intval($days) > 0 ? intval($days) : 3;

        // Resolve docuid from ms_doctors.id
        $docRow = $this->db->get_where('ms_doctors', ['id' => intval($doctorId)])->row_array();
        $docuid = $docRow && isset($docRow['docuid']) ? $docRow['docuid'] : null;
        $doctorName = $docRow && isset($docRow['name']) ? $docRow['name'] : 'Doctor';

        if (!$docuid) {
            return ['count' => 0, 'days' => []];
        }

        $outDays = [];
        for ($i = 0; $i < $days; $i++) {
            $dateStr = date('Y-m-d', strtotime("+{$i} day"));
            $weekday = date('D', strtotime($dateStr)); // Mon, Tue, ...

            // First preference: event schedule for the exact date
            $event = $this->db->get_where('ms_doctor_event_schedules', [
                'docuid' => $docuid,
                'date' => $dateStr,
                'is_available' => 1,
            ])->row_array();

            $source = null;
            $slots = [];

            if ($event && isset($event['id'])) {
                $source = 'event';
                $eventSlots = $this->db->get_where('ms_doctor_event_slots', [ 'event_id' => intval($event['id']) ])->result_array();
                foreach ($eventSlots as $s) {
                    $slots[] = [
                        'slot_id' => isset($s['id']) ? intval($s['id']) : null,
                        'title' => $s['title'] ?? 'Appointment',
                        'start_time' => $s['start_time'] ?? null,
                        'end_time' => $s['end_time'] ?? null,
                        'type' => $s['type'] ?? null,
                        'max_appointments' => isset($s['max_appointments']) ? intval($s['max_appointments']) : null,
                        'available' => true,
                    ];
                }
            } else {
                // Fallback: master schedule by weekday
                $schedule = $this->db->get_where('ms_doctor_schedules', [
                    'docuid' => $docuid,
                    'weekday' => $weekday,
                    'is_available' => 1,
                ])->row_array();
                if ($schedule && isset($schedule['id'])) {
                    $source = 'master';
                    $timeSlots = $this->db->get_where('ms_doctor_time_slots', [ 'schedule_id' => intval($schedule['id']) ])->result_array();
                    foreach ($timeSlots as $s) {
                        $slots[] = [
                            'slot_id' => isset($s['id']) ? intval($s['id']) : null,
                            'title' => $s['title'] ?? 'Appointment',
                            'start_time' => $s['start_time'] ?? null,
                            'end_time' => $s['end_time'] ?? null,
                            'type' => $s['type'] ?? null,
                            'max_appointments' => isset($s['max_appointments']) ? intval($s['max_appointments']) : null,
                            'available' => true,
                        ];
                    }
                } else {
                    $source = 'none';
                }
            }

            $outDays[] = [
                'date' => $dateStr,
                'weekday' => $weekday,
                'source' => $source,
                'slots' => $slots,
                'count' => count($slots),
                'doctor' => [ 'id' => intval($doctorId), 'docuid' => $docuid, 'name' => $doctorName ],
            ];
        }

        return [ 'count' => count($outDays), 'days' => $outDays ];
    }

    // --- Helper: appointment submission unified ---
    private function _submitAppointmentUnified($input, $hospitalId) {
        $name = trim($input['name'] ?? ($input['payload']['name'] ?? ''));
        $mobile = trim($input['mobile'] ?? ($input['payload']['mobile'] ?? ''));
        $doctorId = isset($input['doctor_id']) ? intval($input['doctor_id']) : (isset($input['payload']['doctor_id']) ? intval($input['payload']['doctor_id']) : null);
        $department = trim($input['department'] ?? ($input['payload']['department'] ?? ''));
        $date = trim($input['date'] ?? ($input['payload']['date'] ?? ''));
        $time = trim($input['time'] ?? ($input['payload']['time'] ?? ''));

        if ($name === '' || $mobile === '') {
            return ['success' => false, 'message' => 'Name and mobile are required'];
        }

        $bookingCode = 'APT-' . strtoupper(substr(md5(uniqid('', true)), 0, 9));

        if ($this->db->table_exists('ms_public_appointments')) {
            $data = [
                'booking_code' => $bookingCode,
                'name' => $name,
                'mobile' => $mobile,
                'hospital_id' => intval($hospitalId),
                'doctor_id' => $doctorId,
                'department' => $department,
                'date' => $date,
                'time' => $time,
                'status' => 'pending',
                'created_at' => date('Y-m-d H:i:s'),
            ];
            $this->db->insert('ms_public_appointments', $data);
            $insertId = $this->db->insert_id();
            return ['success' => true, 'intent' => 'appointment', 'appointment_id' => $insertId, 'booking_code' => $bookingCode];
        }
        // Fallback to activity log
        $payload = [
            'booking_code' => $bookingCode,
            'name' => $name,
            'mobile' => $mobile,
            'hospital_id' => intval($hospitalId),
            'doctor_id' => $doctorId,
            'department' => $department,
            'date' => $date,
            'time' => $time,
        ];
        $this->db->insert('ms_activity_log', [
            'loguid' => uniqid('log_', true),
            'role' => 'system',
            'hosuid' => null,
            'action_type' => 'CREATE',
            'api_name' => 'home_chat',
            'description' => 'Public appointment submission',
            'request_payload' => json_encode($payload),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        return ['success' => true, 'intent' => 'appointment', 'booking_code' => $bookingCode];
    }

    // --- Helper: patient registration unified ---
    private function _registerPatientUnified($input, $hospitalId) {
        $name = trim($input['name'] ?? ($input['payload']['name'] ?? ''));
        $phone = trim($input['phone'] ?? ($input['payload']['phone'] ?? ($input['payload']['mobile'] ?? '')));
        $email = trim($input['email'] ?? ($input['payload']['email'] ?? ''));
        $gender = trim($input['gender'] ?? ($input['payload']['gender'] ?? ''));
        $dob = trim($input['dob'] ?? ($input['payload']['dob'] ?? ''));
        $age = intval($input['age'] ?? ($input['payload']['age'] ?? 0));
        $blood_group = trim($input['blood_group'] ?? ($input['payload']['blood_group'] ?? 'Unknown'));
        $address = trim($input['address'] ?? ($input['payload']['address'] ?? 'Registered via Chat'));
        $emergency_contact = trim($input['emergency_contact'] ?? ($input['payload']['emergency_contact'] ?? $phone));

        if (intval($hospitalId) <= 0) {
            return ['success' => false, 'message' => 'Invalid hospital_id'];
        }

        // Stage 1: ask for phone if missing
        if ($phone === '') {
            return [
                'success' => true,
                'intent' => 'register_patient',
                'message' => 'Please share your mobile number to continue.',
                'next' => 'phone',
            ];
        }

        $parts = preg_split('/\s+/', $name);
        $fname = isset($parts[0]) ? $parts[0] : $name;
        $lname = isset($parts[1]) ? implode(' ', array_slice($parts, 1)) : '-';

        // Find hosuid
        $hosuid = 'HOS-' . intval($hospitalId);
        $hQuery = $this->db->get_where('ms_hospitals', ['id' => intval($hospitalId)]);
        $hRow = $hQuery->row_array();
        if ($hRow && isset($hRow['hosuid'])) { $hosuid = $hRow['hosuid']; }

        // Exists check
        $existsQuery = $this->db->get_where('ms_patient', ['phone' => $phone, 'hospital_id' => intval($hospitalId)]);
        $existsRow = $existsQuery->row_array();
        if ($existsRow && isset($existsRow['id'])) {
            $pname = trim(($existsRow['fname'] ?? '') . ' ' . ($existsRow['lname'] ?? ''));
            return [
                'success' => true,
                'intent' => 'register_patient',
                'message' => 'Patient already registered',
                'patient_id' => intval($existsRow['id']),
                'patient_uid' => $existsRow['patient_uid'] ?? null,
                'exists' => true,
                'patient_name' => $pname !== '' ? $pname : null,
                'next' => 'ask_appointment',
            ];
        }

        // Progressive field collection for new patient
        if ($name === '') {
            return [
                'success' => true,
                'intent' => 'register_patient',
                'message' => 'What is your full name?',
                'next' => 'name',
            ];
        }
        if ($email === '') {
            return [
                'success' => true,
                'intent' => 'register_patient',
                'message' => 'Please provide your email address.',
                'next' => 'email',
            ];
        }
        if ($gender === '') {
            return [
                'success' => true,
                'intent' => 'register_patient',
                'message' => 'What is your gender?',
                'next' => 'gender',
            ];
        }
        if ($dob === '' && $age <= 0) {
            return [
                'success' => true,
                'intent' => 'register_patient',
                'message' => 'What is your age?',
                'next' => 'age',
            ];
        }

        $patient_uid = 'PAT-' . strtoupper(substr(md5(uniqid('', true)), 0, 10));
        $email = $email !== '' ? $email : ($phone . '@patients.local');
        $password = md5(uniqid('', true));
        // derive dob from age if dob not provided
        if ($dob === '' && $age > 0) {
            $year = intval(date('Y')) - $age;
            $dob = sprintf('%04d-%02d-%02d', $year, 1, 1);
        }
        $dobVal = $dob !== '' ? $dob : date('Y-m-d', strtotime('1970-01-01'));

        $insertData = [
            'patient_uid' => $patient_uid,
            'fname' => $fname,
            'lname' => $lname,
            'email' => $email,
            'password' => $password,
            'phone' => $phone,
            'dob' => $dobVal,
            'gender' => $gender,
            'blood_group' => $blood_group,
            'emergency_contact' => $emergency_contact,
            'address' => $address,
            'hosuid' => $hosuid,
            'hospital_id' => $hospitalId,
            'status' => 1,
            'isdelete' => 0,
            'created_by' => 'public',
            'updated_by' => 'public',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ];
        $this->db->insert('ms_patient', $insertData);
        $insertId = $this->db->insert_id();

        return [
            'success' => true,
            'intent' => 'register_patient',
            'message' => 'Patient registered successfully',
            'patient_id' => intval($insertId),
            'patient_uid' => $patient_uid,
            'next' => 'ask_appointment',
        ];
    }

    // --- Helper: hospital info reply ---
    private function _getHospitalInfoMessage($hospitalId, $topic) {
        $row = $this->db->get_where('ms_hospitals', ['id' => intval($hospitalId)])->row_array();
        $name = $row['hospital_name'] ?? ($row['name'] ?? 'Hospital');
        $address = $row['address'] ?? 'Address not available';
        $phone = $row['phone'] ?? ($row['contact_number'] ?? 'Phone not available');
        $hours = $row['hours'] ?? '24/7';
        $insurance = $row['insurance'] ?? 'Please contact billing for coverage details.';

        // Normalize topic: accept synonyms and UI labels
        $key = strtolower(trim($topic));
        $key = str_replace(' ', '_', $key);
        $map = [
            'visiting_hours' => 'hours',
            'opening_hours' => 'hours',
            'timings' => 'hours',
            'hours' => 'hours',
            'insurance' => 'insurance',
            'insurance_info' => 'insurance',
            'coverage' => 'insurance',
            'contact' => 'contact',
            'phone' => 'contact',
            'call' => 'contact',
            'address' => 'address',
            'location' => 'address',
            'online_consultation' => 'online_consultation',
            'telemedicine' => 'online_consultation',
            'lab_tests' => 'lab_tests',
            'laboratory' => 'lab_tests',
        ];
        $canonical = isset($map[$key]) ? $map[$key] : 'general';

        switch ($canonical) {
            case 'hours':
                return "$name is open $hours.";
            case 'insurance':
                return "Insurance information: $insurance";
            case 'contact':
                return "You can reach $name at $phone.";
            case 'address':
                return "Address: $address";
            case 'online_consultation':
                return "We offer online consultations. Please call $phone to schedule a telemedicine visit.";
            case 'lab_tests':
                return "Our laboratory is available for tests during $hours. For details, call $phone.";
            default:
                return "$name — How can I help you? We provide appointments, emergency support, and more.";
        }
    }

    // --- Helper: emergency reply ---
    private function _getEmergencyMessage($hospitalId) {
        $row = $this->db->get_where('ms_hospitals', ['id' => intval($hospitalId)])->row_array();
        $ambulance = $row['ambulance_number'] ?? ($row['emergency_phone'] ?? ($row['phone'] ?? 'N/A'));
        return "For emergencies, call: $ambulance. Our ER is open 24/7.";
    }
    // Public: Get doctors list for generic consumption (/api/get_doctors)
    public function GetDoctors() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }
    
        try {
            // Accept hospital_id via GET or POST (default 2)
            $hospitalId = $this->input->get('hospital_id', true);
            if (empty($hospitalId)) {
                $hospitalId = $this->input->post('hospital_id', true);
            }
            $hospitalId = intval($hospitalId) ?: 2;
    
            // Optional department filter
            $department = $this->input->get('department', true);
            if (empty($department)) {
                $department = $this->input->post('department', true);
            }
            $department = is_string($department) ? trim($department) : '';
    
            // Reuse existing helper to fetch active doctors
            $items = $this->_getDoctorsList($hospitalId, $department);
    
            echo json_encode([
                'success' => true,
                'hospital_id' => $hospitalId,
                'count' => count($items),
                // Provide both keys to be robust with frontend parsing
                'items' => $items,
                'doctors' => $items,
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching doctors: ' . $e->getMessage()
            ]);
        }
    }

    public function GetHomeDoctorsList(){
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }

        try {
            // Get hospital_id from GET or POST, default to 2
            $hospitalId = $this->input->get('hospital_id', true);
            if (empty($hospitalId)) {
                $hospitalId = $this->input->post('hospital_id', true);
            }
            $hospitalId = intval($hospitalId) ?: 2;

            // ✅ Fetch active doctors for the given hospital
            $this->db->select('
                d.id,
                d.docuid,
                d.name,
                d.email,
                d.phone,
                d.specialization_id,
                d.profile_image,
                d.gender,
                s.specialization_name,
                d.experience_year,
                d.experience_month,
                d.consultation_fee,
                d.status,
                d.isdelete,
                d.created_at,
                d.updated_at
            ');
            $this->db->from('ms_doctors d');
            $this->db->join('ms_doctor_specializations s', 's.id = d.specialization_id', 'left');
            $this->db->where('d.hospital_id', $hospitalId);
            $this->db->where('d.status', 1);
            $this->db->where('d.isdelete', 0);
            $this->db->order_by('d.name', 'ASC');

            $query = $this->db->get();
            $rows = $query->result_array();

            // No doctors found
            if (empty($rows)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No active doctors found for this hospital.',
                    'hospital_id' => $hospitalId,
                    'count' => 0,
                    'items' => []
                ]);
                return;
            }

            // ✅ Map response data cleanly
            $items = array_map(function ($row) {
                return [
                    'id' => (int)$row['id'],
                    'docuid' => $row['docuid'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'phone' => $row['phone'],
                    'profile_image' => !empty($row['profile_image'])
                    ? base_url('api/assets/images/doctors/'.$row['profile_image'])
                    : '',
                    'gender' => $row['gender'] ?? '',
                    'specialization_id' => (int)$row['specialization_id'],
                    'specialization_name' => $row['specialization_name'] ?? '',
                    'experience' => trim(($row['experience_year'] ?: '0') . ' years ' . ($row['experience_month'] ?: '0') . ' months'),
                    'consultation_fee' => $row['consultation_fee'],
                    //'status' => (int)$row['status'],
                    //'created_at' => $row['created_at'],
                    //'updated_at' => $row['updated_at']
                ];
            }, $rows);

            // ✅ Return final JSON
            echo json_encode([
                'success' => true,
                'hospital_id' => $hospitalId,
                'count' => count($items),
                'items' => $items
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching doctors: ' . $e->getMessage()
            ]);
        }
    }




    // Public: Get single hospital info for home chat (id fixed to 2)
    public function GetHomeHospitalInfo() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }
        try {
            $hospitalId = isset($_GET['hospital_id']) ? intval($_GET['hospital_id']) : 2;
            $query = $this->db->get_where('ms_hospitals', [ 'id' => $hospitalId ]);
            $row = $query->row_array();

            if (!$row) {
                echo json_encode([ 'success' => false, 'message' => 'Hospital not found' ]);
                return;
            }

            $data = [
                'id' => isset($row['id']) ? intval($row['id']) : $hospitalId,
                'name' => $row['hospital_name'] ?? $row['name'] ?? 'Hospital',
                'short_name' => $row['short_name'] ?? null,
                'appointment_day_limit' => isset($row['appointment_day_limit']) ? intval($row['appointment_day_limit']) : 7,
            ];

            echo json_encode([ 'success' => true, 'item' => $data ]);
        } catch (Exception $e) {
            echo json_encode([ 'success' => false, 'message' => $e->getMessage() ]);
        }
    }

    // Public: Submit an appointment request (lightweight booking)
    public function SubmitAppointment() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!is_array($input)) { $input = []; }

            $name = trim($input['name'] ?? '');
            $mobile = trim($input['mobile'] ?? '');
            $hospitalId = intval($input['hospital_id'] ?? 2);
            $doctorId = isset($input['doctor_id']) ? intval($input['doctor_id']) : null;
            $department = trim($input['department'] ?? '');
            $date = trim($input['date'] ?? '');
            $time = trim($input['time'] ?? '');

            if ($name === '' || $mobile === '') {
                echo json_encode(['success' => false, 'message' => 'Name and mobile are required']);
                return;
            }

            // Prepare booking code
            $bookingCode = 'APT-' . strtoupper(substr(md5(uniqid('', true)), 0, 9));

            // Insert into ms_public_appointments if exists, otherwise log to ms_activity_log
            if ($this->db->table_exists('ms_public_appointments')) {
                $data = [
                    'booking_code' => $bookingCode,
                    'name' => $name,
                    'mobile' => $mobile,
                    'hospital_id' => $hospitalId,
                    'doctor_id' => $doctorId,
                    'department' => $department,
                    'date' => $date,
                    'time' => $time,
                    'status' => 'pending',
                    'created_at' => date('Y-m-d H:i:s'),
                ];
                $this->db->insert('ms_public_appointments', $data);
                $insertId = $this->db->insert_id();
                echo json_encode(['success' => true, 'appointment_id' => $insertId, 'booking_code' => $bookingCode]);
                return;
            } else {
                // Fallback: write to activity log for traceability
                $payload = [
                    'booking_code' => $bookingCode,
                    'name' => $name,
                    'mobile' => $mobile,
                    'hospital_id' => $hospitalId,
                    'doctor_id' => $doctorId,
                    'department' => $department,
                    'date' => $date,
                    'time' => $time,
                ];
                $this->db->insert('ms_activity_log', [
                    'loguid' => uniqid('log_', true),
                    'role' => 'system',
                    'hosuid' => null,
                    'action_type' => 'CREATE',
                    'api_name' => 'home_submit_appointment',
                    'description' => 'Public appointment submission',
                    'request_payload' => json_encode($payload),
                    'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
                    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
                echo json_encode(['success' => true, 'booking_code' => $bookingCode]);
                return;
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // Public: Register a patient into ms_patient with minimal information
    public function SubmitPatientRegistration() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!is_array($input)) { $input = []; }

            $name = trim($input['name'] ?? '');
            $phone = trim($input['phone'] ?? ($input['mobile'] ?? ''));
            $hospitalId = intval($input['hospital_id'] ?? 0);
            $email = trim($input['email'] ?? '');
            $gender = trim($input['gender'] ?? 'Other');
            $dob = trim($input['dob'] ?? '');
            $blood_group = trim($input['blood_group'] ?? 'Unknown');
            $address = trim($input['address'] ?? 'Registered via Chat');
            $emergency_contact = trim($input['emergency_contact'] ?? $phone);

            if ($name === '' || $phone === '' || $hospitalId <= 0) {
                echo json_encode(['success' => false, 'message' => 'Name, phone and hospital_id are required']);
                return;
            }

            // Derive fname/lname from full name
            $parts = preg_split('/\s+/', $name);
            $fname = isset($parts[0]) ? $parts[0] : $name;
            $lname = isset($parts[1]) ? implode(' ', array_slice($parts, 1)) : '-';

            // Find hosuid from ms_hospitals
            $hosuid = null;
            $hQuery = $this->db->get_where('ms_hospitals', ['id' => $hospitalId]);
            $hRow = $hQuery->row_array();
            if ($hRow && isset($hRow['hosuid'])) {
                $hosuid = $hRow['hosuid'];
            } else {
                $hosuid = 'HOS-' . $hospitalId;
            }

            // Check if patient exists by phone + hospital + name (to allow family members with same phone)
            // We check if a patient with the same phone AND same name already exists. 
            // If yes -> return existing. If name is different -> create new.
            $this->db->from('ms_patient');
            $this->db->where('phone', $phone);
            $this->db->where('hospital_id', $hospitalId);
            $this->db->group_start();
                $this->db->where('fname', $fname);
                $this->db->where('lname', $lname);
            $this->db->group_end();
            $existsQuery = $this->db->get();
            $existsRow = $existsQuery->row_array();

            if ($existsRow && isset($existsRow['id'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Patient already registered',
                    'patient_id' => intval($existsRow['id']),
                    'patient_uid' => $existsRow['patient_uid'] ?? null,
                    'exists' => true
                ]);
                return;
            }

            // Check max 5 patients limit per phone number
            $this->db->where('phone', $phone);
            $this->db->where('hospital_id', $hospitalId);
            $existingCount = $this->db->count_all_results('ms_patient');
            
            if ($existingCount >= 5) {
                echo json_encode(['success' => false, 'message' => 'Maximum 5 patients allowed per mobile number']);
                return;
            }

            // Prepare defaults for required fields
            $patient_uid = 'PAT-' . strtoupper(substr(md5(uniqid('', true)), 0, 10));
            
            // Email generation logic: use provided email or generate from name (e.g. shantipriya@gmail.com)
            if ($email === '') {
                // Remove non-alphanumeric characters and convert to lowercase
                $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));
                $email = $cleanName . '@gmail.com';
            }
            
            $password = md5(uniqid('', true));
            $dobVal = $dob !== '' ? $dob : date('Y-m-d', strtotime('1970-01-01'));

            $insertData = [
                'patient_uid' => $patient_uid,
                'fname' => $fname,
                'lname' => $lname,
                'email' => $email,
                'password' => $password,
                'phone' => $phone,
                'dob' => $dobVal,
                'gender' => $gender,
                'blood_group' => $blood_group,
                'emergency_contact' => $emergency_contact,
                'address' => $address,
                'hosuid' => $hosuid,
                'hospital_id' => $hospitalId,
                'status' => 1,
                'isdelete' => 0,
                'created_by' => 'public',
                'updated_by' => 'public',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ];

            $this->db->insert('ms_patient', $insertData);
            $insertId = $this->db->insert_id();

            echo json_encode([
                'success' => true,
                'message' => 'Patient registered successfully',
                'patient_id' => intval($insertId),
                'patient_uid' => $patient_uid,
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function CheckUser() {
        $raw = $this->input->raw_input_stream;
        $payload = json_decode($raw, true);
        $phone = preg_replace('/\D/', '', $payload['phone'] ?? $this->input->post('phone') ?? '');
        $hospital_id = intval($payload['hospital_id'] ?? $this->input->post('hospital_id') ?? 2);

        $resp = ['success' => true, 'exists' => false, 'message' => '', 'patients' => []];

        if (strlen($phone) < 10 || $hospital_id <= 0) {
            $resp['success'] = false;
            $resp['message'] = 'Invalid phone or hospital_id';
            return $this->output->set_content_type('application/json')->set_output(json_encode($resp));
        }

        $this->db->from('ms_patient');
        $this->db->where('hospital_id', $hospital_id);
        $this->db->group_start();
        $this->db->where('phone', $phone);
        $this->db->group_end();
        $this->db->order_by('id', 'ASC'); // Oldest first
        $query = $this->db->get();
        $rows = $query->result();

        if ($rows && count($rows) > 0) {
            $resp['exists'] = true;
            $resp['message'] = 'Patient(s) found';
            $resp['limit_reached'] = (count($rows) >= 5);
            
            // Map rows to clean patient objects
            foreach ($rows as $row) {
                $firstName = isset($row->fname) ? $row->fname : '';
                $lastName = isset($row->lname) ? $row->lname : '';
                $fullName = isset($row->name) && !empty($row->name) ? $row->name : (
                    isset($row->patient_name) && !empty($row->patient_name) ? $row->patient_name : trim("$firstName $lastName")
                );

                $resp['patients'][] = [
                    'id' => $row->id,
                    'patient_uid' => isset($row->patient_uid) ? $row->patient_uid : null,
                    'name' => $fullName,
                    'fname' => $firstName,
                    'lname' => $lastName,
                    'age' => isset($row->age) ? intval($row->age) : null,
                    'phone' => $row->phone,
                    'location' => isset($row->address) ? $row->address : (isset($row->location) ? $row->location : null),
                    'email' => isset($row->email) ? $row->email : null
                ];
            }
            
            // Backward compatibility for single user logic (optional, but good practice)
            $first = $resp['patients'][0];
            $resp['name'] = $first['name'];
            $resp['age'] = $first['age'];
            $resp['location'] = $first['location'];
            
        } else {
            $resp['message'] = 'Patient not found';
        }

        return $this->output->set_content_type('application/json')->set_output(json_encode($resp));
    }
    // Handle CORS preflight
    public function GetAvailableSlots() {
        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }
    
        try {
            // Read payload from JSON, POST, or GET
            $raw = $this->input->raw_input_stream;
            $body = json_decode($raw, true);
            $hospitalId = intval($body['hospital_id'] ?? $this->input->post('hospital_id') ?? $this->input->get('hospital_id') ?? 2);
            $doctorId = intval($body['doctor_id'] ?? $this->input->post('doctor_id') ?? $this->input->get('doctor_id') ?? 0);
            $dateStr = $body['date'] ?? $this->input->post('date') ?? $this->input->get('date') ?? '';
            $phone = preg_replace('/\D/', '', ($body['phone'] ?? $this->input->post('phone') ?? $this->input->get('phone') ?? ''));
            $patientId = intval($body['patient_id'] ?? $this->input->post('patient_id') ?? $this->input->get('patient_id') ?? 0);
    
            if ($doctorId <= 0 || !$dateStr) {
                echo json_encode([
                    'success' => false,
                    'message' => 'doctor_id and date are required'
                ]);
                return;
            }
    
            // Validate date
            $dateObj = DateTime::createFromFormat('Y-m-d', $dateStr);
            if (!$dateObj || $dateObj->format('Y-m-d') !== $dateStr) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid date format, expected YYYY-MM-DD'
                ]);
                return;
            }
            $weekday = $dateObj->format('D'); // Mon, Tue, ...

            // If phone provided, check if appointment already exists for this date
            if ($phone && strlen($phone) >= 10) {
                $where = [
                    'hospital_id' => $hospitalId,
                    'doctor_id' => $doctorId,
                    'date' => $dateStr,
                    'phone' => $phone,
                ];

                if ($patientId > 0) {
                    $where['patient_id'] = $patientId;
                }

                $existing = $this->db->get_where('ms_patient_appointment', $where)->row_array();

                if ($existing && isset($existing['id'])) {
                    // Fetch hospital and doctor names for display
                    $hRow = $this->db->get_where('ms_hospitals', ['id' => $hospitalId])->row_array();
                    $hospitalName = $hRow['hospital_name'] ?? ($hRow['name'] ?? 'Hospital');
                    $dRow = $this->db->get_where('ms_doctors', ['id' => $doctorId])->row_array();
                    $doctorName = $dRow['name'] ?? 'Doctor';

                    $startTime = $existing['start_time'] ?? null;
                    $endTime = $existing['end_time'] ?? null;
                    $timeLabel = ($startTime && $endTime) ? ($startTime . ' - ' . $endTime) : ($startTime ?? null);

                    $appointment = [
                        'appointment_id' => intval($existing['id']),
                        'appointment_uid' => $existing['appointment_uid'] ?? null,
                        'hospital_id' => $hospitalId,
                        'hospital_name' => $hospitalName,
                        'doctor_id' => $doctorId,
                        'doctor_name' => $doctorName,
                        'patient_id' => isset($existing['patient_id']) ? intval($existing['patient_id']) : null,
                        'patient_name' => $existing['patient_name'] ?? null,
                        'phone' => $existing['phone'] ?? null,
                        'date' => $existing['date'] ?? null,
                        'start_time' => $startTime,
                        'end_time' => $endTime,
                        'time_label' => $timeLabel,
                        'token_no' => isset($existing['token_no']) ? intval($existing['token_no']) : null,
                        'slot_id' => isset($existing['slot_id']) ? intval($existing['slot_id']) : null,
                        'source' => $existing['source'] ?? null,
                    ];

                    echo json_encode([
                        'success' => true,
                        'hospital_id' => $hospitalId,
                        'doctor_id' => $doctorId,
                        'doctor' => [ 'id' => $doctorId, 'name' => $doctorName ],
                        'date' => $dateStr,
                        'weekday' => $weekday,
                        'source' => $existing['source'] ?? 'none',
                        'count' => 0,
                        'slots' => [],
                        'booked' => true,
                        'appointment' => $appointment,
                    ]);
                    return;
                }
            }
    
            // Resolve docuid and doctor name
            $docRow = $this->db->get_where('ms_doctors', [
                'id' => $doctorId,
                'hospital_id' => $hospitalId,
                'status' => 1,
                'isdelete' => 0
            ])->row_array();
    
            if (!$docRow || !isset($docRow['docuid'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Doctor not found or inactive for this hospital'
                ]);
                return;
            }
    
            $docuid = $docRow['docuid'];
            $doctorName = $docRow['name'] ?? 'Doctor';
    
            // 1) Prefer event schedule for exact date
            $event = $this->db->get_where('ms_doctor_event_schedules', [
                'docuid' => $docuid,
                'date' => $dateStr,
                'is_available' => 1,
            ])->row_array();
    
            $source = 'none';
            $slots = [];
    
            if ($event && isset($event['id'])) {
                $source = 'event';
                $eventSlots = $this->db
                    ->where('event_id', intval($event['id']))
                    ->get('ms_doctor_event_slots')
                    ->result_array();
    
                foreach ($eventSlots as $s) {
                    $slotId = isset($s['id']) ? intval($s['id']) : null;
                    $max = isset($s['max_appointments']) ? intval($s['max_appointments']) : 0;
                    // If column doesn't exist, fallback to appointment count
                    $bookSlot = isset($s['book_slot']) ? intval($s['book_slot']) : $this->_countBookedAppointments('event', $slotId, $doctorId, $dateStr);
                    $availableCount = max(0, $max - $bookSlot);

                    $slots[] = [
                        'id' => $slotId,
                        'title' => $s['title'] ?? 'Appointment',
                        'type' => $s['type'] ?? null,
                        'notes' => $s['notes'] ?? null,
                        'start_time' => $s['start_time'] ?? null,
                        'end_time' => $s['end_time'] ?? null,
                        'time' => $s['start_time'] ?? null, // convenience for UI
                        'max_appointments' => $max,
                        'book_slot' => $bookSlot,
                        'available_count' => $availableCount,
                        'available' => $availableCount > 0,
                        'period' => $this->_inferPeriod($s['start_time'] ?? null),
                    ];
                }
            } else {
                // 2) Fallback to master schedule by weekday
                $schedule = $this->db->get_where('ms_doctor_schedules', [
                    'docuid' => $docuid,
                    'weekday' => $weekday,
                    'is_available' => 1,
                ])->row_array();
    
                if ($schedule && isset($schedule['id'])) {
                    $source = 'master';
                    $timeSlots = $this->db
                        ->where('schedule_id', intval($schedule['id']))
                        ->get('ms_doctor_time_slots')
                        ->result_array();
    
                    foreach ($timeSlots as $s) {
                        $slotId = isset($s['id']) ? intval($s['id']) : null;
                        $max = isset($s['max_appointments']) ? intval($s['max_appointments']) : 0;
                        $bookSlot = isset($s['book_slot']) ? intval($s['book_slot']) : $this->_countBookedAppointments('master', $slotId, $doctorId, $dateStr);
                        $availableCount = max(0, $max - $bookSlot);

                        $slots[] = [
                            'id' => $slotId,
                            'title' => $s['title'] ?? 'Appointment',
                            'type' => $s['type'] ?? null,
                            'notes' => $s['notes'] ?? null,
                            'start_time' => $s['start_time'] ?? null,
                            'end_time' => $s['end_time'] ?? null,
                            'time' => $s['start_time'] ?? null,
                            'max_appointments' => $max,
                            'book_slot' => $bookSlot,
                            'available_count' => $availableCount,
                            'available' => $availableCount > 0,
                            'period' => $this->_inferPeriod($s['start_time'] ?? null),
                        ];
                    }
                }
            }
    
            // Filter out slots where available_count <= 0
            // $slots = array_values(array_filter($slots, function($s) {
            //     $available = isset($s['available_count']) ? intval($s['available_count']) : 0;
            //     return $available > 0;
            // }));

            echo json_encode([
                'success' => true,
                'hospital_id' => $hospitalId,
                'doctor_id' => $doctorId,
                'doctor' => [ 'id' => $doctorId, 'docuid' => $docuid, 'name' => $doctorName ],
                'date' => $dateStr,
                'weekday' => $weekday,
                'source' => $source,
                'count' => count($slots),
                'slots' => $slots,
                'booked' => false,
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching available slots: ' . $e->getMessage()
            ]);
        }
    }

    // Helper: infer simple period from start_time
    private function _inferPeriod($startTime) {
        if (!$startTime) return null;
        // Expect HH:MM format
        $parts = explode(':', $startTime);
        $hour = intval($parts[0] ?? 0);
        if ($hour < 12) return 'morning';
        if ($hour < 17) return 'afternoon';
        return 'evening';
    }

    // ... existing code ...
}

?>
