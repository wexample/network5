<?php

namespace App\Controller\Pages;

use App\Wex\BaseBundle\Controller\AbstractPagesController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractPagesController
{
    #[Route(path: '', name: 'home_index')]
    public function index(): Response
    {
        return $this->renderPage(
            'home/index',
            [
            ]
        );
    }
}
