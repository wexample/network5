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

        $this->assertTrue(true);
    }
}
