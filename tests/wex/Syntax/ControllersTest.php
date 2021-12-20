<?php

namespace App\Tests\Syntax;

use App\Tests\NetworkTestCase;
use App\Wex\BaseBundle\Tests\Traits\ControllerTestCaseTrait;

class ControllersTest extends NetworkTestCase
{
    use ControllerTestCaseTrait;

    public function testApiControllers()
    {
        $this->scanControllerFolder(
            'Api/Controller'
        );

        $this->scanControllerFolder(
            'Wex/BaseBundle/Api/Controller'
        );
    }

    public function testControllers()
    {
        $this->scanControllerFolder(
            'Controller'
        );

        $this->scanControllerFolder(
            'Wex/BaseBundle/Controller'
        );
    }
}
