<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class WhatsAppController extends CI_Controller {

    private $api_version = 'v17.0';

    public function __construct() {
        parent::__construct();
        $this->load->model('WhatsAppModel');
        $this->load->helper('url');
        
        // Allow CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    }

    // Test Endpoint
    public function test() {
        echo "WhatsApp Controller is accessible. Database check: ";
        try {
            if ($this->db->table_exists('ms_whatsapp_messages')) {
                echo "Table 'ms_whatsapp_messages' exists.";
            } else {
                echo "Table 'ms_whatsapp_messages' DOES NOT exist. Please run migrations.";
            }
        } catch (Exception $e) {
            echo "Database Error: " . $e->getMessage();
        }
    }

    // Setup Database Tables (Direct SQL Fallback)
    public function setup_database() {
        echo "<h1>WhatsApp Database Setup</h1>";
        
        // 1. Create ms_whatsapp_messages
        if (!$this->db->table_exists('ms_whatsapp_messages')) {
            $sql1 = "CREATE TABLE `ms_whatsapp_messages` (
              `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
              `direction` enum('inbound','outbound') NOT NULL,
              `phone_number` varchar(20) NOT NULL,
              `message_sid` varchar(100) DEFAULT NULL,
              `body` text DEFAULT NULL,
              `media_url` text DEFAULT NULL,
              `status` varchar(50) DEFAULT 'pending',
              `payload` longtext DEFAULT NULL,
              `created_at` datetime DEFAULT NULL,
              `updated_at` datetime DEFAULT NULL,
              PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
            
            if ($this->db->query($sql1)) {
                echo "<p style='color:green'>Created table: ms_whatsapp_messages</p>";
            } else {
                echo "<p style='color:red'>Failed to create table: ms_whatsapp_messages</p>";
                echo $this->db->error()['message'];
            }
        } else {
            echo "<p style='color:blue'>Table exists: ms_whatsapp_messages</p>";
        }

        // 2. Create ms_whatsapp_config
        if (!$this->db->table_exists('ms_whatsapp_config')) {
            $sql2 = "CREATE TABLE `ms_whatsapp_config` (
              `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
              `config_key` varchar(100) NOT NULL,
              `config_value` text DEFAULT NULL,
              `updated_at` datetime DEFAULT NULL,
              PRIMARY KEY (`id`),
              UNIQUE KEY `config_key` (`config_key`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
            
            if ($this->db->query($sql2)) {
                echo "<p style='color:green'>Created table: ms_whatsapp_config</p>";
                
                // Insert Defaults
                $data = array(
                    array('config_key' => 'verify_token', 'config_value' => 'patientport_verify_123', 'updated_at' => date('Y-m-d H:i:s')),
                    array('config_key' => 'access_token', 'config_value' => 'YOUR_ACCESS_TOKEN', 'updated_at' => date('Y-m-d H:i:s')),
                    array('config_key' => 'phone_number_id', 'config_value' => 'YOUR_PHONE_NUMBER_ID', 'updated_at' => date('Y-m-d H:i:s')),
                    array('config_key' => 'app_id', 'config_value' => '1308838484596357', 'updated_at' => date('Y-m-d H:i:s')),
                    array('config_key' => 'business_id', 'config_value' => '1645960139724883', 'updated_at' => date('Y-m-d H:i:s')),
                    array('config_key' => 'whatsapp_number', 'config_value' => '9503493993', 'updated_at' => date('Y-m-d H:i:s')),
                );
                $this->db->insert_batch('ms_whatsapp_config', $data);
                echo "<p style='color:green'>Inserted default configuration data.</p>";
            } else {
                echo "<p style='color:red'>Failed to create table: ms_whatsapp_config</p>";
                echo $this->db->error()['message'];
            }
        } else {
            echo "<p style='color:blue'>Table exists: ms_whatsapp_config</p>";
            // Check if config exists, if not insert
             $count = $this->db->count_all('ms_whatsapp_config');
             if ($count == 0) {
                $data = array(
                    array('config_key' => 'verify_token', 'config_value' => 'patientport_verify_123', 'updated_at' => date('Y-m-d H:i:s')),
                    array('config_key' => 'access_token', 'config_value' => 'YOUR_ACCESS_TOKEN', 'updated_at' => date('Y-m-d H:i:s')),
                    array('config_key' => 'phone_number_id', 'config_value' => 'YOUR_PHONE_NUMBER_ID', 'updated_at' => date('Y-m-d H:i:s')),
                    array('config_key' => 'app_id', 'config_value' => '1308838484596357', 'updated_at' => date('Y-m-d H:i:s')),
                    array('config_key' => 'business_id', 'config_value' => '1645960139724883', 'updated_at' => date('Y-m-d H:i:s')),
                    array('config_key' => 'whatsapp_number', 'config_value' => '9503493993', 'updated_at' => date('Y-m-d H:i:s')),
                );
                $this->db->insert_batch('ms_whatsapp_config', $data);
                echo "<p style='color:green'>Inserted missing configuration data.</p>";
             }
        }
    }

    // View Logs Endpoint (For debugging live server)
    public function view_logs() {
        echo "<h1>WhatsApp Debug Logs</h1>";
        
        // Check Custom Debug Log
        $debug_path = APPPATH . 'logs/whatsapp_debug.log';
        if (file_exists($debug_path)) {
            echo "<h2>Raw Webhook Traffic (whatsapp_debug.log)</h2>";
            $content = file_get_contents($debug_path);
            echo "<pre style='background:#e0f7fa; padding:10px; border:1px solid #006064; white-space: pre-wrap;'>" . htmlspecialchars($content) . "</pre>";
        } else {
             echo "<h2>Raw Webhook Traffic</h2><p style='color:orange'>No traffic received yet in whatsapp_debug.log</p>";
        }

        echo "<h2>System Logs</h2>";
        echo "<p>Checking for today's logs...</p>";
        
        $log_path = APPPATH . 'logs/log-' . date('Y-m-d') . '.php';
        if (file_exists($log_path)) {
            $content = file_get_contents($log_path);
            echo "<pre style='background:#f4f4f4; padding:10px; border:1px solid #ccc; white-space: pre-wrap;'>" . htmlspecialchars($content) . "</pre>";
        } else {
            echo "<p style='color:red'>No logs found for today (" . date('Y-m-d') . ").</p>";
            echo "<p>Make sure 'log_threshold' is set to 1 or higher in config.php</p>";
        }
    }

    // Webhook Endpoint (Verify & Receive)
    public function webhook() {
        // Force log everything to a separate file to bypass CI log threshold issues
        $raw_input = file_get_contents('php://input');
        $method = $_SERVER['REQUEST_METHOD'];
        $debug_log = "[" . date('Y-m-d H:i:s') . "] METHOD: $method | QUERY: " . json_encode($_GET) . " | BODY: $raw_input" . PHP_EOL;
        file_put_contents(APPPATH . 'logs/whatsapp_debug.log', $debug_log, FILE_APPEND);

        $method = $_SERVER['REQUEST_METHOD'];
        log_message('error', 'WhatsApp Webhook Hit: ' . $method);

        if ($method === 'GET') {
            // Verification Request
            $mode = $this->input->get('hub_mode');
            $token = $this->input->get('hub_verify_token');
            $challenge = $this->input->get('hub_challenge');

            log_message('error', 'Webhook Verification: Mode=' . $mode . ' Token=' . $token);

            $verify_token = $this->WhatsAppModel->get_config('verify_token');
            // Fallback if DB is empty/default
            if ($verify_token === 'YOUR_VERIFY_TOKEN' || empty($verify_token)) {
                 $verify_token = 'patientport_verify_123'; 
            }

            if ($mode && $token) {
                if ($mode === 'subscribe' && $token === $verify_token) {
                    log_message('error', 'Webhook Verified Successfully');
                    http_response_code(200);
                    echo $challenge;
                } else {
                    log_message('error', 'Webhook Verification Failed. Expected: ' . $verify_token . ' Got: ' . $token);
                    http_response_code(403);
                }
            }
        } elseif ($method === 'POST') {
            // Incoming Event
            log_message('error', 'Webhook POST Raw: ' . $raw_input);
            
            $input = json_decode($raw_input, true);

            if ($input) {
                // Process the event
                try {
                    $this->_process_webhook_payload($input);
                    http_response_code(200);
                    echo 'EVENT_RECEIVED';
                } catch (Exception $e) {
                    log_message('error', 'Webhook Processing Error: ' . $e->getMessage());
                    http_response_code(500);
                }
            } else {
                log_message('error', 'Webhook POST Invalid JSON');
                http_response_code(400);
            }
        }
    }

    // Send Message Endpoint (API)
    public function send_message() {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['phone']) || !isset($input['message'])) {
            echo json_encode(['status' => 'error', 'message' => 'Missing phone or message']);
            return;
        }

        $phone = $input['phone'];
        $message = $input['message'];

        // 1. Log as outbound pending
        $data = [
            'direction' => 'outbound',
            'phone_number' => $phone,
            'body' => $message,
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s')
        ];
        $insert_id = $this->WhatsAppModel->log_message($data);

        // 2. Send to WhatsApp API
        $response = $this->_send_to_whatsapp_api($phone, $message);

        // 3. Update status based on response
        if (isset($response['messages'][0]['id'])) {
            $this->WhatsAppModel->update_status($response['messages'][0]['id'], 'sent');
            // Update local ID with WhatsApp Message ID
            $this->db->where('id', $insert_id);
            $this->db->update('ms_whatsapp_messages', ['message_sid' => $response['messages'][0]['id'], 'status' => 'sent']);
            
            echo json_encode(['status' => 'success', 'data' => $response]);
        } else {
            $this->db->where('id', $insert_id);
            $this->db->update('ms_whatsapp_messages', ['status' => 'failed', 'payload' => json_encode($response)]);
            echo json_encode(['status' => 'error', 'data' => $response]);
        }
    }

    // Helper: Process Incoming Webhook
    private function _process_webhook_payload($data) {
        log_message('error', 'Processing Webhook Payload: ' . json_encode($data));

        // Basic parsing for WhatsApp Cloud API format
        if (isset($data['entry'][0]['changes'][0]['value']['messages'][0])) {
            $msg = $data['entry'][0]['changes'][0]['value']['messages'][0];
            log_message('error', 'Found Message: ' . json_encode($msg));

            $phone = $msg['from'];
            $msg_id = $msg['id'];
            $body = isset($msg['text']['body']) ? $msg['text']['body'] : '[Media/Other]';
            
            if (!$this->WhatsAppModel->message_exists($msg_id)) {
                $log_data = [
                    'direction' => 'inbound',
                    'phone_number' => $phone,
                    'message_sid' => $msg_id,
                    'body' => $body,
                    'status' => 'received',
                    'payload' => json_encode($msg),
                    'created_at' => date('Y-m-d H:i:s')
                ];
                $inserted = $this->WhatsAppModel->log_message($log_data);
                log_message('error', 'Message Inserted ID: ' . $inserted);
            } else {
                log_message('error', 'Message already exists: ' . $msg_id);
            }
        } else {
            log_message('error', 'No "messages" field found in payload.');
        }
        
        // Handle Status Updates (sent, delivered, read)
        if (isset($data['entry'][0]['changes'][0]['value']['statuses'][0])) {
            $status_update = $data['entry'][0]['changes'][0]['value']['statuses'][0];
            log_message('error', 'Found Status Update: ' . json_encode($status_update));

            $msg_id = $status_update['id'];
            $status = $status_update['status'];
            
            $this->WhatsAppModel->update_status($msg_id, $status);
        }
    }

    // Helper: Send to Meta API
    private function _send_to_whatsapp_api($to, $text) {
        $phone_number_id = $this->WhatsAppModel->get_config('phone_number_id');
        $access_token = $this->WhatsAppModel->get_config('access_token');

        if (!$phone_number_id || !$access_token) {
            return ['error' => 'Missing configuration (phone_number_id or access_token)'];
        }

        $url = "https://graph.facebook.com/{$this->api_version}/{$phone_number_id}/messages";
        
        $data = [
            'messaging_product' => 'whatsapp',
            'to' => $to,
            'type' => 'text',
            'text' => ['body' => $text]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $access_token
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $result = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($result, true);
    }
}
