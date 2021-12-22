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

    public const SUFFIX_AGGREGATED = 'agg';

    public static function joinPathParts(array $parts): string
    {
        return implode(
            FileHelper::FOLDER_SEPARATOR,
            $parts
        ).FileHelper::FILE_EXTENSION_PHP;
    }

    public static function removeExtension(string $path, string $extension = null): string
    {
        if (is_null($extension))
        {
            $extension = pathinfo($path)['extension'];
        }

        return substr($path, 0, -(strlen($extension) + 1));
    }

    public static function fileWrite(string $fileName, string $content)
    {
        $dir = dirname($fileName);

        if (!is_dir($dir))
        {
            mkdir($dir, 0777, true);
        }

        file_put_contents($fileName, $content);
    }

    public static function fileWriteAndHash(string $fileName, string $content): string
    {
        self::fileWrite($fileName, $content);

        return md5($content);
    }
}
