<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Helper\DomHelper;
use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\RenderingHelper;
use App\Wex\BaseBundle\WexBaseBundle;
use Exception;
use Twig\Environment;
use Twig\TwigFunction;

class VueExtension extends AbstractExtension
{
    const TEMPLATE_FILE_EXTENSION = '.vue.twig';

    public array $renderedTemplates = [];

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'vue',
                [
                    $this,
                    'vue',
                ],
                [
                    self::FUNCTION_OPTION_NEEDS_ENVIRONMENT => true,
                    self::FUNCTION_OPTION_IS_SAFE => [self::FUNCTION_OPTION_HTML],
                ]
            ),
            new TwigFunction(
                'vue_render_templates',
                [
                    $this,
                    'vueRenderTemplate',
                ]
            ),
        ];
    }

    /**
     * @param Environment $env
     * @param string $path
     * @param array|null $options
     * @param array|null $twigContext
     * @return string
     * @throws Exception
     */
    public function vue(
        Environment $env,
        string $path,
        ?array $options = [],
        ?array $twigContext = []
    ): string
    {
        return $this->vueRender(
            $env,
            $path,
            $options,
            $twigContext,
            true
        );
    }

    /**
     * @throws Exception
     */
    protected function vueRender(
        Environment $env,
        string $path,
        ?array $attributes = [],
        ?array $twigContext = [],
        ?bool $root = false
    ): string
    {
        $vueComName = $this->createVueComName($path);
        $pathTemplate = $path.self::TEMPLATE_FILE_EXTENSION;

        $vueComId = $vueComName.'-'.md5(random_int(0, mt_getrandmax()).microtime());

        $attributes['class'] ??= '';
        $attributes['class'] .= ' '.$vueComId;

        $context = [
            'path' => $path,
            'vueComId' => $vueComId,
            'vueComName' => $vueComName,
            'attrs' => $attributes,
        ];

        $outputBody = '';
        if ($root)
        {
            /** @var ComponentsExtension $comExt */
            $comExt = $env
                ->getExtension(ComponentsExtension::class);

            $outputBody = $comExt->comInitParent(
                'components/vue',
                $context
            );
        }

        if (!isset($this->renderedTemplates[$vueComName]))
        {
            /** @var ComponentsExtension $comExt */
            $comExt = $env->getExtension(
                ComponentsExtension::class
            );

            $comExt->comSetContext(
                RenderingHelper::CONTEXT_VUE,
                $vueComName
            );

            $template = DomHelper::buildTag(
                'template',
                [
                    'class' => 'vue vue-loading',
                    'id' => 'vue-template-'.$vueComName
                ],
                $env->render(
                    $pathTemplate,
                    $twigContext + $context
                )
            );

            $comExt->comRevertContext();

            $this->renderedTemplates[$vueComName] = $template;
        }

        return DomHelper::buildTag(
            $vueComName,
            [
                'class' => $vueComId
            ],
            $outputBody
        );
    }

    public function createVueComName(string $path): string
    {
        if (WexBaseBundle::BUNDLE_PATH_ALIAS_PREFIX === $path[0])
        {
            $exp = explode(FileHelper::FOLDER_SEPARATOR, $path);
            // Get relevant path.
            array_shift($exp);

            // Use reference to identify sub folders length.
            $templatePath = count(
                    explode(
                        FileHelper::FOLDER_SEPARATOR,
                        WexBaseBundle::BUNDLE_PATH_TEMPLATES
                    )
                ) - 1;

            // Remove sub folders.
            $exp = array_slice($exp, $templatePath);
            // We have a new base path to find tag name.
            $path = implode(FileHelper::FOLDER_SEPARATOR, $exp);
        }

        return str_replace(
            WexBaseBundle::BUNDLE_PATH_ALIAS_PREFIX,
            '',
            strtolower(
                implode('-',
                    explode(
                        FileHelper::FOLDER_SEPARATOR,
                        $path
                    )
                )
            )
        );
    }

    public function vueRenderTemplate(): string
    {
        // Add vue js templates.
        return implode('', $this->renderedTemplates);
    }
}
