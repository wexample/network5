<?php

namespace App\Wex\BaseBundle\Rendering;

class ComponentContext
{
    public function __construct(
        public string $renderContext,
        public string $name
    ) {
    }
}
