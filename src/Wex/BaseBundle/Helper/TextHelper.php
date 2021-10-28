<?php

namespace App\Wex\BaseBundle\Helper;

use function Symfony\Component\String\u;

class TextHelper
{
    public static function removePrefix(string $string, string $prefix): string
    {
        return preg_replace(
            '/^'.preg_quote($prefix, '/').'/',
            '', $string
        );
    }
    public static function removeSuffix(string $string, string $suffix): string
    {
        return preg_replace(
            '/'.preg_quote($suffix, '/').'$/',
            '', $string
        );
    }

    public static function toSnake(string $string): string
    {
        return u($string)->snake();
    }
}
