<?php 

if(!function_exists('verifyAuthToken')){
    function verifyAuthToken($token){
        if (empty($token)) {
            return false;
        }
        $jwt = new JWT();
        $jwtSecret = 'myloginSecret';
        try {
            $verification = $jwt->decode($token, $jwtSecret, 'HS256');
            $verification_json = $jwt->jsonEncode($verification);
            return $verification_json;
        } catch (Exception $e) {
            return false;
        }
    }
}