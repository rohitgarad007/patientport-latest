<?php

namespace Picqer\Barcode;

interface TypeInterface
{
    /**
     * Return an array of BarcodeBar objects for the given text
     *
     * @param string $code
     * @return BarcodeBar[]
     */
    public function convert($code);
}
