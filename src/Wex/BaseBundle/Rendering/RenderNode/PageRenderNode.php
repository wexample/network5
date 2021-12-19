<?php

namespace App\Wex\BaseBundle\Rendering\RenderNode;

use App\Wex\BaseBundle\Helper\RenderingHelper;

class PageRenderNode extends RenderNode
{
    public ?string $body = null;

    public bool $isInitialPage = false;

    public function getContextType(): string
    {
        return RenderingHelper::CONTEXT_PAGE;
    }

    public function toRenderData(): array
    {
        return parent::toRenderData()
            + $this->serializeVariables([
                'body',
                'isInitialPage',
            ]);
    }
}
