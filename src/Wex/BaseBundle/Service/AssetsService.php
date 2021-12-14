<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Rendering\Asset;

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
}
