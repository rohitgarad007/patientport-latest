<?php

class AdmAuthAdmModel extends CI_Model{

    

    /* ===== Common Use CRUD Code Start Here ===== */
        /*public function get_logUserInfo($sluid){
            $this->db->close(); $this->db->initialize(); 
            $this->db->select("ui.id, ui.name, ui.user_id, ui.availableBalance, ui.role, ui.secret_key, ui.ref_id, ui.status, ui.commission_rate");
            $this->db->from("users as ui");
            $this->db->where("ui.uid", $sluid);
            $query = $this->db->get();
            return $query->row_array();
        }*/

        public function verify_otp($loguid, $role, $otp) {
        $table = '';
        $uidField = '';
        
        switch ($role) {
            case 'doctor':
                $table = 'ms_doctors';
                $uidField = 'docuid';
                break;
            case 'staff':
                $table = 'ms_staff';
                $uidField = 'staff_uid';
                break;
            default:
                return ['success' => false, 'message' => 'Invalid role'];
        }

        $this->db->select("id, $uidField AS loguid, name, email, phone, role, status, current_otp, otp_expires_at");
        $this->db->from($table);
        $this->db->where($uidField, $loguid);
        $query = $this->db->get();

        if ($query->num_rows() !== 1) {
            return ['success' => false, 'message' => 'User not found'];
        }

        $user = $query->row_array();

        if ($user['current_otp'] != $otp) {
            return ['success' => false, 'message' => 'Invalid OTP'];
        }

        if (strtotime($user['otp_expires_at']) < time()) {
            return ['success' => false, 'message' => 'OTP Expired'];
        }

        // OTP Valid - Clear OTP
        // $this->db->where($uidField, $loguid);
        // $this->db->update($table, ['current_otp' => null, 'otp_expires_at' => null]);

        // Return user info for token generation
        unset($user['current_otp']);
        unset($user['otp_expires_at']);
        
        // Ensure role is set
        if (!isset($user['role'])) {
            $user['role'] = $role;
        }

        return ['success' => true, 'user' => $user];
    }


        public function  get_AdmlogUserInfo($muid){
            $this->db->close(); $this->db->initialize(); 
            $this->db->select("mi.muid, mi.mid, mi.name, mi.admin_id, mi.avaliable_balance, mi.secret_key, mi.comission_rate");
            $this->db->from("admin_info_login as mi");
            $this->db->where("mi.muid", $muid);
            $query = $this->db->get();
            return $query->row_array();
        }


        public function check_login($username, $plainPassword, $role){
       
            $allowedRoles = ['agent', 'stockiest', 'distributor'];
            if (!in_array($role, $allowedRoles, true)) {
                return ['not_found' => true]; // Role not allowed, treat as not found
            }

            // ✅ Secure query using CI query builder (prevents SQL injection)
            $this->db->select("id, uid, email, mobile, name, profile_picture, role, wstatus, password, commission_rate, availableBalance");
            $this->db->from('users');
            $this->db->where('user_id', $username);
            $this->db->where('role', $role); // ensure role matches
            $query = $this->db->get();

            if ($query->num_rows() !== 1) {
                // User not found -> No attempts tracking (avoid revealing existence)
                return ['not_found' => true];
            }

            $user = $query->row_array();

            // ✅ Check if account is already blocked
            if ($user['wstatus'] != '1') {
                return ['blocked' => true, 'user' => $user];
            }

            // Track login attempts
            $today = date('Y-m-d');
            $attempt = $this->db->get_where('login_attempts', [
                'user_id' => $user['id'],
                'attempt_date' => $today
            ])->row_array();

            $currentCount = $attempt ? (int)$attempt['attempt_count'] : 0;

            // ✅ If already hit limit, block account
            if ($currentCount >= 5) {
                $this->db->where('id', $user['id'])->update('users', ['wstatus' => 0]);
                return ['blocked' => true, 'user' => $user];
            }

            // ✅ Verify password securely
            if ($plainPassword === $user['password']) {
                // ✅ Reset today's failed attempts on success
                $this->db->where(['user_id' => $user['id'], 'attempt_date' => $today])
                         ->delete('login_attempts');

                // ✅ Remove sensitive data
                unset($user['password']);
                return $user;
            }

            // ✅ Increment failed attempts
            if ($attempt) {
                $currentCount++;
                $this->db->where('id', $attempt['id'])
                         ->update('login_attempts', ['attempt_count' => $currentCount]);
            } else {
                $currentCount = 1;
                $this->db->insert('login_attempts', [
                    'user_id' => $user['id'],
                    'attempt_date' => $today,
                    'attempt_count' => 1
                ]);
            }

            // ✅ If reached 5th wrong attempt, block immediately
            if ($currentCount >= 5) {
                $this->db->where('id', $user['id'])->update('users', ['wstatus' => 0]);
                return ['blocked' => true, 'user' => $user];
            }

            // ✅ Calculate remaining attempts
            $remaining = max(0, 5 - $currentCount);

            return [
                'failed' => true,
                'remaining_attempts' => $remaining
            ];
        }*/

