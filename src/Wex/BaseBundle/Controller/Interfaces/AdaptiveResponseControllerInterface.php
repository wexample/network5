<?php

namespace App\Wex\BaseBundle\Controller\Interfaces;

use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;

interface AdaptiveResponseControllerInterface
{
    /**
     * See into AdaptiveResponseControllerTrait for implementation.
     */
    public function adaptiveRender(
        string $view,
        array $parameters = [],
        Response $response = null
    ): ?Response;

    public function getEnvironment(): Environment;
}
