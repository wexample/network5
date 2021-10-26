<?php

namespace App\Wex\BaseBundle\Helper;

use function preg_replace;
use function str_replace;

class PathHelper
{
    public static function relativeTo(
        string $path,
        string $basePath
    ): string {
        return preg_replace(
            '/^'.str_replace('/', '\/', $basePath).'/',
            '',
            $path
        );
    }
}
