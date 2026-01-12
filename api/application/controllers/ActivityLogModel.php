<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class ActivityLogModel extends CI_Model {

    public function __construct() {
        parent::__construct();
    }

    public function logActivity($logData = []) {
        if (empty($logData)) return false;

        $data = [
            'loguid'          => $logData['loguid'] ?? 'SYSTEM',
            'role'            => $logData['role'] ?? 'system',
            'hosuid'          => $logData['hosuid'] ?? null,
            'action_type'     => $logData['action_type'] ?? 'OTHER',
            'api_name'        => $logData['api_name'] ?? null,
            'description'     => $logData['description'] ?? null,
            'request_payload' => isset($logData['request_payload']) ? json_encode($logData['request_payload']) : null,
            'ip_address'      => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent'      => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'created_at'      => date('Y-m-d H:i:s')
        ];

        return $this->db->insert('ms_activity_log', $data);
    }
}
