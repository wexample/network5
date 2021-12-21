<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Helper\ClassHelper;
use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Helper\TextHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\ComponentRenderNodeManager;
use App\Wex\BaseBundle\Rendering\RenderNode\ComponentRenderNode;
use App\Wex\BaseBundle\Translation\Translator;
use App\Wex\BaseBundle\WexBaseBundle;
use Exception;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig\Environment;

class ComponentService extends RenderNodeService
{
    // Component is loaded with a css class.
    public const INIT_MODE_CLASS = VariableHelper::CLASS_VAR;

    // Component is simply loaded from PHP or from backend adaptive event.
    // It may have no target tag.
    public const INIT_MODE_LAYOUT = VariableHelper::LAYOUT;

    // Component is loaded from template into the target tag.
    public const INIT_MODE_PARENT = VariableHelper::PARENT;

    // Component is loaded from template, just after target tag.
    public const INIT_MODE_PREVIOUS = VariableHelper::PREVIOUS;

    public const COMPONENT_NAME_VUE = 'components/vue';

    public const COMPONENT_NAME_MODAL = 'components/modal';

    protected array $componentsClasses = [];

    protected array $componentsManagers = [];

    public function __construct(
        protected AdaptiveResponseService $adaptiveResponseService,
        protected AssetsService $assetsService,
        KernelInterface $kernel,
        protected Translator $translator
    )
    {
        parent::__construct($assetsService);

        $this->componentsClasses = [];

        $locations = [
            WexBaseBundle::WEX_BUNDLE_PATH_BASE => WexBaseBundle::CLASS_PATH_PREFIX_WEX_BASE,
            ClassHelper::PROJECT_PATH_SRC => WexBaseBundle::CLASS_PATH_PREFIX,
        ];

        foreach ($locations as $location => $classPrefix)
        {
            $locationAbsolute = $kernel->getProjectDir().'/'.$location;

            $this->componentsClasses = $this->findComponentClassesInDir(
                $locationAbsolute,
                $classPrefix,
                'Rendering/Component'
            );

            $managers = $this->findComponentClassesInDir(
                $locationAbsolute,
                $classPrefix,
                'Rendering/ComponentManager',
                'RenderNodeManager'
            );

            foreach ($managers as $componentName => $managerClassName)
            {
                $this->componentsManagers[$componentName] = new $managerClassName();
            }
        }
    }

    protected function findComponentClassesInDir(
        string $location,
        string $classPrefix,
        string $classesSubDir,
        string $unwantedSuffix = '',
    ): array
    {
        $output = [];
        $componentDir = $location.$classesSubDir;

        if (is_dir($componentDir))
        {
            $componentClasses = scandir($componentDir);

            foreach ($componentClasses as $componentClass)
            {
                if ($componentClass[0] !== '.')
                {
                    $componentClassRealPath = $componentDir.FileHelper::FOLDER_SEPARATOR.$componentClass;

                    if (is_file($componentClassRealPath))
                    {
                        $componentClass = FileHelper::removeExtension(
                            $componentClass, FileHelper::FILE_EXTENSION_PHP
                        );

                        $output[TextHelper::toKebab(substr($componentClass, 0, -strlen($unwantedSuffix)))] =
                            $classPrefix.ClassHelper::buildClassNameFromPath(
                                $classesSubDir.'/'.$componentClass
                            );
                    } else
                    {
                        $output += $this->findComponentClassesInDir(
                            $location,
                            $classPrefix,
                            $classesSubDir.'/'.$componentClass,
                        );
                    }
                }
            }
        }

        return $output;
    }

    /**
     * @throws Exception
     */
    public function componentRenderHtml(
        Environment $env,
        ComponentRenderNode $component
    ): ?string
    {
        $loader = $env->getLoader();
        $search = TemplateHelper::buildTemplateInheritanceStack(
            $component->name
        );

        try
        {
            foreach ($search as $templatePath)
            {
                if ($loader->exists($templatePath))
                {
                    return $env->render(
                        $templatePath,
                        $component->options
                    );
                }
            }

            return null;
        } catch (Exception $exception)
        {
            throw new Exception('Error during rendering component '.$component->name.' : '.$exception->getMessage(), $exception->getCode(), $exception);
        }
    }

    /**
     * Init a components and provide a class name to retrieve dom element.
     *
     * @throws Exception
     */
    public function componentInitClass(
        Environment $twig,
        string $name,
        array $options = []
    ): ComponentRenderNode
    {
        return $this->registerComponent(
            $twig,
            $name,
            self::INIT_MODE_CLASS,
            $options
        );
    }

    /**
     * @throws Exception
     */
    public function componentInitLayout(
        Environment $twig,
        string $name,
        array $options = []
    ): ComponentRenderNode
    {
        $component = $this->registerComponent(
            $twig,
            $name,
            ComponentService::INIT_MODE_LAYOUT,
            $options
        );

        $component->body .= $component->renderTag();

        return $component;
    }

    /**
     * Add component to the global page requirements.
     * It adds components assets to page assets.
     *
     * @throws Exception
     */
    public function componentInitParent(
        Environment $twig,
        string $name,
        array $options = []
    ): ComponentRenderNode
    {
        return $this->registerComponent(
            $twig,
            $name,
            self::INIT_MODE_PARENT,
            $options
        );
    }

    /**
     * @throws Exception
     */
    public function componentInitPrevious(
        Environment $twig,
        string $name,
        array $options = []
    ): ComponentRenderNode
    {
        return $this->registerComponent(
            $twig,
            $name,
            self::INIT_MODE_PREVIOUS,
            $options
        );
    }

    public function findComponentClassName(string $name): string
    {
        return $this->componentsClasses[$name] ?? ComponentRenderNode::class;
    }

    public function getComponentManager(string $name): ?ComponentRenderNodeManager
    {
        return $this->componentsManagers[$name] ?? null;
    }

    /**
     * @throws Exception
     */
    public function registerComponent(
        Environment $twig,
        string $name,
        string $initMode,
        array $options = [],
    ): ComponentRenderNode
    {
        $className = $this->findComponentClassName($name);

        // Using an object allow continuing edit properties after save.
        /** @var ComponentRenderNode $component */
        $component = new $className(
            $this->adaptiveResponseService->renderPass,
            $initMode,
            $options
        );

        $manager = $this->getComponentManager($name);
        $manager?->createComponent($component);

        $this->initRenderNode(
            $component,
            $name,
            $this->adaptiveResponseService->renderPass->useJs
        );

        $component->options = $options;

        $component->body = $this->componentRenderHtml(
            $twig,
            $component
        );

        return $component;
    }
}
