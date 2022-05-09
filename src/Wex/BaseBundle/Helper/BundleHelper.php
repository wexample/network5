<?php

namespace App\Wex\BaseBundle\Helper;

class BundleHelper
{
    public const ALIAS_PREFIX = '@';

    public const BUNDLE_PATH_RESOURCES = 'Resources'.FileHelper::FOLDER_SEPARATOR;

    public const BUNDLE_PATH_TEMPLATES = self::BUNDLE_PATH_RESOURCES.self::DIR_TEMPLATES;

    public const CLASS_PATH_PREFIX = ClassHelper::NAMESPACE_SEPARATOR.'App'.ClassHelper::NAMESPACE_SEPARATOR;

    public const DIR_RESOURCE_FONTS = 'fonts'.FileHelper::FOLDER_SEPARATOR;

    public const DIR_SRC = 'src'.FileHelper::FOLDER_SEPARATOR;

    public const DIR_TESTS = 'tests'.FileHelper::FOLDER_SEPARATOR;

    public const DIR_TEMPLATES = 'templates'.FileHelper::FOLDER_SEPARATOR;

    public const DIR_TEMPLATE_PAGES = 'pages'.FileHelper::FOLDER_SEPARATOR;

    public const WEX_BUNDLE_NAME = 'WexBaseBundle';

    public const WEX_CLASS_PATH_BASE = self::CLASS_PATH_PREFIX.'Wex'.ClassHelper::NAMESPACE_SEPARATOR.'BaseBundle'.ClassHelper::NAMESPACE_SEPARATOR;

    public const WEX_TEMPLATE_ALIAS_BASE = self::ALIAS_PREFIX.self::WEX_BUNDLE_NAME.FileHelper::FOLDER_SEPARATOR;

    public const WEX_TEMPLATE_ALIAS_TEMPLATES = self::WEX_TEMPLATE_ALIAS_BASE.self::BUNDLE_PATH_RESOURCES.'templates'.FileHelper::FOLDER_SEPARATOR;

    public const WEX_DIR_BASE = self::DIR_SRC.'Wex'.FileHelper::FOLDER_SEPARATOR.'BaseBundle'.FileHelper::FOLDER_SEPARATOR;
}
