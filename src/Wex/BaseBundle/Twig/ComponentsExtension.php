<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Rendering\Asset;
use App\Wex\BaseBundle\Rendering\Component;
use Twig\TwigFunction;

class ComponentsExtension extends AbstractExtension
{
    // Component is loaded from template into the target tag.
    public const INIT_TYPE_PARENT = 'parent';

    /**
     * Save components options initialized by com_init.
     */
    protected array $components = [];

    public function __construct(
        protected AssetsExtension $assetsExtension)
    {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'com_init_parent',
                [
                    $this,
                    'comInitParent',
                ],
                [self::FUNCTION_OPTION_IS_SAFE => [self::FUNCTION_OPTION_HTML]]
            ),
        ];
    }

    public function saveComponent(
        string $name
    ): Component
    {
        // Using an object allow continuing edit properties after save.
        $entry = new Component($name);

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
     * Add component to the global page requirements.
     * It adds components assets to page assets.
     */
    public function comInitParent(string $name, array $options = []): string
    {
        $component = $this->saveComponent(
            $name,
            self::INIT_TYPE_PARENT,
            $options
        );

        return $component->renderTag();
    }
}
