<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use App\Wex\BaseBundle\Service\PageService;
use Twig\TwigFunction;

class PageExtension extends AbstractExtension
{
    public function __construct(
        private AdaptiveResponseService $adaptiveResponseService,
        private PageService $pageService,
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
            new TwigFunction(
                'page_name_from_path',
                [
                    $this,
                    'pageNameFromPath',
                ]
            ),
            new TwigFunction(
                'page_name_from_route',
                [
                    $this,
                    'pageNameFromRoute'
                ]
            ),
        ];
    }

    public function pageInit(
        string $pageName
    )
    {
        $this->pageService->pageInit(
            $this->adaptiveResponseService->renderPass->layoutRenderNode->page,
            $pageName,
            $this->adaptiveResponseService->renderPass->layoutRenderNode->useJs
        );
    }

    public function pageNameFromPath(string $templatePath): string
    {
        // Define template name.
        $ext = TemplateHelper::TEMPLATE_FILE_EXTENSION;

        // Path have extension.
        if (str_ends_with($templatePath, $ext))
        {
            return substr(
                $templatePath,
                0,
                -strlen(TemplateHelper::TEMPLATE_FILE_EXTENSION)
            );
        }

        return $templatePath;
    }

    public function pageNameFromRoute(string $route): string
    {
        return $this->pageService->buildPageNameFromClassPath(
            $this->pageService->getControllerClassPathFromRouteName(
                $route
            )
        );
    }
}
