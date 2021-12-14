<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Rendering\Asset;
use App\Wex\BaseBundle\Rendering\RenderDataInitialLayout;
use App\Wex\BaseBundle\Rendering\RenderDataLayout;

class LayoutService extends RenderNodeService
{
    public function initialLayoutInit(
        string $renderRequestId,
        RenderDataInitialLayout $layoutRenderData,
        string $layoutName,
        string $colorScheme,
        bool $useJs
    )
    {
        $layoutRenderData->colorScheme = $colorScheme;

        $this->layoutInit(
            $renderRequestId,
            $layoutRenderData,
            $layoutName,
            $useJs
        );
    }

    public function layoutInit(
        string $renderRequestId,
        RenderDataLayout $layoutRenderData,
        string $layoutName,
        bool $useJs
    )
    {
        $layoutRenderData->name = $layoutName;
        $layoutRenderData->useJs = $useJs;
        $backEndAssets = $layoutRenderData->assets;
        $layoutRenderData->assets = AssetsService::ASSETS_DEFAULT_EMPTY;

        $this->initRenderData(
            $renderRequestId,
            $layoutRenderData,
            $layoutName,
            $useJs
        );

        // No main js found.
        if (empty($layoutRenderData->assets[Asset::EXTENSION_JS]))
        {
            // Try to load default js file.
            // Do not preload JS as it is configured
            // to wait for dom content loaded anyway.
            $this->assetsService->assetsDetectForType(
                'layouts/default/layout',
                Asset::EXTENSION_JS,
                RenderingHelper::CONTEXT_LAYOUT,
                true
            );
        }

        $layoutRenderData->assets[Asset::EXTENSION_JS] = array_merge(
            $layoutRenderData->assets[Asset::EXTENSION_JS],
            $backEndAssets[Asset::EXTENSION_JS]
        );

        $layoutRenderData->assets[Asset::EXTENSION_CSS] = array_merge(
            $layoutRenderData->assets[Asset::EXTENSION_CSS],
            $backEndAssets[Asset::EXTENSION_CSS]
        );
    }
}