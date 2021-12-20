<?php

namespace App\Wex\BaseBundle\Tests\Traits;

use App\Wex\BaseBundle\Helper\ClassHelper;
use function class_exists;
use function is_dir;
use JetBrains\PhpStorm\NoReturn;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;

/**
 * Trait LoggingTestCase
 * Various debug and logging helper methods.
 */
trait ClassTestCaseTrait
{
    public function forEachClassFileRecursive(
        string $srcSubDir,
        callable $callback
    ) {
        $srcDir = $this->getSrcDir();
        $controllersDir = $srcDir.$srcSubDir.'/';

        $this->assertTrue(
            is_dir($controllersDir),
            'Dir exists : '.$controllersDir
        );

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($controllersDir)
        );

        /** @var SplFileInfo $file */
        foreach ($iterator as $file)
        {
            if ($file->isFile() && $file->getFilename()[0] !== '.')
            {
                $callback($file);
            }
        }
    }

    #[NoReturn]
    public function assertClassHasCousin(
        string $className,
        string $classBasePath,
        string $classSuffix,
        string $cousinBasePath,
        string $cousinSuffix = ''
    ) {
        $cousinClass = ClassHelper::getCousin(
            $className,
            $classBasePath,
            $classSuffix,
            $cousinBasePath,
            $cousinSuffix
        );

        $this->assertTrue(
            class_exists($cousinClass),
            'The class '.$className
            .' should have a cousin class : '.$cousinClass
        );
    }
}
