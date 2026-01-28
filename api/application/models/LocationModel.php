<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class LocationModel extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function get_all_states() {
        $this->db->select('stateId, stateName');
        $this->db->from('ms_state');
        $this->db->order_by('stateName', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    public function get_cities_by_state($stateId) {
        $this->db->select('cityId, cityName');
        $this->db->from('ms_city');
        $this->db->where('stateId', $stateId);
        $this->db->order_by('cityName', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }
}
