<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\Asset;
use Doctrine\DBAL\Types\Types;
use JetBrains\PhpStorm\ArrayShape;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use function array_merge_recursive;
use function pathinfo;

class AssetsExtension extends AbstractExtension
{
    public const DIR_PUBLIC = 'public/';

    public const DIR_BUILD = 'build/';

    public const FILE_MANIFEST = 'manifest.json';

    public const GROUP_PAGES = 'pages';

    public const DISPLAY_BREAKPOINTS = [
        'xs' => 0,
        's' => 576,
        'm' => 768,
        'l' => 992,
        'xl' => 1200,
        'xxl' => 1400,
    ];

    /**
     * @var array|Asset[][]
     */
    public const ASSETS_DEFAULT_EMPTY = [
        Asset::EXTENSION_CSS => [],
        Asset::EXTENSION_JS => [],
    ];
    public array $assets = self::ASSETS_DEFAULT_EMPTY;

    public array $assetsPreload = self::ASSETS_DEFAULT_EMPTY;

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
                'asset_set_loaded',
                [
                    $this,
                    'assetSetLoaded',
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
            ),
            new TwigFunction(
                'assets_list',
                [
                    $this,
                    'assetsList',
                ]
            ),
            new TwigFunction(
                'assets_preload_list',
                [
                    $this,
                    'assetsPreloadList',
                ]
            ),
        ];
    }

    #[ArrayShape([
        VariableHelper::ALL => Asset::class."[]",
        VariableHelper::RESPONSIVE => Types::ARRAY
    ])]
    public function buildRenderData(): array
    {
        $assets = $this->assets;
        $responsive = [];

        foreach ($assets as $type => $group) {
            foreach ($group as $asset) {
                if ($asset->responsive) {
                    $responsive[$type][] = $asset;
                }
            }
        }

        return [
            VariableHelper::ALL => $assets,
            VariableHelper::RESPONSIVE => $responsive,
        ];
    }

    public function assetsInitLayout(
        ?string $layoutName = null
    )
    {
        $layoutName = $layoutName ?: TemplateExtension::LAYOUT_NAME_DEFAULT;
        $backEndAssets = $this->assets;
        $this->assets = self::ASSETS_DEFAULT_EMPTY;

        $assets = $this->assetsDetect(
            'layouts/'.$layoutName.'/layout',
            Asset::EXTENSION_CSS
        );

        // No main js found.
        if (empty($assets[Asset::EXTENSION_JS])) {
            // Try to load default js file.
            // Do not preload JS as it is configured
            // to wait for dom content loaded anyway.
            $this->assetsDetectForType(
                'layouts/default/layout',
                Asset::EXTENSION_JS
            );
        }

        $this->assets[Asset::EXTENSION_JS] = array_merge_recursive(
            $this->assets[Asset::EXTENSION_JS],
            $backEndAssets[Asset::EXTENSION_JS]
        );

        $this->assets[Asset::EXTENSION_CSS] = array_merge_recursive(
            $this->assets[Asset::EXTENSION_CSS],
            $backEndAssets[Asset::EXTENSION_CSS]
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

    public function assetsPreloadList(string $ext): array
    {
        return $this->assetsPreload[$ext];
    }

    public function assetsDetect(
        string $templateName,
        string|bool $preload = false
    ): array
    {
        $output = [];

        foreach (Asset::ASSETS_EXTENSIONS as $ext) {
            $output[$ext] = $this->assetsDetectForType(
                $templateName,
                $ext,
                $preload === true || $preload === $ext
            );
        }

        return $output;
    }

    /**
     * Return all assets for a given type, including suffixes like -s, -l, etc.
     */
    public function assetsDetectForType(
        string $templateName,
        string $ext,
        bool $preload = false
    ): array
    {
        $assetPath = $ext.'/'.$templateName.'.'.$ext;
        $output = [];

        if ($asset = $this->addAsset($assetPath, $preload)) {
            $output[] = $asset;
        }

        $breakpointsReverted = \array_reverse(
            self::DISPLAY_BREAKPOINTS
        );
        $maxWidth = null;

        foreach ($breakpointsReverted as $name => $minWidth) {
            $assetPath = $ext.'/'.$templateName.'-'.$name.'.'.$ext;

            if ($asset = $this->addAsset($assetPath)) {
                $asset->responsive = true;
                $asset->media = 'screen and (min-width:'.$minWidth.'px)'.
                    ($maxWidth ? ' and (max-width:'.$maxWidth.'px)' : '');

                $output[] = $asset;
            }

            $maxWidth = $minWidth;
        }

        return $output;
    }

    protected array $assetsLoaded = [];

    public function addAsset(string $pathRelative, bool $preload = false): ?Asset
    {
        $pathRelativeToPublic = self::DIR_BUILD.$pathRelative;
        if (!isset($this->manifest[$pathRelativeToPublic])) {
            return null;
        }

        if (!isset($this->assetsLoaded[$pathRelative])) {
            $asset = new Asset(
                $this->manifest[$pathRelativeToPublic]
            );

            $asset->preload = $preload;

            $info = pathinfo($asset->path);
            $asset->type = $info['extension'];

            $this->assetsLoaded[$pathRelative] = $asset;
        } else {
            $asset = $this->assetsLoaded[$pathRelative];
        }

        $this->assets[$asset->type][] = $asset;

        if ($preload) {
            $this->assetsPreload[$asset->type][] = $asset;
        }

        return $this->assetsLoaded[$pathRelative];
    }

    public function assetSetLoaded(Asset $asset, $loaded = true)
    {
        $asset->loaded = $loaded;
    }
}

