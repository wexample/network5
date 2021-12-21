<?php

namespace App\Wex\BaseBundle\Tests\Traits;

use App\Wex\BaseBundle\Controller\AbstractEntityController;
use App\Wex\BaseBundle\Helper\ClassHelper;
use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Helper\TextHelper;
use function basename;
use function class_exists;
use function explode;
use function file_exists;
use function implode;
use function is_dir;
use function is_file;
use function method_exists;
use function rtrim;
use function scandir;
use SplFileInfo;
use function str_ends_with;
use function str_starts_with;
use function strlen;
use function substr;

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
            ): void {
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
                        0,
                        -strlen('Controller')
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
                }
                else
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

    protected function scanControllerPagesTemplates(
        string $templatesRelDir,
        string $templatesDir,
        string $classSrcDir,
    ) {
        $scan = scandir($templatesDir.$templatesRelDir);

        foreach ($scan as $item)
        {
            if ($item[0] !== '.')
            {
                $realSubPath = $templatesDir.$templatesRelDir.$item;

                if (is_dir($realSubPath))
                {
                    $this->scanControllerPagesTemplates(
                        $templatesRelDir.$item.'/',
                        $templatesDir,
                        $classSrcDir
                    );
                }
                elseif (str_ends_with(
                    $item,
                    TemplateHelper::TEMPLATE_FILE_EXTENSION
                ))
                {
                    $controllerClassName = ClassHelper::buildClassNameFromPath(
                        $templatesRelDir,
                        '\\App\\Controller\\',
                        'Controller'
                    );

                    $this->assertTrue(
                        class_exists(
                            $controllerClassName,
                        ),
                        'The controller class '.$controllerClassName.' exists for template '.$realSubPath
                    );

                    $methodName = TextHelper::toCamel(
                        FileHelper::removeExtension(
                            basename($realSubPath),
                            TemplateHelper::TEMPLATE_FILE_EXTENSION
                        )
                    );

                    $this->assertTrue(
                        method_exists(
                            $controllerClassName,
                            $methodName
                        ),
                        'The method exists in controller : '
                        .$controllerClassName.ClassHelper::METHOD_SEPARATOR.$methodName
                    );
                }
            }
        }
    }
}
