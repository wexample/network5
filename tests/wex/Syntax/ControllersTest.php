<?php

namespace App\Tests\Syntax;

use App\Tests\NetworkTestCase;
use App\Wex\BaseBundle\Helper\TemplateHelper;
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
            TemplateHelper::REL_BUNDLE_PATH_PAGES,
            $this->getProjectDir()
            .TemplateHelper::REL_BUNDLE_PATH_TEMPLATES,
            'src/Controllers'
        );

        $this->scanControllerPagesTemplates(
            TemplateHelper::REL_BUNDLE_PATH_PAGES,
            $this->getProjectDir()
                .'src/Wex/BaseBundle/'.TemplateHelper::BUNDLE_PATH_RESOURCES
            .TemplateHelper::REL_BUNDLE_PATH_TEMPLATES,
            'src/Controllers'
        );
    }
}
