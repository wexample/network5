<?php

namespace App\Wex\BaseBundle\Rendering;

class RenderContext
{
    public function __construct(
        public string $type,
        public ?string $name
    ) {
    }
}
