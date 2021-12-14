<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\RenderDataAjax;
use App\Wex\BaseBundle\Rendering\RenderDataInitialLayout;
use App\Wex\BaseBundle\Rendering\RenderDataLayout;
use App\Wex\BaseBundle\Rendering\RenderDataPage;
use App\Wex\BaseBundle\Service\AssetsService;
use App\Wex\BaseBundle\Service\RenderingService;
use App\Wex\BaseBundle\Service\TemplateService;
use Exception;
use function str_ends_with;
use function strlen;
use function substr;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig\Environment;
use Twig\TwigFunction;

class TemplateExtension extends AbstractExtension
{
    public const LAYOUT_NAME_DEFAULT = VariableHelper::DEFAULT;

    public const RENDERING_BASE_NAME_DEFAULT = VariableHelper::DEFAULT;

    public const RENDERING_BASE_NAME_MODAL = VariableHelper::MODAL;

    protected const VAR_RENDER_REQUEST_ID = 'renderRequestId';

    protected const VAR_TRANSLATIONS_DOMAIN_SEPARATOR = VariableHelper::TRANSLATIONS.'DomainSeparator';

    public function __construct(
        protected AssetsService $assetsService,
        private RenderingService $renderingService,
        private TemplateService $templateService
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'page_name_from_path',
                [
                    $this,
                    'pageNameFromPath',
                ]
            ),
            new TwigFunction(
                'page_name_from_route',
                [$this, 'templateBuildPathFromRoute']
            ),
        ];
    }

    /**
     * @throws Exception
     */
    public function templateBuildAjaxRenderData(
        Environment $env,
        string $pageTemplateName,
        string $body
    ): RenderDataAjax
    {
        /** @var ComponentsExtension $comExtension */
        $comExtension = $env->getExtension(
            ComponentsExtension::class
        );

        $templates = $comExtension->componentRenderLayout($env);

        $renderData = new RenderDataAjax();

        $this->templateBuildLayoutRenderData($renderData
            , $env, $pageTemplateName);

        $renderData->page->body =
            $body;
        $renderData->assets =
            $this->assetsService->assetsFiltered(RenderingHelper::CONTEXT_AJAX);
        $renderData->components =
            $comExtension->buildRenderData(RenderingHelper::CONTEXT_AJAX);
        $renderData->templates = $templates;

        return $renderData;
    }

    public function templateBuildPageRenderData(
        RenderDataPage $renderData,
        Environment $env,
        string $pageName
    ): RenderDataPage {
        /** @var ComponentsExtension $comExtension */
        $comExtension = $env->getExtension(
            ComponentsExtension::class
        );
        /** @var TranslationExtension $translationExtension */
        $translationExtension = $env->getExtension(
            TranslationExtension::class
        );
        /** @var JsExtension $jsExtension */
        $jsExtension = $env->getExtension(
            JsExtension::class
        );

        $renderData->init(
            $this->renderingService->getRenderRequestId(),
            $pageName
        );

        $renderData->components =
            $comExtension->buildRenderData(
                RenderingHelper::CONTEXT_PAGE
            );
        $renderData->translations =
            $translationExtension->buildRenderData();
        $renderData->vars =
            $jsExtension->jsVarsGet(
                JsExtension::VARS_GROUP_PAGE
            );

        return $renderData;
    }

    public function templateBuildPathFromRoute(string $route): string
    {
        return $this->templateService->buildTemplatePathFromClassPath(
            $this->templateService->getMethodClassPathFromRouteName(
                $route
            )
        );
    }

    public function templateBuildLayoutRenderData(
        RenderDataLayout $renderData,
        Environment $env,
        string $pageTemplateName = null
    ): RenderDataLayout
    {
        /** @var JsExtension $jsExtension */
        $jsExtension = $env->getExtension(
            JsExtension::class
        );
        /** @var TranslationExtension $translationExtension */
        $translationExtension = $env->getExtension(
            TranslationExtension::class
        );

        $renderData->page = $pageTemplateName
            ? $this->templateBuildPageRenderData(
                $renderData->page,
                $env,
                $pageTemplateName
            ) : null;

        $renderData->translations = $translationExtension->buildRenderData();

        $renderData->vars = $jsExtension
            ->jsVarsGet(
                JsExtension::VARS_GROUP_GLOBAL
            );

        return $renderData;
    }

    public function pageNameFromPath(string $templatePath): string
    {
        // Define template name.
        $ext = TemplateHelper::TEMPLATE_FILE_EXTENSION;

        // Path have extension.
        if (str_ends_with($templatePath, $ext))
        {
            return substr(
                $templatePath,
                0,
                -strlen(TemplateHelper::TEMPLATE_FILE_EXTENSION)
            );
        }

        return $templatePath;
    }
}
