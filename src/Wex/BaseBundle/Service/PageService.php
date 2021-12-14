<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Rendering\RenderDataPage;
use JetBrains\PhpStorm\Pure;
use Symfony\Component\Routing\RouterInterface;

class PageService extends RenderNodeService
{
    #[Pure]
    public function __construct(
        protected AssetsService $assetsService,
        protected RouterInterface $router
    )
    {
        parent::__construct(
            $this->assetsService
        );
    }

    public function pageInit(
        string $renderRequestId,
        RenderDataPage $page,
        string $pageName,
        bool $useJs
    )
    {
        $this->initRenderData(
            $renderRequestId,
            $page,
            $pageName,
            $useJs
        );
    }
}