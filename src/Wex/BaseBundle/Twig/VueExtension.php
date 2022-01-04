<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use App\Wex\BaseBundle\Service\VueService;
use Exception;
use function implode;
use Symfony\Component\ExpressionLanguage\SyntaxError;
use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\TwigFilter;
use Twig\TwigFunction;

class VueExtension extends AbstractExtension
{
    public const TEMPLATE_FILE_EXTENSION = '.vue.twig';

    public function getFilters(): array
    {
        return [
            new TwigFilter(
                'vue_key',
                [
                    $this,
                    'vueKey',
                ]
            ),
        ];
    }

    public function __construct(
        private AdaptiveResponseService $adaptiveResponseService,
        private VueService $vueService
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'vue',
                [
                    $this,
                    'vue',
                ],
                [
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                    self::FUNCTION_OPTION_IS_SAFE => [self::FUNCTION_OPTION_HTML],
                ]
            ),
            new TwigFunction(
                'vue_require',
                [
                    $this,
                    'vueRequire',
                ],
                [
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                    self::FUNCTION_OPTION_IS_SAFE => [self::FUNCTION_OPTION_HTML],
                ]
            ),
            new TwigFunction(
                'vue_render_templates',
                [
                    $this,
                    'vueRenderTemplate',
                ]
            ),
        ];
    }

    /**
     * @throws Exception
     */
    public function vue(
        Environment $env,
        string $path,
        ?array $options = [],
        ?array $twigContext = []
    ): string {
        if ($this->vueService->isRenderPassInVueContext())
        {
            return $this->vueInclude(
                $env,
                $path,
                $options,
                $twigContext
            );
        }
        else
        {
            return $this->vueService->vueRender(
                $env,
                $path,
                $options,
                $twigContext,
                true
            );
        }
    }

    public function vueRenderTemplate(): string
    {
        // Add vue js templates.
        return implode('', $this->vueService->renderedTemplates);
    }

    /**
     * @throws LoaderError
     * @throws RuntimeError
     * @throws SyntaxError|Exception
     */
    public function vueRequire(
        Environment $env,
        string $path,
        ?array $options = []
    ): void {
        // Same behavior but no output tag.
        $this->vueInclude(
            $env,
            $path,
            $options
        );
    }

    /**
     * @throws Exception
     */
    public function vueInclude(
        Environment $env,
        string $path,
        ?array $attributes = [],
        ?array $twigContext = []
    ): string {
        return $this->vueService->vueRender(
            $env,
            $path,
            $attributes,
            $twigContext
        );
    }

    public function vueKey(
        string $key,
        ?string $filters = null
    ): string
    {
        return '{{ '.$key.($filters ? ' | '.$filters : '').' }}';
    }
}
