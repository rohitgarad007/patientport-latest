<?php
class Barcode
{
    protected $barcode;
    protected $width = 0;
    protected $height = 0;
    protected $bars = array();

    public function __construct($barcode)
    {
        $this->barcode = (string) $barcode;
    }

    public function addBar(BarcodeBar $bar)
    {
        $this->bars[] = $bar;
        $this->width += $bar->getWidth();
        $this->height = max($this->height, $bar->getHeight());
    }

    public function getBarcode() { return $this->barcode; }
    public function getWidth() { return $this->width; }
    public function getHeight() { return $this->height; }
    public function getBars() { return $this->bars; }
}
