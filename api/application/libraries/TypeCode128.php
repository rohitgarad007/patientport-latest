<?php
class TypeCode128
{
    public function convert($code)
    {
        $barcode = new Barcode($code);

        for ($i = 0; $i < strlen($code); $i++) {
            $barcode->addBar(new BarcodeBar(true, 2, 50));
            $barcode->addBar(new BarcodeBar(false, 1, 50));
        }

        return $barcode;
    }
}
