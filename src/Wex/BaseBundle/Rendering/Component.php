<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Helper\DomHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use App\Wex\BaseBundle\Service\RenderingService;
use Doctrine\DBAL\Types\Types;
use JetBrains\PhpStorm\ArrayShape;
use function uniqid;

class Component
{
    protected const VAR_INIT_MODE = 'initMode';

    public array $assets = [];

    public string $id;

    public function __construct(
        public string $name,
        public string $initMode,
        public ComponentContext $context,
        public $renderRequestId,
        public array $options = []
    )
    {
        $this->id = 'com-'.uniqid();
    }

    public function renderTag(): string
    {
        return DomHelper::buildTag(
            'span',
            [
                // ID are not used as "id" html attribute,
                // as component may be embedded into a vue,
                // so replicated multiple times.
                'class' => 'com-init '.$this->id,
            ]
        );
    }
}
