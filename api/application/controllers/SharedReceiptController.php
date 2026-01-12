<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class SharedReceiptController extends CI_Controller {

    public function __construct() {
        parent::__construct();
        // CORS Headers
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        
        if ($_SERVER['REQUEST_METHOD'] == "OPTIONS") {
            die();
        }

        $this->load->model('SharedReceiptModel');
        $this->load->helper('url');
    }

    public function view($token) {
        $data['token'] = $token;
        $this->load->view('shared_receipt_view', $data);
    }

    public function verify_password() {
        $token = $this->input->post('token');
        $password = $this->input->post('password');

        if (!$token || !$password) {
            echo json_encode(['success' => false, 'message' => 'Token and password are required']);
            return;
        }

        $receipt = $this->SharedReceiptModel->get_by_token($token);

        if (!$receipt) {
            echo json_encode(['success' => false, 'message' => 'Invalid link']);
            return;
        }

        if (strtotime($receipt['expires_at']) < time()) {
            echo json_encode(['success' => false, 'message' => 'This link has expired']);
            return;
        }

        if (!password_verify($password, $receipt['password'])) {
            echo json_encode(['success' => false, 'message' => 'Incorrect password']);
            return;
        }

        // Generate a temporary access token (valid for short time, e.g., 5 mins)
        // We can use a simple hash of the token + password hash + timestamp + salt
        $timestamp = time();
        $access_token = hash_hmac('sha256', $token . $receipt['password'] . $timestamp, 'shared_receipt_secret_key_change_this');
        
        echo json_encode([
            'success' => true, 
            'download_url' => base_url("shared/receipt/file/{$token}?access_token={$access_token}&t={$timestamp}")
        ]);
    }

    public function view_file($token) {
        $access_token = $this->input->get('access_token');
        $timestamp = $this->input->get('t');

        if (!$token || !$access_token || !$timestamp) {
            show_error('Invalid request', 400);
            return;
        }

        // Verify timestamp (e.g., valid for 5 minutes)
        if (time() - $timestamp > 300) {
            show_error('Link expired. Please enter password again.', 403);
            return;
        }

        $receipt = $this->SharedReceiptModel->get_by_token($token);
        if (!$receipt) {
            show_404();
            return;
        }

        // Verify signature
        $expected_token = hash_hmac('sha256', $token . $receipt['password'] . $timestamp, 'shared_receipt_secret_key_change_this');
        if (!hash_equals($expected_token, $access_token)) {
            show_error('Access denied', 403);
            return;
        }

        $file_path = FCPATH . $receipt['file_path'];
        if (!file_exists($file_path)) {
            show_error('File not found', 404);
            return;
        }

        // Serve the file
        $mime = mime_content_type($file_path);
        header('Content-Description: File Transfer');
        header('Content-Type: ' . $mime);
        header('Content-Disposition: inline; filename="' . basename($file_path) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file_path));
        readfile($file_path);
        exit;
    }
}
