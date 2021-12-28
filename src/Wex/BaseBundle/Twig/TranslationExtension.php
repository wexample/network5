<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Service\LocaleService;
use App\Wex\BaseBundle\Translation\Translator;
use Twig\TwigFunction;

class TranslationExtension extends AbstractExtension
{
    public function __construct(
        public LocaleService $localeService,
        public Translator $translator,
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'trans_js',
                [
                    $this,
                    'transJs',
                ]
            ),
            new TwigFunction(
                'translation_build_domain_from_path',
                [
                    $this,
                    'translationBuildDomainFromPath',
                ]
            ),
        ];
    }

    public function translationBuildDomainFromPath(string $path): string
    {
        return Translator::buildDomainFromPath(
            $path
        );
    }

    /**
     * Make translation available for javascript.
     */
    public function transJs(
        string|array $keys
    ): void {
        $this->localeService->transJs($keys);
    }
}
