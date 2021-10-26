<?php

namespace App\Controller;

use App\Wex\BaseBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    #[Route(path: '', name: 'home')]
    public function home(): Response
    {
        return $this->renderPage(
            'home/index',
            [
            ]
        );
    }
}
