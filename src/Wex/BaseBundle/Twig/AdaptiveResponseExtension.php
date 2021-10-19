<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Rendering\AdaptiveResponse;
use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class AdaptiveResponseExtension extends AbstractExtension
{
    /**
     * CommonExtension constructor.
     */
    public function __construct(
        protected AdaptiveResponseService $adaptiveResponseService,
        protected RequestStack $requestStack,
    )
    {
    }

    protected function getCurrentResponse(): AdaptiveResponse
    {
        return $this->adaptiveResponseService->getCurrentResponse();
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'adaptive_response_layout_path',
                [
                    $this,
                    'adaptiveResponseLayoutPath',
                ],
                [
                    'needs_context' => true,
                ]
            ),
        ];
    }

    /**
     * Return base layout path regarding request type
     * and template configuration.
     */
    public function adaptiveResponseLayoutPath(array $context): string
    {
        return $this
            ->getCurrentResponse()
            ->getRenderingBasePath(
                $context,
                $this->requestStack->getMainRequest()
            );
    }
}
