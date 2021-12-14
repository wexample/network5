<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Rendering\RenderData;

abstract class RenderNodeService
{
    public function __construct(
        protected AssetsService $assetsService
    )
    {
    }

    public function initRenderData(
        string $renderRequestId,
        RenderData $renderData,
        string $name,
        string $useJs
    )
    {
        $renderData->init(
            $renderRequestId,
            $name
        );

        $this->assetsService->assetsDetect(
            $renderData->getAssetsName(),
            RenderingHelper::CONTEXT_PAGE,
            $renderData->assets
        );

        $this->assetsService->assetsPreload(
            $renderData->assets['css'],
            $useJs
        );
    }
}