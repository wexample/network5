<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Controller\AbstractController;
use App\Wex\BaseBundle\Helper\ColorSchemeHelper;
use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\ComponentContext;
use App\Wex\BaseBundle\Rendering\RenderDataInitialLayout;
use Symfony\Component\HttpKernel\KernelInterface;
use function uniqid;

class RenderingService
{
    public const VAR_RENDER_REQUEST_ID = 'renderRequestId';

    protected string $currentRequestId;

    public RenderDataInitialLayout $layoutInitialData;

    protected array $contextsStack;

    public function __construct(
        protected KernelInterface $kernel,
        protected AssetsService $assetsService
    )
    {
        $this->createRenderRequestId();
    }

    public function setContext(
        string $renderingContext,
        ?string $name,
    )
    {
        $this->contextsStack[] = new ComponentContext(
            $renderingContext,
            $name ?: VariableHelper::DEFAULT,
        );
    }

    public function getContext(): ComponentContext
    {
        return end($this->contextsStack);
    }

    public function revertContext(): void
    {
        array_pop($this->contextsStack);
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
        $this->setContext(
            RenderingHelper::CONTEXT_LAYOUT,
            null
        );

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

        $this->layoutInitialData = new RenderDataInitialLayout(
            $this->kernel->getEnvironment()
        );
    }
}
