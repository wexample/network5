<?php

namespace App\Wex\BaseBundle\Helper;

use Symfony\Component\HttpFoundation\Request;

class RequestHelper
{
    public static function getQueryBoolean(
        Request $request,
        string $name
    ): bool {
        return TextHelper::parseBoolean(
            $request->get($name)
        );
    }
}
