<?php

namespace App\Wex\BaseBundle\Helper;

use function Symfony\Component\String\u;

class TextHelper
{
    public static function toSnake(string $string): string
    {
        return u($string)->snake();
    }
}
