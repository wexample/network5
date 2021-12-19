<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\ColorSchemeHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use App\Wex\BaseBundle\Service\LayoutService;
use Exception;
use Twig\Environment;
use Twig\TwigFunction;

class LayoutExtension extends AbstractExtension
{
    public const LAYOUT_NAME_DEFAULT = VariableHelper::DEFAULT;

    public function __construct(
        private AdaptiveResponseService $adaptiveResponseService,
        private LayoutService $layoutService,
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'layout_init',
                [
                    $this,
                    'layoutInit',
                ],
                [
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                ]
            ),
            new TwigFunction(
                'layout_render_initial_data',
                [
                    $this,
                    'layoutRenderInitialData',
                ],
                [
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                ]
            ),
        ];
    }

    /**
     * @throws Exception
     */
    public function layoutInit(
        Environment $twig,
        ?string $layoutName,
        string $colorScheme = ColorSchemeHelper::SCHEME_DEFAULT,
        bool $useJs = true,
    ): void {
        $this->layoutService->layoutInitInitial(
            $twig,
            $layoutName ?: VariableHelper::DEFAULT,
            $colorScheme,
            $useJs
        );
    }

    public function layoutRenderInitialData(): array
    {
        return $this
            ->adaptiveResponseService
            ->renderPass
            ->layoutRenderNode
            ->toRenderData();
    }
}
