<?php

namespace App\Wex\BaseBundle\Twig\Macros;

use App\Wex\BaseBundle\Twig\AbstractExtension;
use stdClass;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig\TwigFunction;
use App\Wex\BaseBundle\Helper\DomHelper;

class IconExtension extends AbstractExtension
{
    /**
     * @var string
     */
    private const ICONS_LIBRARY_FA = 'fa';

    /**
     * @var string
     */
    private const ICONS_LIBRARY_MATERIAL = 'material';

    /**
     * @var string
     */
    const LIBRARY_SEPARATOR = ':';

    protected stdClass $icons;

    public function __construct(
        KernelInterface $kernel
    )
    {
        $pathBundle = $kernel
            ->getBundle('WexBaseBundle')
            ->getPath();

        $this->icons = (object) [
            self::ICONS_LIBRARY_FA => json_decode(
                file_get_contents($pathBundle.'/Resources/json/icons-fa.json')
            ),
            self::ICONS_LIBRARY_MATERIAL => json_decode(
                file_get_contents(
                    $pathBundle.'/Resources/json/icons-material.json'
                )
            ),
        ];
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'icon',
                [
                    $this,
                    'icon',
                ],
                [self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML]
            ),
        ];
    }

    public function icon(
        string $name,
        string $class = '',
        string $tagName = 'i'
    ): string
    {
        $type = null;

        if (str_contains($name, self::LIBRARY_SEPARATOR))
        {
            [$type, $name] = explode(
                self::LIBRARY_SEPARATOR,
                $name
            );
        }

        $class .= ' icon ';

        // Materialize.
        if (self::ICONS_LIBRARY_MATERIAL === $type || (null === $type && isset($this->icons->material->$name)))
        {
            return DomHelper::buildTag($tagName, [
                'class' => $class.'material-icons'
            ], $name);
        }

        // Font Awesome.
        if (self::ICONS_LIBRARY_FA === $type || (null === $type && isset($this->icons->fa->$name)))
        {
            return DomHelper::buildTag(
                $tagName, [
                'class' => $class
            ],
                DomHelper::buildTag('i', [
                    'class' => 'fa fa-'.$name
                ])
            );
        }

        // Just display tag on error.
        return DomHelper::buildTag($tagName, [
            'class' => $class
        ]);
    }
}
