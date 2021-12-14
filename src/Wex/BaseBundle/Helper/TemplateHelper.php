<?php

namespace App\Wex\BaseBundle\Helper;

use App\Wex\BaseBundle\WexBaseBundle;

class TemplateHelper
{
    public const TEMPLATE_FILE_EXTENSION = '.html.twig';

    public static function buildTemplateInheritanceStack(
        string $relativePath,
        string $pageExtension = self::TEMPLATE_FILE_EXTENSION
    ): array {
        return [
            // Search local.
            $relativePath.$pageExtension,
            // Search in base bundle.
            WexBaseBundle::BUNDLE_PATH_TEMPLATES.$relativePath.$pageExtension,
        ];
    }
}
