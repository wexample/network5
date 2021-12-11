<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\WexBaseBundle;

class VueComponent
{
    public string $id;
    
    public string $name;

    public function __construct(
        public string $path
    )
    {
        $this->name = $this->buildName($this->path);

        $this->id = $this->name.'-'.md5(random_int(0, mt_getrandmax()).microtime());
    }

    protected function buildName(string $path): string
    {
        if (WexBaseBundle::BUNDLE_PATH_ALIAS_PREFIX === $path[0])
        {
            $exp = explode(FileHelper::FOLDER_SEPARATOR, $path);
            // Get relevant path.
            array_shift($exp);

            // Use reference to identify sub folders length.
            $templatePath = count(
                    explode(
                        FileHelper::FOLDER_SEPARATOR,
                        WexBaseBundle::BUNDLE_PATH_TEMPLATES
                    )
                ) - 1;

            // Remove sub folders.
            $exp = array_slice($exp, $templatePath);
            // We have a new base path to find tag name.
            $path = implode(FileHelper::FOLDER_SEPARATOR, $exp);
        }

        return str_replace(
            WexBaseBundle::BUNDLE_PATH_ALIAS_PREFIX,
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