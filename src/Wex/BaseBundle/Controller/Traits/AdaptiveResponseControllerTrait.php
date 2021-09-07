<?php

namespace App\Wex\BaseBundle\Controller\Traits;

use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;

trait AdaptiveResponseControllerTrait
{
    /**
     * As adaptive response plays with controller rendering,
     * we should create a way to execute render from outside
     * using this public method.
     */
    public function adaptiveRender(
        string   $view,
        array    $parameters = [],
        Response $response = null
    ): ?Response
    {
        return parent::render($view, $parameters, $response);
    }

    public function getEnvironment(): Environment
    {
        return $this->container->get('twig');
    }
}
