<?php

namespace App\Wex\BaseBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class WexBaseBundle extends Bundle
{
    public const WEX_BUNDLE_PATH_ALIAS = Helper\TemplateHelper::BUNDLE_PATH_ALIAS_PREFIX.'WexBaseBundle/';

    public const WEX_BUNDLE_PATH_TEMPLATES = self::WEX_BUNDLE_PATH_ALIAS.Helper\TemplateHelper::BUNDLE_PATH_RESOURCES.'templates/';
}
