<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\Component;
use App\Wex\BaseBundle\Rendering\ComponentContext;
use App\Wex\BaseBundle\Service\RenderingService;
use App\Wex\BaseBundle\Translation\Translator;
use App\Wex\BaseBundle\WexBaseBundle;
use function array_merge;
use function array_pop;
use function end;
use Exception;
use JetBrains\PhpStorm\Pure;
use function trim;
use Twig\Environment;
use Twig\TwigFunction;

class ComponentsExtension extends AbstractExtension
{
    protected array $contextsStack;

    // Component is loaded with a css class.
    public const INIT_MODE_CLASS = VariableHelper::CLASS_VAR;

    // Component is simply loaded from PHP or from backend adaptive event.
    // It may have no target tag.
    public const INIT_MODE_LAYOUT = VariableHelper::LAYOUT;

    // Component is loaded from template into the target tag.
    public const INIT_MODE_PARENT = VariableHelper::PARENT;

    // Component is loaded from template, just after target tag.
    public const INIT_MODE_PREVIOUS = VariableHelper::PREVIOUS;

    /**
     * Save components options initialized by com_init.
     */
    protected array $components = [];

    public function __construct(
        private AssetsExtension $assetsExtension,
        private RenderingService $renderingService,
        private Translator $translator,
    )
    {
        $this->comSetContext(
            RenderingHelper::CONTEXT_LAYOUT,
            null
        );
    }

    public function comSetContext(
        string $renderingContext,
        ?string $name,
    )
    {
        $this->contextsStack[] = new ComponentContext(
            $renderingContext,
            $name ?: VariableHelper::DEFAULT,
        );
    }

    public function getContext(): ComponentContext
    {
        return end($this->contextsStack);
    }

    public function comRevertContext(): void
    {
        array_pop($this->contextsStack);
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'com',
                [
                    $this,
                    'com',
                ],
                [
                    self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML,
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                ]
            ),
            new TwigFunction(
                'com_init_class',
                [
                    $this,
                    'comInitClass',
                ]
            ),
            new TwigFunction(
                'com_init_parent',
                [
                    $this,
                    'comInitParent',
                ],
                [self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML]
            ),
            new TwigFunction(
                'com_init_previous',
                [
                    $this,
                    'comInitPrevious',
                ],
                [self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML]
            ),
            new TwigFunction(
                'com_render_tag_attributes',
                [
                    $this,
                    'comRenderTagAttributes',
                ],
                [
                    self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML,
                    self::FUNCTION_OPTION_NEEDS_CONTEXT => true,
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                ]
            ),
            new TwigFunction(
                'com_render_layout',
                [
                    $this,
                    'comRenderLayout',
                ],
                [
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                ]
            ),
            new TwigFunction(
                'com_set_context',
                [
                    $this,
                    'comSetContext',
                ]
            ),
            new TwigFunction(
                'com_revert_context',
                [
                    $this,
                    'comRevertContext',
                ]
            ),
        ];
    }

    /**
     * @throws Exception
     */
    public function com(
        Environment $twig,
        string $name,
        array $options = []
    ): string
    {
        $html = $this->comRenderHtml($twig, $name, $options);

        return $html.$this->comInitPrevious($name, $options);
    }

    /**
     * @throws Exception
     */
    public function comRenderHtml(
        Environment $twig,
        $name,
        $options = []
    ): ?string
    {
        $search = [
            // Search local.
            $name.TemplateExtension::TEMPLATE_FILE_EXTENSION,
            // Search in base bundle.
            WexBaseBundle::BUNDLE_PATH_TEMPLATES.$name.TemplateExtension::TEMPLATE_FILE_EXTENSION,
        ];

        try
        {
            foreach ($search as $templatePath)
            {
                if ($twig->getLoader()->exists($templatePath))
                {
                    $this->translator->setDomain(
                        Translator::DOMAIN_TYPE_COMPONENT,
                        // Convert into translation key notation.
                        $this->translator->buildDomainFromPath($name)
                    );

                    $options['com_options'] = $options;

                    $output = $twig->render(
                        $templatePath,
                        $options
                    );

                    $this->translator->revertDomain(
                        Translator::DOMAIN_TYPE_COMPONENT
                    );

                    return $output;
                }
            }

            return null;
        } catch (Exception $exception)
        {
            throw new Exception('Error during rendering component '.$name.' : '.$exception->getMessage(), $exception->getCode(), $exception);
        }
    }

    #[Pure]
    public function buildRenderData(string $renderContext): array
    {
        $data = [];
        /** @var Component $component */
        foreach ($this->components as $component)
        {
            if ($component->context->renderContext === $renderContext)
            {
                $data[] = $component;
            }
        }

        return $data;
    }

    public function comInitPrevious(string $name, array $options = []): string
    {
        $component = $this->registerComponent(
            $name,
            self::INIT_MODE_PREVIOUS,
            $options
        );

        return $component->renderTag();
    }

    public function registerComponent(
        string $name,
        string $initMode,
        array $options
    ): Component
    {
        // Using an object allow continuing edit properties after save.
        $entry = new Component(
            $name,
            $initMode,
            $this->getContext(),
            $this->renderingService->getRenderRequestId(),
            $options
        );

        $this->components[] = $entry;

        $entry->assets = $this->comLoadAssets(
            $name
        );

        return $entry;
    }

    public function comLoadAssets(string $name): array
    {
        return $this
            ->assetsExtension
            ->assetsDetect(
                $name,
                RenderingHelper::CONTEXT_COMPONENT
            );
    }

    /**
     * Init a components and provide a class name to retrieve dom element.
     */
    public function comInitClass(
        string $name,
        array $options = []
    ): string
    {
        $component = $this->registerComponent(
            $name,
            self::INIT_MODE_CLASS,
            $options
        );

        return 'com-class-loaded '.$component->id;
    }

    /**
     * Add component to the global page requirements.
     * It adds components assets to page assets.
     */
    public function comInitParent(string $name, array $options = []): string
    {
        $component = $this->registerComponent(
            $name,
            self::INIT_MODE_PARENT,
            $options
        );

        return $component->renderTag();
    }

    /**
     * @throws Exception
     */
    public function comRenderLayout(Environment $twig): string
    {
        $output = '';

        /** @var Component $component */
        foreach ($this->components as $component)
        {
            if (ComponentsExtension::INIT_MODE_LAYOUT === $component->initMode)
            {
                $componentOutput = $this->comRenderHtml(
                    $twig,
                    $component->name,
                    $component->options
                );

                if ($componentOutput)
                {
                    $componentOutput .= $component->renderTag();
                }

                $output .= $componentOutput;
            }
        }

        return $output;
    }

    public function comRenderTagAttributes(Environment $env, array $context, array $defaults = []): string
    {
        $options = $context['com_options'];
        $class = trim(($defaults['class'] ?? '').' '.($options['class'] ?? ''));

        $attributes = array_merge([
            'id' => $options['id'] ?? null,
            'class' => $class === '' ? null : $class,
        ], ($options['attr'] ?? []));

        /** @var RenderExtension $renderExtension */
        $renderExtension = $env->getExtension(
            RenderExtension::class
        );

        return $renderExtension->renderTagAttributes($attributes);
    }

    public function comInitLayout(string $name, array $options = []): Component
    {
        return $this->registerComponent(
            $name,
            self::INIT_MODE_LAYOUT,
            $options
        );
    }
}
