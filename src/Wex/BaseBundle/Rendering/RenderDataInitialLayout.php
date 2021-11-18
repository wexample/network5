<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Translation\Translator;
use App\Wex\BaseBundle\Twig\AssetsExtension;

class RenderDataInitialLayout extends RenderDataLayout
{
    public array $displayBreakpoints = AssetsExtension::DISPLAY_BREAKPOINTS;

    public string $env;

    public string $theme;

    public string $translationsDomainSeparator = Translator::DOMAIN_SEPARATOR;
}
