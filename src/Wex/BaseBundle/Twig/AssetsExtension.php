<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\Asset;
use App\Wex\BaseBundle\Service\AssetsService;
use function array_merge_recursive;
use function array_reverse;
use function basename;
use function dirname;
use function file_get_contents;
use function implode;
use function json_decode;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig\TwigFunction;

class AssetsExtension extends AbstractExtension
{
    public const DIR_PUBLIC = 'public/';

    public const DIR_BUILD = 'build/';

    public const FILE_MANIFEST = 'manifest.json';

    public const THEME_DARK = 'dark';

    public const THEME_LIGHT = 'light';

    public const THEME_PRINT = 'print';

    public const THEME_DEFAULT = 'default';

    public const THEMES = [
        self::THEME_DARK,
        self::THEME_DEFAULT,
        self::THEME_LIGHT,
        self::THEME_PRINT,
    ];

    /**
     * @var array|Asset[][]
     */
    public const ASSETS_DEFAULT_EMPTY = [
        Asset::EXTENSION_CSS => [],
        Asset::EXTENSION_JS => [],
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
        $this->manifest = json_decode(
            file_get_contents(
                $this->pathBuild.self::FILE_MANIFEST
            ),
            JSON_OBJECT_AS_ARRAY
        );
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'layout_init',
                [
                    $this,
                    'assetsInitLayout',
                ]
            ),
            new TwigFunction(
                'page_init',
                [
                    $this,
                    'assetsInitPage',
                ]
            ),
            new TwigFunction(
                'assets_is_available',
                [
                    $this,
                    'assetsIsAvailable',
                ]
            ),
            new TwigFunction(
                'assets_type_filtered',
                [
                    $this,
                    'assetsTypeFiltered',
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

    public function assetsTypeFiltered(string $context, string $filterType = null): array
    {
        $assets = $this->assetsFiltered(
            $context,
            $filterType
        );

        return $assets[$filterType];
    }

    public function assetsFiltered(string $context, string $filterType = null): array
    {
        $filtered = self::ASSETS_DEFAULT_EMPTY;

        foreach ($this->assets as $type => $group)
        {
            if (!$filterType || $filterType === $type)
            {
                foreach ($group as $asset)
                {
                    if ($asset->renderContext === $context)
                    {
                        $filtered[$type][] = $asset;
                    }
                }
            }
        }

        return $filtered;
    }

    public function assetsList(string $ext): array
    {
        $notLoaded = [];

        /** @var Asset $asset */
        foreach ($this->assets[$ext] as $asset)
        {
            if (!$asset->rendered)
            {
                $notLoaded[] = $asset;
            }
        }

        return $notLoaded;
    }

    public function assetsPreload(array $assets, bool $useJs)
    {
        /** @var Asset $asset */
        foreach ($assets as $asset)
        {
            if ($this->assetsIsAvailable($asset, $useJs))
            {
                $asset->preload = true;
            }
        }
    }

    public function mergeCollections(
        array $collectionA,
        array $collectionB
    ): array
    {
        return array_merge_recursive(
            $collectionA,
            $collectionB
        );
    }

    public function assetsInitLayout(
        ?string $layoutName,
        ?string $layoutTheme,
        bool $useJs,
    )
    {
        $layoutName = $layoutName ?: TemplateExtension::LAYOUT_NAME_DEFAULT;
        $backEndAssets = $this->assets;
        $this->assets = self::ASSETS_DEFAULT_EMPTY;

        $assets = $this->assetsDetect(
            'layouts/'.$layoutName.'/layout',
            RenderingHelper::CONTEXT_LAYOUT
        );

        $this->assetsPreload(
            $assets['css'],
            $useJs
        );

        // No main js found.
        if (empty($assets[Asset::EXTENSION_JS]))
        {
            // Try to load default js file.
            // Do not preload JS as it is configured
            // to wait for dom content loaded anyway.
            $this->assetsDetectForType(
                'layouts/default/layout',
                Asset::EXTENSION_JS,
                RenderingHelper::CONTEXT_LAYOUT,
                true
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

    public function assetsInitPage(
        string $templateName,
        bool $useJs
    )
    {
        $assets = $this->assetsDetect(
            $templateName,
            RenderingHelper::CONTEXT_PAGE
        );

        $this->assetsPreload(
            $assets['css'],
            $useJs
        );
    }

    public function assetsIsAvailable(Asset $asset, bool $useJs): bool
    {
        // When using JS, we manage responsive
        // and extra theme style outside page rendering flow.
        return !((!$useJs) || $asset->responsive || $asset->theme);
    }

    public function assetsPreloadList(string $ext): array
    {
        $assets = $this->assets[$ext];
        $output = [];

        /** @var Asset $asset */
        foreach ($assets as $asset)
        {
            if ($asset->preload)
            {
                $output[] = $asset;
            }
        }

        return $output;
    }

    public function assetsDetect(
        string $templateName,
        string $context,
        array &$collection = []
    ): array
    {
        foreach (Asset::ASSETS_EXTENSIONS as $ext)
        {
            $collection[$ext] = array_merge(
                $collection[$ext] ?? [],
                $this->assetsDetectForType(
                    $templateName,
                    $ext,
                    $context,
                    true
                )
            );
        }

        return $collection;
    }

    /**
     * Return all assets for a given type, including suffixes like -s, -l, etc.
     */
    public function assetsDetectForType(
        string $assetPath,
        string $ext,
        string $context,
        bool $searchTheme
    ): array
    {
        $assetPathFull = $ext.'/'.$assetPath.'.'.$ext;
        $output = [];

        if ($asset = $this->addAsset(
            $assetPathFull,
            $context
        ))
        {
            $output[] = $asset;
        }

        // Add responsive assets.

        $breakpointsReverted = array_reverse(
            AssetsService::DISPLAY_BREAKPOINTS
        );
        $maxWidth = null;

        foreach ($breakpointsReverted as $breakpointName => $minWidth)
        {
            $assetPathFull = implode(
                FileHelper::FOLDER_SEPARATOR,
                [
                    $ext,
                    $assetPath.'-'.$breakpointName.'.'.$ext,
                ]
            );

            if ($asset = $this->addAsset($assetPathFull, $context))
            {
                $asset->responsive = $breakpointName;
                $asset->media = 'screen and (min-width:'.$minWidth.'px)'.
                    ($maxWidth ? ' and (max-width:'.$maxWidth.'px)' : '');

                $output[] = $asset;
            }

            $maxWidth = $minWidth;
        }

        // Prevent infinite loops.
        if ($searchTheme)
        {
            // Add themes assets.
            $basename = basename($assetPath);
            $dirname = dirname($assetPath);
            foreach (self::THEMES as $themeName)
            {
                // Theme's version should be place in :
                // themes/[dark|light|...]/same/path
                $themeAssetPath = implode(
                    FileHelper::FOLDER_SEPARATOR,
                    [
                        VariableHelper::PLURAL_THEME,
                        $themeName,
                        $dirname,
                        $basename,
                    ]
                );

                $assets = $this->assetsDetectForType(
                    $themeAssetPath,
                    $ext,
                    $context,
                    false
                );

                foreach ($assets as $asset)
                {
                    $asset->theme = $themeName;
                    $output[] = $asset;
                }
            }
        }

        return $output;
    }

    protected array $assetsLoaded = [];

    public function addAsset(
        string $pathRelative,
        string $renderContext
    ): ?Asset
    {
        $pathRelativeToPublic = self::DIR_BUILD.$pathRelative;
        if (!isset($this->manifest[$pathRelativeToPublic]))
        {
            return null;
        }

        if (!isset($this->assetsLoaded[$pathRelative]))
        {
            $asset = new Asset(
                realpath($this->pathPublic.$this->manifest[$pathRelativeToPublic]),
                $renderContext,
                $this->pathPublic
            );

            $this->assetsLoaded[$pathRelative] = $asset;
        } else
        {
            $asset = $this->assetsLoaded[$pathRelative];
        }

        $this->assets[$asset->type][] = $asset;

        return $this->assetsLoaded[$pathRelative];
    }
}
