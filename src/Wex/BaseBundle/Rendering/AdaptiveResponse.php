<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Controller\AbstractController;
use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use App\Wex\BaseBundle\WexBaseBundle;
use Exception;
use JetBrains\PhpStorm\Pure;
use function in_array;
use function is_null;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class AdaptiveResponse
{
    public const BASE_MODAL = VariableHelper::MODAL;

    public const BASE_PAGE = VariableHelper::PAGE;

    public const BASE_DEFAULT = VariableHelper::DEFAULT;

    public const BASES_MAIN_DIR = WexBaseBundle::WEX_BUNDLE_PATH_TEMPLATES.'bases/';

    public const OUTPUT_TYPE_RESPONSE_HTML = VariableHelper::HTML;

    public const OUTPUT_TYPE_RESPONSE_JSON = VariableHelper::JSON;

    public const RENDER_PARAM_NAME_BASE = 'adaptive_base';

    public const RENDER_PARAM_NAME_OUTPUT_TYPE = 'adaptive_output_type';

    private string $body;

    private string $outputType;

    private string $renderingBase;

    private array $parameters = [];

    private RenderPass $renderPass;

    private ?string $view = null;

    protected array $allowedBases = [
        self::BASE_MODAL,
        self::BASE_PAGE,
        self::BASE_DEFAULT,
    ];

    public function __construct(
        protected Request $request,
        protected AbstractController $controller,
        protected AdaptiveResponseService $adaptiveResponseService,
    )
    {
        $this->setOutputType(
            $this->detectOutputType()
        );
        $this->setRenderingBase(
            $this->detectRenderingBase()
        );
    }

    public function setRenderPass(RenderPass $renderPass)
    {
        $this->renderPass = $renderPass;
    }

    public function setOutputType(string $type): self
    {
        $this->outputType = $type;

        return $this;
    }

    public function getRenderingBase(): string
    {
        return $this->renderingBase;
    }

    public function setRenderingBase(string $base): self
    {
        $this->renderingBase = $base;

        return $this;
    }

    #[Pure]
    public function getRenderingBasePath(array $twigContext): string
    {
        return self::BASES_MAIN_DIR
            .$this->getOutputType($twigContext)
            .FileHelper::FOLDER_SEPARATOR
            .$this->getRenderingBase()
            .TemplateHelper::TEMPLATE_FILE_EXTENSION;
    }

    /**
     * Return detected output type if not overridden in twig.
     * @param array $twigContext
     * @return string
     */
    public function getOutputType(array $twigContext = []): string
    {
        return $twigContext[self::RENDER_PARAM_NAME_OUTPUT_TYPE]
            ?? $this->outputType;
    }

    public function detectRenderingBase(): string
    {
        // Allow defining json layout expected type from query string.
        $layout = $this->request->get(self::RENDER_PARAM_NAME_BASE);

        // Layout not specified in query string.
        if (is_null($layout) && $this->request->isXmlHttpRequest())
        {
            // Use modal as default ajax layout, but might be configurable.
            $layout = self::BASE_MODAL;
        }

        if (in_array($layout, $this->allowedBases))
        {
            return $layout;
        }

        return self::BASE_DEFAULT;
    }

    public function getView(): ?string
    {
        return $this->view;
    }

    public function setView(
        string $view,
        $parameters = null
    ): self
    {
        $this->view = $view;

        if ($parameters)
        {
            $this->setParameters($parameters);
        }

        return $this;
    }

    public function setParameters(array $parameters): self
    {
        $this->parameters = $parameters;

        return $this;
    }

    public function detectOutputType(): string
    {
        return $this->request->isXmlHttpRequest() ?
            self::OUTPUT_TYPE_RESPONSE_JSON : self::OUTPUT_TYPE_RESPONSE_HTML;
    }

    public function getBody(): ?string
    {
        return $this->body;
    }

    public function setBody(?string $body = null): AdaptiveResponse
    {
        $this->body = $body;

        return $this;
    }

    /**
     * @throws Exception
     */
    public function render(): Response
    {
        if ($this->getOutputType() === self::OUTPUT_TYPE_RESPONSE_JSON)
        {
            return $this->renderJson();
        }

        return $this->renderHtml();
    }

    /**
     * @throws Exception
     */
    public function renderHtml(): Response
    {
        return $this->renderResponse();
    }

    /**
     * @throws Exception
     */
    public function renderJson(): JsonResponse
    {
        $this->renderPass->layoutRenderNode->page->body = $this->renderResponse()->getContent();

        $response = new JsonResponse(
            $this->renderPass->layoutRenderNode->toRenderData()
        );

        // Prevents browser to display json response when
        // clicking on back button.
        $response->headers->set('Vary', 'Accept');

        return $response;
    }

    /**
     * @throws Exception
     */
    public function renderResponse(): Response
    {
        $view = $this->getView();

        if (!$view)
        {
            throw new Exception('View must be defined before adaptive rendering');
        }

        $parameters = [
            AdaptiveResponse::RENDER_PARAM_NAME_OUTPUT_TYPE => $this->detectOutputType(),
            AdaptiveResponse::RENDER_PARAM_NAME_BASE => $this->detectOutputType(),
        ];

        return $this->controller->adaptiveRender(
            $view,
            $parameters
        );
    }
}
