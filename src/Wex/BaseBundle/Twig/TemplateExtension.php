<?php

namespace App\Wex\BaseBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use function str_ends_with;
use function strlen;
use function substr;

class TemplateExtension extends AbstractExtension
{
    public const TEMPLATE_FILE_EXTENSION = '.html.twig';

    public const LAYOUT_NAME_DEFAULT = 'default';

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'template_name_from_path',
                [
                    $this,
                    'templateNameFromPath',
                ]
            ),
        ];
    }

    public function templateNameFromPath(string $templatePath): string
    {
        // Define template name.
        $ext = TemplateExtension::TEMPLATE_FILE_EXTENSION;

        // Path have extension.
        if (str_ends_with($templatePath, $ext)) {
            return substr(
                $templatePath,
                0,
                -strlen(TemplateExtension::TEMPLATE_FILE_EXTENSION)
            );
        }

        return $templatePath;
    }
}
