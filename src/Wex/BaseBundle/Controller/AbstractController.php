<?php

namespace App\Wex\BaseBundle\Controller;

use App\Wex\BaseBundle\Controller\Interfaces\AdaptiveResponseControllerInterface;
use App\Wex\BaseBundle\Controller\Traits\AdaptiveResponseControllerTrait;
use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;

abstract class AbstractController extends \Symfony\Bundle\FrameworkBundle\Controller\AbstractController implements AdaptiveResponseControllerInterface
{
    /* Set methods for adaptive rendering. */
    use AdaptiveResponseControllerTrait;

    public function __construct(
        protected AdaptiveResponseService $adaptiveResponse,
        protected Environment $twigEnvironment
    )
    {
        $this->adaptiveResponse->setController($this);
    }

    /**
     * As adaptive response plays with controller rendering,
     * we should create a way to execute render from outside
     * using this public method.
     */
    public function adaptiveRender(
        string $view,
        array $parameters = [],
        Response $response = null
    ): ?Response
    {
        return parent::render($view, $parameters, $response);
    }

    public function getTwigEnvironment(): Environment
    {
        return $this->twigEnvironment;
    }
}
