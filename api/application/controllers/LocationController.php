<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class LocationController extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('LocationModel');
        // Enable CORS
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Content-Length, Accept-Encoding, Authorization");
        if ( "OPTIONS" === $_SERVER['REQUEST_METHOD'] ) {
            die();
        }
    }

    public function get_states() {
        $states = $this->LocationModel->get_all_states();
        echo json_encode($states);
    }

    public function get_cities($stateId) {
        if (!$stateId) {
            echo json_encode(['status' => false, 'message' => 'State ID is required']);
            return;
        }
        $cities = $this->LocationModel->get_cities_by_state($stateId);
        echo json_encode($cities);
    }
}
