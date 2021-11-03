<?php

namespace App\Controller\Pages;

use App\Wex\BaseBundle\Controller\AbstractPagesController;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Twig\AssetsExtension;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DemoController extends AbstractPagesController
{
    protected string $viewPathPrefix = VariableHelper::DEMO.'/';

    #[Route(
        path: VariableHelper::DEMO.'/'.VariableHelper::ASSETS,
        name: VariableHelper::DEMO.'_'.VariableHelper::ASSETS
    )
    ]
    public function assets(): Response
    {
        return $this->renderPage(
            VariableHelper::ASSETS,
            [
                'displayBreakpoints' => AssetsExtension::DISPLAY_BREAKPOINTS,
            ]
        );
    }

    #[Route(
        path: VariableHelper::DEMO.'/'.VariableHelper::PLURAL_COMPONENT,
        name: VariableHelper::DEMO.'_'.VariableHelper::PLURAL_COMPONENT
    )
    ]
    public function components(): Response
    {
        return $this->renderPage(
            VariableHelper::PLURAL_COMPONENT
        );
    }

    #[Route(
        path: VariableHelper::DEMO.'/'.VariableHelper::LOADING,
        name: VariableHelper::DEMO.'_'.VariableHelper::LOADING
    )
    ]
    public function loading(): Response
    {
        return $this->renderPage(
            VariableHelper::LOADING
        );
    }

    #[Route(
        path: VariableHelper::DEMO.'/'.VariableHelper::TRANSLATIONS,
        name: VariableHelper::DEMO.'_'.VariableHelper::TRANSLATIONS
    )
    ]
    public function translations(): Response
    {
        return $this->renderPage(
            VariableHelper::TRANSLATIONS
        );
    }
}
