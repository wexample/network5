<?php

namespace App\Wex\BaseBundle\Rendering\RenderNode;

use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Rendering\RenderPass;
use JetBrains\PhpStorm\Pure;

class LayoutRenderNode extends RenderNode
{
    public PageRenderNode $page;

    public array $events = [];

    public ?string $templates = null;

    #[Pure]
    public function __construct(
        protected RenderPass $renderPass,
        public bool $useJs
    )
    {
        // No render context for layout.
        parent::__construct(
            $this->renderPass
        );
    }

    public function init(
        string $name,
    )
    {
        parent::init(
            $name
        );

        $this->page = new PageRenderNode(
            $this->renderPass
        );
    }

    public function getAssetsName(): string
    {
        return 'layouts/'.$this->name.'/layout';
    }

    public function getContextType(): string
    {
        return RenderingHelper::CONTEXT_LAYOUT;
    }

    public function toRenderData(): array
    {
        return parent::toRenderData()
            + $this->serializeVariables([
                'page',
                'useJs',
            ])
            + [
                'templates' => $this->getComponentsTemplates(),
            ];
    }
}
