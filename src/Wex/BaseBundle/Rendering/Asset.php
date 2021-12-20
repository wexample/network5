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

    public string $id;

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
    ) {
        $this->filesize = filesize($path);
        $info = pathinfo($path);
        if (!isset($info['extension']))
        {
            dd(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS));
        }

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

    public function getIsAvailable(bool $useJs): bool
    {
        if ($this->rendered)
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

            if ($this->colorScheme)
            {
                // Color scheme CSS are loaded using JS.
                // TODO Preload default theme.
                return false;
            }
        }

        return true;
    }

    public function setRendered(bool $bool = true)
    {
        $this->rendered = $bool;
    }

    public function toRenderData(): array
    {
        return $this->serializeVariables([
            'filesize',
            'id',
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
