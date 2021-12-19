<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Service\AssetsService;
use Twig\TwigFunction;

class AssetsExtension extends AbstractExtension
{
    public function __construct(
        protected AssetsService $assetsService,
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'assets_type_filtered',
                [
                    $this,
                    'assetsTypeFiltered',
                ]
            ),
            new TwigFunction(
                'assets_preload_list',
                [
                    $this,
                    'assetsPreloadList',
                ]
            ),
        ];
    }

    public function assetsTypeFiltered(string $contextType, string $assetType = null): array
    {
        return $this->assetsService->assetsFiltered(
            $contextType,
            $assetType
        );
    }

    public function assetsPreloadList(string $ext): array
    {
        return $this->assetsService->assetsPreloadList($ext);
    }
}
