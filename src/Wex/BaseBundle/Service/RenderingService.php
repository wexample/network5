<?php

namespace App\Wex\BaseBundle\Service;

use function uniqid;

class RenderingService
{
    public const VAR_RENDER_REQUEST_ID = 'renderRequestId';

    protected string $currentRequestId;

    public function __construct()
    {
        $this->createRenderRequestId();
    }

    public function createRenderRequestId(): string
    {
        $this->currentRequestId = uniqid();

        return $this->getRenderRequestId();
    }

    public function getRenderRequestId(): string
    {
        return $this->currentRequestId;
    }
}
