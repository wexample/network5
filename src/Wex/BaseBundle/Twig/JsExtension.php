<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Service\JsService;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class JsExtension extends AbstractExtension
{
    /**
     * CommonExtension constructor.
     */
    public function __construct(
        private JsService $jsService,
    )
    {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'js_var',
                [
                    $this,
                    'jsVar',
                ]
            ),
            new TwigFunction(
                'js_vars',
                [
                    $this,
                    'jsVars',
                ]
            ),
        ];
    }

    /**
     * @throws ExceptionInterface
     */
    public function jsVars(
        array $array,
        string $group = JsService::VARS_GROUP_PAGE
    ): void
    {
        foreach ($array as $name => $value)
        {
            $this->jsService->jsVar($name, $value, $group);
        }
    }

    /**
     * @throws ExceptionInterface
     */
    public function jsVar(
        string $name,
        mixed $value,
        string $group = JsService::VARS_GROUP_PAGE
    ): void
    {
        $this->jsService->jsVar($name, $value, $group);
    }
}
