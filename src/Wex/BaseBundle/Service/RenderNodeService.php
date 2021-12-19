<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Rendering\RenderNode\RenderNode;

abstract class RenderNodeService
{
    public function __construct(
        protected AssetsService $assetsService
    )
    {
    }

    public function initRenderNode(
        RenderNode $renderNode,
        string $name,
        string $useJs
    )
    {
        $renderNode->init(
            $name
        );

        $this->assetsService->assetsDetect(
            $renderNode->getAssetsName(),
            $renderNode,
            $renderNode->assets
        );

        $this->assetsService->assetsPreload(
            $renderNode->assets['css'],
            $useJs
        );
    }
}