<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'store')]
#[ORM\HasLifecycleCallbacks]
class Store
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['store:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255, unique: true)]
    #[Groups(['store:read', 'store:write'])]
    private ?string $storeId = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['store:read', 'store:write'])]
    private ?string $name = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['store:read', 'store:write'])]
    private ?string $nameSlug = null;

    #[ORM\Column(type: 'string', length: 500)]
    #[Groups(['store:read', 'store:write'])]
    private ?string $address = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 8, nullable: true)]
    #[Groups(['store:read', 'store:write'])]
    private ?string $longitude = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 8, nullable: true)]
    #[Groups(['store:read', 'store:write'])]
    private ?string $latitude = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['store:read', 'store:write'])]
    private ?string $userId = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['store:read'])]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['store:read'])]
    private ?\DateTime $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStoreId(): ?string
    {
        return $this->storeId;
    }

    public function setStoreId(string $storeId): static
    {
        if ($this->storeId === null) {
            $this->storeId = $storeId;
        }
        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getNameSlug(): ?string
    {
        return $this->nameSlug;
    }

    public function setNameSlug(string $nameSlug): static
    {
        $this->nameSlug = $nameSlug;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getLongitude(): ?string
    {
        return $this->longitude;
    }

    public function setLongitude(string $longitude): static
    {
        $this->longitude = $longitude;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getLatitude(): ?string
    {
        return $this->latitude;
    }

    public function setLatitude(string $latitude): static
    {
        $this->latitude = $latitude;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getUserId(): ?string
    {
        return $this->userId;
    }

    public function setUserId(?string $userId): static
    {
        $this->userId = $userId;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTime();
    }
} 