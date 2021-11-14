<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Helper\DomHelper;
use App\Wex\BaseBundle\Helper\VariableHelper;
use Doctrine\DBAL\Types\Types;
use JetBrains\PhpStorm\ArrayShape;
use function uniqid;

class Component
{
    public const CONTEXT_LAYOUT = VariableHelper::LAYOUT;

    public const CONTEXT_PAGE = VariableHelper::PAGE;

    public const CONTEXT_VUE = VariableHelper::VUE;

    public string $id;

    public function __construct(
        public string $name,
        public string $initMode,
        public string $context,
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

    #[ArrayShape([
        VariableHelper::ID => Types::STRING,
        VariableHelper::NAME => Types::STRING,
    ])]
    public function buildRenderData(): array
    {
        return [
            VariableHelper::CONTEXT => $this->context,
            VariableHelper::ID => $this->id,
            'initMode' => $this->initMode,
            VariableHelper::NAME => $this->name,
            VariableHelper::OPTIONS => $this->options,
        ];
    }
}
