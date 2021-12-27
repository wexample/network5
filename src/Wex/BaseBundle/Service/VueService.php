<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Helper\DomHelper;
use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Rendering\Vue;
use Exception;
use Twig\Environment;

class VueService
{
    public array $renderedTemplates = [];

    public array $rootComponents = [];

    public function __construct(
        private AdaptiveResponseService $adaptiveResponseService,
        protected AssetsService $assetsService,
        private ComponentService $componentsService,
    ) {
    }

    /**
     * @throws Exception
     */
    public function vueRender(
        Environment $twig,
        string $path,
        ?array $attributes = [],
        ?array $twigContext = [],
        ?bool $root = false
    ): string {
        $vue = new Vue(
            $path,
        );

        $pathTemplate = $vue->findTemplate($twig);

        $renderPass = $this->adaptiveResponseService->renderPass;

        $attributes['class'] ??= '';
        $attributes['class'] .= ' '.$vue->id;

        $context = [
            'path' => $vue->path,
            'vueComId' => $vue->id,
            'vueComName' => $vue->name,
            'attrs' => $attributes,
        ];

        $outputBody = '';
        if ($root)
        {
            $rootComponent = $this
                ->componentsService
                ->registerComponent(
                    $twig,
                    ComponentService::COMPONENT_NAME_VUE,
                    ComponentService::INIT_MODE_PARENT,
                    $context
                );

            $this->rootComponents[$vue->name] = $rootComponent;

            $outputBody = $rootComponent->renderTag();
        }
        else
        {
            $rootComponent = $renderPass->getCurrentContextRenderNode();

            $contextCurrent = RenderingHelper::buildRenderContextKey(
                RenderingHelper::CONTEXT_COMPONENT,
                ComponentService::COMPONENT_NAME_VUE
            );

            if ($rootComponent->getContextRenderNodeKey() !== $contextCurrent)
            {
                throw new Exception('Trying to render a non-root vue outside the vue context. Current context is '.$contextCurrent);
            }
        }

        // Append assets to root vue component.
        $this
            ->assetsService
            ->assetsDetect(
                $vue->path,
                $rootComponent,
                $rootComponent->assets
            );

        if (!isset($this->renderedTemplates[$vue->name]))
        {
            $renderPass->setCurrentContextRenderNode(
                $rootComponent
            );

            $template = DomHelper::buildTag(
                'template',
                [
                    'class' => 'vue vue-loading',
                    'id' => 'vue-template-'.$vue->name,
                ],
                $twig->render(
                    $pathTemplate,
                    $twigContext + $context
                )
            );

            $renderPass->revertCurrentContextRenderNode();

            $this->renderedTemplates[$vue->name] = $template;
        }

        if ($this->adaptiveResponseService->getResponse()->isJsonRequest())
        {
            $renderPass->layoutRenderNode->vueTemplates = $this->renderedTemplates;
        }

        return DomHelper::buildTag(
            $vue->name,
            [
                'class' => $vue->id,
            ],
            $outputBody
        );
    }
}
