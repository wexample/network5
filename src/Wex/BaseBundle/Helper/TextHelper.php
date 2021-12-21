<?php

namespace App\Wex\BaseBundle\Helper;

use function lcfirst;
use function preg_quote;
use function preg_replace;
use function str_replace;
use function Symfony\Component\String\u;

class TextHelper
{
    public static function removePrefix(string $string, string $prefix): string
    {
        return preg_replace(
            '/^'.preg_quote($prefix, '/').'/',
            '',
            $string
        );
    }

    public static function toCamel(string $string): string
    {
        return lcfirst(
            static::toClass($string)
        );
    }

    public static function toClass(string $string): string
    {
        return u(
            static::kebabToDash($string)
        )->camel()->title();
    }

    public static function kebabToDash(string $string): string
    {
        return str_replace(
            '-',
            '_',
            $string
        );
    }

    public static function removeSuffix(string $string, string $suffix): string
    {
        return preg_replace(
            '/'.preg_quote($suffix, '/').'$/',
            '',
            $string
        );
    }

    public static function toKebab(string $string): string
    {
        return str_replace(
            '_',
            '-',
            self::toSnake($string)
        );
    }

    public static function toSnake(string $string): string
    {
        return u($string)->snake();
    }
}
