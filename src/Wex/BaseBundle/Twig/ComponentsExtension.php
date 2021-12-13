<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\RenderDataComponent;
use App\Wex\BaseBundle\Rendering\ComponentContext;
use App\Wex\BaseBundle\Service\RenderingService;
use App\Wex\BaseBundle\Translation\Translator;
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
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'component',
                [
                    $this,
                    'component',
                ],
                [
                    self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML,
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                ]
            ),
            new TwigFunction(
                'component_init_class',
                [
                    $this,
                    'componentInitClass',
                ]
            ),
            new TwigFunction(
                'component_init_parent',
                [
                    $this,
                    'componentInitParent',
                ],
                [self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML]
            ),
            new TwigFunction(
                'component_init_previous',
                [
                    $this,
                    'componentInitPrevious',
                ],
                [self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML]
            ),
            new TwigFunction(
                'component_render_tag_attributes',
                [
                    $this,
                    'componentRenderTagAttributes',
                ],
                [
                    self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML,
                    self::FUNCTION_OPTION_NEEDS_CONTEXT => true,
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                ]
            ),
            new TwigFunction(
                'component_render_layout',
                [
                    $this,
                    'componentRenderLayout',
                ],
                [
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                ]
            ),
        ];
    }

    /**
     * @throws Exception
     */
    public function component(
        Environment $twig,
        string $name,
        array $options = []
    ): string
    {
        $html = $this->comRenderHtml($twig, $name, $options);

        return $html.$this->componentInitPrevious($name, $options);
    }

    /**
     * @throws Exception
     */
    public function comRenderHtml(
        Environment $env,
        $name,
        $options = []
    ): ?string
    {
        $loader = $env->getLoader();
        $search = TemplateHelper::buildTemplateInheritanceStack(
            $name
        );

        try
        {
            foreach ($search as $templatePath)
            {
                if ($loader->exists($templatePath))
                {
                    $this->translator->setDomain(
                        Translator::DOMAIN_TYPE_COMPONENT,
                        // Convert into translation key notation.
                        $this->translator->buildDomainFromPath($name)
                    );

                    $options['com_options'] = $options;

                    $output = $env->render(
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
        /** @var RenderDataComponent $component */
        foreach ($this->components as $component)
        {
            if ($component->context->renderContext === $renderContext)
            {
                $data[] = $component;
            }
        }

        return $data;
    }

    public function componentInitPrevious(string $name, array $options = []): string
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
        array $options = []
    ): RenderDataComponent
    {
        // Using an object allow continuing edit properties after save.
        $component = new RenderDataComponent(
            $name,
            $initMode,
            $this->renderingService->getContext(),
            $this->renderingService->getRenderRequestId(),
            $options
        );

        $this->components[] = $component;

        $this->comLoadAssets(
            $component
        );

        return $component;
    }

    public function comLoadAssets(RenderDataComponent $component): array
    {
        return $this
            ->assetsExtension
            ->assetsDetect(
                $component->name,
                RenderingHelper::CONTEXT_COMPONENT,
                $component->assets
            );
    }

    /**
     * Init a components and provide a class name to retrieve dom element.
     */
    public function componentInitClass(
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
    public function componentInitParent(string $name, array $options = []): string
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
    public function componentRenderLayout(Environment $twig): string
    {
        $output = '';

        /** @var RenderDataComponent $component */
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

    public function componentRenderTagAttributes(Environment $env, array $context, array $defaults = []): string
    {
        $options = $context['com_options'];
        $class = trim(($defaults[VariableHelper::CLASS_VAR] ?? '').' '.($options[VariableHelper::CLASS_VAR] ?? ''));

        $attributes = array_merge([
            VariableHelper::ID => $options[VariableHelper::ID] ?? null,
            VariableHelper::CLASS_VAR => $class === '' ? null : $class,
        ], ($options['attr'] ?? []));

        /** @var RenderExtension $renderExtension */
        $renderExtension = $env->getExtension(
            RenderExtension::class
        );

        return $renderExtension->renderTagAttributes($attributes);
    }

    public function comInitLayout(string $name, array $options = []): RenderDataComponent
    {
        return $this->registerComponent(
            $name,
            self::INIT_MODE_LAYOUT,
            $options
        );
    }
}
