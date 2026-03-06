<?php

class HospitalDashboardModel extends CI_Model
{
    private function getHospitalIdByHosuid($hosuid)
    {
        $row = $this->db
            ->select('id')
            ->from('ms_hospitals')
            ->where('hosuid', $hosuid)
            ->limit(1)
            ->get()
            ->row_array();

        return $row ? (int)$row['id'] : 0;
    }

    public function getStats($hosuid)
    {
        $hospitalId = $this->getHospitalIdByHosuid($hosuid);
        $today = date('Y-m-d');

        $totalDoctors = (int)$this->db
            ->select('COUNT(*) AS cnt')
            ->from('ms_doctors')
            ->where('hosuid', $hosuid)
            ->where('isdelete', 0)
            ->get()
            ->row()
            ->cnt;

        $activeDoctors = (int)$this->db
            ->select('COUNT(*) AS cnt')
            ->from('ms_doctors')
            ->where('hosuid', $hosuid)
            ->where('isdelete', 0)
            ->where('status', 1)
            ->get()
            ->row()
            ->cnt;

        $totalStaff = (int)$this->db
            ->select('COUNT(*) AS cnt')
            ->from('ms_staff')
            ->where('hosuid', $hosuid)
            ->where('isdelete', 0)
            ->get()
            ->row()
            ->cnt;

        $staffOnDuty = (int)$this->db
            ->select('COUNT(*) AS cnt')
            ->from('ms_staff')
            ->where('hosuid', $hosuid)
            ->where('isdelete', 0)
            ->where('status', 1)
            ->get()
            ->row()
            ->cnt;

        $totalPatients = (int)$this->db
            ->select('COUNT(*) AS cnt')
            ->from('ms_patient')
            ->where('hosuid', $hosuid)
            ->where('isdelete', 0)
            ->get()
            ->row()
            ->cnt;

        $appointmentsToday = 0;
        $appointmentsRemaining = 0;
        if ($hospitalId > 0) {
            $appointmentsToday = (int)$this->db
                ->select('COUNT(*) AS cnt')
                ->from('ms_patient_appointment')
                ->where('hospital_id', $hospitalId)
                ->where('date', $today)
                ->where('(status <> "cancelled" OR status IS NULL)', null, false)
                ->get()
                ->row()
                ->cnt;

            $appointmentsRemaining = (int)$this->db
                ->select('COUNT(*) AS cnt')
                ->from('ms_patient_appointment')
                ->where('hospital_id', $hospitalId)
                ->where('date', $today)
                ->where('(status <> "cancelled" OR status IS NULL)', null, false)
                ->where('(status <> "completed" OR status IS NULL)', null, false)
                ->get()
                ->row()
                ->cnt;
        }

        $totalBeds = 0;
        $freeBeds = 0;
        if ($hospitalId > 0) {
            $totalBeds = (int)$this->db
                ->select('COUNT(*) AS cnt')
                ->from('ms_hospitals_rooms_bed')
                ->where('hospital_id', $hospitalId)
                ->where('isdelete', 0)
                ->get()
                ->row()
                ->cnt;

            $freeBeds = (int)$this->db
                ->select('COUNT(*) AS cnt')
                ->from('ms_hospitals_rooms_bed')
                ->where('hospital_id', $hospitalId)
                ->where('isdelete', 0)
                ->where('status', 1)
                ->get()
                ->row()
                ->cnt;
        }

        $occupancyPercent = 0;
        if ($totalBeds > 0) {
            $occupancyPercent = (int)round((($totalBeds - $freeBeds) / $totalBeds) * 100);
        }

        return [
            'totalDoctors' => $totalDoctors,
            'activeDoctors' => $activeDoctors,
            'totalStaff' => $totalStaff,
            'staffOnDuty' => $staffOnDuty,
            'totalPatients' => $totalPatients,
            'appointmentsToday' => $appointmentsToday,
            'appointmentsRemaining' => $appointmentsRemaining,
            'totalBeds' => $totalBeds,
            'freeBeds' => $freeBeds,
            'bedOccupancyPercent' => $occupancyPercent,
        ];
    }

