<?php

namespace App\Controller;

use App\Wex\BaseBundle\Controller\BaseController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends BaseController
{
    /**
     * @Route("", name="home")
     */
    public function home(): Response
    {
        return $this->renderPage(
            'home/index',
            [
            ]
        );
    }
}
