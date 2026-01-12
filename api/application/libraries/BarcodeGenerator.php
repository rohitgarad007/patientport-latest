<?php
class BarcodeGenerator
{
    const TYPE_CODE_128 = 'code128';

    public function getBarcode($code, $type)
    {
        if ($type === self::TYPE_CODE_128) {
            $generator = new TypeCode128();
            $barcodeObj = $generator->convert($code);
            return $this->drawPNG($barcodeObj);
        }
        return null;
    }

    protected function drawPNG(Barcode $barcode)
    {
        $width = $barcode->getWidth();
        $height = $barcode->getHeight();
        $img = imagecreate($width, $height);
        $white = imagecolorallocate($img, 255, 255, 255);
        $black = imagecolorallocate($img, 0, 0, 0);

        $x = 0;
        foreach ($barcode->getBars() as $bar) {
            $color = $bar->isBar() ? $black : $white;
            imagefilledrectangle($img, $x, 0, $x + $bar->getWidth() - 1, $bar->getHeight(), $color);
            $x += $bar->getWidth();
        }

        ob_start();
        imagepng($img);
        $data = ob_get_clean();
        imagedestroy($img);

        return $data;
    }
}
