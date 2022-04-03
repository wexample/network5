<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Controller\AbstractController;
use App\Wex\BaseBundle\Helper\ColorSchemeHelper;
use App\Wex\BaseBundle\Rendering\AdaptiveResponse;
use App\Wex\BaseBundle\Rendering\RenderPass;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\KernelInterface;

class AdaptiveResponseService
{
    public const EVENT_METHODS_PREFIX = 'renderEvent';

    public const EVENT_NAME_POST_RENDER = 'PostRender';

    public const RENDER_OPTION_COLOR_SCHEME = 'render_option_color_scheme';

    public const RENDER_OPTION_ENABLE_AGGREGATION = 'render_option_enable_aggregation';

    public const RENDER_OPTION_ENABLE_JAVASCRIPT = 'render_option_enable_javascript';

    private ?AbstractController $controller = null;

    private ?AdaptiveResponse $currentResponse = null;

    private array $renderEventListeners = [];

    public RenderPass $renderPass;

    public bool $enableAggregation;

    public function __construct(
        private RequestStack $requestStack,
        private KernelInterface $kernel,
    ) {
    }

    public function renderPrepare(
        string $view,
        array &$parameters = []
    ) {
        // Response may be explicitly created in controller,
        // but if not we need at least one to detect layout base name.
        if (!$this->getResponse())
        {
            $this->createResponse($this->controller);
        }

        $this->renderPass = new RenderPass(
            $this->getResponse(),
            $this->requestStack->getMainRequest(),
            $view,
            $parameters[AdaptiveResponseService::RENDER_OPTION_ENABLE_AGGREGATION] ?? true,
            $parameters[AdaptiveResponseService::RENDER_OPTION_ENABLE_JAVASCRIPT] ?? true,
            $parameters[AdaptiveResponseService::RENDER_OPTION_COLOR_SCHEME] ?? ColorSchemeHelper::SCHEME_DEFAULT,
        );

        $this->renderPass->prepare(
            $parameters,
            $this->kernel->getEnvironment()
        );
    }

    public function createResponse(AbstractController $controller): AdaptiveResponse
    {
        $this->currentResponse = new AdaptiveResponse(
            $this->requestStack->getMainRequest(),
            $controller,
            $this
        );

        return $this->getResponse();
    }

    public function getResponse(): ?AdaptiveResponse
    {
        return $this->currentResponse;
    }

    public function setController(
        AbstractController $controller
    ): self {
        $this->controller = $controller;

        return $this;
    }

    public function getController(): ?AbstractController
    {
        return $this->controller;
    }

    public function addRenderEventListener(object $service)
    {
        $this->renderEventListeners[] = $service;
    }

    public function triggerRenderEvent(
        string $eventName,
        array &$options = []): array
    {
        $eventName = AdaptiveResponseService::EVENT_METHODS_PREFIX.ucfirst($eventName);

        foreach ($this->renderEventListeners as $service)
        {
            if (method_exists($service, $eventName))
            {
                $service->$eventName($options);
            }
        }

        return $options;
    }
}
