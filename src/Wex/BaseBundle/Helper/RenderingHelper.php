<?php

namespace App\Wex\BaseBundle\Helper;

use function implode;

class RenderingHelper
{
    public const CONTEXT_COMPONENT = VariableHelper::COMPONENT;

    public const CONTEXT_LAYOUT = VariableHelper::LAYOUT;

    public const CONTEXT_PAGE = VariableHelper::PAGE;

    public const CONTEXT_VUE = VariableHelper::VUE;

    public const VAR_RENDERING_CONTEXT = 'renderingContext';

    public static function buildRenderContextKey(
        string $renderContextType,
        string $renderContextName
    ): string {
        return implode('@', [
            $renderContextType,
            $renderContextName,
        ]);
    }
}
