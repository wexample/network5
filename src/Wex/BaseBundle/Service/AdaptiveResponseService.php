<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Rendering\AdaptiveResponse;

class AdaptiveResponseService
{
    protected ?AdaptiveResponse $currentResponse = null;

    public function getCurrentResponse(): AdaptiveResponse
    {
        if (!$this->currentResponse) {
            $this->createResponse();
        }

        return $this->currentResponse;
    }

    public function createResponse(): AdaptiveResponse
    {
        $response = new AdaptiveResponse();
        $this->currentResponse = $response;

        return $response;
    }
}
