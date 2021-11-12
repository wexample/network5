<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Helper\DomHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use Doctrine\DBAL\Types\Types;
use JetBrains\PhpStorm\ArrayShape;
use function uniqid;

class Component
{
    public string $id;

    public function __construct(
        public string $name,
        public string $initMode,
        protected array $options
    ) {
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
                'data-com-name' => $this->name,
            ]
        );
    }

    #[ArrayShape([
        VariableHelper::ID => Types::STRING,
        VariableHelper::NAME => Types::STRING,
    ])]
    public function buildPageData(): array
    {
        return [
            VariableHelper::ID => $this->id,
            'initMode' => $this->initMode,
            VariableHelper::NAME => $this->name,
            VariableHelper::OPTIONS => $this->options,
        ];
    }
}
