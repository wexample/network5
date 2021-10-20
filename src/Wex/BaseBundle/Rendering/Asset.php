<?php

namespace App\Wex\BaseBundle\Rendering;

class Asset
{
    public bool $defer = false;

    public bool $loaded = false;

    public string $media = 'screen';

    public ?string $path = null;

    public ?string $type = null;
}