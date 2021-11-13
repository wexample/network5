<?php

namespace App\Wex\BaseBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class WexBaseBundle extends Bundle
{
    public const BUNDLE_PATH_ALIAS = '@WexBaseBundle/';

    public const BUNDLE_PATH_RESOURCES = self::BUNDLE_PATH_ALIAS.'Resources/';

    public const BUNDLE_PATH_TEMPLATES = self::BUNDLE_PATH_RESOURCES.'templates/';
}
