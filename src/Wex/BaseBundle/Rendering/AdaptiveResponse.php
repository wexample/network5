<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Helper\TemplateHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Service\AdaptiveResponseService;
use App\Wex\BaseBundle\WexBaseBundle;
use function in_array;
use function is_null;
use Symfony\Component\HttpFoundation\Request;

class AdaptiveResponse
{
    public const BASE_MODAL = VariableHelper::MODAL;

    public const BASE_PAGE = VariableHelper::PAGE;

    public const BASE_DEFAULT = VariableHelper::DEFAULT;

    public const OUTPUT_TYPE_RESPONSE_HTML = VariableHelper::HTML;

    public const OUTPUT_TYPE_RESPONSE_JSON = VariableHelper::JSON;

    protected array $allowedBases = [
        self::BASE_MODAL,
        self::BASE_PAGE,
        self::BASE_DEFAULT,
    ];

    public const BASES_MAIN_DIR = WexBaseBundle::BUNDLE_PATH_TEMPLATES.'bases/';

    public function getOutputType(array $context): string
    {
        return $context[AdaptiveResponseService::RENDER_PARAM_NAME_OUTPUT_TYPE]
            ?? AdaptiveResponse::OUTPUT_TYPE_RESPONSE_HTML;
    }

    public function getRenderingBasePath(array $context, Request $request): string
    {
        return self::BASES_MAIN_DIR
            .$this->getOutputType($context)
            .'/'.$this->getRenderingBaseNameFromRequest($request)
            .TemplateHelper::TEMPLATE_FILE_EXTENSION;
    }

    public function getRenderingBaseNameFromRequest(Request $request): string
    {
        // Allow defining json layout expected type from query string.
        $layout = $request->get(VariableHelper::LAYOUT);

        // Layout not specified in query string.
        if (is_null($layout) && $request->isXmlHttpRequest())
        {
            // Use modal as default ajax layout, but might be configurable.
            $layout = self::BASE_MODAL;
        }

        if (in_array($layout, $this->allowedBases))
        {
            return $layout;
        }

        return self::BASE_DEFAULT;
    }
}
