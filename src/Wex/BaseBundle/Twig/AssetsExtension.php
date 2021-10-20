<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\PathHelper;
use App\Wex\BaseBundle\Rendering\Asset;
use Exception;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class AssetsExtension extends AbstractExtension
{
    public const EXTENSION_JS = 'js';

    public const EXTENSION_CSS = 'css';

    public const DIR_PUBLIC = 'public/';

    public const DIR_BUILD = self::DIR_PUBLIC.'build/';

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

    /**
     * CommonExtension constructor.
     */
    public function __construct(
        KernelInterface $kernel
    )
    {
        $this->pathProject = $kernel->getProjectDir().'/';
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
            ),
            new TwigFunction(
                'debug_assets',
                [
                    $this,
                    'debugAssets',
                ]
            ),
        ];
    }

    /**
     * @throws Exception
     */
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
     * @throws Exception
     */
    public function assetsDetectForType(
        string $templateName,
        string $ext
    ): array
    {
        $assetPath = $this->pathProject.self::DIR_BUILD.$ext.'/'.$templateName.'.'.$ext;
        $output = [];

        if (is_file($assetPath)) {
            $output[] = $this->addAsset($assetPath, self::GROUP_PAGES);
        }

        $breakpointsReverted = array_reverse(
            self::DISPLAY_BREAKPOINTS
        );
        $maxWidth = null;

        // Used for CSS, TODO this behavior may be tested with javascript, or moved.
        foreach ($breakpointsReverted as $name => $minWidth) {
            $assetPath = $this->pathProject.self::DIR_BUILD.$ext.'/'.$templateName.'-'.$name.'.'.$ext;

            if (is_file($assetPath)) {
                $entry = $this->addAsset($assetPath, self::GROUP_PAGES);
                $entry->media = 'screen and (min-width:'.$minWidth.'px)'.
                    ($maxWidth ? ' and (max-width:'.$maxWidth.'px)' : '');

                $output[] = $entry;
            }

            $maxWidth = $minWidth;
        }

        return $output;
    }

    protected array $assetsLoaded = [];

    /**
     * @throws Exception
     */
    public function addAsset(string $path): Asset
    {
        if (!isset($this->assetsLoaded[$path])) {
            $entry = new Asset();
            $path = realpath($path);

            if (!is_file($path)) {
                throw new Exception('Unable to find asset : '.$path);
            }

            $entry->path = '/'.PathHelper::relativeTo(
                    $path,
                    $this->pathProject.self::DIR_PUBLIC
                );

            $info = pathinfo($path);
            $entry->type = $info['extension'];

            $this->assetsLoaded[$path] = $entry;
        } else {
            $entry = $this->assetsLoaded[$path];
        }

        $this->assets[$entry->type][] = $entry;

        return $this->assetsLoaded[$path];
    }

    public function debugAssets()
    {
        echo '<hr><code>';
        echo nl2br(
            str_replace(' ', '&nbsp;',
                print_r(
                    $this->assets
                    , true
                )
            )
        );
        echo '</code>';
    }
}
