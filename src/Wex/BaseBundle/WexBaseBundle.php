<?php

namespace App\Wex\BaseBundle;

use App\Wex\BaseBundle\Helper\ClassHelper;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class WexBaseBundle extends Bundle
{
    public const CLASS_PATH_PREFIX = '\\App\\';

    public const CLASS_PATH_PREFIX_WEX_BASE = self::CLASS_PATH_PREFIX.'Wex\\BaseBundle\\';

    public const WEX_BUNDLE_PATH_ALIAS = Helper\TemplateHelper::BUNDLE_PATH_ALIAS_PREFIX.'WexBaseBundle/';

    public const WEX_BUNDLE_PATH_TEMPLATES = self::WEX_BUNDLE_PATH_ALIAS.Helper\TemplateHelper::BUNDLE_PATH_RESOURCES.'templates/';

    public const WEX_BUNDLE_PATH_BASE = ClassHelper::PROJECT_PATH_SRC . 'Wex/BaseBundle/';
}