        public function check_adminLogin($username, $plainPassword){
       
           

            $this->db->select("id, muid, name, admin_id, email, password, role, wstatus");
            $this->db->from('ms_admin_info');
            $this->db->where('email', $username);
            $query = $this->db->get();

            if ($query->num_rows() !== 1) {
                return ['not_found' => true];
            }

            $user = $query->row_array();

            // ✅ Check if account is already blocked
            if ($user['wstatus'] != '1') {
                return ['blocked' => true, 'user' => $user];
            }


            // Track login attempts
            $today = date('Y-m-d');
            $attempt = $this->db->get_where('ms_admin_attempts', [
                'admin_id' => $user['id'],
                'attempt_date' => $today
            ])->row_array();

            $currentCount = $attempt ? (int)$attempt['attempt_count'] : 0;

            // ✅ If already hit limit, block account
            if ($currentCount >= 5) {
                $this->db->where('id', $user['id'])->update('ms_admin_info', ['wstatus' => 0]);
                return ['blocked' => true, 'user' => $user];
            }

            // ✅ Verify password securely
            if ($plainPassword === $user['password']) {
                // ✅ Reset today's failed attempts on success
                $this->db->where(['admin_id' => $user['id'], 'attempt_date' => $today])
                         ->delete('ms_admin_attempts');

                // ✅ Remove sensitive data
                unset($user['password']);
                return $user;
            }

            // ✅ Increment failed attempts
            if ($attempt) {
                $currentCount++;
                $this->db->where('id', $attempt['id'])
                         ->update('ms_admin_attempts', ['attempt_count' => $currentCount]);
            } else {
                $currentCount = 1;
                $this->db->insert('ms_admin_attempts', [
                    'admin_id' => $user['id'],
                    'attempt_date' => $today,
                    'attempt_count' => 1
                ]);
            }

            // ✅ If reached 5th wrong attempt, block immediately
            if ($currentCount >= 5) {
                $this->db->where('id', $user['id'])->update('ms_admin_info', ['wstatus' => 0]);
                return ['blocked' => true, 'user' => $user];
            }

            // ✅ Calculate remaining attempts
            $remaining = max(0, 5 - $currentCount);

            return [
                'failed' => true,
                'remaining_attempts' => $remaining
            ];
        }


     /* ===== Common Use CRUD Code End Here ===== */

    public function check_userLogin($username, $plainPassword, $role) {
        $table = '';
        $uidField = '';
        $statusField = 'status';
        $attemptColumn = 'userUid';

        switch ($role) {
            case 'hospital_admin':
                $table = 'ms_hospitals';
                $uidField = 'hosuid';
                break;
            case 'doctor':
                $table = 'ms_doctors';
                $uidField = 'docuid';
                break;
            case 'staff':
                $table = 'ms_staff';
                $uidField = 'staff_uid';
                break;
            default:
                return ['not_found' => true];
        }

        // ✅ Standardized SELECT
        //$this->db->select("$uidField AS loguid, id, name, email, password, phone, $statusField AS status");

         if ($role === 'hospital_admin') {
           
            $this->db->select("
                $uidField AS loguid, 
                id, 
                name, 
                email, 
                password, 
                phone, 
                $statusField AS status,
                doctorsCount,
                staffCount,
                patientCount
            ");
        } elseif ($role === 'staff') {
             $this->db->select("$uidField AS loguid, id, name, email, password, phone, $statusField AS status, role, two_factor_auth");
        } elseif ($role === 'doctor') {
             $this->db->select("$uidField AS loguid, id, name, email, password, phone, $statusField AS status, two_factor_auth");
        } else {
            $this->db->select("$uidField AS loguid, id, name, email, password, phone, $statusField AS status");
        }

        $this->db->from($table);
        $this->db->where('email', $username);
        $query = $this->db->get();

        if ($query->num_rows() !== 1) {
            return ['not_found' => true];
        }

        $user = $query->row_array();

        // Add role statically if not present
        if (!isset($user['role'])) {
            $user['role'] = $role;
        }

        // 2️⃣ Check if account is active
        if ($user['status'] != 1) {
            return ['blocked' => true, 'user' => $user];
        }

        // 3️⃣ Track login attempts
        $today = date('Y-m-d');
        $attempt = $this->db->get_where('ms_user_attempts', [
            $attemptColumn => $user['loguid'],
            'attempt_date' => $today
        ])->row_array();

        $currentCount = $attempt ? (int)$attempt['attempt_count'] : 0;

        if ($currentCount >= 5) {
            $this->db->where('id', $user['id'])->update($table, [$statusField => 0]);
            return ['blocked' => true, 'user' => $user];
        }

        // 4️⃣ Verify password
        if ($plainPassword === $user['password']) {
            if ($attempt) {
                $this->db->where(['id' => $attempt['id']])->delete('ms_user_attempts');
            }
            unset($user['password']);
            return $user;
        }

        // 5️⃣ Increment failed attempts
        if ($attempt) {
            $currentCount++;
            $this->db->where('id', $attempt['id'])->update('ms_user_attempts', ['attempt_count' => $currentCount]);
        } else {
            $currentCount = 1;
            $this->db->insert('ms_user_attempts', [
                $attemptColumn => $user['loguid'],
                'attempt_date' => $today,
                'attempt_count' => 1
            ]);
        }

        if ($currentCount >= 5) {
            $this->db->where('id', $user['id'])->update($table, [$statusField => 0]);
            return ['blocked' => true, 'user' => $user];
        }

        $remaining = max(0, 5 - $currentCount);

        return [
            'failed' => true,
            'remaining_attempts' => $remaining
        ];
    }



    






}