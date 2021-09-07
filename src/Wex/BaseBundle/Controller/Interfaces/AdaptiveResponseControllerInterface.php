<?php

namespace App\Wex\BaseBundle\Controller\Interfaces;

use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;

interface AdaptiveResponseControllerInterface
{
    /**
     * See into AdaptiveResponseControllerTrait for implementation.
     *
     * @param \Symfony\Component\HttpFoundation\Response|null $response
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function adaptiveRender(
        string $view,
        array $parameters = [],
        Response $response = null
    );

    public function getEnvironment(): Environment;
}
