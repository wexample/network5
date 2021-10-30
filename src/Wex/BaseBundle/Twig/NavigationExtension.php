<?php

namespace App\Wex\BaseBundle\Twig;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Twig\TwigFunction;

class NavigationExtension extends AbstractExtension
{
    protected ?string $currentPath = null;

    public function __construct(
        RequestStack $requestStack,
        public UrlGeneratorInterface $urlGenerator
    ) {
        $request = $requestStack->getCurrentRequest();

        if ($request)
        {
            $this->currentPath = $request->getPathInfo();
        }
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'route_is_current',
                [$this, 'routeIsCurrent']
            ),
        ];
    }

    public function routeIsCurrent(string $route, array $params): bool
    {
        return $this->urlGenerator->generate(
            $route,
            $params
        ) === $this->currentPath;
    }
}
