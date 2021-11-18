<?php

namespace App\Wex\BaseBundle\Rendering;

class RenderData extends JsonResource
{
    public array $assets = [];

    public string $context;

    public array $components = [];

    public string $renderRequestId;

    public string $templates;

    public array $translations = [];

    public array $vars;
}
