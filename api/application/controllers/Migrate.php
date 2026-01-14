<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Migrate extends CI_Controller {
    public function index() {
        // Enable migration dynamically
        $this->config->set_item('migration_enabled', TRUE);
        $this->config->set_item('migration_type', 'timestamp');
        
        $this->load->library('migration');
        
        if ($this->migration->latest() === FALSE) {
            show_error($this->migration->error_string());
        } else {
            echo "Migration success!";
        }
    }
}
