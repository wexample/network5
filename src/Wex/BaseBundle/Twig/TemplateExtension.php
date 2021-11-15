<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\Asset;
use App\Wex\BaseBundle\Service\RenderingService;
use App\Wex\BaseBundle\Service\TemplateService;
use App\Wex\BaseBundle\Translation\Translator;
use Exception;
use function array_merge_recursive;
use Doctrine\DBAL\Types\Types;
use JetBrains\PhpStorm\ArrayShape;
use function str_ends_with;
use function strlen;
use function substr;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig\Environment;
use Twig\TwigFunction;

class TemplateExtension extends AbstractExtension
{
    public const TEMPLATE_FILE_EXTENSION = '.html.twig';

    public const LAYOUT_NAME_DEFAULT = VariableHelper::DEFAULT;

    public const RENDERING_BASE_NAME_DEFAULT = VariableHelper::DEFAULT;

    public const RENDERING_BASE_NAME_MODAL = VariableHelper::MODAL;

    protected const VAR_RENDER_REQUEST_ID = 'renderRequestId';

    protected const VAR_TRANSLATIONS_DOMAIN_SEPARATOR = VariableHelper::TRANSLATIONS.'DomainSeparator';

    public function __construct(
        private KernelInterface $kernel,
        private RenderingService $renderingService,
        private TemplateService $templateService
    )
    {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'template_name_from_path',
                [
                    $this,
                    'templateNameFromPath',
                ]
            ),
            new TwigFunction(
                'template_build_initial_layout_render_data',
                [
                    $this,
                    'templateBuildInitialLayoutRenderData',
                ],
                [
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                ]
            ),
            new TwigFunction(
                'template_build_path_from_route',
                [$this, 'templateBuildPathFromRoute']
            ),
        ];
    }

    public function templateBuildInitialLayoutRenderData(
        Environment $env,
        string $pageTemplateName,
        string $layoutTheme
    ): array
    {
        /** @var AssetsExtension $assetsExtension */
        $assetsExtension = $env->getExtension(
            AssetsExtension::class
        );
        /** @var ComponentsExtension $comExtension */
        $comExtension = $env->getExtension(
            ComponentsExtension::class
        );

        return array_merge_recursive(
            $this->templateBuildRenderData($env, $pageTemplateName),
            [
                VariableHelper::ASSETS => $assetsExtension->buildRenderData(RenderingHelper::CONTEXT_LAYOUT),
                VariableHelper::PLURAL_COMPONENT => $comExtension->buildRenderData(RenderingHelper::CONTEXT_LAYOUT),
                'displayBreakpoints' => AssetsExtension::DISPLAY_BREAKPOINTS,
                VariableHelper::PAGE => [
                    'isLayoutPage' => true,
                ],
                VariableHelper::ENV => $this->kernel->getEnvironment(),
                VariableHelper::THEME => $layoutTheme,
            ]
        );
    }

    /**
     * @throws Exception
     */
    public function templateBuildAjaxRenderData(
        Environment $env,
        string $pageTemplateName,
        string $body
    ): array
    {
        /** @var AssetsExtension $assetsExtension */
        $assetsExtension = $env->getExtension(
            AssetsExtension::class
        );
        /** @var ComponentsExtension $comExtension */
        $comExtension = $env->getExtension(
            ComponentsExtension::class
        );

        $templates = $comExtension->comRenderLayout($env);

        return array_merge_recursive(
            $this->templateBuildRenderData($env, $pageTemplateName),
            [
                VariableHelper::PLURAL_COMPONENT => $comExtension->buildRenderData(RenderingHelper::CONTEXT_AJAX),
                VariableHelper::ASSETS => $assetsExtension->buildRenderData(RenderingHelper::CONTEXT_AJAX),
                VariableHelper::PAGE => [
                    VariableHelper::BODY => $body,
                ],
                VariableHelper::PLURAL_TEMPLATE => $templates
            ]
        );
    }

    #[ArrayShape(
        [
            VariableHelper::ASSETS => Asset::class."[][][]|array[]|\array[][]",
            VariableHelper::NAME => Types::STRING,
            VariableHelper::PLURAL_COMPONENT => Types::ARRAY,
            VariableHelper::TRANSLATIONS => Types::ARRAY,
            VariableHelper::VARS => Types::ARRAY,
        ]
    )]
    public function templateBuildPageRenderData(
        Environment $env,
        string $pageName
    ): array
    {
        /** @var AssetsExtension $assetsExtension */
        $assetsExtension = $env->getExtension(
            AssetsExtension::class
        );
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

        return [
            VariableHelper::ASSETS => $assetsExtension->buildRenderData(RenderingHelper::CONTEXT_PAGE),
            VariableHelper::NAME => $pageName,
            VariableHelper::PLURAL_COMPONENT => $comExtension->buildRenderData(RenderingHelper::CONTEXT_PAGE),
            self::VAR_RENDER_REQUEST_ID => $this->renderingService->getRenderRequestId(),
            VariableHelper::TRANSLATIONS => $translationExtension->buildRenderData(),
            VariableHelper::VARS => $jsExtension->jsVarsGet(JsExtension::VARS_GROUP_PAGE),
        ];
    }

    public function templateBuildPathFromRoute(string $route): string
    {
        return $this->templateService->buildTemplatePathFromClassPath(
            $this->templateService->getMethodClassPathFromRouteName(
                $route
            )
        );
    }

    #[ArrayShape([
        VariableHelper::EVENTS => Types::ARRAY,
        VariableHelper::PAGE => Types::ARRAY.'|'.VariableHelper::NULL,
        self::VAR_TRANSLATIONS_DOMAIN_SEPARATOR => Types::STRING,
        VariableHelper::TRANSLATIONS => Types::ARRAY,
        VariableHelper::VARS => Types::ARRAY,
    ])]
    public function templateBuildRenderData(
        Environment $env,
        string $pageTemplateName = null
    ): array
    {
        /** @var JsExtension $jsExtension */
        $jsExtension = $env->getExtension(
            JsExtension::class
        );
        /** @var TranslationExtension $translationExtension */
        $translationExtension = $env->getExtension(
            TranslationExtension::class
        );

        return [
            VariableHelper::EVENTS => [],
            VariableHelper::PAGE => $pageTemplateName
                ? $this->templateBuildPageRenderData(
                    $env,
                    $pageTemplateName
                ) : null,
            self::VAR_RENDER_REQUEST_ID => $this->renderingService->getRenderRequestId(),
            VariableHelper::TRANSLATIONS => $translationExtension->buildRenderData(),
            self::VAR_TRANSLATIONS_DOMAIN_SEPARATOR => Translator::DOMAIN_SEPARATOR,
            VariableHelper::VARS => $jsExtension->jsVarsGet(JsExtension::VARS_GROUP_GLOBAL),
        ];
    }

    public function templateNameFromPath(string $templatePath): string
    {
        // Define template name.
        $ext = TemplateExtension::TEMPLATE_FILE_EXTENSION;

        // Path have extension.
        if (str_ends_with($templatePath, $ext))
        {
            return substr(
                $templatePath,
                0,
                -strlen(TemplateExtension::TEMPLATE_FILE_EXTENSION)
            );
        }

        return $templatePath;
    }
}
