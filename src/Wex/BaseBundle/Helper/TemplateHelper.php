<?php

namespace App\Wex\BaseBundle\Helper;

use App\Wex\BaseBundle\Twig\TemplateExtension;
use App\Wex\BaseBundle\WexBaseBundle;

class TemplateHelper
{
    public static function buildTemplateInheritanceStack(
        string $relativePath,
        string $templateExtension = TemplateExtension::TEMPLATE_FILE_EXTENSION
    ): array
    {
        return [
            // Search local.
            $relativePath.$templateExtension,
            // Search in base bundle.
            WexBaseBundle::BUNDLE_PATH_TEMPLATES.$relativePath.$templateExtension,
        ];
    }
}
