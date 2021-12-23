<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Helper\PathHelper;
use App\Wex\BaseBundle\Rendering\RenderNode\RenderNode;
use App\Wex\BaseBundle\Service\AssetsService;
use function dirname;
use function filesize;
use JetBrains\PhpStorm\NoReturn;
use function pathinfo;

class Asset extends RenderDataGenerator
{
    public const EXTENSION_CSS = 'css';

    public const EXTENSION_JS = 'js';

    public const EXTENSION_VUE = 'vue';

    public const ASSETS_EXTENSIONS = [
        Asset::EXTENSION_CSS,
        Asset::EXTENSION_JS,
    ];

    public const PRELOAD_BY_ASSET_TYPE = [
        self::EXTENSION_CSS => self::PRELOAD_AS_STYLE,
        self::EXTENSION_JS => self::PRELOAD_AS_SCRIPT,
    ];

    public const PRELOAD_AS_AUDIO = 'audio';

    public const PRELOAD_AS_DOCUMENT = 'document';

    public const PRELOAD_AS_EMBED = 'embed';

    public const PRELOAD_AS_FETCH = 'fetch';

    public const PRELOAD_AS_FONT = 'font';

    public const PRELOAD_AS_IMAGE = 'image';

    public const PRELOAD_AS_OBJECT = 'object';

    public const PRELOAD_AS_SCRIPT = 'script';

    public const PRELOAD_AS_STYLE = 'style';

    public const PRELOAD_AS_TRACK = 'track';

    public const PRELOAD_AS_WORKER = 'worker';

    public const PRELOAD_AS_VIDEO = 'video';

    public const PRELOAD_NONE = 'none';

    public bool $active = false;

    public string $id;

    public bool $initial = false;

    public string $media = 'screen';

    public string $path;

    public bool $preload = false;

    public bool $rendered = false;

    public ?string $responsive = null;

    public ?string $colorScheme = null;

    public string $type;

    public int $filesize;

    #[NoReturn]
    public function __construct(
        string $path,
        public RenderNode $renderData,
        string $basePath
    )
    {
        $this->filesize = filesize($path);

        $info = pathinfo($path);
        $this->type = $info['extension'];

        $this->path = '/'.PathHelper::relativeTo(
                $path,
                $basePath
            );

        // Remove the base part before build/{type}/ folder.
        $pathWithoutExt = dirname($this->path).'/'.$info['filename'];

        $this->id = PathHelper::relativeTo(
            $pathWithoutExt,
            '/'.AssetsService::DIR_BUILD.
            $this->type.'/'
        );
    }

    /**
     * Used in twig rendering like "asset.preloadAs".
     */
    public function getPreloadAs(): ?string
    {
        if ($this->preload)
        {
            return self::PRELOAD_BY_ASSET_TYPE[$this->type];
        }

        return null;
    }

    public function getIsReadyForServerSideRendering(string $colorScheme, bool $useJs): bool
    {
        if ($this->isServerSideRendered())
        {
            return false;
        }

        if ($this->type === static::EXTENSION_JS)
        {
            return $useJs && !$this->responsive;
        }

        if ($this->type === static::EXTENSION_CSS)
        {
            if ($this->responsive)
            {
                // Responsive CSS are loaded in page when JS is disabled.
                return !$useJs;
            }

            if ($this->colorScheme !== null && $this->colorScheme !== $colorScheme)
            {
                // Non-base color schemes CSS are loaded using JS.
                return false;
            }
        }

        return true;
    }

    public function setServerSideRendered(bool $bool = true)
    {
        $this->active =
        $this->rendered =
        $this->initial = $bool;
    }

    public function isServerSideRendered(): bool
    {
        return $this->active &&
            $this->rendered &&
            $this->initial;
    }

    public function toRenderData(): array
    {
        return $this->serializeVariables([
            'active',
            'filesize',
            'id',
            'initial',
            'media',
            'path',
            'preload',
            'rendered',
            'responsive',
            'colorScheme',
            'type',
        ]);
    }
}
