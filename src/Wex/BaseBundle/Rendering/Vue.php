<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Helper\BundleHelper;
use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Twig\VueExtension;
use function array_shift;
use function array_slice;
use function count;
use Exception;
use function explode;
use function implode;
use function md5;
use function microtime;
use function mt_getrandmax;
use function random_int;
use function str_replace;
use function strtolower;
use Twig\Environment;

class Vue
{
    public string $id;

    public string $name;

    /**
     * @throws Exception
     */
    public function __construct(public string $path)
    {
        $this->name = $this->buildName($this->path);
        $this->id = $this->name.'-'.md5(random_int(0, mt_getrandmax()).microtime());
    }

    /**
     * @throws Exception
     */
    public function findTemplate(Environment $twigEnvironment): string
    {
        // Search for template.
        $pathTemplate = null;
        $loader = $twigEnvironment->getLoader();

        $locations = TemplateHelper::buildTemplateInheritanceStack(
            $this->path,
            VueExtension::TEMPLATE_FILE_EXTENSION
        );

        foreach ($locations as $fullPath)
        {
            if (!$pathTemplate && $loader->exists($fullPath))
            {
                $pathTemplate = $fullPath;
            }
        }

        if (!$pathTemplate)
        {
            throw new Exception('Unable to find vue template, searched in '.implode(',', $locations));
        }

        return $pathTemplate;
    }

    public function buildName(string $path): string
    {
        if (BundleHelper::ALIAS_PREFIX === $path[0])
        {
            $exp = explode(FileHelper::FOLDER_SEPARATOR, $path);
            // Get relevant path.
            array_shift($exp);

            // Use reference to identify sub folders length.
            $templatePath = count(
                explode(
                    FileHelper::FOLDER_SEPARATOR,
                    BundleHelper::WEX_TEMPLATE_ALIAS_TEMPLATES
                )
            ) - 1;

            // Remove sub folders.
            $exp = array_slice($exp, $templatePath);
            // We have a new base path to find tag name.
            $path = implode(FileHelper::FOLDER_SEPARATOR, $exp);
        }

        return str_replace(
            BundleHelper::ALIAS_PREFIX,
            '',
            strtolower(
                implode(
                    '-',
                    explode(
                        FileHelper::FOLDER_SEPARATOR,
                        $path
                    )
                )
            )
        );
    }
}
