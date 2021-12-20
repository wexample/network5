<?php

namespace App\Wex\BaseBundle\Helper;

use App\Wex\BaseBundle\WexBaseBundle;

class TemplateHelper
{
    public const TEMPLATE_FILE_EXTENSION = '.html.twig';

    public const BUNDLE_PATH_ALIAS_PREFIX = '@';

    public const BUNDLE_PATH_RESOURCES = 'Resources/';

    public const BUNDLE_PATH_TEMPLATES = self::BUNDLE_PATH_RESOURCES.self::REL_BUNDLE_PATH_TEMPLATES;

    public const REL_BUNDLE_PATH_PAGES = 'pages/';

    public const REL_BUNDLE_PATH_TEMPLATES = 'templates/';

    public static function buildTemplateInheritanceStack(
        string $relativePath,
        string $pageExtension = self::TEMPLATE_FILE_EXTENSION
    ): array
    {
        return [
            // Search local.
            $relativePath.$pageExtension,
            // Search in base bundle.
            WexBaseBundle::WEX_BUNDLE_PATH_TEMPLATES.$relativePath.$pageExtension,
        ];
    }
}
