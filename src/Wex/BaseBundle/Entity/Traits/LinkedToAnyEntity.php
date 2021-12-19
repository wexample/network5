<?php

namespace App\Wex\BaseBundle\Entity\Traits;

use Doctrine\ORM\Mapping\Column;

trait LinkedToAnyEntity
{
    #[Column(type: 'string', length: 255, nullable: true)]
    private ?string $entityType = null;

    #[Column(type: 'integer', nullable: true)]
    private ?int $entityId = null;

    public function getEntityType(): ?string
    {
        return $this->entityType;
    }

    public function setEntityType(?string $entityType): self
    {
        $this->entityType = $entityType;

        return $this;
    }

    public function getEntityId(): ?int
    {
        return $this->entityId;
    }

    public function setEntityId(?int $entityId): self
    {
        $this->entityId = $entityId;

        return $this;
    }
}
