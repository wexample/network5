<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Service\PageService;
use App\Wex\BaseBundle\Service\RenderingService;
use Twig\TwigFunction;

class PageExtension extends AbstractExtension
{
    public function __construct(
        private PageService $pageService,
        private RenderingService $renderingService
    )
    {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'page_init',
                [
                    $this,
                    'pageInit',
                ]
            ),
        ];
    }

    public function pageInit(
        string $pageName
    )
    {
        $this->pageService->pageInit(
            $this->renderingService->getRenderRequestId(),
            $this->renderingService->layoutInitialData->page,
            $pageName,
            $this->renderingService->layoutInitialData->useJs
        );
    }
}
