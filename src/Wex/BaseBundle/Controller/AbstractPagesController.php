<?php

namespace App\Wex\BaseBundle\Controller;

use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use App\Wex\BaseBundle\Service\RenderingService;
use function is_null;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;

abstract class AbstractPagesController extends AbstractController
{
    protected string $viewPathPrefix = '';

    public const NAMESPACE_CONTROLLER = 'App\\Controller\\';

    public const NAMESPACE_PAGES = self::NAMESPACE_CONTROLLER.'Pages\\';

    public const RESOURCES_DIR = VariableHelper::PLURAL_PAGE.FileHelper::FOLDER_SEPARATOR;

    public function __construct(
        protected AdaptiveResponseService $adaptiveResponse,
        protected Environment $twigEnvironment,
        protected RequestStack $requestStack,
        protected RenderingService $renderingService
    )
    {
        parent::__construct(
            $adaptiveResponse,
            $twigEnvironment,
            $renderingService
        );

        $mainRequest = $this->requestStack->getMainRequest();

        $this->templateUseJs = is_null($mainRequest->get('no_js'));
        $this->requestUri = $mainRequest->getRequestUri();
    }

    public function buildTemplatePath(string $view): string
    {
        return self::RESOURCES_DIR.$this->viewPathPrefix.$view.TemplateHelper::TEMPLATE_FILE_EXTENSION;
    }

    protected function renderPage(
        string $view,
        array $parameters = [],
        Response $response = null
    ): Response
    {
        $templatePath = $this->buildTemplatePath($view);

        return $this->render(
            $templatePath,
            $parameters,
            $response
        );
    }
}
