<?php

use App\Tests\NetworkTestCase;
use App\Tests\Unit\Helper;
use App\Wex\BaseBundle\Helper\TextHelper;

class TextHelperTest extends NetworkTestCase
{
    public function testHelper()
    {
        $this->assertEquals(
            'some-thing-in-class-case',
            TextHelper::toKebab('Some_ThingInClassCase')
        );
    }
}