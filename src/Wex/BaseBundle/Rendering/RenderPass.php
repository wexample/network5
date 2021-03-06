<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Helper\ColorSchemeHelper;
use App\Wex\BaseBundle\Helper\PageHelper;
use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Rendering\RenderNode\AjaxLayoutRenderNode;
use App\Wex\BaseBundle\Rendering\RenderNode\InitialLayoutRenderNode;
use App\Wex\BaseBundle\Rendering\RenderNode\RenderNode;
use function array_pop;
use function end;
use Symfony\Component\HttpFoundation\Request;
use function uniqid;

class RenderPass
{
    private string $currentRequestId;

    public InitialLayoutRenderNode|AjaxLayoutRenderNode $layoutRenderNode;

    protected array $contextRenderNodeRegistry = [];

    protected array $contextRenderNodeStack = [];

    protected RenderNode $renderDataContextCurrent;

    public array $registry = [
        RenderingHelper::CONTEXT_COMPONENT => [],
        RenderingHelper::CONTEXT_PAGE => [],
        RenderingHelper::CONTEXT_LAYOUT => [],
        RenderingHelper::CONTEXT_VUE => [],
    ];

    public string $pageName;

    public function __construct(
        public AdaptiveResponse $adaptiveResponse,
        private bool $enableAggregation,
        private Request $request,
        public bool $useJs,
        public string $view,
    ) {
        $this->pageName = PageHelper::pageNameFromPath($this->view);

        $this->createRenderRequestId();

        $this->adaptiveResponse->setRenderPass($this);
    }

    public function prepare(
        &$parameters,
        string $env,
    ) {
        $className = InitialLayoutRenderNode::class;

        if ($this->adaptiveResponse->getOutputType() === AdaptiveResponse::OUTPUT_TYPE_RESPONSE_JSON)
        {
            $className = AjaxLayoutRenderNode::class;
        }

        $this->layoutRenderNode = new $className(
            $this,
            $this->useJs,
            $env
        );

        // Add global variables for rendering.
        $parameters =
            [
                'document_head_title' => '@page::page_title',
                'document_head_title_args' => [],
                'layout_name' => null,
                'layout_color_scheme' => ColorSchemeHelper::SCHEME_DEFAULT,
                'layout_animation' => null,
                'layout_shape' => null,
                'layout_use_js' => $this->useJs,
                'page_name' => $this->pageName,
                'page_path' => $this->view,
                'page_title' => '@page::page_title',
                'render_pass' => $this,
                'request_uri' => $this->request->getRequestUri(),
            ] + $parameters;
    }

    public function registerRenderNode(
        RenderNode $renderNode
    ) {
        $this->registry[$renderNode->getContextType()][$renderNode->name] = $renderNode;
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

    public function getEnableAggregation(): bool
    {
        return $this->enableAggregation;
    }

    public function registerContextRenderNode(
        RenderNode $renderNode
    ) {
        $this->contextRenderNodeRegistry[$renderNode->getContextRenderNodeKey()] = $renderNode;
    }

    public function setCurrentContextRenderNode(
        RenderNode $renderNode
    ) {
        $this->setCurrentContextRenderNodeByTypeAndName(
            $renderNode->getContextType(),
            $renderNode->name
        );
    }

    public function setCurrentContextRenderNodeByTypeAndName(
        string $renderNodeType,
        string $renderNodeName
    ) {
        $key = RenderingHelper::buildRenderContextKey(
            $renderNodeType,
            $renderNodeName
        );

        $this->contextRenderNodeStack[] = $this->contextRenderNodeRegistry[$key];
    }

    public function getCurrentContextRenderNode(): ?RenderNode
    {
        return empty($this->contextRenderNodeStack) ? null : end($this->contextRenderNodeStack);
    }

    public function revertCurrentContextRenderNode(): void
    {
        array_pop($this->contextRenderNodeStack);
    }
}
