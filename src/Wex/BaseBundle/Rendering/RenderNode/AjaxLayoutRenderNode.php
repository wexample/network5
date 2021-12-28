<?php

namespace App\Wex\BaseBundle\Rendering\RenderNode;

class AjaxLayoutRenderNode extends LayoutRenderNode
{
    public array $vueTemplates = [];

    public function toRenderData(): array
    {
        return parent::toRenderData() + [
                'vueTemplates' => $this->vueTemplates,
            ];
    }
}
