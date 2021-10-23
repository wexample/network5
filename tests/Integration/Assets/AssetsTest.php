<?php

namespace App\Tests\Integration\Assets;

use App\Tests\NetworkTestCase;
use App\Wex\BaseBundle\Helper\VariableHelper;
use function json_decode;
use function preg_match;

class AssetsTest extends NetworkTestCase
{
    public function testAssetsLoading()
    {
        $this->newClient();

        $this->goToRoute(VariableHelper::DEMO.'_'.VariableHelper::ASSETS);

        $layoutRenderData = $this->getPageLayoutData();

        $this->assertNotEmpty(
            $layoutRenderData,
            'Html contains layout data.'
        );

        $this->assertRenderData($layoutRenderData);

        $this->assertTrue(
            isset($layoutRenderData['page']),
            'Layout data contains page data'
        );

        $this->assertRenderData($layoutRenderData['page']);

        $pageRenderData = $layoutRenderData['page'];

        $this->assertTrue(
            isset($pageRenderData['assets']['all']['css']),
            'Demo page contains a default css page.'
        );
    }

    protected function assertRenderData(array $renderData)
    {
        $this->assertTrue(
            isset($renderData['assets']),
            'Render data contains assets entry'
        );
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