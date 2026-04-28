<?php
class AIManageModel extends CI_Model {

    // 🔹 List
    public function getAIList($search, $limit, $offset) {

        // 🔹 Select only required columns
        $this->db->select("
            aiuid,
            name,
            api_key as apiKey,
            model,
            description,
            status,
            created_at
        ");

        if (!empty($search)) {
            $this->db->group_start();
            $this->db->like('name', $search);
            $this->db->or_like('model', $search);
            $this->db->group_end();
        }

        $this->db->where('isdelete', 0);
        $this->db->order_by('id', 'DESC');
        $this->db->limit($limit, $offset);

        $query = $this->db->get('ms_ai_manage');

        return [
            "data" => $query->result_array() // ✅ better for JSON
        ];
    }

    // 🔹 Count
    public function getAICount($search) {
        if (!empty($search)) {
            $this->db->like('name', $search);
        }

        $this->db->where('isdelete', 0);
        return ["total" => $this->db->count_all_results('ms_ai_manage')];
    }

    // 🔹 Insert
    public function insertAI($data) {
        $this->db->insert('ms_ai_manage', $data);
        return $this->db->insert_id();
    }

    // 🔹 Update
    public function updateAI($aiuid, $data) {
        $this->db->where('aiuid', $aiuid);
        return $this->db->update('ms_ai_manage', $data);
    }

    // 🔹 Status Update
    public function updateAIStatus($aiuid, $status) {
        $this->db->where('aiuid', $aiuid);
        return $this->db->update('ms_ai_manage', ['status' => $status]);
    }
}