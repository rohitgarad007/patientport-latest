<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class LabPaymentModel extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function add_payment($data) {
        // $data contains: lab_id, order_id, amount, payment_method, transaction_ref, notes, created_by
        
        $this->db->trans_start();
        
        // 1. Insert into lb_lab_order_payments
        $this->db->insert('lb_lab_order_payments', $data);
        $payment_id = $this->db->insert_id();

        // 2. Update lb_lab_orders (paid_amount, payment_status)
        // First get current paid amount and total amount
        $this->db->select('paid_amount, total_amount');
        $this->db->where('id', $data['order_id']);
        $this->db->where('lab_id', $data['lab_id']);
        $order = $this->db->get('lb_lab_orders')->row();

        if ($order) {
            $new_paid_amount = $order->paid_amount + $data['amount'];
            
            // Determine status
            $status = 'Pending';
            if ($new_paid_amount >= $order->total_amount && $order->total_amount > 0) {
                $status = 'Paid';
            } elseif ($new_paid_amount > 0) {
                $status = 'Partial';
            }

            $this->db->where('id', $data['order_id']);
            $this->db->update('lb_lab_orders', [
                'paid_amount' => $new_paid_amount,
                'payment_status' => $status,
                'updated_at' => date('Y-m-d H:i:s')
            ]);
        }

        $this->db->trans_complete();

        if ($this->db->trans_status() === FALSE) {
            return false;
        }
        return $payment_id;
    }

    public function get_order_payments($order_id, $lab_id) {
        $this->db->select('*');
        $this->db->from('lb_lab_order_payments');
        $this->db->where('order_id', $order_id);
        $this->db->where('lab_id', $lab_id);
        $this->db->order_by('payment_date', 'DESC');
        return $this->db->get()->result_array();
    }

    // Update total amount of an order (e.g. if tests change or discount applied)
    public function update_order_total($order_id, $lab_id, $total_amount) {
        $this->db->where('id', $order_id);
        $this->db->where('lab_id', $lab_id);
        return $this->db->update('lb_lab_orders', ['total_amount' => $total_amount]);
    }

    public function get_billing_invoices($lab_id, $limit = 100, $offset = 0, $search = '', $status = 'all') {
        $this->db->select('o.id, o.order_number as invoiceNumber, o.order_number as orderId, 
            CONCAT(mp.fname, " ", mp.lname) as patientName,
            o.total_amount as total, o.paid_amount as paidAmount,
            o.payment_status as status, o.created_at as createdAt,
            0 as discount, 0 as tax, 0 as subtotal,
            o.treatment_id');
        $this->db->from('lb_lab_orders o');
        $this->db->join('ms_patient_treatment_info mt', 'mt.id = o.treatment_id', 'left');
        $this->db->join('ms_patient mp', 'mp.id = mt.patient_id', 'left');
        $this->db->where('o.lab_id', $lab_id);
        
        if ($status !== 'all') {
            $this->db->where('o.payment_status', $status);
        }

        if (!empty($search)) {
            $this->db->group_start();
            $this->db->like('o.order_number', $search);
            $this->db->or_like('mp.fname', $search);
            $this->db->or_like('mp.lname', $search);
            $this->db->group_end();
        }

        $this->db->order_by('o.created_at', 'DESC');
        $this->db->limit($limit, $offset);
        
        $orders = $this->db->get()->result_array();

        // Populate items and payments for each order and calculate amounts
        foreach ($orders as &$order) {
            $order['status'] = ucfirst($order['status']);

            // Ensure invoiceNumber and orderId are never empty
            if (empty($order['invoiceNumber'])) {
                $order['invoiceNumber'] = 'INV-' . str_pad($order['id'], 6, '0', STR_PAD_LEFT);
            }
            if (empty($order['orderId'])) {
                $order['orderId'] = 'ORD-' . str_pad($order['id'], 6, '0', STR_PAD_LEFT);
            }

            // Get Items (Tests)
            $this->db->select('lt.test_name as testName, lt.price as unitPrice, 0 as discount, lt.price as amount, 1 as quantity, lt.id as testId');
            $this->db->from('lb_patient_test_tracking lpt');
            $this->db->join('lb_lab_tests lt', 'lt.id = lpt.treatment_test_id');
            $this->db->where('lpt.lab_order_id', $order['id']);
            $order['items'] = $this->db->get()->result_array();
            
            // If no items found via tracking (maybe direct order?), try treatment tests
            if (empty($order['items'])) {
                $this->db->select('test_name as testName, 0 as unitPrice, 0 as discount, 0 as amount, 1 as quantity, id as testId');
                $this->db->from('ms_patient_treatment_lab_tests');
                $this->db->where('treatment_id', $order['treatment_id']);
                $order['items'] = $this->db->get()->result_array();
            }

            // Calculate subtotal based on items
            $subtotal = 0;
            foreach ($order['items'] as $item) {
                $subtotal += (float) $item['amount'];
            }
            $order['subtotal'] = $subtotal;

            // Discount and tax placeholders
            $order['discount'] = isset($order['discount']) ? (float) $order['discount'] : 0;
            $order['tax'] = isset($order['tax']) ? (float) $order['tax'] : 0;

            // Total = subtotal - discount + tax
            $order['total'] = $order['subtotal'] - $order['discount'] + $order['tax'];

            // Get Payments
            $order['payments'] = $this->get_order_payments($order['id'], $lab_id);
            
            // Sum payments and format
            $paidFromPayments = 0;
            foreach ($order['payments'] as &$p) {
                $paidFromPayments += (float) $p['amount'];
                $p['mode'] = $p['payment_method'];
                $p['reference'] = $p['transaction_ref'];
                $p['receivedAt'] = $p['payment_date'];
                $p['receivedBy'] = $p['created_by'];
            }

            // Use payments sum if available, otherwise fallback to stored paidAmount
            if ($paidFromPayments > 0) {
                $order['paidAmount'] = $paidFromPayments;
            } else {
                $order['paidAmount'] = isset($order['paidAmount']) ? (float) $order['paidAmount'] : 0;
            }

            // Pending/balance based on calculated total and paid
            $order['balance'] = max($order['total'] - $order['paidAmount'], 0);

            // Derive status from amounts when total is available
            if ($order['total'] > 0) {
                if ($order['balance'] <= 0) {
                    $order['status'] = 'Paid';
                } elseif ($order['paidAmount'] > 0) {
                    $order['status'] = 'Partial';
                } else {
                    $order['status'] = 'Pending';
                }
            }
        }
        
        return $orders;
    }

    public function get_billing_stats($lab_id) {
        $today = date('Y-m-d');

        // Collected Today
        $this->db->select_sum('amount');
        $this->db->where('lab_id', $lab_id);
        $this->db->like('payment_date', $today);
        $q1 = $this->db->get('lb_lab_order_payments');
        $collectedToday = $q1->row()->amount ?? 0;

        // Total Revenue (All time collected)
        $this->db->select_sum('paid_amount');
        $this->db->where('lab_id', $lab_id);
        $q2 = $this->db->get('lb_lab_orders');
        $totalRevenue = $q2->row()->paid_amount ?? 0;

        // Pending Payments (Total Outstanding)
        $this->db->select_sum('total_amount');
        $this->db->where('lab_id', $lab_id);
        $q3 = $this->db->get('lb_lab_orders');
        $totalAmount = $q3->row()->total_amount ?? 0;
        
        $pendingAmount = $totalAmount - $totalRevenue;

        // Refunds (Placeholder for now, assuming no refunds table yet)
        $refunds = 0;

        return [
            'collectedToday' => $collectedToday,
            'totalRevenue' => $totalRevenue,
            'pendingAmount' => $pendingAmount,
            'refunds' => $refunds
        ];
    }
}
