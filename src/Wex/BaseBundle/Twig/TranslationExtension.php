<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Translation\Translator;
use Twig\TwigFunction;

class TranslationExtension extends AbstractExtension
{
    public function __construct(
        public Translator $translator
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'translation_build_domain_from_path',
                [
                    $this,
                    'translationBuildDomainFromPath',
                ]
            ),
            new TwigFunction(
                'translation_set_domain_from_path',
                [
                    $this,
                    'translationSetDomainFromPath',
                ]
            ),
        ];
    }

    public function translationBuildDomainFromPath(string $path): string
    {
        return $this->translator->buildDomainFromPath(
            $path
        );
    }

    public function translationSetDomainFromPath(string $domainName, string $path): void
    {
        $this->translator->setDomainFromPath(
            $domainName,
            $path
        );
    }
}
