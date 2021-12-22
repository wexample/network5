<?php

namespace App\Wex\BaseBundle\Helper;

use function implode;

class RenderingHelper
{
    public const CONTEXT_COMPONENT = VariableHelper::COMPONENT;

    public const CONTEXT_LAYOUT = VariableHelper::LAYOUT;

    public const CONTEXT_PAGE = VariableHelper::PAGE;

    public const CONTEXT_VUE = VariableHelper::VUE;

    public const PLACEHOLDER_PRELOAD_TAG = '<-- {{ ADAPTIVE_PRELOAD_PLACEHOLDER }} -->';

    public static function buildRenderContextKey(
        string $renderContextType,
        string $renderContextName
    ): string {
        return implode('@', [
            $renderContextType,
            $renderContextName,
        ]);
    }

    public static function pageNameFromPath(string $pagePath): string
    {
        // Define template name.
        $ext = TemplateHelper::TEMPLATE_FILE_EXTENSION;

        // Path have extension.
        if (str_ends_with($pagePath, $ext))
        {
            return substr(
                $pagePath,
                0,
                -strlen(TemplateHelper::TEMPLATE_FILE_EXTENSION)
            );
        }

        return $pagePath;
    }
}
