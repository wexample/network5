<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Helper\ColorSchemeHelper;
use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\Asset;
use App\Wex\BaseBundle\Rendering\RenderNode\RenderNode;
use function array_merge;
use function array_reverse;
use function basename;
use function dirname;
use function file_get_contents;
use function implode;
use function json_decode;
use function realpath;
use Symfony\Component\HttpKernel\KernelInterface;

class AssetsService
{
    public const DISPLAY_BREAKPOINTS = [
        'xs' => 0,
        's' => 576,
        'm' => 768,
        'l' => 992,
        'xl' => 1200,
        'xxl' => 1400,
    ];

    public const COLOR_SCHEME_DIR = VariableHelper::PLURAL_COLORS;

    /**
     * @var array|Asset[][]
     */
    public const ASSETS_DEFAULT_EMPTY = [
        Asset::EXTENSION_CSS => [],
        Asset::EXTENSION_JS => [],
    ];

    public const DIR_BUILD = 'build/';

    public const DIR_PUBLIC = 'public/';

    public const FILE_MANIFEST = 'manifest.json';

    private array $assets = self::ASSETS_DEFAULT_EMPTY;

    private string $pathProject;

    private string $pathBuild;

    private array $manifest;

    private string $pathPublic;

    public function __construct(
        KernelInterface $kernel,
        private AdaptiveResponseService $adaptiveResponseService
    ) {
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

    public function assetsDetect(
        string $path,
        RenderNode $context,
        array &$collection = []
    ): array {
        foreach (Asset::ASSETS_EXTENSIONS as $ext)
        {
            $collection[$ext] = array_merge(
                $collection[$ext] ?? [],
                $this->assetsDetectForType(
                    $path,
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
        string $pageName,
        string $ext,
        RenderNode $renderNode,
        bool $searchColorScheme
    ): array {
        $assetPathFull = $ext.'/'.$pageName.'.'.$ext;
        $output = [];

        if ($asset = $this->addAsset(
            $assetPathFull,
            $renderNode
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
            $assetPathFull = implode(
                FileHelper::FOLDER_SEPARATOR,
                [
                    $ext,
                    $pageName.'-'.$breakpointName.'.'.$ext,
                ]
            );

            if ($asset = $this->addAsset($assetPathFull, $renderNode))
            {
                $asset->responsive = $breakpointName;
                $asset->media = 'screen and (min-width:'.$minWidth.'px)'.
                    ($maxWidth ? ' and (max-width:'.$maxWidth.'px)' : '');

                $output[] = $asset;
            }

            $maxWidth = $minWidth;
        }

        // Prevent infinite loops.
        if ($searchColorScheme)
        {
            // Add color scheme assets.
            $basename = basename($pageName);
            $dirname = dirname($pageName);
            foreach (ColorSchemeHelper::SCHEMES as $colorSchemeName)
            {
                // Color scheme's version should be place in :
                // colors/[dark|light|...]/same/path
                $colorSchemePageName = implode(
                    FileHelper::FOLDER_SEPARATOR,
                    [
                        self::COLOR_SCHEME_DIR,
                        $colorSchemeName,
                        $dirname,
                        $basename,
                    ]
                );

                $assets = $this->assetsDetectForType(
                    $colorSchemePageName,
                    $ext,
                    $renderNode,
                    false
                );

                /** @var Asset $asset */
                foreach ($assets as $asset)
                {
                    $asset->colorScheme = $colorSchemeName;
                    $output[] = $asset;
                }
            }
        }

        return $output;
    }

    protected array $assetsLoaded = [];

    public function addAsset(
        string $pathRelative,
        RenderNode $renderNode
    ): ?Asset {
        $pathRelativeToPublic = self::DIR_BUILD.$pathRelative;
        if (!isset($this->manifest[$pathRelativeToPublic]))
        {
            return null;
        }

        if (!isset($this->assetsLoaded[$pathRelative]))
        {
            $asset = new Asset(
                realpath($this->pathPublic.$this->manifest[$pathRelativeToPublic]),
                $renderNode,
                $this->pathPublic
            );

            $this->assetsLoaded[$pathRelative] = $asset;
        }
        else
        {
            $asset = $this->assetsLoaded[$pathRelative];
        }

        $this->assets[$asset->type][] = $asset;

        return $this->assetsLoaded[$pathRelative];
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

    public function assetsIsAvailable(Asset $asset, bool $useJs): bool
    {
        // When using JS, we manage responsive
        // and extra color style outside page rendering flow.
        return !((!$useJs) || $asset->responsive || $asset->colorScheme);
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

    public function assetsFiltered(string $contextType, string $assetType = null): array
    {
        $registry = $this->adaptiveResponseService->renderPass->registry;
        $assets = [];

        /** @var RenderNode $renderNode */
        foreach ($registry[$contextType] as $renderNode)
        {
            foreach ($renderNode->assets as $asset)
            {
                $assets = array_merge(
                    $assets,
                    $renderNode->assets[$assetType]
                );
            }
        }

        return $assets;
    }
}
