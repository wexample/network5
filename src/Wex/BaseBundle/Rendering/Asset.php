<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Helper\PathHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Twig\AssetsExtension;
use function dirname;
use JetBrains\PhpStorm\NoReturn;
use function ltrim;
use function pathinfo;
use function str_replace;

class Asset
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

    public const CONTEXT_LAYOUT = VariableHelper::LAYOUT;

    public const CONTEXT_PAGE = VariableHelper::PAGE;

    public const CONTEXT_VUE = VariableHelper::VUE;

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

    public string $name;

    public bool $preload = false;

    public string $preloadType;

    public bool $rendered = false;

    public ?string $responsive = null;

    public ?string $type = null;

    #[NoReturn]
    public function __construct(public string $path, public string $context)
    {
        $this->name = $this->createName($path);

        $info = pathinfo($this->path);
        $this->type = $info['extension'];

        // Remove the base part before build/{type}/ folder.
        $pathWithoutExt = dirname($this->path).'/'.$info['filename'];

        $this->id = $context.'.'.PathHelper::relativeTo(
            $pathWithoutExt,
            '/'.AssetsExtension::DIR_BUILD.
                $this->type.'/'
        );
    }

    /**
     * Create a name which can be used as a dom id.
     */
    protected function createName(string $path): string
    {
        return VariableHelper::ASSETS
            .'-'.str_replace(
                ['/', '.'],
                '-',
                ltrim(
                    $path,
                    '/'
                )
            );
    }

    public function getPreloadAs(): ?string
    {
        if ($this->preload)
        {
            return self::PRELOAD_BY_ASSET_TYPE[$this->type];
        }

        return null;
    }
}
