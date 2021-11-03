<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\Asset;
use function array_merge_recursive;
use Doctrine\DBAL\Types\Types;
use JetBrains\PhpStorm\ArrayShape;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig\TwigFunction;
use function array_reverse;
use function file_get_contents;
use function json_decode;

class AssetsExtension extends AbstractExtension
{
    public const DIR_PUBLIC = 'public/';

    public const DIR_BUILD = 'build/';

    public const FILE_MANIFEST = 'manifest.json';

    public const DISPLAY_BREAKPOINTS = [
        'xs' => 0,
        's' => 576,
        'm' => 768,
        'l' => 992,
        'xl' => 1200,
        'xxl' => 1400,
    ];

    public const THEME_DARK = 'dark';

    public const THEME_LIGHT = 'light';

    public const THEME_PRINT = 'print';

    public const THEMES = [
        self::THEME_DARK,
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
                'asset_set_rendered',
                [
                    $this,
                    'assetSetRendered',
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
                'assets_is_available',
                [
                    $this,
                    'assetsIsAvailable',
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
        VariableHelper::ALL => Asset::class.'[]',
        VariableHelper::RESPONSIVE => Types::ARRAY,
        VariableHelper::THEME => Types::ARRAY,
    ])]
    public function buildRenderData(string $context): array
    {
        $all = self::ASSETS_DEFAULT_EMPTY;
        $responsive = self::ASSETS_DEFAULT_EMPTY;
        $themes = self::ASSETS_DEFAULT_EMPTY;

        foreach ($this->assets as $type => $group)
        {
            foreach ($group as $asset)
            {
                if ($asset->context === $context)
                {
                    $all[$type][] = $asset;

                    if ($asset->responsive)
                    {
                        $responsive[$type][] = $asset;
                    }

                    if ($asset->theme)
                    {
                        $themes[$type][] = $asset;
                    }
                }
            }
        }

        return [
            VariableHelper::ALL => $all,
            VariableHelper::RESPONSIVE => $responsive,
            VariableHelper::THEME => $themes,
        ];
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

    public function assetsInitLayout(
        ?string $layoutName,
        bool $useJs,
    )
    {
        $layoutName = $layoutName ?: TemplateExtension::LAYOUT_NAME_DEFAULT;
        $backEndAssets = $this->assets;
        $this->assets = self::ASSETS_DEFAULT_EMPTY;

        $assets = $this->assetsDetect(
            'layouts/'.$layoutName.'/layout',
            Asset::CONTEXT_LAYOUT
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
                Asset::CONTEXT_LAYOUT
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
        string $templateName,
        bool $useJs
    )
    {
        $assets = $this->assetsDetect(
            $templateName,
            Asset::CONTEXT_PAGE
        );

        $this->assetsPreload(
            $assets['css'],
            $useJs
        );
    }

    public function assetsIsAvailable(
        Asset $asset,
        bool $useJs
    ): bool
    {
        // When using JS, we manage responsive
        // and extra theme style outside page rendering flow.
        if ((!$useJs) || $asset->responsive || $asset->theme)
        {
            return false;
        }

        return true;
    }

    public function assetsList(string $ext): array
    {
        $notLoaded = [];

        foreach ($this->assets[$ext] as $asset)
        {
            if (!$asset->rendered)
            {
                $notLoaded[] = $asset;
            }
        }

        return $notLoaded;
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
        string $context
    ): array
    {
        $output = [];

        foreach (Asset::ASSETS_EXTENSIONS as $ext)
        {
            $output[$ext] = $this->assetsDetectForType(
                $templateName,
                $ext,
                $context
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
        string $context
    ): array
    {
        $assetPath = $ext.'/'.$templateName.'.'.$ext;
        $output = [];

        if ($asset = $this->addAsset(
            $assetPath,
            $context
        ))
        {
            $output[] = $asset;
        }

        // Add responsive assets.

        $breakpointsReverted = array_reverse(
            self::DISPLAY_BREAKPOINTS
        );
        $maxWidth = null;

        foreach ($breakpointsReverted as $breakpointName => $minWidth)
        {
            $assetPath = implode(
                FileHelper::FOLDER_SEPARATOR,
                [
                    $ext,
                    $templateName.'-'.$breakpointName.'.'.$ext,
                ]
            );

            if ($asset = $this->addAsset($assetPath, $context))
            {
                $asset->responsive = $breakpointName;
                $asset->media = 'screen and (min-width:'.$minWidth.'px)'.
                    ($maxWidth ? ' and (max-width:'.$maxWidth.'px)' : '');

                $output[] = $asset;
            }

            $maxWidth = $minWidth;
        }

        // Add themes assets.
        $basename = basename($templateName);
        $dirname = dirname($templateName);
        foreach (self::THEMES as $themeName)
        {
            $assetPath = implode(
                FileHelper::FOLDER_SEPARATOR,
                [
                    $ext,
                    $dirname,
                    VariableHelper::PLURAL_THEME,
                    $themeName,
                    $basename.'.'.$ext
                ]
            );

            if ($asset = $this->addAsset($assetPath, $context))
            {
                $asset->theme = $themeName;

                $output[] = $asset;
            }
        }

        return $output;
    }

    protected array $assetsLoaded = [];

    public function addAsset(
        string $pathRelative,
        string $context
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
                $this->manifest[$pathRelativeToPublic],
                $context
            );

            $this->assetsLoaded[$pathRelative] = $asset;
        } else
        {
            $asset = $this->assetsLoaded[$pathRelative];
        }

        $this->assets[$asset->type][] = $asset;

        return $this->assetsLoaded[$pathRelative];
    }

    public function assetSetRendered(Asset $asset, bool $rendered = true)
    {
        $asset->rendered = $rendered;
    }
}
