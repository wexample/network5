<?php

namespace App\Wex\BaseBundle\Twig\Macros;

use App\Wex\BaseBundle\Helper\DomHelper;
use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Twig\AbstractExtension;
use App\Wex\BaseBundle\Twig\ComponentsExtension;
use Exception;
use function explode;
use function file_get_contents;
use function json_decode;
use stdClass;
use function str_contains;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig\Environment;
use Twig\TwigFunction;

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
    public const LIBRARY_SEPARATOR = ':';

    protected stdClass $icons;

    private string $pathSvgFa;

    public function __construct(
        KernelInterface $kernel,
        protected ComponentsExtension $componentsExtension
    )
    {
        $pathBundle = $kernel
            ->getBundle('WexBaseBundle')
            ->getPath();

        $this->pathSvgFa = $pathBundle.'/Resources/fonts/fontawesome/svgs/';

        $this->icons = (object) [
            self::ICONS_LIBRARY_FA => $this->buildIconsListFa(),
            self::ICONS_LIBRARY_MATERIAL => json_decode(
                file_get_contents(
                    $pathBundle.'/Resources/json/icons-material.json'
                )
            ),
        ];
    }

    public function buildIconsListFa(): array
    {
        $groups = scandir($this->pathSvgFa);
        $output = [];

        foreach ($groups as $group)
        {
            if ($group[0] !== '.')
            {
                $icons = scandir($this->pathSvgFa.FileHelper::FOLDER_SEPARATOR.$group);
                foreach ($icons as $icon)
                {
                    if ($icon[0] !== '.')
                    {
                        $output[$group][FileHelper::removeExtension(basename($icon))] = true;
                    }
                }
            }
        }

        return $output;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                VariableHelper::ICON,
                [
                    $this,
                    VariableHelper::ICON,
                ],
                [
                    self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML,
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                ]
            ),
        ];
    }

    /**
     * @throws Exception
     */
    public function icon(
        Environment $twig,
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
                VariableHelper::CLASS_VAR => $class.'material-icons',
            ], $name);
        }

        // Font Awesome.
        if (self::ICONS_LIBRARY_FA === $type || (null === $type && isset($this->icons->fa->$name)))
        {
            return $this->componentsExtension->component(
                $twig,
                VariableHelper::PLURAL_COMPONENT . '/' . VariableHelper::ICON,
                [
                    'name' => $name,
                    'group' => $this->findFaIconGroup($name),
                ]
            );
        }

        // Just display tag on error.
        return DomHelper::buildTag($tagName, [
            VariableHelper::CLASS_VAR => $class,
        ]);
    }

    private function findFaIconGroup(string $name): ?string
    {
        foreach ($this->icons->fa as $group => $icons)
        {
            if (isset($icons[$name]))
            {
                return $group;
            }
        }

        return null;
    }
}
