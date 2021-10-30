<?php

namespace App\Tests\Unit\Translation;

use App\Tests\NetworkTestCase;
use App\Wex\BaseBundle\Translation\Translator;

class TranslationTest extends NetworkTestCase
{
    protected ?object $translator = null;

    protected function setUp(): void
    {
        parent::setUp();

        /* @var Translator $translator */
        $this->translator = self::getContainer()->get(Translator::class);
    }

    public function testTranslation()
    {
        $translator = $this->translator;

        $this->assertNotNull($translator);

        $translator->setLocale('en');

        $translator->addTranslationDirectory(
            self::getContainer()->get('kernel')->getProjectDir()
            .'/tests/wex/Resources/translations/'
        );

        $translator->resolveCatalog();

        $this->_testOne();

        // Missing key fails to be extended.
        $this->assertTranslation(
            'include_missing',
            '@test.domain.two::missing'
        );

        $this->_testOne('test.domain.three');
    }

    protected function _testOne(string $domain = 'test.domain.one')
    {
        // Simple

        $this->assertTranslation(
            'simple_key',
            'Simple value',
            $domain
        );

        $this->assertTranslation(
            'simple_group.simple_group_key',
            'Simple group value',
            $domain
        );

        // Include with the same key name

        $this->assertTranslation(
            'include_key_full_notation',
            'Included value',
            $domain
        );

        $this->assertTranslation(
            'include_key_short_notation',
            'Included string with short notation',
            $domain
        );

        // Include with a different key name

        $this->assertTranslation(
            'include_different_key',
            'Included value with different key',
            $domain
        );

        // Include a group

        $this->assertTranslation(
            'deep_values.deepTwo',
            'Deep two',
            $domain
        );

        $this->assertTranslation(
            'deep_values_2.deeper.deepTwo',
            'Deep two',
            $domain
        );

        $this->assertTranslation(
            'simple_group.include_group_short_notation.sub_group.two',
            'Two',
            $domain
        );

        // Loop

        $this->assertTranslation(
            'include_resolvable_loop.sub_group.two',
            'Two',
            $domain
        );
    }

    protected function assertTranslation(
        string $key,
        string $expectedValue,
        string $domain = 'test.domain.one',
        array $args = []
    ) {
        $this->assertEquals(
            $expectedValue,
            $this->translator->trans(
                $key,
                $args,
                $domain
            )
        );
    }
}
