<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Helper\VariableHelper;
use JetBrains\PhpStorm\NoReturn;

class Asset
{
    public bool $defer = false;

    public bool $loaded = false;

    public string $media = 'screen';

    public string $path;

    public string $name;

    public ?string $type = null;

    public bool $responsive = false;

    public bool $preload = false;

    public string $preloadType;

    public const EXTENSION_JS = 'js';

    public const EXTENSION_CSS = 'css';

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

    #[NoReturn]
    public function __construct(string $path)
    {
        $this->path = $path;
        $this->name = $this->createName($path);
    }

    /**
     * Create a name which can be used as a dom id.
     * @param string $path
     * @return string
     */
    protected function createName(string $path): string
    {
        return VariableHelper::ASSETS
            .'-'.str_replace(
                ['/', '.'],
                '-',
                ltrim($path, '/'
                )
            );
    }

    public function getPreloadAs(): ?string
    {
        if ($this->preload) {
            return self::PRELOAD_BY_ASSET_TYPE[$this->type];
        }

        return null;
    }
}