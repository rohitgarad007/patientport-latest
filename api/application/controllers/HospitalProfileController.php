<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use OpenApi\Annotations as OA;

class HospitalProfileController extends CI_Controller {

    private $AES_KEY = "RohitGaradHos@173414";

    public function __construct() {
        parent::__construct();
        $this->load->model('HospitalProfileModel');
        $this->load->helper('url');
        // Enable CORS
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Content-Length, Accept-Encoding, Authorization");
        if ( "OPTIONS" === $_SERVER['REQUEST_METHOD'] ) {
            die();
        }
    }

    private function openssl_EVP_BytesToKey($passphrase, $salt, $keyLen = 32, $ivLen = 16) {
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

    private function encrypt_aes_for_js($plainText, $passphrase) {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = 'Salted__' . $salt;
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $encrypted = openssl_encrypt($plainText, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        return base64_encode($salted . $encrypted);
    }

    private function decrypt_aes_from_js($cipherTextBase64, $passphrase) {
        $cipherText = base64_decode($cipherTextBase64);
        if (!$cipherText || strlen($cipherText) < 16) {
            throw new Exception('Base64 decode failed or too short');
        }
        $saltHeader = substr($cipherText, 0, 8);
        if (strncmp($saltHeader, 'Salted__', 8) !== 0) {
            throw new Exception('Invalid salt header');
        }
        $salt = substr($cipherText, 8, 8);
        $cipherRaw = substr($cipherText, 16);
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $decrypted = openssl_decrypt($cipherRaw, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        if ($decrypted === false) {
            throw new Exception('Decryption failed');
        }
        return $decrypted;
    }

    /**
     * @OA\Get(
     *     path="/HospitalProfileController/get_profile/{hosuid}",
     *     tags={"Hospital Profile"},
     *     summary="Get hospital profile",
     *     @OA\Parameter(
     *         name="hosuid",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean"),
     *             @OA\Property(property="data", type="string", description="Encrypted profile data"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function get_profile($hosuid) {
        if (!$hosuid) {
            echo json_encode(['status' => false, 'message' => 'Hospital UID is required']);
            return;
        }
        $profile = $this->HospitalProfileModel->get_hospital_profile($hosuid);
        if ($profile) {
            $encryptedData = $this->encrypt_aes_for_js(json_encode($profile), $this->AES_KEY);
            echo json_encode(['status' => true, 'data' => $encryptedData]);
        } else {
            echo json_encode(['status' => false, 'message' => 'Hospital not found']);
        }
    }

    public function get_website_settings($hosuid) {
        if (!$hosuid) {
            echo json_encode(['status' => false, 'message' => 'Hospital UID is required']);
            return;
        }

        $hospitalId = $this->HospitalProfileModel->get_hospital_id_by_hosuid($hosuid);
        if (!$hospitalId) {
            echo json_encode(['status' => false, 'message' => 'Hospital not found']);
            return;
        }

        $about = $this->HospitalProfileModel->get_website_about_by_hospital_id($hospitalId);
        $bannersRows = $this->HospitalProfileModel->get_website_banners_by_hospital_id($hospitalId);

        $banners = [];
        foreach ($bannersRows as $row) {
            $banners[] = [
                'id' => isset($row['id']) ? (int)$row['id'] : null,
                'title' => $row['title'] ?? '',
                'sub_title' => $row['sub_title'] ?? '',
                'image' => $row['banner_image'] ?? '',
                'status' => isset($row['status']) ? (int)$row['status'] : 1,
            ];
        }

        $templateId = $this->HospitalProfileModel->get_web_template_by_hospital_id($hospitalId);
        $templateKey = 'template_1';
        if (in_array($templateId, [1,2,3,4], true)) {
            $templateKey = 'template_' . $templateId;
        }

        $settings = [
            'about_title' => $about['about_title'] ?? '',
            'about_description' => $about['about_description'] ?? '',
            'about_image' => $about['about_image'] ?? '',
            'website_template' => $templateKey,
            'banners' => $banners,
        ];

        $encryptedData = $this->encrypt_aes_for_js(json_encode($settings), $this->AES_KEY);
        echo json_encode(['status' => true, 'data' => $encryptedData]);
    }

    /**
     * @OA\Post(
     *     path="/HospitalProfileController/update_profile",
     *     tags={"Hospital Profile"},
     *     summary="Update hospital profile",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="string", description="Encrypted update data")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function update_profile() {
        $raw = file_get_contents("php://input");
        $requestData = json_decode($raw, true);
        
        $data = [];
        if (isset($requestData['data'])) {
            try {
                $decryptedJson = $this->decrypt_aes_from_js($requestData['data'], $this->AES_KEY);
                $data = json_decode($decryptedJson, true);
            } catch (Exception $e) {
                echo json_encode(['status' => false, 'message' => 'Decryption failed: ' . $e->getMessage()]);
                return;
            }
        } else {
            // Fallback for unencrypted form data
            $data = !empty($requestData) ? $requestData : $_POST;
        }

        $hosuid = $data['hosuid'] ?? null;
        if (!$hosuid) {
            echo json_encode(['status' => false, 'message' => 'Hospital UID is required']);
            return;
        }

        $screen_default_message = $data['screen_default_message'] ?? null;
        $hospital_qr_code = $data['hospital_qr_code'] ?? null;
        
        // Handle QR Code Upload (Base64)
        if ($hospital_qr_code && strpos($hospital_qr_code, 'data:image') === 0) {
            $uploadDir = FCPATH . 'uploads/hospitals/qr/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            list($type, $dataRaw) = explode(';', $hospital_qr_code);
            list(, $dataRaw)      = explode(',', $dataRaw);
            $decodedData = base64_decode($dataRaw);
            
            $fileName = 'qr_' . $hosuid . '_' . time() . '.png';
            file_put_contents($uploadDir . $fileName, $decodedData);
            
            $hospital_qr_code = 'uploads/hospitals/qr/' . $fileName;
        }

        $updateData = [
            'name' => $data['name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'state' => $data['state'] ?? null,
            'city' => $data['city'] ?? null,
            'appointment_day_limit' => $data['appointment_day_limit'] ?? null,
            'book_appointment_status' => $data['book_appointment_status'] ?? null,
            'screen_default_message' => $screen_default_message,
            'hospital_qr_code' => $hospital_qr_code
        ];

        // Remove null values (preserve 0 for status)
        $updateData = array_filter($updateData, function($value) { return !is_null($value) && $value !== ''; });

        $updated = $this->HospitalProfileModel->update_hospital_profile($hosuid, $updateData);

        if ($updated) {
            echo json_encode(['status' => true, 'message' => 'Profile updated successfully']);
        } else {
            echo json_encode(['status' => false, 'message' => 'Failed to update profile']);
        }
    }

    public function update_website_settings() {
        $raw = file_get_contents("php://input");
        $requestData = json_decode($raw, true);

        $data = [];
        if (isset($requestData['data'])) {
            try {
                $decryptedJson = $this->decrypt_aes_from_js($requestData['data'], $this->AES_KEY);
                $data = json_decode($decryptedJson, true);
            } catch (Exception $e) {
                echo json_encode(['status' => false, 'message' => 'Decryption failed: ' . $e->getMessage()]);
                return;
            }
        } else {
            $data = !empty($requestData) ? $requestData : $_POST;
        }

        $hosuid = $data['hosuid'] ?? null;
        if (!$hosuid) {
            echo json_encode(['status' => false, 'message' => 'Hospital UID is required']);
            return;
        }

        $hospitalId = $this->HospitalProfileModel->get_hospital_id_by_hosuid($hosuid);
        if (!$hospitalId) {
            echo json_encode(['status' => false, 'message' => 'Hospital not found']);
            return;
        }

        $about_title = isset($data['about_title']) ? (string)$data['about_title'] : '';
        $about_description = isset($data['about_description']) ? (string)$data['about_description'] : '';
        $website_template = isset($data['website_template']) ? (string)$data['website_template'] : '';

        $aboutData = [
            'about_title' => $about_title,
            'about_description' => $about_description,
            'website_template' => $website_template,
            'status' => 1,
            'isdelete' => 0,
        ];

        if (array_key_exists('banners', $data)) {
            $bannersIn = $data['banners'] ?? [];
            if (is_string($bannersIn)) {
                $decoded = json_decode($bannersIn, true);
                $bannersIn = is_array($decoded) ? $decoded : [];
            }
            if (!is_array($bannersIn)) {
                $bannersIn = [];
            }

            $sanitizedBanners = [];
            $maxBanners = 20;
            foreach ($bannersIn as $banner) {
                if (!is_array($banner)) continue;
                $title = isset($banner['title']) ? trim((string)$banner['title']) : '';
                $subTitle = isset($banner['sub_title']) ? trim((string)$banner['sub_title']) : '';
                $image = isset($banner['image']) ? trim((string)$banner['image']) : '';
                $statusRaw = $banner['status'] ?? 1;
                $status = ($statusRaw === 1 || $statusRaw === '1' || $statusRaw === true || $statusRaw === 'active') ? 1 : 0;

                $sanitizedBanners[] = [
                    'title' => $title,
                    'sub_title' => $subTitle,
                    'banner_image' => $image,
                    'status' => $status,
                ];

                if (count($sanitizedBanners) >= $maxBanners) break;
            }

            $updated = $this->HospitalProfileModel->save_website_settings($hospitalId, $aboutData, $sanitizedBanners);
        } else {
            $updated = $this->HospitalProfileModel->upsert_website_about($hospitalId, $aboutData);
        }

        if ($updated) {
            echo json_encode(['status' => true, 'message' => 'Website settings updated successfully']);
        } else {
            echo json_encode(['status' => false, 'message' => 'Failed to update website settings']);
        }
    }

    public function upload_website_banner() {
        $hosuid = $this->input->post('hosuid');
        if (!$hosuid) {
            echo json_encode(['status' => false, 'message' => 'Hospital UID is required']);
            return;
        }

        $hospitalId = $this->HospitalProfileModel->get_hospital_id_by_hosuid($hosuid);
        if (!$hospitalId) {
            echo json_encode(['status' => false, 'message' => 'Hospital not found']);
            return;
        }

        if (empty($_FILES['banner_image']) || empty($_FILES['banner_image']['name'])) {
            echo json_encode(['status' => false, 'message' => 'No banner image provided']);
            return;
        }

        $uploadDir = FCPATH . 'assets/images/hospitals/' . $hospitalId . '/';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }

        $config = [
            'upload_path'   => $uploadDir,
            'allowed_types' => 'jpg|jpeg|png|gif|webp',
            'max_size'      => 5120,
            'encrypt_name'  => TRUE,
        ];
        $this->load->library('upload', $config);

        if (!$this->upload->do_upload('banner_image')) {
            echo json_encode([
                'status' => false,
                'message' => $this->upload->display_errors('', ''),
            ]);
            return;
        }

        $ud = $this->upload->data();
        $imageRelPath = 'assets/images/hospitals/' . $hospitalId . '/' . $ud['file_name'];

        $fullUrl = rtrim(base_url(), '/') . '/' . $imageRelPath;
        echo json_encode([
            'status' => true,
            'message' => 'Banner image uploaded successfully',
            'path' => $imageRelPath,
            'full_url' => $fullUrl,
        ]);
    }

    public function add_website_banner() {
        $hosuid = $this->input->post('hosuid');
        if (!$hosuid) {
            echo json_encode(['status' => false, 'message' => 'Hospital UID is required']);
            return;
        }

        $hospitalId = $this->HospitalProfileModel->get_hospital_id_by_hosuid($hosuid);
        if (!$hospitalId) {
            echo json_encode(['status' => false, 'message' => 'Hospital not found']);
            return;
        }

        $title = trim((string)$this->input->post('title'));
        $subTitle = trim((string)$this->input->post('sub_title'));
        $statusRaw = $this->input->post('status');
        $status = 1;
        if ($statusRaw !== null && $statusRaw !== '') {
            $status = ($statusRaw === 1 || $statusRaw === '1' || $statusRaw === true || $statusRaw === 'active') ? 1 : 0;
        }

        if (empty($_FILES['banner_image']) || empty($_FILES['banner_image']['name'])) {
            echo json_encode(['status' => false, 'message' => 'Banner image is required']);
            return;
        }

        $uploadDir = FCPATH . 'assets/images/hospitals/' . $hospitalId . '/';
        if (!is_dir($uploadDir)) {
            if (!@mkdir($uploadDir, 0755, true)) {
                echo json_encode(['status' => false, 'message' => 'Failed to create upload directory']);
                return;
            }
        }

        $config = [
            'upload_path'   => $uploadDir,
            'allowed_types' => 'jpg|jpeg|png|gif|webp',
            'max_size'      => 5120,
            'encrypt_name'  => TRUE,
        ];
        $this->load->library('upload', $config);

        if (!$this->upload->do_upload('banner_image')) {
            echo json_encode([
                'status' => false,
                'message' => $this->upload->display_errors('', ''),
            ]);
            return;
        }

        $ud = $this->upload->data();
        $imageRelPath = 'assets/images/hospitals/' . $hospitalId . '/' . $ud['file_name'];

        $bannerId = $this->HospitalProfileModel->add_website_banner($hospitalId, [
            'title' => $title,
            'sub_title' => $subTitle,
            'banner_image' => $imageRelPath,
            'status' => $status,
        ]);

        if (!$bannerId) {
            echo json_encode(['status' => false, 'message' => 'Failed to save banner']);
            return;
        }

        echo json_encode([
            'status' => true,
            'message' => 'Banner added successfully',
            'banner' => [
                'id' => $bannerId,
                'title' => $title,
                'sub_title' => $subTitle,
                'image' => $imageRelPath,
                'status' => $status,
                'full_url' => rtrim(base_url(), '/') . '/' . $imageRelPath,
            ],
        ]);
    }

    public function update_website_banner() {
        $hosuid = $this->input->post('hosuid');
        $bannerId = $this->input->post('banner_id');
        if (!$bannerId) {
            $bannerId = $this->input->post('id');
        }

        if (!$hosuid || !$bannerId) {
            echo json_encode(['status' => false, 'message' => 'Hospital UID and banner_id are required']);
            return;
        }

        $hospitalId = $this->HospitalProfileModel->get_hospital_id_by_hosuid($hosuid);
        if (!$hospitalId) {
            echo json_encode(['status' => false, 'message' => 'Hospital not found']);
            return;
        }

        $bannerRow = $this->db
            ->where('hospital_id', $hospitalId)
            ->where('isdelete', 0)
            ->where('id', (int)$bannerId)
            ->get('ms_hospitals_website_banners')
            ->row_array();

        if (!$bannerRow) {
            echo json_encode(['status' => false, 'message' => 'Banner not found']);
            return;
        }

        $titlePost = $this->input->post('title');
        $subTitlePost = $this->input->post('sub_title');
        $title = trim((string)$titlePost);
        $subTitle = trim((string)$subTitlePost);
        $statusRaw = $this->input->post('status');

        $updateData = [];
        if ($titlePost !== null) {
            if ($title === '') {
                echo json_encode(['status' => false, 'message' => 'Banner title is required']);
                return;
            }
            $updateData['title'] = $title;
        }
        if ($subTitlePost !== null) {
            $updateData['sub_title'] = $subTitle;
        }
        if ($statusRaw !== null && $statusRaw !== '') {
            $updateData['status'] = ($statusRaw === 1 || $statusRaw === '1' || $statusRaw === true || $statusRaw === 'active') ? 1 : 0;
        }

        $imageRelPath = $bannerRow['banner_image'] ?? '';

        if (!empty($_FILES['banner_image']) && !empty($_FILES['banner_image']['name'])) {
            $uploadDir = FCPATH . 'assets/images/hospitals/' . $hospitalId . '/';
            if (!is_dir($uploadDir)) {
                if (!@mkdir($uploadDir, 0755, true)) {
                    echo json_encode(['status' => false, 'message' => 'Failed to create upload directory']);
                    return;
                }
            }

            $config = [
                'upload_path'   => $uploadDir,
                'allowed_types' => 'jpg|jpeg|png|gif|webp',
                'max_size'      => 5120,
                'encrypt_name'  => TRUE,
            ];
            $this->load->library('upload', $config);

            if (!$this->upload->do_upload('banner_image')) {
                echo json_encode([
                    'status' => false,
                    'message' => $this->upload->display_errors('', ''),
                ]);
                return;
            }

            $ud = $this->upload->data();
            $imageRelPath = 'assets/images/hospitals/' . $hospitalId . '/' . $ud['file_name'];
            $updateData['banner_image'] = $imageRelPath;
        }

        if (empty($updateData)) {
            echo json_encode(['status' => false, 'message' => 'No fields to update']);
            return;
        }

        $ok = $this->HospitalProfileModel->update_website_banner($hospitalId, $bannerId, $updateData);
        if (!$ok) {
            echo json_encode(['status' => false, 'message' => 'Failed to update banner']);
            return;
        }

        $outTitle = array_key_exists('title', $updateData) ? $updateData['title'] : ($bannerRow['title'] ?? '');
        $outSubTitle = array_key_exists('sub_title', $updateData) ? $updateData['sub_title'] : ($bannerRow['sub_title'] ?? '');
        $outStatus = array_key_exists('status', $updateData) ? (int)$updateData['status'] : (int)($bannerRow['status'] ?? 1);

        echo json_encode([
            'status' => true,
            'message' => 'Banner updated successfully',
            'banner' => [
                'id' => (int)$bannerId,
                'title' => $outTitle,
                'sub_title' => $outSubTitle,
                'image' => $imageRelPath,
                'status' => $outStatus,
                'full_url' => rtrim(base_url(), '/') . '/' . $imageRelPath,
            ],
        ]);
    }

    public function update_website_template() {
        $raw = file_get_contents("php://input");
        $requestData = json_decode($raw, true);

        $data = [];
        if (isset($requestData['data'])) {
            try {
                $decryptedJson = $this->decrypt_aes_from_js($requestData['data'], $this->AES_KEY);
                $data = json_decode($decryptedJson, true);
            } catch (Exception $e) {
                echo json_encode(['status' => false, 'message' => 'Decryption failed: ' . $e->getMessage()]);
                return;
            }
        } else {
            $data = !empty($requestData) ? $requestData : $_POST;
        }

        $hosuid = $data['hosuid'] ?? null;
        $templateId = isset($data['template_id']) ? (int)$data['template_id'] : null;

        if (!$hosuid || !$templateId) {
            echo json_encode(['status' => false, 'message' => 'hosuid and template_id are required']);
            return;
        }
        if (!in_array($templateId, [1,2,3,4], true)) {
            echo json_encode(['status' => false, 'message' => 'Invalid template_id']);
            return;
        }

        $ok = $this->HospitalProfileModel->update_hospital_profile($hosuid, ['web_template' => $templateId]);
        if ($ok) {
            echo json_encode(['status' => true, 'message' => 'Website template updated successfully', 'data' => ['template_id' => $templateId]]);
        } else {
            echo json_encode(['status' => false, 'message' => 'Failed to update website template']);
        }
    }

    public function update_website_about() {
        $raw = file_get_contents("php://input");
        $requestData = json_decode($raw, true);

        $data = [];
        if (isset($requestData['data'])) {
            try {
                $decryptedJson = $this->decrypt_aes_from_js($requestData['data'], $this->AES_KEY);
                $data = json_decode($decryptedJson, true);
            } catch (Exception $e) {
                echo json_encode(['status' => false, 'message' => 'Decryption failed: ' . $e->getMessage()]);
                return;
            }
        } else {
            $data = !empty($requestData) ? $requestData : $_POST;
        }

        $hosuid = $data['hosuid'] ?? null;
        if (!$hosuid) {
            echo json_encode(['status' => false, 'message' => 'Hospital UID is required']);
            return;
        }

        $hospitalId = $this->HospitalProfileModel->get_hospital_id_by_hosuid($hosuid);
        if (!$hospitalId) {
            echo json_encode(['status' => false, 'message' => 'Hospital not found']);
            return;
        }

        $about_title = isset($data['about_title']) ? (string)$data['about_title'] : '';
        $about_description = isset($data['about_description']) ? (string)$data['about_description'] : '';

        $aboutImageRelPath = null;
        if (!empty($_FILES['about_image']) && !empty($_FILES['about_image']['name'])) {
            $subDir = 'abouts_image';
            $uploadDir = FCPATH . 'assets/images/hospitals/' . $hospitalId . '/' . $subDir . '/';
            if (!is_dir($uploadDir)) {
                if (!@mkdir($uploadDir, 0755, true)) {
                    echo json_encode(['status' => false, 'message' => 'Failed to create upload directory']);
                    return;
                }
            }

            $config = [
                'upload_path'   => $uploadDir,
                'allowed_types' => 'jpg|jpeg|png|gif|webp',
                'max_size'      => 5120,
                'encrypt_name'  => TRUE,
            ];
            $this->load->library('upload', $config);

            if (!$this->upload->do_upload('about_image')) {
                echo json_encode([
                    'status' => false,
                    'message' => $this->upload->display_errors('', ''),
                ]);
                return;
            }

            $ud = $this->upload->data();
            $aboutImageRelPath = 'assets/images/hospitals/' . $hospitalId . '/' . $subDir . '/' . $ud['file_name'];
        }

        $aboutData = [
            'about_title' => $about_title,
            'about_description' => $about_description,
            'status' => 1,
            'isdelete' => 0,
        ];
        if (!empty($aboutImageRelPath)) {
            $aboutData['about_image'] = $aboutImageRelPath;
        }

        $updated = $this->HospitalProfileModel->upsert_website_about($hospitalId, $aboutData);
        if ($updated) {
            $resp = ['status' => true, 'message' => 'About information updated successfully'];
            if (!empty($aboutImageRelPath)) {
                $resp['about_image'] = $aboutImageRelPath;
                $resp['full_url'] = rtrim(base_url(), '/') . '/' . $aboutImageRelPath;
            }
            echo json_encode($resp);
        } else {
            echo json_encode(['status' => false, 'message' => 'Failed to update about information']);
        }
    }
    public function change_website_banner_status() {
        $raw = file_get_contents("php://input");
        $requestData = json_decode($raw, true);

        $data = [];
        if (isset($requestData['data'])) {
            try {
                $decryptedJson = $this->decrypt_aes_from_js($requestData['data'], $this->AES_KEY);
                $data = json_decode($decryptedJson, true);
            } catch (Exception $e) {
                echo json_encode(['status' => false, 'message' => 'Decryption failed: ' . $e->getMessage()]);
                return;
            }
        } else {
            $data = !empty($requestData) ? $requestData : $_POST;
        }

        $hosuid = $data['hosuid'] ?? null;
        $bannerId = $data['banner_id'] ?? ($data['id'] ?? null);
        $statusRaw = $data['status'] ?? null;

        if (!$hosuid || !$bannerId || $statusRaw === null) {
            echo json_encode(['status' => false, 'message' => 'hosuid, banner_id and status are required']);
            return;
        }

        $hospitalId = $this->HospitalProfileModel->get_hospital_id_by_hosuid($hosuid);
        if (!$hospitalId) {
            echo json_encode(['status' => false, 'message' => 'Hospital not found']);
            return;
        }

        $status = ($statusRaw === 1 || $statusRaw === '1' || $statusRaw === true || $statusRaw === 'active') ? 1 : 0;
        $ok = $this->HospitalProfileModel->update_website_banner_status($hospitalId, $bannerId, $status);

        if ($ok && $this->db->affected_rows() > 0) {
            echo json_encode(['status' => true, 'message' => 'Banner status updated successfully', 'data' => ['banner_id' => $bannerId, 'status' => $status]]);
        } elseif ($ok) {
            echo json_encode(['status' => false, 'message' => 'Banner not found']);
        } else {
            echo json_encode(['status' => false, 'message' => 'Failed to update banner status']);
        }
    }

    /**
     * @OA\Post(
     *     path="/HospitalProfileController/change_password",
     *     tags={"Hospital Profile"},
     *     summary="Change hospital password",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="hosuid", type="string"),
     *             @OA\Property(property="currentPassword", type="string"),
     *             @OA\Property(property="newPassword", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function change_password() {
        $hosuid = $this->input->post('hosuid');
        $currentPassword = $this->input->post('currentPassword');
        $newPassword = $this->input->post('newPassword');

        if (!$hosuid || !$currentPassword || !$newPassword) {
            echo json_encode(['status' => false, 'message' => 'All fields are required']);
            return;
        }

        // Verify current password
        if ($this->HospitalProfileModel->verify_password($hosuid, $currentPassword)) {
            // Update to new password
            if ($this->HospitalProfileModel->update_password($hosuid, $newPassword)) {
                echo json_encode(['status' => true, 'message' => 'Password updated successfully']);
            } else {
                echo json_encode(['status' => false, 'message' => 'Failed to update password']);
            }
        } else {
            echo json_encode(['status' => false, 'message' => 'Current password is incorrect']);
        }
    }
}
