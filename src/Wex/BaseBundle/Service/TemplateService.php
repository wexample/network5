<?php

namespace App\Wex\BaseBundle\Service;

use Symfony\Component\Routing\RouterInterface;

class TemplateService
{
    public function __construct(
        protected RouterInterface $router
    ) {
    }
}
