<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Translation\Translator;
use Doctrine\DBAL\Types\Types;
use JetBrains\PhpStorm\ArrayShape;
use function str_starts_with;
use Twig\TwigFunction;

class TranslationExtension extends AbstractExtension
{
    public array $transJsKeys = [
        '@page::alert',
        '@page::confirm',
        '@page::page_message',
    ];

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
            )
        ];
    }

    public function buildCatalog(array $keys): array
    {
        $output = [];
        $all = $this->translator->getCatalogue()->all();

        foreach ($keys as $id)
        {
            $domain = $this->translator->splitDomain($id);

            if ($domain)
            {
                $id = $this->translator->splitId($id);

                $domain = $this->translator->resolveDomain($domain);
            }
            else
            {
                $domain = 'messages';
            }

            if (isset($all[$domain]))
            {
                foreach ($all[$domain] as $key => $trans)
                {
                    if (str_starts_with($key, $id) || '*' === $id)
                    {
                        $output[$domain.
                        $this->translator::DOMAIN_SEPARATOR.
                        $key] = $trans;
                    }
                }
            }
        }

        return $output;
    }

    public function translationBuildDomainFromPath(string $path): string
    {
        return Translator::buildDomainFromPath(
            $path
        );
    }
}
