<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Rendering\Asset;
use App\Wex\BaseBundle\Rendering\Component;
use Twig\TwigFunction;

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
        protected AssetsExtension $assetsExtension
    ) {
    }

    public function getFunctions(): array
    {
        return [
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
                [self::FUNCTION_OPTION_IS_SAFE => [self::FUNCTION_OPTION_HTML]]
            ),
            new TwigFunction(
                'com_init_previous',
                [
                    $this,
                    'comInitPrevious',
                ],
                [self::FUNCTION_OPTION_IS_SAFE => [self::FUNCTION_OPTION_HTML]]
            ),
        ];
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
}
