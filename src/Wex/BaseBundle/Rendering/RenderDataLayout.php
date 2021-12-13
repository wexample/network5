<?php

namespace App\Wex\BaseBundle\Rendering;

use JetBrains\PhpStorm\Pure;

class RenderDataLayout extends RenderData
{
    public RenderDataPage $page;

    public array $events = [];

    #[Pure]
    public function __construct()
    {
        $this->page = new RenderDataPage();
    }
}
