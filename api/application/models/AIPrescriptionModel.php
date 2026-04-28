<?php
class AIPrescriptionModel extends CI_Model {

    public function getList($search, $limit, $offset) {
        $this->db->select("*");
        $this->db->where("isdelete", 0);

        if (!empty($search)) {
            $this->db->like("name", $search);
        }

        $this->db->limit($limit, $offset);
        $this->db->order_by("id", "DESC");

        return ["data" => $this->db->get("ms_ai_prescription")->result()];
    }

    public function getCount($search) {
        $this->db->where("isdelete", 0);

        if (!empty($search)) {
            $this->db->like("name", $search);
        }

        return ["total" => $this->db->count_all_results("ms_ai_prescription")];
    }

    public function insert($data) {
        $this->db->insert("ms_ai_prescription", $data);
        return $this->db->insert_id();
    }

    public function update($apuid, $data) {
        $this->db->where("apuid", $apuid);
        return $this->db->update("ms_ai_prescription", $data);
    }

    public function setDefault($apuid) {
        // remove previous default
        $this->db->update("ms_ai_prescription", ["is_default" => 0]);

        // set new default
        $this->db->where("apuid", $apuid);
        return $this->db->update("ms_ai_prescription", ["is_default" => 1]);
    }
}