<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require 'vendor/autoload.php';

use OpenApi\Generator;
use OpenApi\Annotations as OA;
use Psr\Log\NullLogger;

/**
 * @OA\Info(
 *     title="Patient Port API",
 *     version="1.0.0"
 * )
 */
class SwaggerController extends CI_Controller {

    public function __construct() {
        parent::__construct();
        // Load URL helper
        $this->load->helper('url');
        
        // Allow CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }

    public function index() {
        $this->load->view('swagger_ui');
    }

    public function json($role = 'hospital_admin') {
        // scan paths based on role
        $paths = [APPPATH . 'config/swagger_info.php'];
        
        if ($role === 'hospital_admin') {
            $paths[] = APPPATH . 'controllers/HSPatientController.php';
            $paths[] = APPPATH . 'controllers/HSDoctorsController.php';
            $paths[] = APPPATH . 'controllers/HSStaffController.php';
            $paths[] = APPPATH . 'controllers/HSHospitalsController.php';
            $paths[] = APPPATH . 'controllers/HSHospitalLaboratoryController.php';
            $paths[] = APPPATH . 'controllers/HSHospitalMedicalSController.php';
            $paths[] = APPPATH . 'controllers/HSHospitalsBedPermissionController.php';
            $paths[] = APPPATH . 'controllers/HSHospitalsInventoryController.php';
            $paths[] = APPPATH . 'controllers/HospitalDashboardController.php';
            $paths[] = APPPATH . 'controllers/HospitalProfileController.php';
            $paths[] = APPPATH . 'controllers/ReceptionController.php';
        } elseif ($role === 'doctor') {
            $paths[] = APPPATH . 'controllers/SFDoctorController.php';
        } elseif ($role === 'staff') {
            $paths[] = APPPATH . 'controllers/SFStaffController.php';
        } else {
             // Default or all
             $paths[] = APPPATH . 'controllers';
        }

        try {
            // Manually include controller files for ReflectionAnalyser
            foreach ($paths as $path) {
                if (file_exists($path)) {
                    require_once $path;
                }
            }

            $openapi = Generator::scan($paths);
            header('Content-Type: application/json');
            echo $openapi->toJson();
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
