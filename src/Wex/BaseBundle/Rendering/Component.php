<?php

namespace App\Wex\BaseBundle\Rendering;

use App\Wex\BaseBundle\Helper\DomHelper;

class Component
{
    public string $id;

    public function __construct(public string $name)
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
                'data-com-name' => $this->name,
            ]
        );
    }
}
