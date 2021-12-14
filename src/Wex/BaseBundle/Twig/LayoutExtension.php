<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\RenderDataInitialLayout;
use App\Wex\BaseBundle\Service\AssetsService;
use App\Wex\BaseBundle\Service\LayoutService;
use App\Wex\BaseBundle\Service\RenderingService;
use Twig\Environment;
use Twig\TwigFunction;

class LayoutExtension extends AbstractExtension
{
    public const LAYOUT_NAME_DEFAULT = VariableHelper::DEFAULT;

    public function __construct(
        protected LayoutService $layoutService,
        protected RenderingService $renderingService,
        private TemplateExtension $templateExtension
    )
    {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'layout_init',
                [
                    $this,
                    'layoutInit',
                ]
            ),
            new TwigFunction(
                'layout_render_initial_data',
                [
                    $this,
                    'templateBuildInitialLayoutRenderData',
                ],
                [
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                ]
            ),
        ];
    }

    public function layoutInit(
        string $layoutName,
        string $colorScheme,
        bool $useJs,
    ): void
    {
        $this->layoutService->initialLayoutInit(
            $this->renderingService->getRenderRequestId(),
            $this->renderingService->layoutInitialData,
            $layoutName,
            $colorScheme,
            $useJs
        );
    }

    public function templateBuildInitialLayoutRenderData(
        Environment $env,
        string $pageTemplateName,
        string $layoutTheme
    ): RenderDataInitialLayout {
        /** @var ComponentsExtension $comExtension */
        $comExtension = $env->getExtension(
            ComponentsExtension::class
        );

        $renderData = $this->renderingService->layoutInitialData;

        $tempAssets = $renderData->assets;
        $renderData->merge(
            $this->templateExtension->templateBuildLayoutRenderData($env, $pageTemplateName)
        );
        $renderData->assets = $tempAssets;

        $renderData->page->isLayoutPage = true;

        $renderData->components = $comExtension->buildRenderData(
            RenderingHelper::CONTEXT_LAYOUT
        );

        $renderData->displayBreakpoints = AssetsService::DISPLAY_BREAKPOINTS;
        $renderData->colorScheme = $layoutTheme;

        return $renderData;
    }
}
