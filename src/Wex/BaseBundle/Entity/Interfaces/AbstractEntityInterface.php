<?php

namespace App\Wex\BaseBundle\Entity\Interfaces;

interface AbstractEntityInterface
{
    public function getId(): ?int;

    public function setId(int $id);
}
