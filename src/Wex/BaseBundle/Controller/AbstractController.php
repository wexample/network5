<?php

namespace App\Wex\BaseBundle\Controller;

use App\Wex\BaseBundle\Controller\Interfaces\AdaptiveResponseControllerInterface;
use App\Wex\BaseBundle\Controller\Traits\AdaptiveResponseControllerTrait;
use App\Wex\BaseBundle\Twig\TemplateExtension;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;

abstract class AbstractController extends
    \Symfony\Bundle\FrameworkBundle\Controller\AbstractController implements AdaptiveResponseControllerInterface
{
    /* Set methods for adaptive rendering. */
    use AdaptiveResponseControllerTrait;

    protected bool $templateNoJs;

    protected string $requestUri;

    public function __construct(
        protected RequestStack $requestStack
    )
    {
        $mainRequest = $this->requestStack->getMainRequest();

        $this->templateNoJs = !is_null($mainRequest->get('no_js'));
        $this->requestUri = $mainRequest->getRequestUri();
    }

    public function renderPage(
        string $view,
        array $parameters = [],
        Response $response = null
    ): Response
    {
        // Add global variables for rendering.
        $parameters['layout_no_js'] = $parameters['layout_no_js'] ?? $this->templateNoJs;
        $parameters['request_uri'] = $parameters['request_uri'] ?? $this->requestUri;

        return parent::render(
            'pages/'.$view
            .TemplateExtension::TEMPLATE_FILE_EXTENSION,
            $parameters,
            $response
        );
    }
}
