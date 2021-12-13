<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Controller\AbstractController;
use App\Wex\BaseBundle\Helper\ColorSchemeHelper;
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
        $parameters =
            [
                'document_head_title' => '@page::page_title',
                'document_head_title_args' => [],
                'layout_name' => null,
                'layout_theme' => ColorSchemeHelper::SCHEME_DEFAULT,
                'layout_use_js' => $controller->templateUseJs,
                'page_path' => $view,
                'page_title' => '@page::page_title',
                'request_uri' => $controller->requestUri,
                'render_request_id' => $this->getRenderRequestId(),
            ] + $parameters;
    }
}
