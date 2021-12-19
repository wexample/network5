<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Controller\AbstractController;
use App\Wex\BaseBundle\Rendering\AdaptiveResponse;
use App\Wex\BaseBundle\Rendering\RenderPass;
use Symfony\Component\HttpKernel\KernelInterface;
use function is_null;
use Symfony\Component\HttpFoundation\RequestStack;

class AdaptiveResponseService
{
    private ?AbstractController $controller = null;

    private ?AdaptiveResponse $currentResponse = null;

    public RenderPass $renderPass;

    public function __construct(
        private RequestStack $requestStack,
        private KernelInterface $kernel,
    )
    {
    }

    public function renderPrepare(
        string $pageName,
        array &$parameters = []
    )
    {
        // Response may be explicitly created in controller,
        // but if not we need at least one to detect layout base name.
        if (!$this->getResponse())
        {
            $this->createResponse($this->controller);
        }

        $this->renderPass = new RenderPass(
            $this->requestStack->getMainRequest(),
            $this->getResponse(),
            $pageName,
            is_null($this->requestStack->getMainRequest()->get('no_js'))
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
    ): self
    {
        $this->controller = $controller;

        return $this;
    }

    public function getController(): ?AbstractController
    {
        return $this->controller;
    }
}
