<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Service\AssetsService;
use App\Wex\BaseBundle\Translation\Translator;
use JetBrains\PhpStorm\Pure;

class RenderDataInitialLayout extends RenderDataLayout
{
    public array $displayBreakpoints = AssetsService::DISPLAY_BREAKPOINTS;

    public string $colorScheme;

    public string $translationsDomainSeparator = Translator::DOMAIN_SEPARATOR;

    #[Pure]
    public function __construct(
        protected string $env
    )
    {
        // The initial layout is created before template process starts,
        // so final name will be defined later.
        parent::__construct();

        $this->page->isLayoutPage = true;
    }
}
