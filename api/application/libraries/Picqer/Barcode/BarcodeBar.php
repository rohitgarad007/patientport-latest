<?php

namespace Picqer\Barcode;

class BarcodeBar
{
    protected $isBar; // bool
    protected $width; // int
    protected $height; // int

    public function __construct($isBar, $width, $height)
    {
        $this->isBar = (bool) $isBar;
        $this->width = (int) $width;
        $this->height = (int) $height;
    }

    public function isBar()
    {
        return $this->isBar;
    }

    public function getWidth()
    {
        return $this->width;
    }

    public function getHeight()
    {
        return $this->height;
    }
}