    public function getLists($hosuid)
    {
        $today = date('Y-m-d');
        $todayEsc = $this->db->escape($today);

        $this->db
            ->select('md.id, md.name, md.status')
            ->select('COALESCE(ds.specialization_name, "") AS specialization', false)
            ->select('(SELECT COUNT(*) FROM ms_patient_appointment a WHERE a.doctor_id = md.id AND a.date = ' . $todayEsc . ' AND (a.status <> "cancelled" OR a.status IS NULL)) AS patientCountToday', false)
            ->from('ms_doctors md')
            ->join('ms_doctor_specializations ds', 'ds.id = md.specialization_id', 'left')
            ->where('md.hosuid', $hosuid)
            ->where('md.isdelete', 0)
            ->order_by('md.status', 'DESC')
            ->order_by('md.name', 'ASC')
            ->limit(4);
        $doctors = $this->db->get()->result_array();

        $this->db
            ->select('ms.id, ms.name, ms.role, ms.department, ms.status')
            ->from('ms_staff ms')
            ->where('ms.hosuid', $hosuid)
            ->where('ms.isdelete', 0)
            ->order_by('ms.status', 'DESC')
            ->order_by('ms.id', 'DESC')
            ->limit(4);
        $staff = $this->db->get()->result_array();

        $this->db
            ->select('p.id, p.fname, p.lname, p.status')
            ->from('ms_patient p')
            ->where('p.hosuid', $hosuid)
            ->where('p.isdelete', 0)
            ->order_by('p.id', 'DESC')
            ->limit(4);
        $patientRows = $this->db->get()->result_array();
        $patients = array_map(function ($p) {
            $name = trim(($p['fname'] ?? '') . ' ' . ($p['lname'] ?? ''));
            return [
                'id' => (int)($p['id'] ?? 0),
                'name' => $name !== '' ? $name : 'Patient',
                'status' => $p['status'] ?? '',
            ];
        }, $patientRows);

        return [
            'doctors' => array_map(function ($d) {
                return [
                    'id' => (int)($d['id'] ?? 0),
                    'name' => (string)($d['name'] ?? ''),
                    'specialization' => (string)($d['specialization'] ?? ''),
                    'status' => $d['status'] ?? '',
                    'patientCountToday' => isset($d['patientCountToday']) ? (int)$d['patientCountToday'] : 0,
                ];
            }, $doctors),
            'staff' => array_map(function ($s) {
                return [
                    'id' => (int)($s['id'] ?? 0),
                    'name' => (string)($s['name'] ?? ''),
                    'role' => (string)($s['role'] ?? ''),
                    'department' => (string)($s['department'] ?? ''),
                    'status' => $s['status'] ?? '',
                ];
            }, $staff),
            'patients' => $patients,
        ];
    }

    public function getAppointments($hosuid)
    {
        $hospitalId = $this->getHospitalIdByHosuid($hosuid);
        if ($hospitalId <= 0) return [];

        $today = date('Y-m-d');

        $rows = $this->db
            ->select('a.id, a.patient_name, a.start_time, a.status, d.name AS doctor_name')
            ->from('ms_patient_appointment a')
            ->join('ms_doctors d', 'd.id = a.doctor_id', 'left')
            ->where('a.hospital_id', $hospitalId)
            ->where('a.date', $today)
            ->where('(a.status <> "cancelled" OR a.status IS NULL)', null, false)
            ->order_by('a.start_time', 'ASC')
            ->limit(6)
            ->get()
            ->result_array();

        return array_map(function ($r) {
            $statusRaw = strtolower(trim($r['status'] ?? 'scheduled'));
            if ($statusRaw === 'in-consultation') $statusRaw = 'in progress';
            if ($statusRaw === 'booked') $statusRaw = 'scheduled';
            if ($statusRaw === 'active') $statusRaw = 'in progress';
            $status = ucwords($statusRaw);

            $patient = trim((string)($r['patient_name'] ?? ''));
            $doctor = trim((string)($r['doctor_name'] ?? ''));
            $time = (string)($r['start_time'] ?? '');

            return [
                'id' => (int)($r['id'] ?? 0),
                'patient' => $patient !== '' ? $patient : 'Patient',
                'doctor' => $doctor !== '' ? $doctor : 'Doctor',
                'time' => $time !== '' ? $time : '--:--',
                'type' => 'Consultation',
                'status' => $status,
            ];
        }, $rows);
    }

