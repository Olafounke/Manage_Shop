<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: 'inventory')]
#[ORM\HasLifecycleCallbacks]
class Inventory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['inventory:read', 'inventory:write'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['inventory:read', 'inventory:write'])]
    #[Assert\NotBlank]
    private ?string $productId = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['inventory:read', 'inventory:write'])]
    private ?string $productName = null;

    #[ORM\Column(type: 'integer')]
    #[Groups(['inventory:read', 'inventory:write'])]
    #[Assert\GreaterThanOrEqual(0)]
    private ?int $quantity = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['inventory:read'])]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['inventory:read'])]
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

    public function getProductId(): ?string
    {
        return $this->productId;
    }

    public function setProductId(string $productId): static
    {
        $this->productId = $productId;
        return $this;
    }

    public function getProductName(): ?string
    {
        return $this->productName;
    }

    public function setProductName(?string $productName): static
    {
        $this->productName = $productName;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): static
    {
        $this->quantity = $quantity;
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

    public function incrementQuantity(int $quantity): static
    {
        $this->quantity += $quantity;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function decrementQuantity(int $quantity): static
    {
        $this->quantity = max(0, $this->quantity - $quantity);
        $this->updatedAt = new \DateTime();
        return $this;
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTime();
    }
} 