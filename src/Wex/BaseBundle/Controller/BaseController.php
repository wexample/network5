<?php

namespace App\Wex\BaseBundle\Controller;

use App\Wex\BaseBundle\Controller\Interfaces\AdaptiveResponseControllerInterface;
use App\Wex\BaseBundle\Controller\Traits\AdaptiveResponseControllerTrait;
use App\Wex\BaseBundle\Twig\TemplateExtension;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

abstract class BaseController extends AbstractController implements AdaptiveResponseControllerInterface
{
    /** Set methods for adaptive rendering. */
    use AdaptiveResponseControllerTrait;

    public function renderPage(
        string   $view,
        array    $parameters = [],
        Response $response = null
    ): Response
    {
        return parent::render(
            'pages/' . $view
            . TemplateExtension::TEMPLATE_FILE_EXTENSION,
            $parameters,
            $response
        );
    }
}
