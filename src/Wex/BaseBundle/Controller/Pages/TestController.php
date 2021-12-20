<?php

namespace App\Wex\BaseBundle\Controller\Pages;

use App\Wex\BaseBundle\Controller\AbstractPagesController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

abstract class TestController extends AbstractPagesController
{
    #[Route(path: 'test', name: 'test_index')]
    public function index(): Response
    {
        return $this->renderPage('@WexBaseBundle::test/index');
    }

    #[Route(path: 'test/view', name: 'test_view')]
    public function view(): Response
    {
        return $this->render(
            '@WexBaseBundle/Resources/templates/pages/test/view.html.twig'
        );
    }

    #[Route(path: 'test/adaptive', name: 'test_adaptive')]
    public function adaptive(): Response
    {
        return $this
            ->adaptiveResponseService
            ->createResponse($this)
            ->setView(
                '@WexBaseBundle/Resources/templates/pages/test/adaptive.html.twig'
            )
            ->render();
    }
}
