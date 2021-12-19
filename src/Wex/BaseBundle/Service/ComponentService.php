<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\RenderNode\ComponentRenderNode;
use App\Wex\BaseBundle\Translation\Translator;
use Exception;
use JetBrains\PhpStorm\Pure;
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

    /**
     * Save components options initialized by com_init.
     */
    protected array $components = [];

    #[Pure]
    public function __construct(
        protected AdaptiveResponseService $adaptiveResponseService,
        protected AssetsService $assetsService,
        protected Translator $translator
    ) {
        parent::__construct($assetsService);
    }

    /**
     * @throws Exception
     */
    public function componentRenderHtml(
        Environment $env,
        ComponentRenderNode $component
    ): ?string {
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
        }
        catch (Exception $exception)
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
    ): ComponentRenderNode {
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
    ): ComponentRenderNode {
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
    ): ComponentRenderNode {
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
    ): ComponentRenderNode {
        return $this->registerComponent(
            $twig,
            $name,
            self::INIT_MODE_PREVIOUS,
            $options
        );
    }

    /**
     * @throws Exception
     */
    public function registerComponent(
        Environment $twig,
        string $name,
        string $initMode,
        array $options = []
    ): ComponentRenderNode {
        // Using an object allow continuing edit properties after save.
        $component = new ComponentRenderNode(
            $this->adaptiveResponseService->renderPass,
            $initMode,
            $options
        );

        $this->initRenderNode(
            $component,
            $name,
            $this->adaptiveResponseService->renderPass->useJs
        );

        $component->options = $options;

        $this
            ->assetsService
            ->assetsDetect(
                $component->name,
                $component,
                $component->assets
            );

        $component->body = $this->componentRenderHtml(
            $twig,
            $component
        );

        return $component;
    }

    public function componentRenderTemplates(): string
    {
        $output = '';

        /** @var ComponentRenderNode $component */
        foreach ($this->components as $component)
        {
            if (ComponentService::INIT_MODE_LAYOUT === $component->initMode)
            {
                $output .= $component->body
                    ? $component->body.$component->renderTag()
                    : '';
            }
        }

        return $output;
    }
}
