<?php
namespace Picqer\Barcode\Types;

use Picqer\Barcode\Barcode;
use Picqer\Barcode\BarcodeBar;
use Picqer\Barcode\TypeInterface;

class TypeCode128 implements TypeInterface
{
    // Code 128 character patterns
    private static $char128 = [
        ' ' => '212222', '!' => '222122', '"' => '222221', '#' => '121223', '$' => '121322',
        '%' => '131222', '&' => '122213', '\'' => '122312', '(' => '132212', ')' => '221213',
        '*' => '221312', '+' => '231212', ',' => '112232', '-' => '122132', '.' => '122231',
        '/' => '113222', '0' => '123122', '1' => '123221', '2' => '223211', '3' => '221132',
        '4' => '221231', '5' => '213212', '6' => '223112', '7' => '312131', '8' => '311222',
        '9' => '321122', ':' => '321221', ';' => '312212', '<' => '322112', '=' => '322211',
        '>' => '212123', '?' => '212321', '@' => '232121', 'A' => '111323', 'B' => '131123',
        'C' => '131321', 'D' => '112313', 'E' => '132113', 'F' => '132311', 'G' => '211313',
        'H' => '231113', 'I' => '231311', 'J' => '112133', 'K' => '112331', 'L' => '132131',
        'M' => '113123', 'N' => '113321', 'O' => '133121', 'P' => '313121', 'Q' => '211331',
        'R' => '231131', 'S' => '213113', 'T' => '213311', 'U' => '213131', 'V' => '311123',
        'W' => '311321', 'X' => '331121', 'Y' => '312113', 'Z' => '312311', '[' => '332111',
        '\\' => '314111', ']' => '221411', '^' => '431111', '_' => '111224', '`' => '111422',
        'a' => '121124', 'b' => '121421', 'c' => '141122', 'd' => '141221', 'e' => '112214',
        'f' => '112412', 'g' => '122114', 'h' => '122411', 'i' => '142112', 'j' => '142211',
        'k' => '241211', 'l' => '221114', 'm' => '413111', 'n' => '241112', 'o' => '134111',
        'p' => '111242', 'q' => '121142', 'r' => '121241', 's' => '114212', 't' => '124112',
        'u' => '124211', 'v' => '411212', 'w' => '421112', 'x' => '421211', 'y' => '212141',
        'z' => '214121', '{' => '412121', '|' => '111143', '}' => '111341', '~' => '131141'
    ];

    public function convert($code)
    {
        $barcode = new Barcode($code);
        $checksum = 104; // Start Code B
        $weight = 1;

        // Add Start Code B pattern
        $this->addPattern($barcode, '211214');

        // Add characters
        for ($i = 0; $i < strlen($code); $i++) {
            $char = $code[$i];
            if (!isset(self::$char128[$char])) {
                throw new \InvalidArgumentException("Unsupported character: $char");
            }
            $value = array_search(self::$char128[$char], self::$char128, true);
            $checksum += $value * $weight++;
            $this->addPattern($barcode, self::$char128[$char]);
        }

        // Checksum
        $checksum %= 103;
        $pattern = array_values(self::$char128)[$checksum];
        $this->addPattern($barcode, $pattern);

        // Stop pattern (106)
        $this->addPattern($barcode, '2331112');

        return $barcode;
    }

    private function addPattern(Barcode $barcode, $pattern)
    {
        $length = strlen($pattern);
        for ($i = 0; $i < $length; $i++) {
            $width = (int)$pattern[$i];
            $isBar = $i % 2 === 0;
            $barcode->addBar(new BarcodeBar($isBar, $width, 50));
        }
    }
}
