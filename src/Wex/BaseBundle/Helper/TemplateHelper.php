<?php

namespace App\Wex\BaseBundle\Helper;

use App\Wex\BaseBundle\WexBaseBundle;

class TemplateHelper
{
    public const TEMPLATE_FILE_EXTENSION = '.html.twig';

    public const TEMPLATES_LOCATIONS = [
        // Search in default local template folder.
        '',
        // Search in base bundle.
        BundleHelper::WEX_TEMPLATE_ALIAS_TEMPLATES,
    ];

    public static function buildTemplateInheritanceStack(
        string $relativePath,
        string $pageExtension = self::TEMPLATE_FILE_EXTENSION
    ): array {
        $output = [];

        foreach (self::TEMPLATES_LOCATIONS as $location)
        {
            $output[] = $location.$relativePath.$pageExtension;
        }

        return $output;
    }
}
