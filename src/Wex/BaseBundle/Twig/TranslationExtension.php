<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Translation\Translator;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class TranslationExtension extends AbstractExtension
{
    public function __construct(
        public Translator $translator
    )
    {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'translation_set_domain_from_path',
                [
                    $this,
                    'translationSetDomainFromPath',
                ]
            )
        ];
    }

    public function translationSetDomainFromPath(string $domainName, string $path): void
    {
        $this->translator->setDomainFromPath(
            $domainName,
            $path
        );
    }
}
