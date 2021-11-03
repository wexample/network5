<?php

namespace App\Wex\BaseBundle\Controller;

use App\Wex\BaseBundle\Helper\FileHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Twig\TemplateExtension;
use function is_null;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;

abstract class AbstractPagesController extends AbstractController
{
    protected bool $templateUseJs;

    protected string $requestUri;

    protected string $viewPathPrefix = '';

    public const NAMESPACE_CONTROLLER = 'App\\Controller\\';

    public const NAMESPACE_PAGES = self::NAMESPACE_CONTROLLER.'Pages\\';

    public const RESOURCES_DIR = VariableHelper::PLURAL_PAGE.FileHelper::FOLDER_SEPARATOR;

    public function __construct(
        protected RequestStack $requestStack
    ) {
        $mainRequest = $this->requestStack->getMainRequest();

        $this->templateUseJs = is_null($mainRequest->get('no_js'));
        $this->requestUri = $mainRequest->getRequestUri();
    }

    public function renderPage(
        string $view,
        array $parameters = [],
        Response $response = null
    ): Response {
        $templatePath = self::RESOURCES_DIR.$this->viewPathPrefix.$view.TemplateExtension::TEMPLATE_FILE_EXTENSION;

        // Add global variables for rendering.
        $parameters['layout_use_js'] ??= $this->templateUseJs;
        $parameters['template_path'] = $templatePath;
        $parameters['request_uri'] ??= $this->requestUri;

        return parent::render(
            $templatePath,
            $parameters,
            $response
        );
    }
}
