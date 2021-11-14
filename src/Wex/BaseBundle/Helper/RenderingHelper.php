<?php

namespace App\Wex\BaseBundle\Helper;

class RenderingHelper
{
    public const CONTEXT_AJAX = VariableHelper::AJAX;

    public const CONTEXT_LAYOUT = VariableHelper::LAYOUT;

    public const CONTEXT_PAGE = VariableHelper::PAGE;

    public const CONTEXT_VUE = VariableHelper::VUE;

    public const VAR_RENDERING_CONTEXT = 'renderingContext';
}
