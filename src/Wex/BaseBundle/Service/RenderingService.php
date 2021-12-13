<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Controller\AbstractController;
use function uniqid;

class RenderingService
{
    public const VAR_RENDER_REQUEST_ID = 'renderRequestId';

    protected string $currentRequestId;

    public function __construct()
    {
        $this->createRenderRequestId();
    }

    public function createRenderRequestId(): string
    {
        $this->currentRequestId = uniqid();

        return $this->getRenderRequestId();
    }

    public function getRenderRequestId(): string
    {
        return $this->currentRequestId;
    }

    public function renderPrepare(
        AbstractController $controller,
        string $view,
        array &$parameters
    )
    {
        // Add global variables for rendering.
        $parameters['layout_use_js'] ??= $controller->templateUseJs;
        $parameters['page_path'] = $view;
        $parameters['request_uri'] ??= $controller->requestUri;
    }
}
