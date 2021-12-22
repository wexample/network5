<?php

namespace App\Wex\BaseBundle\Tests\Traits;

use App\Wex\BaseBundle\Controller\AbstractEntityController;
use App\Wex\BaseBundle\Helper\ClassHelper;
use function implode;
use function is_subclass_of;
use SplFileInfo;
use function str_ends_with;
use function strlen;
use function substr;

/**
 * Trait LoggingTestCase
 * Various debug and logging helper methods.
 */
trait SplFileTestCaseTrait
{
    public function assertSplFileNameHasSuffix(
        SplFileInfo $file,
        array $suffixes
    ) {
        $this->assertTrue(
            $this->splFileNameHasAnySuffix($file, $suffixes),
            $file->getRealPath()
            .' has any suffix in : '.implode(', ', $suffixes)
        );
    }

    public function spfFilenameWithoutExt(SplFileInfo $file): string
    {
        return $file->getBasename(
            '.'.$file->getExtension()
        );
    }

    public function splFileNameHasAnySuffix(
        SplFileInfo $file,
        array $suffixes
    ): bool {
        $baseNameWithoutExt = $this->spfFilenameWithoutExt($file);

        foreach ($suffixes as $suffix)
        {
            if (str_ends_with($baseNameWithoutExt, $suffix))
            {
                return true;
            }
        }

        return false;
    }

    protected function assertSplSrcFileIsSubClassOf(
        SplFileInfo $splFileInfo,
        string $classToExtend
    ) {
        $this->assertTrue(
            $this->splFileIsSubClassOf($splFileInfo, $classToExtend),
            'All controller placed in the Entity dir should extend the class '.AbstractEntityController::class
        );
    }

    protected function splFileIsSubClassOf(
        SplFileInfo $splFileInfo,
        string $classToExtend
    ): bool {
        $controllerClass = $this->buildClassNameFromSpl($splFileInfo);

        return is_subclass_of(
            $controllerClass,
            $classToExtend
        );
    }

    public function splFileTestCousin(
        SplFileInfo $file,
        string $srcFileSubDir,
        string $testFileSubDir
    ): string {
        return $this->getProjectDir().ClassHelper::PROJECT_PATH_TESTS
            .$testFileSubDir.substr(
                $file->getRealPath(),
                strlen($this->getProjectDir().ClassHelper::PROJECT_PATH_SRC.$srcFileSubDir)
            );
    }
}
