<?php

namespace App\Wex\BaseBundle\Tests\Traits;

use App\Wex\BaseBundle\Controller\AbstractEntityController;
use App\Wex\BaseBundle\Helper\ClassHelper;
use SplFileInfo;

/**
 * Trait LoggingTestCase
 * Various debug and logging helper methods.
 */
trait ControllerTestCaseTrait
{
    use SplFileTestCaseTrait;
    use ClassTestCaseTrait;

    public function scanControllerFolder(string $srcSubDir)
    {
        $projectDir = $this->getProjectDir();

        $this->forEachClassFileRecursive(
            $srcSubDir,
            function (SplFileInfo $file) use (
                $srcSubDir,
                $projectDir
            ) {
                $controllerClass = $this->buildClassNameFromSpl($file);
                $split = explode('\\', $controllerClass);

                $this->assertSplFileNameHasSuffix($file, [
                    'Controller',
                    'ControllerInterface',
                    'ControllerTrait',
                ]);

                $fileNameWithoutExt = $this->spfFilenameWithoutExt($file);

                // This is a plain controller class.
                if (str_ends_with(
                        $fileNameWithoutExt,
                        'Controller'
                    ) && !str_starts_with(
                        $fileNameWithoutExt,
                        'Abstract'
                    ))
                {
                    $relDir = substr(
                        $srcSubDir,
                        0, -strlen('Controller')
                    );

                    $testFile = $this->splFileTestCousin(
                        $file,
                        $relDir,
                        'Integration/'
                    );

                    $testFileTwo = $this->splFileTestCousin(
                        $file,
                        $relDir,
                        'wex/Integration/'
                    );

                    $this->assertTrue(
                        file_exists($testFile) || file_exists($testFileTwo),
                        'Test file exists '.$testFile
                        .' or '.$testFileTwo.' for file '.$file
                    );
                }

                // Controller is placed in the entity dir.
                if ('Entity' === $split[2])
                {
                    $this->assertSplSrcFileIsSubClassOf(
                        $file,
                        AbstractEntityController::class
                    );

                    $entityClassName = $this->buildRelatedEntityClassNameFromSplFile(
                        $file,
                        'Controller'
                    );

                    $entityTableized = ClassHelper::getTableizedName($entityClassName);

                    $this->assertTrue(
                        class_exists($entityClassName),
                        'Entity controller placed in the Entity folder should have a final entity name, entity not found '.$entityClassName
                    );

                    // Templates

                    $templateEntityWrongDir = $projectDir.'templates/pages/'.$entityTableized.'/';
                    $hasTemplateEntityWrongDir = is_dir($templateEntityWrongDir);
                    $hasAViewOrEditTemplate = is_file($templateEntityWrongDir.'view.html.twig')
                        || is_file($templateEntityWrongDir.'edit.html.twig');

                    $this->assertFalse(
                        $hasTemplateEntityWrongDir && $hasAViewOrEditTemplate,
                        'The entity dir should not be in '
                        .$templateEntityWrongDir
                        .' or it should not contains no view.html.twig or edit.html.twig'
                    );
                } else
                {
                    $this->assertNotEquals(
                        'Entity',
                        $split[2],
                        'All non-entity controller should be placed into the Controller\\Entity\\ folder : '.$controllerClass
                    );
                }
            }
        );
    }
}