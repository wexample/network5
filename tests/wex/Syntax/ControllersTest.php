<?php

namespace App\Tests\Syntax;

use App\Tests\NetworkTestCase;
use App\Wex\BaseBundle\Helper\BundleHelper;
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

    public function testTemplates()
    {
        $this->scanControllerPagesTemplates(
            BundleHelper::DIR_TEMPLATE_PAGES,
            $this->getProjectDir()
            .BundleHelper::DIR_TEMPLATES,
            'src/Controllers'
        );

        $this->scanControllerPagesTemplates(
            BundleHelper::DIR_TEMPLATE_PAGES,
            $this->getProjectDir()
                .'src/Wex/BaseBundle/'.BundleHelper::BUNDLE_PATH_RESOURCES
            .BundleHelper::DIR_TEMPLATES,
            'src/Controllers'
        );
    }
}
