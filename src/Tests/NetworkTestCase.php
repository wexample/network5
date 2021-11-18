<?php

namespace App\Tests;

use App\Wex\BaseBundle\Tests\SymfonyTestCase;
use function json_decode;
use function preg_match;

abstract class NetworkTestCase extends SymfonyTestCase
{
    protected function getPageLayoutData(?string $content = null): array
    {
        $matches = [];
        preg_match(
            '/layoutRenderData = ([.\S\s\n]*);(\s*)<\/script>/',
            $content ?? $this->getContent(),
            $matches,
        );

        return json_decode($matches[1], JSON_OBJECT_AS_ARRAY);
    }
}
