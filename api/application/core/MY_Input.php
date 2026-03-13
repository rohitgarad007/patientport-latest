<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class MY_Input extends CI_Input
{
    public function get_request_header($index, $xss_clean = NULL)
    {
        $normalizeAuthorization = function ($val) use ($index) {
            if (strcasecmp((string) $index, 'Authorization') !== 0) {
                return $val;
            }
            $val = trim((string) $val);
            if ($val === '') {
                return $val;
            }
            if (stripos($val, 'Bearer ') === 0) {
                return $val;
            }
            if (strpos($val, ' ') === false && substr_count($val, '.') === 2) {
                return 'Bearer ' . $val;
            }
            return $val;
        };

        $value = parent::get_request_header($index, $xss_clean);
        if (!empty($value)) {
            return $normalizeAuthorization($value);
        }

        $key = strtoupper(str_replace('-', '_', (string) $index));

        $serverCandidates = [
            'HTTP_' . $key,
            $key,
            'REDIRECT_HTTP_' . $key,
            'REDIRECT_' . $key
        ];

        foreach ($serverCandidates as $candidate) {
            if (!empty($_SERVER[$candidate])) {
                return $normalizeAuthorization($_SERVER[$candidate]);
            }
        }

        if (strcasecmp((string) $index, 'Authorization') === 0) {
            $altServerKeys = [
                'HTTP_X_AUTHORIZATION',
                'HTTP_X_AUTH_TOKEN',
                'HTTP_X_ACCESS_TOKEN',
                'REDIRECT_HTTP_X_AUTHORIZATION',
                'REDIRECT_HTTP_X_AUTH_TOKEN',
                'REDIRECT_HTTP_X_ACCESS_TOKEN',
            ];

            foreach ($altServerKeys as $candidate) {
                if (!empty($_SERVER[$candidate])) {
                    return $normalizeAuthorization($_SERVER[$candidate]);
                }
            }
        }

        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (is_array($headers)) {
                foreach ($headers as $hKey => $hValue) {
                    if (strcasecmp((string) $hKey, (string) $index) === 0 && !empty($hValue)) {
                        return $normalizeAuthorization($hValue);
                    }
                }
            }
        }

        return $normalizeAuthorization($value);
    }
}
