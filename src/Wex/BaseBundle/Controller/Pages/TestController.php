<?php

namespace App\Wex\BaseBundle\Controller\Pages;

use App\Wex\BaseBundle\Controller\AbstractPagesController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

abstract class TestController extends AbstractPagesController
{
    #[Route(path: '_core/test', name: '_core_test_index')]
    public function index(): Response
    {
        return $this->renderPage('@WexBaseBundle::_core/test/index');
    }

    #[Route(path: '_core/test/adaptive', name: '_core_test_adaptive', options: self::ROUTE_OPTIONS_ONLY_EXPOSE)]
    public function adaptive(): Response
    {
        return $this
            ->adaptiveResponseService
            ->createResponse($this)
            ->setView(
                '@WexBaseBundle/Resources/templates/pages/_core/test/adaptive.html.twig'
            )
            ->render();
    }

    #[Route(path: '_core/test/view', name: '_core_test_view', options: self::ROUTE_OPTIONS_ONLY_EXPOSE)]
    public function view(): Response
    {
        return $this->render(
            '@WexBaseBundle/Resources/templates/pages/_core/test/view.html.twig'
        );
    }

    #[Route(path: '_core/test/error-missing-view', name: '_core_test_error-missing-view', options: self::ROUTE_OPTIONS_ONLY_EXPOSE)]
    public function errorMissingVue(): Response
    {
        return $this
            ->adaptiveResponseService
            ->createResponse($this)
            ->setView(
                'MISSING_VIEW'
            )
            ->render();
    }
}
