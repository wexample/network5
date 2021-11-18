<?php

namespace App\Wex\BaseBundle\Rendering;

class RenderDataPage extends RenderData
{
    public string $body;

    public bool $isLayoutPage = false;

    public string $name;

    public array $translations;
}
