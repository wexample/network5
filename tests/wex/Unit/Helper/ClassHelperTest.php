<?php

use App\Tests\NetworkTestCase;
use App\Tests\Unit\Helper;
use App\Wex\BaseBundle\Helper\ClassHelper;

class ClassHelperTest extends NetworkTestCase
{
    public function testHelper()
    {
        $this->assertEquals(
            'This\\Is\\ATest\\ClassPath',
            ClassHelper::buildClassNameFromPath('this/is/a_test/class-path')
        );
    }
}