<?php

namespace App\Controller;

use App\Wex\BaseBundle\Controller\AbstractController;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Twig\AssetsExtension;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DemoController extends AbstractController
{
    protected string $viewPathPrefix = VariableHelper::DEMO.'/';

    #[Route(path: VariableHelper::DEMO.'/buttons', name: VariableHelper::DEMO)]
    public function buttons(): Response
    {
        return $this->renderPage(
            'buttons',
            [
            ]
        );
    }

    #[Route(path: VariableHelper::DEMO.'/assets', name: VariableHelper::DEMO)]
    public function assets(): Response
    {
        return $this->renderPage(
            'assets',
            [
                'displayBreakpoints' => AssetsExtension::DISPLAY_BREAKPOINTS
            ]
        );
    }
}
