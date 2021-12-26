<?php

namespace App\Wex\BaseBundle\Rendering\RenderNode;

use App\Wex\BaseBundle\Helper\DomHelper;
use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\RenderPass;
use JetBrains\PhpStorm\Pure;

class ComponentRenderNode extends RenderNode
{
    protected const VAR_INIT_MODE = 'initMode';

    public array $assets = [];

    public ?string $body = null;

    #[Pure]
    public function __construct(
        protected RenderPass $renderPass,
        public string $initMode,
        public array $options = []
    ) {
        parent::__construct(
            $this->renderPass
        );
    }

    public function init(string $name, )
    {
        parent::init($name);

        $this
            ->renderPass
            ->getCurrentContextRenderNode()
            ->components[] = $this;
    }

    public function getContextType(): string
    {
        return RenderingHelper::CONTEXT_COMPONENT;
    }

    public function renderCssClass(): string
    {
        return 'com-class-loaded '.$this->id;
    }

    public function renderTag(): string
    {
        return DomHelper::buildTag(
            'span',
            [
                // ID are not used as "id" html attribute,
                // as component may be embedded into a vue,
                // so replicated multiple times.
                VariableHelper::CLASS_VAR => 'com-init '.$this->id,
            ]
        );
    }

    public function toRenderData(): array
    {
        return parent::toRenderData()
            + [
                'initMode' => $this->initMode,
                'options' => $this->options,
            ];
    }
}
