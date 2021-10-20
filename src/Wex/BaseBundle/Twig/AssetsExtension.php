<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Rendering\Asset;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use function array_merge_recursive;
use function pathinfo;

class AssetsExtension extends AbstractExtension
{
    public const EXTENSION_JS = 'js';

    public const EXTENSION_CSS = 'css';

    public const DIR_PUBLIC = 'public/';

    public const DIR_BUILD = 'build/';

    public const FILE_MANIFEST = 'manifest.json';

    public const GROUP_PAGES = 'pages';

    public const DISPLAY_BREAKPOINTS = [
        's' => 0,
        'm' => 600,
        'l' => 992,
        'xl' => 1200,
    ];

    public const ASSETS_EXTENSIONS = [
        self::EXTENSION_CSS,
        self::EXTENSION_JS,
    ];

    public const ASSETS_DEFAULT_EMPTY = [
        self::EXTENSION_CSS => [],
        self::EXTENSION_JS => [],
    ];

    public array $assets = self::ASSETS_DEFAULT_EMPTY;

    private string $pathProject;

    private string $pathBuild;

    private string $pathPublic;

    private array $manifest;

    /**
     * CommonExtension constructor.
     */
    public function __construct(
        KernelInterface $kernel
    )
    {
        $this->pathProject = $kernel->getProjectDir().'/';
        $this->pathPublic = $this->pathProject.self::DIR_PUBLIC;
        $this->pathBuild = $this->pathPublic.self::DIR_BUILD;
        $this->manifest = \json_decode(
            \file_get_contents(
                $this->pathBuild.self::FILE_MANIFEST
            ),
            JSON_OBJECT_AS_ARRAY
        );
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'assets_list',
                [
                    $this,
                    'assetsList',
                ]
            ),
            new TwigFunction(
                'assets_init_layout',
                [
                    $this,
                    'assetsInitLayout',
                ]
            ),
            new TwigFunction(
                'assets_init_template',
                [
                    $this,
                    'assetsInitTemplate',
                ]
            )
        ];
    }

    public function assetsInitLayout(
        ?string $layoutName = null
    )
    {
        $layoutName = $layoutName ?: TemplateExtension::LAYOUT_NAME_DEFAULT;
        $backEndAssets = $this->assets;
        $this->assets = self::ASSETS_DEFAULT_EMPTY;

        $assets = $this->assetsDetect('layouts/'.$layoutName.'/layout');

        // No main js found.
        if (empty($assets[AssetsExtension::EXTENSION_JS])) {
            // Try to load default js file.
            $this->assetsDetectForType('layouts/default/layout', AssetsExtension::EXTENSION_JS);
        }

        $this->assets[AssetsExtension::EXTENSION_JS] = array_merge_recursive(
            $this->assets[AssetsExtension::EXTENSION_JS],
            $backEndAssets[AssetsExtension::EXTENSION_JS]
        );

        $this->assets[AssetsExtension::EXTENSION_CSS] = array_merge_recursive(
            $this->assets[AssetsExtension::EXTENSION_CSS],
            $backEndAssets[AssetsExtension::EXTENSION_CSS]
        );
    }

    public function assetsInitTemplate(
        string $templateName
    )
    {
        $this->assetsDetect(
            $templateName
        );
    }

    public function assetsList(string $ext): array
    {
        $notLoaded = [];

        foreach ($this->assets[$ext] as $asset) {
            if (!$asset->loaded) {
                $notLoaded[] = $asset;
            }
        }

        return $notLoaded;
    }

    public function assetsDetect(string $templateName): array
    {
        $output = [];

        foreach (self::ASSETS_EXTENSIONS as $ext) {
            $output[$ext] = $this->assetsDetectForType(
                $templateName,
                $ext
            );
        }

        return $output;
    }

    /**
     * Return all assets for a given type, including suffixes like -s, -l, etc.
     */
    public function assetsDetectForType(
        string $templateName,
        string $ext
    ): array
    {
        $assetPath = $ext.'/'.$templateName.'.'.$ext;
        $output = [];

        if ($asset = $this->addAsset($assetPath)) {
            $output[] = $asset;
        }

        $breakpointsReverted = \array_reverse(
            self::DISPLAY_BREAKPOINTS
        );
        $maxWidth = null;

        // Used for CSS, TODO this behavior may be tested with javascript, or moved.
        foreach ($breakpointsReverted as $name => $minWidth) {
            $assetPath = $ext.'/'.$templateName.'-'.$name.'.'.$ext;

            if ($asset = $this->addAsset($assetPath)) {
                $asset->media = 'screen and (min-width:'.$minWidth.'px)'.
                    ($maxWidth ? ' and (max-width:'.$maxWidth.'px)' : '');

                $output[] = $asset;
            }

            $maxWidth = $minWidth;
        }

        return $output;
    }

    protected array $assetsLoaded = [];

    public function addAsset(string $pathRelative): ?Asset
    {
        $pathRelativeToPublic = self::DIR_BUILD.$pathRelative;
        if (!isset($this->manifest[$pathRelativeToPublic])) {
            return null;
        }

        if (!isset($this->assetsLoaded[$pathRelative])) {
            $entry = new Asset();
            $entry->path = $this->manifest[$pathRelativeToPublic];
            $info = pathinfo($entry->path);
            $entry->type = $info['extension'];

            $this->assetsLoaded[$pathRelative] = $entry;
        } else {
            $entry = $this->assetsLoaded[$pathRelative];
        }

        $this->assets[$entry->type][] = $entry;

        return $this->assetsLoaded[$pathRelative];
    }
}

