<?php

namespace App\Wex\BaseBundle\Helper;

use function array_slice;
use function count;
use function explode;
use function implode;
use function is_string;
use JetBrains\PhpStorm\Pure;
use ReflectionClass;
use ReflectionException;
use function strlen;
use function substr;

class ClassHelper
{
    public const METHOD_SEPARATOR = '::';

    public const NAMESPACE_SEPARATOR = '\\';

    public static function getTableizedName(string $className): string
    {
        return TextHelper::toSnake(static::getShortName($className));
    }

    public static function getShortName(string $className): string
    {
        try
        {
            $reflexion = new ReflectionClass($className);

            return $reflexion->getShortName();
        }
        catch (ReflectionException)
        {
            return 'undefined';
        }
    }

    #[Pure]
    public static function getCousin(
        string $className,
        string $classBasePath,
        string $classSuffix,
        string $cousinBasePath,
        string $cousinSuffix = ''
    ): string {
        $parts = static::getPathParts(
            $className,
            count(explode('\\', $classBasePath)) - 1
        );

        $classBase = implode('\\', $parts);

        // Remove suffix if exists.
        $classBase = $classSuffix ? substr(
            $classBase,
            0,
            -strlen($classSuffix)
        ) : $classBase;

        return $cousinBasePath.$classBase.$cousinSuffix;
    }

    public static function getPathParts($type, $offset = 2): array
    {
        return array_slice(
            explode('\\', is_string($type) ? $type : $type::class),
            $offset
        );
    }

    #[Pure]
    public static function buildPathFromClassName(string $className): string
    {
        return FileHelper::joinPathParts(
            static::getPathParts($className)
        );
    }

    public static function buildClassNameFromPath(
        string $path,
        string $classPathPrefix = '',
        string $classPathSuffix = ''
    ): string {
        $pathParts = explode(
            FileHelper::FOLDER_SEPARATOR,
            rtrim(
                $path,
                FileHelper::FOLDER_SEPARATOR
            )
        );

        foreach ($pathParts as $key => $part)
        {
            $pathParts[$key] = TextHelper::toClass($part);
        }

        return $classPathPrefix.implode(
            ClassHelper::NAMESPACE_SEPARATOR,
            $pathParts
        )
            .$classPathSuffix;
    }
}
