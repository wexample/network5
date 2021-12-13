<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\DomHelper;
use App\Wex\BaseBundle\Service\RenderingService;
use Twig\TwigFunction;

class RenderExtension extends AbstractExtension
{
    public function __construct(
        protected RenderingService $renderingService,
    )
    {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'render_set_context',
                [
                    $this,
                    'renderSetContext',
                ]
            ),
            new TwigFunction(
                'render_revert_context',
                [
                    $this,
                    'renderRevertContext',
                ]
            ),
            new TwigFunction(
                'render_tag',
                [
                    $this,
                    'renderTag',
                ],
                [self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML]
            ),
            new TwigFunction(
                'render_tag_attributes',
                [
                    $this,
                    'renderTagAttributes',
                ],
                [self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML]
            ),
        ];
    }

    public function renderSetContext(
        string $renderingContext,
        ?string $name,
    )
    {
        $this->renderingService->setContext(
            $renderingContext,
            $name,
        );
    }

    public function renderRevertContext()
    {
        $this->renderingService->revertContext();
    }

    public function renderTag(
        string $tagName,
        array $attributes,
        string $body = '',
        bool $allowSingleTag = true
    ): string
    {
        return DomHelper::buildTag(
            $tagName,
            $attributes,
            $body,
            $allowSingleTag
        );
    }

    public function renderTagAttributes(
        array $attributes
    ): string
    {
        return DomHelper::buildTagAttributes(
            $attributes
        );
    }
}
