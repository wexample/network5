<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Helper\ColorSchemeHelper;
use App\Wex\BaseBundle\Helper\DomHelper;
use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\Asset;
use App\Wex\BaseBundle\Rendering\RenderNode\RenderNode;
use function array_merge;
use function array_reverse;
use function basename;
use function dirname;
use Exception;
use function file_get_contents;
use function implode;
use JetBrains\PhpStorm\Pure;
use function json_decode;
use Psr\Cache\InvalidArgumentException;
use function realpath;
use function str_replace;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Contracts\Cache\CacheInterface;

class AssetsService
{
    /**
     * @var string
     */
    private const CACHE_KEY_ASSETS_REGISTRY = 'assets_registry';

    public const DISPLAY_BREAKPOINTS = [
        'xs' => 0,
        's' => 576,
        'm' => 768,
        'l' => 992,
        'xl' => 1200,
        'xxl' => 1400,
    ];

    public const COLOR_SCHEME_DIR = 'color_schemes';

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

    private array $aggregationHash = [];

    private array $assets = self::ASSETS_DEFAULT_EMPTY;

    private string $pathProject;

    private string $pathBuild;

    private array $registry;

    private string $pathPublic;

    /**
     * @throws InvalidArgumentException
     */
    public function __construct(
        KernelInterface $kernel,
        private AdaptiveResponseService $adaptiveResponseService,
        CacheInterface $cache
    ) {
        $this->pathProject = $kernel->getProjectDir().'/';
        $this->pathPublic = $this->pathProject.self::DIR_PUBLIC;
        $this->pathBuild = $this->pathPublic.self::DIR_BUILD;

        // Assets registry is cached as manifest file may be unstable.
        if ($cache->hasItem(self::CACHE_KEY_ASSETS_REGISTRY))
        {
            /** @var CacheItem $item */
            $item = $cache->getItem(self::CACHE_KEY_ASSETS_REGISTRY);
            $this->registry = $item->get();
        }
        else
        {
            $cache->get(
                self::CACHE_KEY_ASSETS_REGISTRY,
                function (): array {
                    $this->registry = json_decode(
                        file_get_contents(
                            $this->pathBuild.self::FILE_MANIFEST
                        ),
                        JSON_OBJECT_AS_ARRAY
                    );

                    return $this->registry;
                }
            );
        }

        $this->adaptiveResponseService->addRenderEventListener(
            $this
        );
    }

    public function replacePreloadPlaceholder(
        string $rendered
    ): string {
        if (str_contains($rendered, RenderingHelper::PLACEHOLDER_PRELOAD_TAG))
        {
            $renderPass = $this->adaptiveResponseService->renderPass;
            $html = '';

            if ($renderPass->getEnableAggregation())
            {
                $pageName = $this->adaptiveResponseService->renderPass->pageName;

                $html .= $this->buildPreloadTag(
                    $this->buildAggregatedPublicPath($pageName, Asset::EXTENSION_CSS),
                    Asset::EXTENSION_CSS
                );

                $html .= $this->buildPreloadTag(
                    $this->buildAggregatedPublicPath($pageName, Asset::EXTENSION_JS),
                    Asset::EXTENSION_JS
                );
            }
            else
            {
                $html .= $this->buildPreloadTagsForAssetsType(
                    Asset::EXTENSION_CSS
                );

                $html .= $this->buildPreloadTagsForAssetsType(
                    Asset::EXTENSION_JS
                );
            }

            return str_replace(
                RenderingHelper::PLACEHOLDER_PRELOAD_TAG,
                $html,
                $rendered
            );
        }

        return $rendered;
    }

    protected function buildPreloadTagsForAssetsType(string $type): string
    {
        $output = [];

        $assets = $this->getServerSideRenderedAssets(
            $type,
            false
        );

        foreach ($assets as $path)
        {
            $output[] = $this->buildPreloadTag(
                $path,
                $type
            );
        }

        return implode(PHP_EOL, $output);
    }

    protected function buildPreloadTag(
        string $path,
        string $type
    ): string {
        return DomHelper::buildTag(
            DomHelper::TAG_LINK,
            [
                'rel' => VariableHelper::PRELOAD,
                'href' => $path,
                'as' => Asset::PRELOAD_BY_ASSET_TYPE[$type]
            ]
        );
    }

    protected function buildAggregatedPathFromPageName(
        string $pageName,
        string $type
    ): string {
        return self::DIR_BUILD.$type.'/'.$pageName.'.'.FileHelper::SUFFIX_AGGREGATED.'.'.$type;
    }

    #[Pure]
    protected function buildAggregatedPublicPath(
        string $pageName,
        string $type
    ): string {
        return FileHelper::FOLDER_SEPARATOR.
            $this->buildAggregatedPathFromPageName($pageName, $type)
            .(
            isset($this->aggregationHash[$type.'-'.$pageName])
                ? '?'.$this->aggregationHash[$type.'-'.$pageName]
                : ''
            );
    }

