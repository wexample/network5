<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Rendering\RenderNode\ComponentRenderNode;
use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use Symfony\Component\HttpKernel\KernelInterface;

abstract class ComponentRenderNodeManager
{
    public function __construct(
        protected KernelInterface $kernel,
        protected AdaptiveResponseService $adaptiveResponseService,
    ) {
    }

    public function createComponent(ComponentRenderNode $componentRenderNode)
    {
        // To override...
    }

    public function postRender()
    {
        // To override...
    }
}
