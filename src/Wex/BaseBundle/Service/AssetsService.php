<?php

namespace App\Wex\BaseBundle\Service;

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
    public const DIR_BUILD = 'build/';

    public const DIR_PUBLIC = 'public/';
}
