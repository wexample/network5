<?php

namespace App\Wex\BaseBundle\Twig;

abstract class AbstractExtension extends \Twig\Extension\AbstractExtension
{
    /**
     * @var string
     */
    protected const FUNCTION_OPTION_IS_SAFE = 'is_safe';

    /**
     * @var string
     */
    protected const FUNCTION_OPTION_HTML = 'html';

    /**
     * @var string
     */
    protected const FUNCTION_OPTION_NEEDS_ENVIRONMENT = 'needs_environment';
}
