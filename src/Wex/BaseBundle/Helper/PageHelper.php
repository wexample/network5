<?php

namespace App\Wex\BaseBundle\Helper;

use function str_ends_with;
use function strlen;
use function substr;

class PageHelper
{
    public static function pageNameFromPath(string $pagePath): string
    {
        // Define template name.
        $ext = TemplateHelper::TEMPLATE_FILE_EXTENSION;

        // Path have extension.
        if (str_ends_with($pagePath, $ext))
        {
            $pagePath = substr(
                $pagePath,
                0,
                -strlen(TemplateHelper::TEMPLATE_FILE_EXTENSION)
            );
        }

        return self::trimPageTemplateLocationAlias($pagePath);
    }

    public static function trimPageTemplateLocationAlias(string $pagePath): string
    {
        if (str_starts_with($pagePath, TemplateHelper::BUNDLE_PATH_ALIAS_PREFIX))
        {
            foreach (TemplateHelper::TEMPLATES_LOCATIONS as $location)
            {
                $location .= TemplateHelper::REL_BUNDLE_PATH_PAGES;

                if ($location && str_starts_with($pagePath, $location))
                {
                    return substr($pagePath, strlen($location));
                }
            }
        }

        return $pagePath;
    }
}
