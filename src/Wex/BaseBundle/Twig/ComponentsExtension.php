<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Rendering\Asset;
use App\Wex\BaseBundle\Rendering\Component;
use App\Wex\BaseBundle\Translation\Translator;
use App\Wex\BaseBundle\WexBaseBundle;
use Exception;
use Twig\Environment;
use Twig\TwigFunction;
use function array_merge;
use function trim;

class ComponentsExtension extends AbstractExtension
{
    // Component is loaded with a css class.
    public const INIT_MODE_CLASS = 'class';

    // Component is loaded from template into the target tag.
    public const INIT_MODE_PARENT = 'parent';

    // Component is loaded from template, just after target tag.
    public const INIT_MODE_PREVIOUS = 'previous';

    /**
     * Save components options initialized by com_init.
     */
    protected array $components = [];

    public function __construct(
        protected AssetsExtension $assetsExtension,
        private Translator $translator
    ) {
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
        ];
    }

    /**
     * @throws Exception
     */
    public function com(
        Environment $twig,
        string $name,
        array $options = []
    ) {
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
    ): ?string {
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
        }
        catch (Exception $exception)
        {
            throw new Exception('Error during rendering component '.$name.' : '.$exception->getMessage(), $exception->getCode(), $exception);
        }
    }

    public function componentsBuildPageData(): array
    {
        $data = [];
        /** @var Component $component */
        foreach ($this->components as $component)
        {
            $data[] = $component->buildPageData();
        }

        return $data;
    }

    /**
     * Add component to the global page requirements.
     * It adds components assets to page assets.
     */
    public function comInitPrevious(string $name, array $options = []): string
    {
        $component = $this->saveComponent(
            $name,
            self::INIT_MODE_PREVIOUS,
            $options
        );

        return $component->renderTag();
    }

    public function saveComponent(
        string $name,
        string $initMode,
        array $options
    ): Component {
        // Using an object allow continuing edit properties after save.
        $entry = new Component($name, $initMode, $options);

        $this->components[] = $entry;

        $this->comLoadAssets($name);

        return $entry;
    }

    public function comLoadAssets(string $name)
    {
        $this
            ->assetsExtension
            ->assetsDetect(
                $name,
                Asset::CONTEXT_PAGE
            );
    }

    /**
     * Init a components and provide a class name to retrieve dom element.
     */
    public function comInitClass(
        string $name,
        array $options = []
    ): string {
        $component = $this->saveComponent(
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
        $component = $this->saveComponent(
            $name,
            self::INIT_MODE_PARENT,
            $options
        );

        return $component->renderTag();
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
}
