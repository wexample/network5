<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\DomHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Rendering\RenderNode\ComponentRenderNode;
use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use App\Wex\BaseBundle\Service\AssetsService;
use App\Wex\BaseBundle\Service\ComponentService;
use function array_merge;
use Exception;
use function trim;
use Twig\Environment;
use Twig\TwigFunction;

class ComponentsExtension extends AbstractExtension
{
    public function __construct(
        private AdaptiveResponseService $adaptiveResponseService,
        private AssetsService $assetsService,
        protected ComponentService $componentService,
    )
    {
    }

    public function getFunctions(): array
    {
        $initOptions = [
            self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML,
            self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
        ];

        return [
            new TwigFunction(
                'component',
                [
                    $this,
                    'component',
                ],
                $initOptions
            ),
            new TwigFunction(
                'component_init_class',
                [
                    $this,
                    'componentInitClass',
                ],
                $initOptions
            ),
            new TwigFunction(
                'component_init_parent',
                [
                    $this,
                    'componentInitParent',
                ],
                $initOptions
            ),
            new TwigFunction(
                'component_init_previous',
                [
                    $this,
                    'componentInitPrevious',
                ],
                $initOptions
            ),
            new TwigFunction(
                'component_render_tag_attributes',
                [
                    $this,
                    'componentRenderTagAttributes',
                ],
                [
                    self::FUNCTION_OPTION_IS_SAFE => self::FUNCTION_OPTION_IS_SAFE_VALUE_HTML,
                    self::FUNCTION_OPTION_NEEDS_CONTEXT => true,
                ]
            ),
            new TwigFunction(
                'component_render_templates',
                [
                    $this,
                    'componentRenderTemplates',
                ]
            ),
        ];
    }

    /**
     * @throws Exception
     */
    public function component(
        Environment $twig,
        string $name,
        array $options = []
    ): string
    {
        $component = $this->componentService->componentInitPrevious(
            $twig,
            $name,
            $options
        );

        return $component->body . $component->renderTag();
    }

    /**
     * @throws Exception
     */
    public function componentInitPrevious(
        Environment $twig,
        string $name,
        array $options = []
    ): string
    {
        return $this->componentService->componentInitPrevious(
            $twig,
            $name,
            $options
        )->renderTag();
    }

    public function comLoadAssets(ComponentRenderNode $component): array
    {
        return $this
            ->assetsService
            ->assetsDetect(
                $component->name,
                $this->adaptiveResponseService->renderPass->getCurrentContextRenderNode(),
                $component->assets
            );
    }

    /**
     * Init a components and provide a class name to retrieve dom element.
     * @throws Exception
     */
    public function componentInitClass(
        Environment $twig,
        string $name,
        array $options = []
    ): string
    {
        return $this
            ->componentService
            ->componentInitClass(
                $twig,
                $name,
                $options
            )->renderCssClass();
    }

    /**
     * @throws Exception
     */
    public function componentInitParent(
        Environment $twig,
        string $name,
        array $options = []
    ): string
    {
        return $this
            ->componentService
            ->componentInitParent(
                $twig,
                $name,
                $options
            )->renderTag();
    }

    public function componentRenderTagAttributes(
        array $context,
        array $defaults = []
    ): string
    {
        $class = trim(($defaults[VariableHelper::CLASS_VAR] ?? '').' '.($context[VariableHelper::CLASS_VAR] ?? ''));

        $attributes = array_merge([
            VariableHelper::ID => $context[VariableHelper::ID] ?? null,
            VariableHelper::CLASS_VAR => $class === '' ? null : $class,
        ], ($context['attr'] ?? []));

        return DomHelper::buildTagAttributes(
            $attributes
        );
    }

    public function componentRenderTemplates(): string
    {
        return $this->componentService->componentRenderTemplates();
    }
}
