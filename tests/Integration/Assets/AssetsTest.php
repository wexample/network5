<?php

namespace App\Tests\Integration\Assets;

use App\Tests\NetworkTestCase;
use App\Wex\BaseBundle\Helper\VariableHelper;

class AssetsTest extends NetworkTestCase
{
    public function testAssetsLoading()
    {
        $this->newClient();

        $this->goToRoute(VariableHelper::DEMO.'_'.VariableHelper::ASSETS);

        $layoutData = $this->getPageLayoutData();

        $this->assertNotEmpty($layoutData);
    }

    protected function getPageLayoutData(?string $content = null): array
    {
        $matches = [];
        preg_match(
            '/layoutData = ([.\S\s\n]*);(\s*)<\/script>/',
            $content ?? $this->getContent(),
            $matches,
        );

        return json_decode($matches[1], JSON_OBJECT_AS_ARRAY);
    }
}
