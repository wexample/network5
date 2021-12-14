<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Service\AssetsService;

class RenderData extends JsonResource
{
    public array $assets = AssetsService::ASSETS_DEFAULT_EMPTY;

    public array $components = [];

    public string $renderRequestId;

    public string $templates;

    public array $translations = [];

    public array $vars;

    public string $name;

    public function init(
        string $renderRequestId,
        string $name,
    )
    {
        $this->renderRequestId = $renderRequestId;
        $this->name = $name;
    }
}
