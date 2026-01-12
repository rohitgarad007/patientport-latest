 <?php
defined('BASEPATH') OR exit('No direct script access allowed');

class AdmAdminAuthCtr extends CI_Controller {


    public function __construct(){
        parent::__construct();
        error_reporting(0);
        $this->load->model('AdmAuthAdmModel');
        $this->load->helper('verifyauthtoken_helper');
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
    }
    
    
    
    public function userLogin() {
        $jwt = new JWT();
        $JwtSecretKey = "myloginSecret";
        $AES_KEY = "RohitGaradHos@173414"; // Match React AES key

        $rawData = json_decode(file_get_contents("php://input"), true);

        if (!$rawData || !isset($rawData['username']) || !isset($rawData['password']) || !isset($rawData['role'])) {
            echo json_encode([
                "status" => 400,
                "message" => "Invalid or missing input.",
                "success" => false
            ]);
            return;
        }

        $username = $this->decrypt_aes_from_js($rawData['username'], $AES_KEY);
        $plainPassword = md5($this->decrypt_aes_from_js($rawData['password'], $AES_KEY));
        $role = $rawData['role'];

        // Check login credentials based on role
        $result = $this->AdmAuthAdmModel->check_userLogin($username, $plainPassword, $role);

        

        // Case 1: User not found
        if (isset($result['not_found']) && $result['not_found'] === true) {
            echo json_encode([
                "status" => 401,
                "message" => "Invalid username or password",
                "success" => false
            ]);
            return;
        }

        // Case 2: User blocked
        if (isset($result['blocked']) && $result['blocked'] === true) {
            echo json_encode([
                "status" => 403,
                "message" => "Your account is blocked due to too many failed login attempts.",
                "success" => false
            ]);
            return;
        }

        // Case 3: Failed attempt but still allowed
        if (isset($result['failed']) && $result['failed'] === true) {
            echo json_encode([
                "status" => 401,
                "message" => "Invalid username or password",
                "remaining_attempts" => $result['remaining_attempts'],
                "success" => false
            ]);
            return;
        }

        // Case 4: Success -> issue token
        $token = $jwt->encode($result, $JwtSecretKey, 'HS256');

        echo json_encode([
            "status" => 200,
            "message" => "Logged In Successfully",
            "success" => true,
            "token" => $token,
            "userInfo" => $result
        ]);
    }

    public function adminLogin() {
        $jwt = new JWT();
        $JwtSecretKey = "myloginSecret";
        $AES_KEY = "RohitGaradHos@173414"; // Match React key
    
        $rawData = json_decode(file_get_contents("php://input"), true);
    
        if (!$rawData || !isset($rawData['username']) || !isset($rawData['password'])) {
            echo json_encode([
                "status" => 400,
                "message" => "Invalid or missing input.",
                "success" => false
            ]);
            return;
        }
    
        $username = $this->decrypt_aes_from_js($rawData['username'], $AES_KEY);
        $plainPassword = md5($this->decrypt_aes_from_js($rawData['password'], $AES_KEY));

        // Check login credentials
        $result = $this->AdmAuthAdmModel->check_adminLogin($username, $plainPassword);
    
        // Case 1: User not found (don't reveal existence)
        if (isset($result['not_found']) && $result['not_found'] === true) {
            echo json_encode([
                "status" => 401,
                "message" => "Invalid username or password",
                "success" => false
            ]);
            return;
        }

        // Case 2: User blocked
        if (isset($result['blocked']) && $result['blocked'] === true) {
            echo json_encode([
                "status" => 403,
                "message" => "Your account is blocked due to too many failed login attempts.",
                "success" => false
            ]);
            return;
        }

        // Case 3: Failed attempt but still allowed
        if (isset($result['failed']) && $result['failed'] === true) {
            echo json_encode([
                "status" => 401,
                "message" => "Invalid username or password",
                "remaining_attempts" => $result['remaining_attempts'],
                "success" => false
            ]);
            return;
        }

        // Case 4: Success -> issue token
        $token = $jwt->encode($result, $JwtSecretKey, 'HS256');

        echo json_encode([
            "status" => 200,
            "message" => "Logged In Successfully",
            "success" => true,
            "token" => $token,
            "adminInfo" => $result
        ]);
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


}
