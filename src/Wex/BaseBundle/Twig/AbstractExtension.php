<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\VariableHelper;

abstract class AbstractExtension extends \Twig\Extension\AbstractExtension
{
    /**
     * @var string
     */
    protected const FUNCTION_OPTION_IS_SAFE = 'is_safe';

    /**
     * @var string
     */
    protected const FUNCTION_OPTION_HTML = VariableHelper::HTML;

    /**
     * @var string
     */
    protected const FUNCTION_OPTION_NEEDS_ENVIRONMENT = 'needs_environment';
}
