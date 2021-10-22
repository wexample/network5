<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\VariableHelper;
use Symfony\Component\HttpKernel\KernelInterface;
use function str_ends_with;
use function strlen;
use function substr;
use Twig\Environment;
use Twig\TwigFunction;

class TemplateExtension extends AbstractExtension
{
    public const TEMPLATE_FILE_EXTENSION = '.html.twig';

    public const LAYOUT_NAME_DEFAULT = 'default';

    public function __construct(
        private KernelInterface $kernel
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
        ];
    }

    public function templateBuildLayoutData(Environment $env, string $templateName): array
    {
        $output = $this->templateBuildPageData(
            $env,
            $templateName
        );

        return array_merge_recursive(
            $output,
            [
                'displayBreakpoints' => AssetsExtension::DISPLAY_BREAKPOINTS,
                'env' => $this->kernel->getEnvironment(),
            ]
        );
    }

    public function templateBuildPageData(
        Environment $env,
        string $pageName,
        ?string $body = null
    ): array
    {
        $output = $this->templateBuildRenderData(
            $env
        );

        $output['page'] = [
            'name' => $pageName,
        ];

        return $output;
    }

    public function templateBuildRenderData(
        Environment $env
    ): array
    {
        /** @var AssetsExtension $assetsExtension */
        $assetsExtension = $env->getExtension(
            AssetsExtension::class
        );

        $output = [
            VariableHelper::ASSETS => $assetsExtension->buildRenderData(),
            VariableHelper::ENV => $this->kernel->getEnvironment(),
        ];

        return $output;
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
