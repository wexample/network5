<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig\TwigFunction;

class AdaptiveResponseExtension extends AbstractExtension
{
    /**
     * CommonExtension constructor.
     */
    public function __construct(
        protected AdaptiveResponseService $adaptiveResponseService,
        protected RequestStack $requestStack,
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'adaptive_response_revert_context',
                [
                    $this,
                    'adaptiveResponseRevertContext',
                ]
            ),
            new TwigFunction(
                'adaptive_response_set_context',
                [
                    $this,
                    'adaptiveResponseSetContext',
                ]
            ),
            new TwigFunction(
                'adaptive_response_rendering_base_path',
                [
                    $this,
                    'adaptiveResponseRenderingBasePath',
                ],
                [
                    self::FUNCTION_OPTION_NEEDS_CONTEXT => true,
                ]
            ),
            new TwigFunction(
                'adaptive_rendering_base',
                [
                    $this,
                    'adaptiveRenderingBase',
                ]
            ),
        ];
    }

    /**
     * Return base layout path regarding request type
     * and template configuration.
     */
    public function adaptiveResponseRenderingBasePath(array $context): string
    {
        return $this
            ->adaptiveResponseService
            ->getResponse()
            ->getRenderingBasePath($context);
    }

    public function adaptiveRenderingBase(): string
    {
        return $this
            ->adaptiveResponseService
            ->getResponse()
            ->getRenderingBase();
    }

    public function adaptiveResponseSetContext(
        string $renderNodeType,
        ?string $renderNodeName,
    )
    {
        $this
            ->adaptiveResponseService
            ->renderPass
            ->setCurrentContextRenderNodeByTypeAndName(
                $renderNodeType,
                $renderNodeName
            );
    }

    public function adaptiveResponseRevertContext()
    {
        $this
            ->adaptiveResponseService
            ->renderPass
            ->revertCurrentContextRenderNode();
    }
}
