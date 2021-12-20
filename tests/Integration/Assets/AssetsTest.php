<?php

namespace App\Tests\Integration\Assets;

use App\Tests\NetworkTestCase;
use App\Wex\BaseBundle\Helper\VariableHelper;
use function count;

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
            isset($pageRenderData['assets']['css']),
            'Demo page contains a default css page.'
        );

        $this->assertNotEmpty(
            count($pageRenderData['assets']['css']),
            'Demo page contains some css page.'
        );
    }

    protected function assertRenderData(array $renderData)
    {
        $this->assertTrue(
            isset($renderData['assets']),
            'Render data contains assets entry'
        );
    }
}
