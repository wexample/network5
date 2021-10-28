<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Controller\AbstractPagesController;
use App\Wex\BaseBundle\Helper\ClassHelper;
use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\TextHelper;
use Symfony\Component\Routing\RouterInterface;

class TemplateService
{
    public function __construct(
        protected RouterInterface $router
    )
    {
    }

    public function getMethodClassPathFromRouteName(string $routeName): string
    {
        $routes = $this->router->getRouteCollection();

        return $routes->get($routeName)->getDefault('_controller');
    }

    public function buildTemplatePathFromClassPath(string $methodClassPath): string
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
        return AbstractPagesController::RESOURCES_DIR.implode(
                FileHelper::FOLDER_SEPARATOR,
                $explodeController
            );
    }
}
