<?php

namespace Picqer\Barcode;

class Barcode
{
    protected $barcode; // string
    protected $width = 0; // int
    protected $height = 0; // int
    protected $bars = array(); // array of BarcodeBar

    public function __construct($barcode)
    {
        $this->barcode = (string) $barcode;
    }

    // Add a bar to the barcode (bar or space)
    public function addBar(BarcodeBar $bar)
    {
        $this->bars[] = $bar;
        $this->width += $bar->getWidth();
        $this->height = max($this->height, $bar->getHeight());
    }

    public function getBarcode()
    {
        return $this->barcode;
    }

    public function getWidth()
    {
        return $this->width;
    }

    public function getHeight()
    {
        return $this->height;
    }

    public function getBars()
    {
        return $this->bars;
    }
}
