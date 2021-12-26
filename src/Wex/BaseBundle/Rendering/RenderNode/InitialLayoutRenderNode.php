<?php

namespace App\Wex\BaseBundle\Rendering\RenderNode;

use App\Wex\BaseBundle\Rendering\RenderPass;
use App\Wex\BaseBundle\Service\AssetsService;
use App\Wex\BaseBundle\Translation\Translator;
use JetBrains\PhpStorm\Pure;

class InitialLayoutRenderNode extends LayoutRenderNode
{
    public string $colorScheme;

    public string $translationsDomainSeparator = Translator::DOMAIN_SEPARATOR;

    #[Pure]
    public function __construct(
        protected RenderPass $renderPass,
        public bool $useJs,
        protected string $env
    ) {
        parent::__construct(
            $renderPass,
            $useJs
        );
    }

    public function init(
        string $name,
    ) {
        parent::init(
            $name
        );

        $this->page->isInitialPage = true;

        $this->vars += [
            'colorScheme' => $this->colorScheme,
            'displayBreakpoints' => AssetsService::DISPLAY_BREAKPOINTS,
            'translationsDomainSeparator' => $this->translationsDomainSeparator,
            'useJs' => $this->useJs,
        ];
    }
}