    #[Pure]
    public function getServerSideRenderedAssets(
        string $type,
        bool $serverPath
    ): array {
        $basePath = '';
        if ($serverPath)
        {
            $basePath = rtrim(
                $this->pathPublic,
                FileHelper::FOLDER_SEPARATOR
            );
        }

        $aggregatePaths = [];

        // Per type specific assets.
        if ($type === Asset::EXTENSION_JS)
        {
            $aggregatePaths[] = $basePath.FileHelper::FOLDER_SEPARATOR.'build/runtime.js';
        }

        /** @var Asset $asset */
        foreach ($this->assets[$type] as $asset)
        {
            if ($asset->isServerSideRendered()
                && $asset->type === $type)
            {

                $aggregatePaths[] = $basePath.$asset->path;
            }
        }

        return $aggregatePaths;
    }

    public function aggregateInitialAssets(
        string $pageName,
        string $type
    ): string {
        $aggregatedFileName = $this->buildAggregatedPathFromPageName($pageName, $type);
        $output = '';

        $aggregatePaths = $this->getServerSideRenderedAssets(
            $type,
            true
        );

        $aggregated = [];
        foreach ($aggregatePaths as $path)
        {
            if (!isset($aggregated[$path]))
            {
                $aggregated[$path] = true;
                $output .=
                    PHP_EOL.'/* '.$path.' */ '.PHP_EOL
                    .file_get_contents($path);
            }
        }

        $this->aggregationHash[$type.'-'.$pageName] = FileHelper::fileWriteAndHash(
            $this->pathPublic.$aggregatedFileName,
            $output
        );

        return $this->buildAggregatedPublicPath(
            $pageName,
            $type
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
        string $renderNodeName,
        string $ext,
        RenderNode $renderNode,
        string $usage = Asset::USAGE_INITIAL
    ): array {
        $assetPathFull = $ext.'/'.$renderNodeName.'.'.$ext;
        $output = [];

        if ($asset = $this->addAsset(
            $assetPathFull,
            $renderNode,
            $usage
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
                    $renderNodeName.'-'.$breakpointName.'.'.$ext,
                ]
            );

            if ($asset = $this->addAsset(
                $assetPathFull,
                $renderNode,
                Asset::USAGE_RESPONSIVE
            ))
            {
                $asset->responsive = $breakpointName;
                $asset->media = 'screen and (min-width:'.$minWidth.'px)'.
                    ($maxWidth ? ' and (max-width:'.$maxWidth.'px)' : '');

                $output[] = $asset;
            }

            $maxWidth = $minWidth;
        }

        // Prevent infinite loops.
        if ($usage !== Asset::USAGE_COLOR_SCHEME)
        {
            // Add color scheme assets.
            $basename = basename($renderNodeName);
            $dirname = dirname($renderNodeName);
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
                    Asset::USAGE_COLOR_SCHEME
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

    /**
     * @throws Exception
     */
    public function addAsset(
        string $pathRelative,
        RenderNode $renderNode,
        string $usage
    ): ?Asset {
        $pathRelativeToPublic = self::DIR_BUILD.$pathRelative;
        if (!isset($this->registry[$pathRelativeToPublic]))
        {
            return null;
        }

        if (!isset($this->assetsLoaded[$pathRelative]))
        {
            $pathReal = realpath($this->pathPublic.$this->registry[$pathRelativeToPublic]);

            if (!$pathReal)
            {
                throw new Exception('Unable to find asset "'.$this->registry[$pathRelativeToPublic].'" from manifest for render node '.$renderNode->name);
            }

            $asset = new Asset(
                $pathReal,
                $renderNode,
                $this->pathPublic,
                $usage
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

    public function assetsPreload(
        array $assets,
        string $colorScheme,
        bool $useJs
    ) {
        /** @var Asset $asset */
        foreach ($assets as $asset)
        {
            if ($asset->getIsReadyForServerSideRendering($colorScheme, $useJs))
            {
                $asset->preload = true;
            }
        }
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

    public function assetsFiltered(
        string $contextType,
        string $assetType = null
    ): array {
        $registry = $this->adaptiveResponseService->renderPass->registry;
        $assets = [];

        /** @var RenderNode $renderNode */
        foreach ($registry[$contextType] as $renderNode)
        {
            $assets = array_merge(
                $assets,
                $renderNode->assets[$assetType]
            );
        }

        return $assets;
    }

    public function renderEventPostRender(array &$options)
    {
        $options['rendered'] = $this->replacePreloadPlaceholder(
            $options['rendered']
        );
    }
}
