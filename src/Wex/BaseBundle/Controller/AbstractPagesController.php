<?php

namespace App\Wex\BaseBundle\Controller;

use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use function is_null;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;

abstract class AbstractPagesController extends AbstractController
{
    protected string $viewPathPrefix = '';

    public const NAMESPACE_CONTROLLER = 'App\\Controller\\';

    public const NAMESPACE_PAGES = self::NAMESPACE_CONTROLLER.'Pages\\';

    public const RESOURCES_DIR_PAGE = VariableHelper::PLURAL_PAGE.FileHelper::FOLDER_SEPARATOR;

    public const BUNDLE_TEMPLATE_SEPARATOR = '::';

    public function __construct(
        protected AdaptiveResponseService $adaptiveResponseService,
        protected Environment $twigEnvironment,
        protected RequestStack $requestStack
    )
    {
        parent::__construct(
            $adaptiveResponseService,
            $twigEnvironment
        );

        $mainRequest = $this->requestStack->getMainRequest();

        $this->requestUri = $mainRequest->getRequestUri();
    }

    public function buildTemplatePath(string $view): string
    {
        $base = self::RESOURCES_DIR_PAGE;

        if (str_contains($view, self::BUNDLE_TEMPLATE_SEPARATOR))
        {
            $exp = explode(self::BUNDLE_TEMPLATE_SEPARATOR, $view);
            $base = $exp[0].FileHelper::FOLDER_SEPARATOR.TemplateHelper::BUNDLE_PATH_TEMPLATES.$base;
            $view = $exp[1];
        }

        return $base.$this->viewPathPrefix.$view.TemplateHelper::TEMPLATE_FILE_EXTENSION;
    }

    protected function renderPage(
        string $view,
        array $parameters = [],
        Response $response = null
    ): Response
    {
        return $this->adaptiveRender(
            $this->buildTemplatePath($view),
            $parameters,
            $response
        );
    }
}
