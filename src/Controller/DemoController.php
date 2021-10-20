<?php

namespace App\Controller;

use App\Wex\BaseBundle\Controller\BaseController;
use App\Wex\BaseBundle\Helper\VariableHelper;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DemoController extends BaseController
{
    #[Route(path: VariableHelper::DEMO, name: VariableHelper::DEMO)]
    public function demo(): Response
    {
        return $this->renderPage(
            VariableHelper::DEMO.'/buttons',
            [
            ]
        );
    }
}
