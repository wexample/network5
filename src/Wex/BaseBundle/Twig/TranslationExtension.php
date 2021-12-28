<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Translation\Translator;
use function str_starts_with;
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

    /**
     * Make translation available for javascript.
     *
     * @param string|array $keys
     */
    public function transJs(
        string|array $keys
    ): void {
        $this->translator->transJs($keys);
    }
}
