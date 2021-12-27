<?php

namespace App\Wex\BaseBundle\Controller;

use App\Wex\BaseBundle\Controller\Interfaces\AdaptiveResponseControllerInterface;
use App\Wex\BaseBundle\Controller\Traits\AdaptiveResponseControllerTrait;
use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use App\Wex\BaseBundle\Service\AssetsService;
use App\Wex\BaseBundle\WexBaseBundle;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;

abstract class AbstractController extends \Symfony\Bundle\FrameworkBundle\Controller\AbstractController implements AdaptiveResponseControllerInterface
{
    /* Set methods for adaptive rendering. */
    use AdaptiveResponseControllerTrait;

    public const ROUTE_OPTION_KEY_EXPOSE = 'expose';

    public const ROUTE_OPTIONS_ONLY_EXPOSE = [self::ROUTE_OPTION_KEY_EXPOSE => true];

    public bool $templateUseJs;

    public string $requestUri;

    public function __construct(
        protected AdaptiveResponseService $adaptiveResponseService,
        protected AssetsService $assetsService,
        protected Environment $twigEnvironment
    ) {
        $adaptiveResponseService->setController($this);
    }

    /**
     * As adaptive response plays with controller rendering,
     * we should create a way to execute render from outside
     * using this public method.
     */
    public function adaptiveRender(
        string $view,
        array $parameters = [],
        Response $response = null
    ): ?Response {
        return $this->render(
            $view,
            $parameters,
            $response
        );
    }

    public function getTwigEnvironment(): Environment
    {
        return $this->twigEnvironment;
    }

    /**
     * Overrides default render, adding some magic.
     *
     * @param Response|null $response
     */
    protected function render(
        string $view,
        array $parameters = [],
        Response $response = null
    ): Response {
        $this->adaptiveResponseService->renderPrepare(
            $view,
            $parameters
        );

        return parent::render(
            $view,
            $parameters,
            $response
        );
    }

    protected function renderView(
        string $view,
        array $parameters = []): string {

        try
        {
            $rendered = parent::renderView(
                $view,
                $parameters
            );
        } catch (\Exception $exception)
        {
            $rendered = parent::renderView(
                WexBaseBundle::WEX_BUNDLE_PATH_TEMPLATES.'pages/_core/error/default.html.twig',
                $parameters + [
                    'message' => $exception->getMessage()
                ]
            );
        }

        $options = [
            'view' => $view,
            'rendered' => $rendered,
        ];

        $this->adaptiveResponseService->triggerRenderEvent(
            AdaptiveResponseService::EVENT_NAME_POST_RENDER,
            $options
        );

        return $options['rendered'];
    }
}
