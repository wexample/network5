<?php

namespace App\Wex\BaseBundle\Rendering\RenderNode;

use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Rendering\RenderDataGenerator;
use App\Wex\BaseBundle\Rendering\RenderPass;
use App\Wex\BaseBundle\Service\AssetsService;

abstract class RenderNode extends RenderDataGenerator
{
    public array $assets = AssetsService::ASSETS_DEFAULT_EMPTY;

    public array $components = [];

    public ?RenderNode $parent;

    public string $renderRequestId;

    public array $translations = [];

    public array $vars = [];

    public string $name;

    abstract public function getContextType(): string;

    public function __construct(
        protected RenderPass $renderPass
    )
    {
    }

    public function init(
        string $name,
    )
    {
        $this->parent = $this->renderPass->getCurrentContextRenderNode();
        $this->renderRequestId = $this->renderPass->getRenderRequestId();
        $this->name = $name;

        $this->renderPass->registerContextRenderNode($this);

        $this->renderPass->registerRenderNode($this);
    }

    public function getContextRenderNodeKey(): string
    {
        return RenderingHelper::buildRenderContextKey(
            $this->getContextType(),
            $this->getRenderContextName()
        );
    }

    public function getAssetsName(): string
    {
        return $this->name;
    }

    protected function getRenderContextName(): string
    {
        return $this->name;
    }

    public function getComponentsTemplates(): string
    {
        $output = '';

        /** @var ComponentRenderNode $component */
        foreach ($this->components as $component)
        {
            $output .= $component->body;
        }

        return $output;
    }

    public function toRenderData(): array
    {
        return [
            'assets' => [
                'css' => $this->arrayToRenderData($this->assets['css']),
                'js' => $this->arrayToRenderData($this->assets['js']),
            ],
            'components' => $this->arrayToRenderData($this->components),
            'name' => $this->name,
            'renderRequestId' => $this->renderRequestId,
            'translations' => $this->translations,
            'vars' => $this->vars
        ];
    }
}