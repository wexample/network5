<?php

namespace App\Wex\BaseBundle\Helper;

use function implode;
use function strlen;
use function substr;

class FileHelper
{
    public const EXTENSION_SEPARATOR = '.';

    public const FOLDER_SEPARATOR = '/';

    public const FILE_EXTENSION_PDF = 'pdf';

    public const FILE_EXTENSION_PHP = 'php';

    public const FILE_EXTENSION_YML = 'yml';

    public const FILE_EXTENSION_VUE = 'vue';

    public const FILE_EXTENSION_SVG = 'svg';

    public static function joinPathParts(array $parts): string
    {
        return implode(
            FileHelper::FOLDER_SEPARATOR,
            $parts
        ).FileHelper::FILE_EXTENSION_PHP;
    }

    public static function removeExtension(string $path, string $extension): string
    {
        return substr($path, 0, -(strlen($extension) + 1));
    }
}
