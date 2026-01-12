<?php
namespace Picqer\Barcode;

require_once __DIR__ . '/BarcodeGenerator.php';

class BarcodeGeneratorPNG extends BarcodeGenerator
{
    public function getBarcode($code, $type)
    {
        return parent::getBarcode($code, $type);
    }
}