    public function getBottom($hosuid)
    {
        $stats = $this->getStats($hosuid);

        $bed = [
            'totalBeds' => (int)($stats['totalBeds'] ?? 0),
            'freeBeds' => (int)($stats['freeBeds'] ?? 0),
            'occupancyPercent' => (int)($stats['bedOccupancyPercent'] ?? 0),
        ];

        // Fetch shift times from ms_hospitals_shift_time (same source as hs-shift-time-list)
        $shiftRows = $this->db
            ->select('id, shift_name, start_time, end_time, status')
            ->from('ms_hospitals_shift_time')
            ->where('hosuid', $hosuid)
            ->where('isdelete', 0)
            ->order_by('start_time', 'ASC')
            ->get()
            ->result_array();

        $shifts = array_map(function ($s) use ($hosuid) {
            $startTime = '';
            $endTime = '';
            if (!empty($s['start_time'])) {
                $startTime = date('g:i A', strtotime($s['start_time']));
            }
            if (!empty($s['end_time'])) {
                $endTime = date('g:i A', strtotime($s['end_time']));
            }
            $timeStr = ($startTime && $endTime) ? ($startTime . ' - ' . $endTime) : '';

            // Count currently active staff assigned to this shift
            $rowCnt = $this->db
                ->select('COUNT(*) AS cnt')
                ->from('ms_staff')
                ->where('hosuid', $hosuid)
                ->where('isdelete', 0)
                ->where('status', 1)
                ->where('shift', $s['shift_name'])
                ->get()
                ->row_array();
            $cnt = isset($rowCnt['cnt']) ? (int)$rowCnt['cnt'] : 0;

            return [
                'name' => $s['shift_name'] ?? 'Shift',
                'time' => $timeStr,
                'staff' => $cnt > 0 ? ($cnt . ' staff assigned') : '',
            ];
        }, $shiftRows);

        $departments = $this->db
            ->select('ds.specialization_name AS name, COUNT(md.id) AS doctorCount', false)
            ->from('ms_doctors md')
            ->join('ms_doctor_specializations ds', 'ds.id = md.specialization_id', 'left')
            ->where('md.hosuid', $hosuid)
            ->where('md.isdelete', 0)
            ->group_by('ds.specialization_name')
            ->order_by('doctorCount', 'DESC')
            ->limit(4)
            ->get()
            ->result_array();

        $departmentItems = array_map(function ($d) {
            $name = (string)($d['name'] ?? 'Department');
            $doctorCount = (int)($d['doctorCount'] ?? 0);
            return [
                'name' => $name,
                'info' => $doctorCount . ' doctors',
            ];
        }, $departments);

        return [
            'bed' => $bed,
            'shifts' => $shifts,
            'departments' => $departmentItems,
            'amenities' => [
                ['name' => 'Free Wi-Fi', 'status' => 'Active'],
                ['name' => 'Parking', 'status' => 'Available'],
                ['name' => 'Cafeteria', 'status' => 'Open'],
                ['name' => 'Power Backup', 'status' => 'Standby'],
                ['name' => 'Security', 'status' => 'Active'],
                ['name' => 'Blood Bank', 'status' => 'Stocked'],
            ],
        ];
    }

}
