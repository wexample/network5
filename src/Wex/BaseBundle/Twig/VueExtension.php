<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\DomHelper;
use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Rendering\VueComponent;
use App\Wex\BaseBundle\Service\RenderingService;
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

    public ?string $contextCurrent;

    protected array $includedHtml = [];

    public array $renderedTemplates = [];

    public array $rootComponents = [];

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
        protected RenderingService $renderingService,
        private ComponentsExtension $componentsExtension,
        private AssetsExtension $assetsExtension
    )
    {
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
    ): string
    {
        return $this->vueRender(
            $env,
            $path,
            $options,
            $twigContext,
            true
        );
    }

    /**
     * @throws Exception
     */
    protected function vueRender(
        Environment $env,
        string $path,
        ?array $attributes = [],
        ?array $twigContext = [],
        ?bool $root = false
    ): string
    {
        // TODO Move more logic in class.
        $vue = new VueComponent($path);

        // Search for template.
        $loader = $env->getLoader();
        $pathTemplate = null;
        $locations = TemplateHelper::buildTemplateInheritanceStack(
            $path,
            self::TEMPLATE_FILE_EXTENSION
        );

        foreach ($locations as $fullPath)
        {
            if (!$pathTemplate && $loader->exists($fullPath))
            {
                $pathTemplate = $fullPath;
            }
        }

        if (!$pathTemplate)
        {
            throw new Exception('Unable to find vue template, searched in '.implode(',', $locations));
        }

        $attributes['class'] ??= '';
        $attributes['class'] .= ' '.$vue->id;

        $context = [
            'path' => $path,
            'vueComId' => $vue->id,
            'vueComName' => $vue->name,
            'attrs' => $attributes,
        ];

        $outputBody = '';
        if ($root)
        {
            $rootComponent = $this
                ->componentsExtension
                ->registerComponent(
                    'components/vue',
                    ComponentsExtension::INIT_MODE_PARENT,
                    $context
                );

            $this->rootComponents[$vue->name] = $rootComponent;

            $outputBody = $rootComponent->renderTag();
        } else
        {
            $rootComponent = $this->rootComponents[$this->contextCurrent];
        }

        $this
            ->assetsExtension
            ->assetsDetect(
                $path,
                RenderingHelper::CONTEXT_COMPONENT,
                $rootComponent->assets
            );

        if (!isset($this->renderedTemplates[$vue->name]))
        {
            $this->contextCurrent = $vue->name;
            $this->renderingService->setContext(
                RenderingHelper::CONTEXT_VUE,
                $vue->name
            );

            $template = DomHelper::buildTag(
                'template',
                [
                    'class' => 'vue vue-loading',
                    'id' => 'vue-template-'.$vue->name,
                ],
                $env->render(
                    $pathTemplate,
                    $twigContext + $context
                )
            );

            $this->renderingService->revertContext();

            $this->contextCurrent = null;
            $this->renderedTemplates[$vue->name] = $template;
        }

        return DomHelper::buildTag(
            $vue->name,
            [
                'class' => $vue->id,
            ],
            $outputBody
        );
    }

    public function vueRenderTemplate(): string
    {
        // Add vue js templates.
        return implode('', $this->renderedTemplates);
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
    ): void
    {
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
    ): string
    {
        // Register template.
        $output =
            $this->vueRender(
                $env,
                $path,
                $attributes,
                $twigContext
            );

        $this->includedHtml[] = $output;

        return $output;
    }

    public function vueKey(string $key, ?string $filters = null): string
    {
        return '{{ '.$key.($filters ? ' | '.$filters : '').' }}';
    }
}
