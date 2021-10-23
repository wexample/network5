<?php

namespace App\Wex\BaseBundle\Helper;

use function realpath;
use function strlen;
use function substr;

class PathHelper
{
    public static function relativeTo(
        string $path,
        string $basePath
    ): string
    {
        return preg_replace(
            '/^'.str_replace('/', '\/', $basePath).'/',
            '',
            $path
        );
    }
}
