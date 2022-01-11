<?php

namespace App\Wex\BaseBundle\Entity\Interfaces;

interface AbstractEntityInterface
{
    /**
     * @return ?int
     */
    public function getId(): ?int;

    /**
     * @param int $id
     */
    public function setId(int $id);
}
