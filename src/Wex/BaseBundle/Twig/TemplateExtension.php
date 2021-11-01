<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\Asset;
use App\Wex\BaseBundle\Service\TemplateService;
use App\Wex\BaseBundle\Translation\Translator;
use Doctrine\DBAL\Types\Types;
use JetBrains\PhpStorm\ArrayShape;
use function array_merge_recursive;
use function str_ends_with;
use function strlen;
use function substr;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig\Environment;
use Twig\TwigFunction;
use function ucfirst;

class TemplateExtension extends AbstractExtension
{
    public const TEMPLATE_FILE_EXTENSION = '.html.twig';

    public const LAYOUT_NAME_DEFAULT = 'default';

    public function __construct(
        private KernelInterface $kernel,
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
                'template_build_layout_data',
                [
                    $this,
                    'templateBuildLayoutData',
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

    public function templateBuildLayoutData(
        Environment $env,
        string $pageTemplateName
    ): array
    {
        /** @var AssetsExtension $assetsExtension */
        $assetsExtension = $env->getExtension(
            AssetsExtension::class
        );
        /** @var JsExtension $jsExtension */
        $jsExtension = $env->getExtension(
            JsExtension::class
        );

        $output = array_merge_recursive(
            $this->templateBuildRenderData($env, $pageTemplateName),
            [
                VariableHelper::ASSETS => $assetsExtension->buildRenderData(Asset::CONTEXT_LAYOUT),
                'displayBreakpoints' => AssetsExtension::DISPLAY_BREAKPOINTS,
                VariableHelper::ENV => $this->kernel->getEnvironment(),
                VariableHelper::VARS => $jsExtension->jsVarsGet(JsExtension::VARS_GROUP_GLOBAL),
            ]
        );

        $output[VariableHelper::PAGE]['isLayoutPage'] = true;

        return $output;
    }

    #[ArrayShape([
            VariableHelper::ASSETS => "\App\Wex\BaseBundle\Rendering\Asset[][][]|array[]|\array[][]",
            VariableHelper::BODY => VariableHelper::NULL."|".Types::STRING,
            VariableHelper::NAME => Types::STRING,
            VariableHelper::TRANSLATIONS => Types::ARRAY,
            VariableHelper::VARS => Types::ARRAY
        ]
    )]
    public function templateBuildPageData(
        Environment $env,
        string $pageName,
        ?string $body = null
    ): array
    {
        /** @var AssetsExtension $assetsExtension */
        $assetsExtension = $env->getExtension(
            AssetsExtension::class
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
            VariableHelper::ASSETS => $assetsExtension->buildRenderData(Asset::CONTEXT_PAGE),
            VariableHelper::BODY => $body,
            VariableHelper::NAME => $pageName,
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
        VariableHelper::PAGE => Types::ARRAY."|".VariableHelper::NULL,
        VariableHelper::TRANSLATIONS => Types::ARRAY
    ])]
    public function templateBuildRenderData(
        Environment $env,
        string $pageTemplateName = null
    ): array
    {
        /** @var TranslationExtension $translationExtension */
        $translationExtension = $env->getExtension(
            TranslationExtension::class
        );

        return [
            VariableHelper::PAGE => $pageTemplateName
                ? $this->templateBuildPageData(
                    $env,
                    $pageTemplateName
                ) : null,
            // TODO Layout data only
            VariableHelper::TRANSLATIONS => $translationExtension->buildRenderData(),
            VariableHelper::TRANSLATIONS
            .ucfirst(VariableHelper::DOMAIN)
            .ucfirst(VariableHelper::SEPARATOR) => Translator::DOMAIN_SEPARATOR,
        ];
    }

    public function templateNameFromPath(string $templatePath): string
    {
        // Define template name.
        $ext = TemplateExtension::TEMPLATE_FILE_EXTENSION;

        // Path have extension.
        if (str_ends_with($templatePath, $ext)) {
            return substr(
                $templatePath,
                0,
                -strlen(TemplateExtension::TEMPLATE_FILE_EXTENSION)
            );
        }

        return $templatePath;
    }
}
