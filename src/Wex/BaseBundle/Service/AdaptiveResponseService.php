<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Controller\AbstractController;
use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\AdaptiveResponse;
use App\Wex\BaseBundle\Twig\ComponentsExtension;
use App\Wex\BaseBundle\Twig\TemplateExtension;
use Exception;
use function in_array;
use function is_null;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use function trim;

class AdaptiveResponseService
{
    public const LAYOUT_MODAL = VariableHelper::MODAL;

    public const LAYOUT_PAGE = VariableHelper::PAGE;

    protected array $allowedJsonLayout = [
        self::LAYOUT_MODAL,
        self::LAYOUT_PAGE,
    ];

    public const OUTPUT_TYPE_RESPONSE_HTML = 'html';

    public const OUTPUT_TYPE_RESPONSE_JSON = 'json';

    public const RENDER_PARAM_NAME_OUTPUT_TYPE = 'adaptive_output_type';

    public const RENDER_PARAM_NAME_BASE = 'adaptive_base';

    /**
     * array.
     */
    private array $callbacks = [
        self::OUTPUT_TYPE_RESPONSE_JSON => [],
        self::OUTPUT_TYPE_RESPONSE_HTML => [],
    ];

    private ?AbstractController $currentController = null;

    private array $parameters = [];

    private ?string $view = null;

    private ?string $body = null;

    private ?string $outputTypeForced = null;

    private ?AdaptiveResponse $currentResponse = null;

    public function __construct(private RequestStack $requestStack)
    {
    }

    /**
     * @throws Exception
     */
    public function render(string $body = null): Response
    {
        if ($body)
        {
            $this->setBody($body);
        }

        $type = $this->detectOutputType();

        foreach ($this->callbacks[$type] as $callback)
        {
            $result = $callback();
            if ($result instanceof Response)
            {
                return $result;
            }
        }

        if (self::OUTPUT_TYPE_RESPONSE_JSON === $type)
        {
            if ($this->detectRenderingBase() === TemplateExtension::RENDERING_BASE_NAME_MODAL)
            {
                $env = $this->getController()->getTwigEnvironment();

                /** @var ComponentsExtension $comExt */
                $comExt = $env->getExtension(
                    ComponentsExtension::class
                );

                $comExt->setContext(
                    RenderingHelper::CONTEXT_AJAX,
                    null
                );

                $comExt->comInitLayout('components/modal', [
                    'adaptiveResponseBodyDestination' => true,
                ]);
            }

            return $this->renderJson();
        }

        return $this->renderHtml();
    }

    public function detectOutputType(): string
    {
        if ($this->outputTypeForced)
        {
            return $this->outputTypeForced;
        }

        return $this->requestStack->getMainRequest()->isXmlHttpRequest() ?
            self::OUTPUT_TYPE_RESPONSE_JSON : self::OUTPUT_TYPE_RESPONSE_HTML;
    }

    public function detectRenderingBase(): string
    {
        $request = $this->requestStack->getCurrentRequest();

        // Allow defining json layout expected type from query string.
        $layout = $request->get('_template_base');

        // Layout not specified in query string.
        if (is_null($layout) && $request->isXmlHttpRequest())
        {
            // Use modal as default ajax layout, but might be configurable.
            $layout = self::LAYOUT_MODAL;
        }

        if (in_array($layout, $this->allowedJsonLayout))
        {
            return $layout;
        }

        return TemplateExtension::RENDERING_BASE_NAME_DEFAULT;
    }

    /**
     * @throws Exception
     */
    public function renderJson(): JsonResponse
    {
        $response = new JsonResponse($this->buildRenderData());

        // Prevents browser to display json response when
        // clicking on back button.
        $response->headers->set('Vary', 'Accept');

        return $response;
    }

    /**
     * @throws Exception
     */
    public function buildRenderData(): array
    {
        $env = $this->getController()->getTwigEnvironment();

        /** @var TemplateExtension $templateExtension */
        $templateExtension = $env->getExtension(
            TemplateExtension::class
        );

        $body = $this->getView()
            ? $this->renderResponse()->getContent()
            : $this->getBody();

        // Allow to use a rendered vue as a component loader,
        // but returning an empty body.
        $body = trim($body);

        return $templateExtension->templateBuildAjaxRenderData(
            $env,
            $templateExtension->templateNameFromPath($this->getView()),
            $body
        );
    }

    public function getController(): ?AbstractController
    {
        return $this->currentController;
    }

    public function getView(): ?string
    {
        return $this->view;
    }

    public function setView(
        string $view,
        $parameters = null
    ): self {
        $this->view = $view;

        if ($parameters)
        {
            $this->setParameters($parameters);
        }

        return $this;
    }

    /**
     * @throws Exception
     */
    public function renderResponse(): Response
    {
        $controller = $this->getController();

        $view = $this->getView();

        if (!$view)
        {
            throw new Exception('View must be defined before adaptive rendering');
        }

        $parameters = [
            self::RENDER_PARAM_NAME_OUTPUT_TYPE => $this->detectOutputType(),
            self::RENDER_PARAM_NAME_BASE => $this->detectOutputType(),
        ];

        return $controller->adaptiveRender(
            $view,
            $parameters
        );
    }

    public function getParameters(): array
    {
        return $this->parameters;
    }

    public function setParameters(array $parameters): self
    {
        $this->parameters = $parameters;

        return $this;
    }

    public function getBody(): ?string
    {
        return $this->body;
    }

    public function setBody(?string $body = null)
    {
        $this->body = $body;
    }

    public function setOutputType(string $type): self
    {
        $this->outputTypeForced = $type;

        return $this;
    }

    /**
     * @throws Exception
     */
    public function renderHtml(): Response
    {
        return $this->renderResponse();
    }

    public function setController(
        AbstractController $controller
    ): self {
        $this->currentController = $controller;

        return $this;
    }

    public function onHtml(callable $callback): self
    {
        $this->callbacks[self::OUTPUT_TYPE_RESPONSE_HTML][] = $callback;

        return $this;
    }

    public function onJson(callable $callback): self
    {
        $this->callbacks[self::OUTPUT_TYPE_RESPONSE_JSON][] = $callback;

        return $this;
    }

    public function getCurrentResponse(): AdaptiveResponse
    {
        if (!$this->currentResponse)
        {
            $this->createResponse();
        }

        return $this->currentResponse;
    }

    public function createResponse(): AdaptiveResponse
    {
        $response = new AdaptiveResponse();
        $this->currentResponse = $response;

        return $response;
    }
}
