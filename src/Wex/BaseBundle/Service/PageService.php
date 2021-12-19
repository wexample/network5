<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Controller\AbstractPagesController;
use App\Wex\BaseBundle\Helper\ClassHelper;
use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\TextHelper;
use App\Wex\BaseBundle\Rendering\RenderNode\PageRenderNode;
use App\Wex\BaseBundle\Translation\Translator;
use function array_map;
use function explode;
use function implode;
use JetBrains\PhpStorm\Pure;
use Symfony\Component\Routing\RouterInterface;

class PageService extends RenderNodeService
{
    #[Pure]
    public function __construct(
        protected AssetsService $assetsService,
        protected Translator $translator,
        protected RouterInterface $router
    ) {
        parent::__construct(
            $this->assetsService
        );
    }

    public function pageInit(
        PageRenderNode $page,
        string $pageName,
        bool $useJs
    ) {
        $this->initRenderNode(
            $page,
            $pageName,
            $useJs
        );

        $this->translator->setDomainFromPath(
            $page->getContextType(),
            $pageName
        );
    }

    public function getControllerClassPathFromRouteName(string $routeName): string
    {
        $routes = $this->router->getRouteCollection();

        return $routes->get($routeName)->getDefault('_controller');
    }

    public function buildPageNameFromClassPath(string $methodClassPath): string
    {
        $explode = explode(ClassHelper::METHOD_SEPARATOR, $methodClassPath);

        // Remove useless namespace part.
        $controllerRelativePath = TextHelper::removePrefix(
            TextHelper::removeSuffix($explode[0], 'Controller'),
            AbstractPagesController::NAMESPACE_PAGES
        );

        // Cut parts.
        $explodeController = explode(
            ClassHelper::NAMESPACE_SEPARATOR,
            $controllerRelativePath
        );

        // Append method name.
        $explodeController[] = $explode[1];

        // Convert all parts.
        $explodeController = array_map(
            TextHelper::class.'::toSnake',
            $explodeController
        );

        // Return joined string.
        return AbstractPagesController::RESOURCES_DIR_PAGE.implode(
            FileHelper::FOLDER_SEPARATOR,
            $explodeController
        );
    }
}
